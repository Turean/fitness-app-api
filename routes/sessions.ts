import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"

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

router.post("/sessions", auth, async (req, res) => {
    const sessionType = req.body?.sessionType
    const note = req.body?.note
    const userId = res.locals.user.id

    if (!sessionType) {
        return res.status(400).json({ msg: "Session type is required" })
    }
    const session = await prisma.session.create({
        data: {
            sessionType: sessionType.toUpperCase(),
            note,
            userId,
        },
    })
    res.status(201).json(session)
})
