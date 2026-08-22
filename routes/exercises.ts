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
