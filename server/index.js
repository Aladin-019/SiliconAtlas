const express = require('express')
const cors = require('cors')
const { initDb } = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

const db = initDb()

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'SiliconAtlas API' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})