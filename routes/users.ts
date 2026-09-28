import express from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { Prisma } from "../generated/prisma/client"
import { isNonEmptyString } from "../lib/validate"

export const router = express.Router()

router.post("/users", async (req, res) => {
    const name = req.body?.name
    const username = req.body?.username
    const email = req.body?.email
    const password = req.body?.password

    // Every one of these is a String column, and bcrypt.hash rejects a
    // non-string too — so a truthy check alone would let 123 through and
    // fail deeper down as a 500 instead of a 400.
    if (
        !isNonEmptyString(name) ||
        !isNonEmptyString(username) ||
        !isNonEmptyString(email) ||
        !isNonEmptyString(password)
    ) {
        return res.status(400).json({ msg: "All fields are required" })
    }

    try {
        const user = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: await bcrypt.hash(password, 10),
            },
        })

        const { password: _password, ...safeUser } = user
        return res.status(201).json(safeUser)
    } catch (e) {
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
        ) {
            return res.status(400).json({ msg: "username already taken" })
        }
        throw e
    }
})
