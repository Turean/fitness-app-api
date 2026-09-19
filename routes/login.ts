import express from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import jwt from "jsonwebtoken"

import { auth } from "../middlewares/auth"

export const router = express.Router()
router.get("/verify", auth, async (req, res) => {
    const id = res.locals.user.id
    const user = await prisma.user.findUnique({
        where: { id },
        omit: { password: true },
    })

    res.json(user)
})

router.post("/login", async (req, res) => {
    const username = req.body?.username
    const password = req.body?.password

    if (!username || !password) {
        return res.status(400).json({ msg: "username and password required" })
    }

    const user = await prisma.user.findUnique({
        where: { username },
    })

    if (user) {
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET as string,
            )

            const { password: _password, ...safeUser } = user
            return res.json({ safeUser, token })
        }
        return res.status(401).json({ msg: "invalid password" })
    }
    return res.status(401).json({ msg: "invalid username" })
})
