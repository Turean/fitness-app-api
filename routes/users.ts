import express from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"

export const router = express.Router()

router.get("/users", async (req, res) => {
    const users = await prisma.user.findMany({
        orderBy: { id: "desc" },
    })

    res.json(users)
})

router.post("/users", async (req, res) => {
    const name = req.body?.name
    const username = req.body?.username
    const email = req.body?.email
    const password = req.body?.password

    if (!name || !username || !email || !password) {
        return res.status(400).json({ msg: "All fields are required" })
    }

    const user = await prisma.user.create({
        data: {
            name,
            username,
            email,
            password: await bcrypt.hash(password, 10),
        },
    })
    res.status(201).json(user)
})
