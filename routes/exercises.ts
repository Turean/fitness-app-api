import express from "express"
import { prisma } from "../lib/prisma"

export const router = express.Router()

router.get("/exercises", async (req, res) => {
    const exercises = await prisma.exercise.findMany({
        orderBy: { id: "desc" },
        include: {
            user: true,
            workoutExercises: {
                include: { session: true },
            },
        },
    })

    res.json(exercises)
})

router.get("/exercises/:id", async (req, res) => {
    const id = req.params?.id
    const exercise = await prisma.exercise.findUnique({
        where: { id: Number(id) },
        include: {
            user: true,
            workoutExercises: {
                include: { session: true },
            },
        },
    })

    res.json(exercise)
})
