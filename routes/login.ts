import express from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import jwt from "jsonwebtoken"

export const router = express.Router()
router.post("/login", async (req, res) => {
    const username = req.body?.username
    const password = req.body?.password

    if (!username || !password) {
        res.status(400).json({ msg: "username and password required" })
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

            return res.json({ user, token })
        }
    }
    return res.status(401).json({ msg: "invalid username or password" })
})
