import express from "express"
import { prisma } from "../lib/prisma"
import { auth } from "../middlewares/auth"
import { isNonNegativeInt, isPositiveInt, parseId } from "../lib/validate"

export const router = express.Router()

router.get(
    "/workoutExercises/:workoutExerciseId/sets",
    auth,
    async (req, res) => {
        const workoutExerciseId = parseId(req.params?.workoutExerciseId)

        if (workoutExerciseId === null) {
            return res.status(404).json({ msg: "workout exercise not found" })
        }

        const workoutExercise = await prisma.workoutExercise.findFirst({
            where: {
                id: workoutExerciseId,
                session: {
                    userId: res.locals.user.id,
                },
            },
            include: {
                sets: true,
            },
        })

        if (workoutExercise) {
            return res.json(workoutExercise.sets)
        }

        res.status(404).json({ msg: "workout exercise not found" })
    },
)

router.post(
    "/workoutExercises/:workoutExerciseId/sets",
    auth,
    async (req, res) => {
        const workoutExerciseId = parseId(req.params?.workoutExerciseId)

        if (workoutExerciseId === null) {
            return res.status(404).json({ msg: "workout exercise not found" })
        }

        const reps = req.body?.reps
        const weight = req.body?.weight

        if (!isPositiveInt(reps) || !isNonNegativeInt(weight)) {
            return res.status(400).json({
                msg: "reps (1 or more) and weight (0 or more) required",
            })
        }

        const workoutExercise = await prisma.workoutExercise.findFirst({
            where: {
                id: workoutExerciseId,
                session: {
                    userId: res.locals.user.id,
                },
            },
        })

        if (!workoutExercise) {
            return res.status(404).json({ msg: "workout exercise not found" })
        }

        // setNumber continues from the highest one already logged, so the
        // client never has to track how many sets it has sent.
        const lastSet = await prisma.set.findFirst({
            where: { workoutExerciseId: workoutExercise.id },
            orderBy: { setNumber: "desc" },
        })

        const set = await prisma.set.create({
            data: {
                setNumber: (lastSet?.setNumber ?? 0) + 1,
                reps,
                weight,
                workoutExerciseId: workoutExercise.id,
            },
        })

        return res.status(201).json(set)
    },
)

router.patch(
    "/workoutExercises/:workoutExerciseId/sets/:setId",
    auth,
    async (req, res) => {
        const workoutExerciseId = parseId(req.params?.workoutExerciseId)
        const setId = parseId(req.params?.setId)

        if (workoutExerciseId === null || setId === null) {
            return res.status(404).json({ msg: "set not found" })
        }

        const reps = req.body?.reps
        const weight = req.body?.weight

        // setNumber is not editable — it records the order the set was
        // performed in, and the server owns it on every other route too.
        const data: { reps?: number; weight?: number } = {}

        if (reps !== undefined) {
            if (!isPositiveInt(reps)) {
                return res.status(400).json({ msg: "reps must be 1 or more" })
            }
            data.reps = reps
        }

        if (weight !== undefined) {
            if (!isNonNegativeInt(weight)) {
                return res
                    .status(400)
                    .json({ msg: "weight must be 0 or more" })
            }
            data.weight = weight
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ msg: "nothing to update" })
        }

        const set = await prisma.set.findFirst({
            where: {
                id: setId,
                workoutExerciseId,
                workoutExercise: {
                    session: {
                        userId: res.locals.user.id,
                    },
                },
            },
        })

        if (!set) {
            return res.status(404).json({ msg: "set not found" })
        }

        try {
            const updated = await prisma.set.update({
                where: { id: set.id },
                data,
            })
            return res.json(updated)
        } catch (e) {
            return res.status(400).json({ msg: "failed to update the set" })
        }
    },
)

router.delete(
    "/workoutExercises/:workoutExerciseId/sets/:setId",
    auth,
    async (req, res) => {
        const setId = parseId(req.params?.setId)
        const workoutExerciseId = parseId(req.params?.workoutExerciseId)

        if (setId === null || workoutExerciseId === null) {
            return res.status(404).json({ msg: "set not found" })
        }

        const set = await prisma.set.findFirst({
            where: {
                id: setId,
                workoutExerciseId,
                workoutExercise: {
                    session: {
                        userId: res.locals.user.id,
                    },
                },
            },
        })

        if (!set) {
            return res.status(404).json({ msg: "Set not found" })
        }

        try {
            const deleteSet = await prisma.set.delete({
                where: { id: set.id },
            })
            return res.status(200).json(deleteSet)
        } catch (e) {
            return res.status(400).json({ msg: "failed to delete the set" })
        }
    },
)
