import { prisma } from "../lib/prisma"

async function main() {
    console.log("Exercise seeding started...")
    await prisma.exercise.createMany({
        data: [
            {
                name: "Chest Press",
                muscleGroup: "Chest",
            },
            {
                name: "Incline Chest Press",
                muscleGroup: "Chest",
            },
            {
                name: "Lat Pull Down",
                muscleGroup: "Back",
            },
        ],
    })

    console.log("Exercise seeding done. \n")

    console.log("Session seeding started...")
    await prisma.session.createMany({
        data: [
            {
                sessionType: "Push",
            },
            {
                sessionType: "Pull",
                note: "Did tricep curl",
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
        ],
    })

    console.log("Set seeding done. \n")
}

main()
