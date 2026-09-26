import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"
import { Prisma } from "../generated/prisma/client"
import { isNonEmptyString, parseId } from "../lib/validate"

export const router = express.Router()

router.get("/exercises", auth, async (req, res) => {
    const userId = res.locals.user.id
    const exercises = await prisma.exercise.findMany({
        where: { userId },
    })

    res.json(exercises)
})

router.post("/exercises", auth, async (req, res) => {
    const name = req.body?.name
    const muscleGroup = req.body?.muscleGroup
    const userId = res.locals.user.id

    if (!name || !muscleGroup) {
        return res.status(400).json({ msg: "name and muscle group required" })
    }

    const exercise = await prisma.exercise.create({
        data: {
            name: name.toUpperCase(),
            muscleGroup,
            userId,
        },
    })

    res.status(201).json(exercise)
})

router.patch("/exercises/:id", auth, async (req, res) => {
    const id = parseId(req.params?.id)
    const userId = res.locals.user.id

    if (id === null) {
        return res.status(404).json({ msg: "exercise not found" })
    }

    const name = req.body?.name
    const muscleGroup = req.body?.muscleGroup
    const data: { name?: string; muscleGroup?: string } = {}

    if (name !== undefined) {
        if (!isNonEmptyString(name)) {
            return res.status(400).json({ msg: "name must be text" })
        }
        data.name = name.toUpperCase()
    }

    if (muscleGroup !== undefined) {
        if (!isNonEmptyString(muscleGroup)) {
            return res.status(400).json({ msg: "muscle group must be text" })
        }
        data.muscleGroup = muscleGroup
    }

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ msg: "nothing to update" })
    }

    const exercise = await prisma.exercise.findFirst({ where: { id, userId } })

    if (!exercise) {
        return res.status(404).json({ msg: "exercise not found" })
    }

    try {
        const updated = await prisma.exercise.update({
            where: { id: exercise.id },
            data,
        })
        return res.json(updated)
    } catch (e) {
        // @@unique([name, userId]) — renaming onto a name already in this
        // user's library. Renaming is allowed even once the exercise has
        // workout history; only deleting it is blocked.
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
        ) {
            return res
                .status(400)
                .json({ msg: "you already have an exercise with that name" })
        }
        return res.status(400).json({ msg: "failed to update the exercise" })
    }
})

router.delete("/exercises/:id", auth, async (req, res) => {
    const id = parseId(req.params?.id)
    const userId = res.locals.user.id

    if (id === null) {
        return res.status(404).json({ msg: "exercise not found" })
    }

    const exercise = await prisma.exercise.findFirst({
        where: { id, userId },
    })

    if (exercise) {
        const workoutExercise = await prisma.workoutExercise.findFirst({
            where: { exerciseId: exercise.id },
        })

        try {
            if (!workoutExercise) {
                const deleteExercise = await prisma.exercise.delete({
                    where: { id: exercise.id },
                })
                return res.status(200).json(deleteExercise)
            }
            return res.status(400).json({
                msg: "cannot delete an exercise with workout history",
            })
        } catch (e) {
            return res
                .status(400)
                .json({ msg: "failed to delete the exercise" })
        }
    }
    res.status(404).json({ msg: "exercise not found" })
})
