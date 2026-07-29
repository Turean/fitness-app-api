import express from "express"
const app = express()

app.use(express.json())
app.use(express.urlencoded())

import { router as sessionsRouter } from "./routes/sessions"
app.use(sessionsRouter)

import { router as exercisesRouter } from "./routes/exercises"
app.use(exercisesRouter)

import { router as usersRouter } from "./routes/users"
app.use(usersRouter)

import { router as loginRouter } from "./routes/login"
app.use(loginRouter)

import { router as workoutExerciseRouter } from "./routes/workoutExercises"
app.use(workoutExerciseRouter)

app.get("/", (req, res) => {
    res.json({ status: "Fitness app API running..." })
})

app.listen(8800, () => {
    console.log("Fitness app API running at 8800...")
})
