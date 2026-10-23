import express from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { Prisma } from "../generated/prisma/client"
import { isNonEmptyString } from "../lib/validate"
import { signToken } from "../lib/token"

export const router = express.Router()

router.post("/users", async (req, res) => {
    const name = req.body?.name
    const username = req.body?.username
    const email = req.body?.email
    const password = req.body?.password

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
        return res.status(201).json({ safeUser, token: signToken(user.id) })
    } catch (e) {
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
        ) {
            const fields = uniqueFields(e)

            if (fields.includes("username")) {
                return res.status(400).json({ msg: "username already taken" })
            }
            if (fields.includes("email")) {
                return res.status(400).json({ msg: "email already in use" })
            }
            return res
                .status(400)
                .json({ msg: "username or email already taken" })
        }
        throw e
    }
})

function uniqueFields(e: Prisma.PrismaClientKnownRequestError): string[] {
    const adapterError = e.meta?.driverAdapterError as
        | { cause?: { constraint?: { fields?: string[] } } }
        | undefined

    return adapterError?.cause?.constraint?.fields ?? []
}
