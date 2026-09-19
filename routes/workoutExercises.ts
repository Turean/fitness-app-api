import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"
import { isValidSet } from "../lib/validate"

export const router = express.Router()

router.post("/sessions/:sessionId/workoutExercises", auth, async (req, res) => {
    const sessionId = req.params?.sessionId
    const userId = res.locals.user.id
    const session = await prisma.session.findFirst({
        where: { id: Number(sessionId), userId },
    })
    if (session) {
        const exerciseId = Number(req.body?.exerciseId)

        if (!Number.isInteger(exerciseId)) {
            return res.status(400).json({ msg: "valid exercise id required" })
        }

        const exercise = await prisma.exercise.findFirst({
            where: { id: exerciseId, userId },
        })

        if (!exercise) {
            return res.status(404).json({ msg: "exercise not found" })
        }

        // sets is optional — a workout exercise can be created empty and
        // filled in set by set via POST /workoutExercises/:id/sets.
        const sets = req.body?.sets ?? []

        if (!Array.isArray(sets)) {
            return res.status(400).json({ msg: "sets must be an array" })
        }

        if (!sets.every(isValidSet)) {
            return res.status(400).json({
                msg: "each set needs reps (1 or more) and weight (0 or more)",
            })
        }

        try {
            const workoutExercise = await prisma.workoutExercise.create({
                data: {
                    sessionId: session.id,
                    exerciseId: exercise.id,
                    sets: {
                        // setNumber is always assigned by the server, in the
                        // order the sets arrive; any client value is ignored.
                        create: sets.map((set, i) => ({
                            setNumber: i + 1,
                            reps: set.reps,
                            weight: set.weight,
                        })),
                    },
                },
                include: { sets: true },
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

router.delete(
    "/sessions/:sessionId/workoutExercises/:weId",
    auth,
    async (req, res) => {
        const sessionId = req.params?.sessionId
        const weId = req.params?.weId
        const userId = res.locals.user.id

        const session = await prisma.session.findFirst({
            where: { id: Number(sessionId), userId },
        })

        if (!session) {
            return res.status(404).json({ msg: "session not found" })
        }

        const workoutExercise = await prisma.workoutExercise.findFirst({
            where: { id: Number(weId), sessionId: session.id },
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
