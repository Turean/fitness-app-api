import express from "express"

const app = express()

app.get("/", (req, res) => {
    res.json({ status: "Fitness app API running..." })
})

app.listen(8800, () => {
    console.log("Fitness app API running at 8800...")
})
