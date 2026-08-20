import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"

export const router = express.Router()

router.get("/sessions", auth, async (req, res) => {
    const userId = res.locals.user.id
    const sessions = await prisma.session.findMany({
        where: { userId },
        orderBy: { id: "desc" },
    })
    res.json(sessions)
})

router.get("/sessions/:id", auth, async (req, res) => {
    const id = req.params?.id
    const userId = res.locals.user.id
    const session = await prisma.session.findFirst({
        where: { id: Number(id), userId },
        include: {
            workoutExercises: {
                include: { exercise: true, sets: true },
            },
        },
    })
    if (session) {
        return res.json(session)
    }

    res.status(404).json({ msg: "session not found" })
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
