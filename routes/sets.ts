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
