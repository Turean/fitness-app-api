import express from "express"
import type { NextFunction, Request, Response } from "express"
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

import { router as setRouter } from "./routes/sets"
app.use(setRouter)

app.get("/", (req, res) => {
    res.json({ status: "Fitness app API running..." })
})

// Nothing matched. Must come after every router, and before the error
// handler below.
app.use((req, res) => {
    res.status(404).json({ msg: "not found" })
})

// Four parameters is what marks this as an error handler — Express checks
// the function's arity, not its name. Express 5 forwards rejected promises
// from async route handlers here on its own, which is why the routes can
// let a failed query bubble instead of catching it.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err)

    // express.json() throws this before any route runs, so no route-level
    // try/catch could ever see it. A malformed body is the client's fault.
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ msg: "invalid JSON body" })
    }

    if (res.headersSent) {
        return next(err)
    }

    res.status(500).json({ msg: "something went wrong" })
})

app.listen(8800, () => {
    console.log("Fitness app API running at 8800...")
})
