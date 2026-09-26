import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"
import { isNonEmptyString, parseId } from "../lib/validate"

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
    const id = parseId(req.params?.id)
    const userId = res.locals.user.id

    if (id === null) {
        return res.status(404).json({ msg: "session not found" })
    }

    const session = await prisma.session.findFirst({
        where: { id, userId },
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

router.patch("/sessions/:id", auth, async (req, res) => {
    const id = parseId(req.params?.id)
    const userId = res.locals.user.id

    if (id === null) {
        return res.status(404).json({ msg: "session not found" })
    }

    const sessionType = req.body?.sessionType
    const note = req.body?.note

    // Only the fields actually sent are changed, so a client can edit a
    // note without having to resend the session type it isn't touching.
    const data: { sessionType?: string; note?: string | null } = {}

    if (sessionType !== undefined) {
        if (!isNonEmptyString(sessionType)) {
            return res.status(400).json({ msg: "session type must be text" })
        }
        data.sessionType = sessionType.toUpperCase()
    }

    // note is optional in the schema, so null is a real value — it is
    // how a client clears a note it previously saved.
    if (note !== undefined) {
        if (note !== null && !isNonEmptyString(note)) {
            return res.status(400).json({ msg: "note must be text or null" })
        }
        data.note = note
    }

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ msg: "nothing to update" })
    }

    const session = await prisma.session.findFirst({ where: { id, userId } })

    if (!session) {
        return res.status(404).json({ msg: "session not found" })
    }

    try {
        const updated = await prisma.session.update({
            where: { id: session.id },
            data,
        })
        return res.json(updated)
    } catch (e) {
        return res.status(400).json({ msg: "failed to update the session" })
    }
})

router.delete("/sessions/:id", auth, async (req, res) => {
    const id = parseId(req.params?.id)
    const userId = res.locals.user.id

    if (id === null) {
        return res.status(404).json({ msg: "session not found" })
    }

    const session = await prisma.session.findFirst({
        where: { id, userId },
    })

    if (session) {
        try {
            const deleteSession = await prisma.session.delete({
                where: { id: session.id },
            })
            return res.status(200).json(deleteSession)
        } catch (e) {
            return res.status(400).json({ msg: "failed to delete the session" })
        }
    }
    res.status(404).json({ msg: "session not found" })
})
