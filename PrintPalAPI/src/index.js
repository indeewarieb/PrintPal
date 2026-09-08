import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import { categoryImagesRouter } from './routes/categoryImages.routes.js'
import { itemsRouter } from './routes/items.routes.js'

const app = express()

const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  })
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/categories', categoryImagesRouter)
app.use('/api/items', itemsRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File is too large (max 5MB).' })
  }
  if (err?.message?.includes('Only image files')) {
    return res.status(400).json({ error: err.message })
  }
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT ?? 4000
app.listen(PORT, () => {
  console.log(`visions-today-api listening on http://localhost:${PORT}`)
})
