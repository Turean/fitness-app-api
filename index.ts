import express from "express"
const app = express()

import { router as sessionsRouter } from "./routes/sessions"

app.get("/", (req, res) => {
    res.json({ status: "Fitness app API running..." })
})

app.use(sessionsRouter)

app.listen(8800, () => {
    console.log("Fitness app API running at 8800...")
})
