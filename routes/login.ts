import express from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { signToken } from "../lib/token"

import { auth } from "../middlewares/auth"
import { isNonEmptyString } from "../lib/validate"

export const router = express.Router()

const DUMMY_HASH = bcrypt.hashSync("dummy-password", 10)
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

    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
        return res.status(400).json({ msg: "username and password required" })
    }

    const user = await prisma.user.findUnique({
        where: { username },
    })

    // Always run bcrypt, so an unknown username takes as long as a wrong password.
    const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH)

    if (!user || !valid) {
        return res.status(401).json({ msg: "invalid username or password" })
    }

    const { password: _password, ...safeUser } = user
    return res.json({ safeUser, token: signToken(user.id) })
})
