import { prisma } from "../lib/prisma"
import bcrypt from "bcrypt"

async function main() {
    console.log("User seeding started...")
    await prisma.user.createMany({
        data: [
            {
                name: "Thurein",
                email: "thurein@gmail.com",
                username: "thurein",
                password: await bcrypt.hash("thurein", 10),
            },
            {
                name: "Thant",
                email: "thant@gmail.com",
                username: "thant",
                password: await bcrypt.hash("thant", 10),
            },
            {
                name: "Turean",
                email: "turean@gmail.com",
                username: "turean",
                password: await bcrypt.hash("turean", 10),
            },
            {
                name: "Tant",
                email: "tant@gmail.com",
                username: "tant",
                password: await bcrypt.hash("tant", 10),
            },
        ],
    })

    console.log("User seeding done. \n")

    console.log("Exercise seeding started...")
    await prisma.exercise.createMany({
        data: [
            {
                name: "CHEST PRESS",
                muscleGroup: "Chest",
                userId: 1,
            },
            {
                name: "INCLINE CHEST PRESS",
                muscleGroup: "Chest",
                userId: 1,
            },
            {
                name: "LAT PULL DOWN",
                muscleGroup: "Back",
                userId: 2,
            },
            {
                name: "LAT PULL DOWN",
                muscleGroup: "Back",
                userId: 1,
            },
            {
                name: "SQUAT",
                muscleGroup: "Legs",
                userId: 1,
            },
            {
                name: "LEG PRESS",
                muscleGroup: "Legs",
                userId: 2,
            },
            {
                name: "SHOULDER PRESS",
                muscleGroup: "Shoulders",
                userId: 1,
            },
            {
                name: "CHEST PRESS",
                muscleGroup: "Chest",
                userId: 3,
            },
            {
                name: "DEADLIFT",
                muscleGroup: "Legs",
                userId: 3,
            },
        ],
    })

    console.log("Exercise seeding done. \n")

    console.log("Session seeding started...")
    await prisma.session.createMany({
        data: [
            {
                sessionType: "PUSH",
                userId: 1,
            },
            {
                sessionType: "PULL",
                note: "Did tricep curl",
                userId: 2,
            },
            {
                sessionType: "LEGS",
                userId: 1,
            },
            {
                sessionType: "LEGS",
                userId: 2,
            },
            {
                sessionType: "PUSH",
                note: "First session",
                userId: 3,
            },
        ],
    })

    console.log("Session seeding done. \n")

    console.log("WorkoutExercise seeding started...")
    await prisma.workoutExercise.createMany({
        data: [
            {
                sessionId: 1,
                exerciseId: 1,
            },
            {
                sessionId: 2,
                exerciseId: 3,
            },
            {
                sessionId: 3,
                exerciseId: 5,
            },
            {
                sessionId: 4,
                exerciseId: 6,
            },
            {
                sessionId: 5,
                exerciseId: 8,
            },
        ],
    })

    console.log("WorkoutExercise seeding done. \n")

    console.log("Set seeding started...")
    await prisma.set.createMany({
        data: [
            {
                setNumber: 1,
                reps: 15,
                weight: 23,
                workoutExerciseId: 1,
            },
            {
                setNumber: 2,
                reps: 12,
                weight: 23,
                workoutExerciseId: 1,
            },
            {
                setNumber: 3,
                reps: 10,
                weight: 23,
                workoutExerciseId: 1,
            },

            {
                setNumber: 1,
                reps: 10,
                weight: 27,
                workoutExerciseId: 2,
            },
            {
                setNumber: 2,
                reps: 10,
                weight: 27,
                workoutExerciseId: 2,
            },
            {
                setNumber: 3,
                reps: 8,
                weight: 27,
                workoutExerciseId: 2,
            },

            {
                setNumber: 1,
                reps: 12,
                weight: 40,
                workoutExerciseId: 3,
            },
            {
                setNumber: 2,
                reps: 10,
                weight: 45,
                workoutExerciseId: 3,
            },
            {
                setNumber: 3,
                reps: 8,
                weight: 50,
                workoutExerciseId: 3,
            },

            {
                setNumber: 1,
                reps: 12,
                weight: 60,
                workoutExerciseId: 4,
            },
            {
                setNumber: 2,
                reps: 12,
                weight: 65,
                workoutExerciseId: 4,
            },
            {
                setNumber: 3,
                reps: 10,
                weight: 70,
                workoutExerciseId: 4,
            },

            {
                setNumber: 1,
                reps: 15,
                weight: 20,
                workoutExerciseId: 5,
            },
            {
                setNumber: 2,
                reps: 12,
                weight: 22,
                workoutExerciseId: 5,
            },
            {
                setNumber: 3,
                reps: 10,
                weight: 25,
                workoutExerciseId: 5,
            },
        ],
    })

    console.log("Set seeding done. \n")
}

main()
