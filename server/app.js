import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cors())

app.use(express.json({
    limit: '20mb'
}))

app.use(express.urlencoded({
    extended: true,
    limit: "20mb"
}))
app.use(cookieParser())

import pollRoutes from './route/poll.route.js'
app.use("/api/polls", pollRoutes)

export {app};