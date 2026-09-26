import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"
import { parseId } from "../lib/validate"

export const router = express.Router()

router.post("/sessions/:sessionId/workoutExercises", auth, async (req, res) => {
    const sessionId = parseId(req.params?.sessionId)
    const userId = res.locals.user.id

    if (sessionId === null) {
        return res.status(404).json({ msg: "session not found" })
    }

    const session = await prisma.session.findFirst({
        where: { id: sessionId, userId },
    })
    if (session) {
        const exerciseId = parseId(req.body?.exerciseId)

        if (exerciseId === null) {
            return res.status(400).json({ msg: "valid exercise id required" })
        }

        const exercise = await prisma.exercise.findFirst({
            where: { id: exerciseId, userId },
        })

        if (!exercise) {
            return res.status(404).json({ msg: "exercise not found" })
        }

        try {
            const workoutExercise = await prisma.workoutExercise.create({
                data: {
                    sessionId: session.id,
                    exerciseId: exercise.id,
                },
            })
            return res.status(201).json(workoutExercise)
        } catch (e) {
            return res
                .status(400)
                .json({ msg: "failed to create workout exercise" })
        }
    }
    res.status(404).json({ msg: "session not found" })
})

router.patch(
    "/sessions/:sessionId/workoutExercises/:weId",
    auth,
    async (req, res) => {
        const sessionId = parseId(req.params?.sessionId)
        const weId = parseId(req.params?.weId)
        const userId = res.locals.user.id

        if (sessionId === null || weId === null) {
            return res.status(404).json({ msg: "workout exercise not found" })
        }

        // exerciseId is the only editable field: swapping the exercise
        // keeps the sets already logged, where deleting would lose them.
        const exerciseId = parseId(req.body?.exerciseId)

        if (exerciseId === null) {
            return res.status(400).json({ msg: "valid exercise id required" })
        }

        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        })

        if (!session) {
            return res.status(404).json({ msg: "session not found" })
        }

        const workoutExercise = await prisma.workoutExercise.findFirst({
            where: { id: weId, sessionId: session.id },
        })

        if (!workoutExercise) {
            return res.status(404).json({ msg: "workout exercise not found" })
        }

        const exercise = await prisma.exercise.findFirst({
            where: { id: exerciseId, userId },
        })

        if (!exercise) {
            return res.status(404).json({ msg: "exercise not found" })
        }

        try {
            const updated = await prisma.workoutExercise.update({
                where: { id: workoutExercise.id },
                data: { exerciseId: exercise.id },
            })
            return res.json(updated)
        } catch (e) {
            return res
                .status(400)
                .json({ msg: "failed to update workout exercise" })
        }
    },
)

router.delete(
    "/sessions/:sessionId/workoutExercises/:weId",
    auth,
    async (req, res) => {
        const sessionId = parseId(req.params?.sessionId)
        const weId = parseId(req.params?.weId)
        const userId = res.locals.user.id

        if (sessionId === null || weId === null) {
            return res.status(404).json({ msg: "workout exercise not found" })
        }

        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        })

        if (!session) {
            return res.status(404).json({ msg: "session not found" })
        }

        const workoutExercise = await prisma.workoutExercise.findFirst({
            where: { id: weId, sessionId: session.id },
        })

        if (!workoutExercise) {
            return res.status(404).json({ msg: "workout exercise not found" })
        }

        try {
            const deleteWorkoutExercise = await prisma.workoutExercise.delete({
                where: { id: workoutExercise.id },
            })
            return res.status(200).json(deleteWorkoutExercise)
        } catch (e) {
            return res
                .status(400)
                .json({ msg: "failed to delete workout exercise" })
        }
    },
)
