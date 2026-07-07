import express from "express"
const app = express()

import { router as sessionsRouter } from "./routes/sessions"
import { router as exercisesRouter } from "./routes/exercises"

app.get("/", (req, res) => {
    res.json({ status: "Fitness app API running..." })
})

app.use(sessionsRouter)
app.use(exercisesRouter)

app.listen(8800, () => {
    console.log("Fitness app API running at 8800...")
})
