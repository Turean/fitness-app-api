import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"

export const router = express.Router()

router.get("/exercises", auth, async (req, res) => {
    const userId = res.locals.user.id
    const exercises = await prisma.exercise.findMany({
        where: { userId },
    })

    res.json(exercises)
})

router.post("/exercises", auth, async (req, res) => {
    const name = req.body?.name
    const muscleGroup = req.body?.muscleGroup
    const userId = res.locals.user.id

    if (!name || !muscleGroup) {
        return res.status(400).json({ msg: "name and muscle group required" })
    }

    const exercise = await prisma.exercise.create({
        data: {
            name: name.toUpperCase(),
            muscleGroup,
            userId,
        },
    })

    res.status(201).json(exercise)
})

router.delete("/exercises/:id", auth, async (req, res) => {
    const id = req.params?.id
    const userId = res.locals.user.id
    const exercise = await prisma.exercise.findFirst({
        where: { id: Number(id), userId },
    })

    if (exercise) {
        const workoutExercise = await prisma.workoutExercise.findFirst({
            where: { exerciseId: exercise.id },
        })

        try {
            if (!workoutExercise) {
                const deleteExercise = await prisma.exercise.delete({
                    where: { id: exercise.id },
                })
                return res.status(200).json(deleteExercise)
            }
            return res.status(400).json({
                msg: "cannot delete an exercise with workout history",
            })
        } catch (e) {
            return res
                .status(400)
                .json({ msg: "failed to delete the exercise" })
        }
    }
    res.status(404).json({ msg: "exercise not found" })
})
