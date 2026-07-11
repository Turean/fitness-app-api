import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"

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

router.post("/exercises", auth, async (req, res) => {
    const name = req.body?.name
    const muscleGroup = req.body?.muscleGroup
    const userId = res.locals.user.id

    if (!name || !muscleGroup) {
        return res.status(400).json({ msg: "name and muscle group required" })
    }

    const exercise = await prisma.exercise.create({
        data: {
            name,
            muscleGroup,
            userId,
        },
    })

    res.status(201).json(exercise)
})
