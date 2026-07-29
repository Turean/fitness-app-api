import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"

export const router = express.Router()

router.post("/sessions/:sessionId/workoutExercises", auth, async (req, res) => {
    const sessionId = req.params?.sessionId
    const userId = res.locals.user.id
    const session = await prisma.session.findFirst({
        where: { id: Number(sessionId), userId },
    })
    if (session) {
        try {
            const exerciseId = req.body?.exerciseId
            const sets = req.body?.sets
            if (
                !Array.isArray(sets) ||
                !sets.every((set) => set.setNumber && set.reps && set.weight)
            ) {
                return res
                    .status(400)
                    .json({ msg: "all fields for sets required" })
            }

            const workoutExercise = await prisma.workoutExercise.create({
                data: {
                    sessionId: Number(sessionId),
                    exerciseId,
                    sets: {
                        create: req.body?.sets,
                    },
                },
            })
            return res.status(201).json(workoutExercise)
        } catch (e) {
            return res
                .status(400)
                .json({ msg: "failed to create workout exercise" })
        }
    }
    res.status(403).json({ msg: "invalid session" })
})
