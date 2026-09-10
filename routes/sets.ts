import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"

export const router = express.Router()

router.get("/:workoutExerciseId/sets", auth, async (req, res) => {
    const workoutExerciseId = req.params?.workoutExerciseId

    const workoutExercise = await prisma.workoutExercise.findFirst({
        where: {
            id: Number(workoutExerciseId),
            session: {
                userId: res.locals.user.id,
            },
        },
        include: {
            sets: true,
        },
    })

    if (workoutExercise) {
        return res.json(workoutExercise.sets)
    }

    res.status(404).json({ error: "Workout exercise not found" })
})

router.delete("/:workoutExerciseId/sets/:setId", auth, async (req, res) => {
    const setId = req.params?.setId
    const workoutExerciseId = req.params?.workoutExerciseId

    const set = await prisma.set.findFirst({
        where: {
            id: Number(setId),
            workoutExercise: {
                id: Number(workoutExerciseId),
                session: {
                    userId: res.locals.user.id,
                },
            },
        },
    })

    if (!set) {
        return res.status(404).json({ msg: "Set not found" })
    }

    try {
        const deleteSet = await prisma.set.delete({
            where: { id: set.id },
        })
        return res.status(200).json(deleteSet)
    } catch (e) {
        return res.status(400).json({ msg: "failed to delete the set" })
    }
})
