import express from 'express'
import cors from 'cors'
import { initDb } from './db'

/** Same shape as frontend CpuSpec (API response). */
interface CpuSpec {
  id: number
  cpu_model_name: string
  family: string
  cpu_model: string
  codename: string
  cores: number
  threads: number
  max_turbo_frequency_ghz: number
  l3_cache_mb: number
  tdp_watts: number
  launch_year: number
  max_memory_tb: number
}

interface ProcessorRow {
  source_id: number | null
  id?: number
  model_name: string
  family: string
  model: string
  codename: string
  cores: number
  threads: number
  boost_clock_ghz: number
  cache_l3_mb: number
  tdp_watts: number
  launch_year: number
  max_memory_tb: number
}

const app = express()
app.use(cors())
app.use(express.json())

const db = initDb()

function rowToCpuSpec(row: ProcessorRow): CpuSpec {
  return {
    id: row.source_id ?? row.id ?? 0,
    cpu_model_name: row.model_name,
    family: row.family,
    cpu_model: row.model,
    codename: row.codename,
    cores: row.cores,
    threads: row.threads,
    max_turbo_frequency_ghz: row.boost_clock_ghz,
    l3_cache_mb: row.cache_l3_mb,
    tdp_watts: row.tdp_watts,
    launch_year: row.launch_year,
    max_memory_tb: row.max_memory_tb,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'SiliconAtlas API' })
})

app.get('/api/processors', (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 10, 100)
  const rows = db
    .prepare(
      `SELECT source_id, model_name, family, model, codename, cores, threads,
              boost_clock_ghz, cache_l3_mb, tdp_watts, launch_year, max_memory_tb
       FROM processors
       ORDER BY launch_year DESC, (cores * boost_clock_ghz) DESC
       LIMIT ?`
    )
    .all(limit) as ProcessorRow[]
  res.json(rows.map(rowToCpuSpec))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})