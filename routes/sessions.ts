import express from "express"
import { prisma } from "../lib/prisma"

export const router = express.Router()

router.get("/sessions", async (req, res) => {
    const sessions = await prisma.session.findMany({
        orderBy: { id: "desc" },
        include: {
            workoutExercises: {
                include: { exercise: true },
            },
        },
    })
    res.json(sessions)
})

router.get("/sessions/:id", async (req, res) => {
    const id = req.params?.id
    const session = await prisma.session.findUnique({
        where: { id: Number(id) },
        include: {
            workoutExercises: {
                include: { exercise: true },
            },
        },
    })
    res.json(session)
})
