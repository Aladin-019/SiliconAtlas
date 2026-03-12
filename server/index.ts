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

/** Same shape as frontend GpuSpec (API response). */
interface GpuSpec {
  id?: number
  source_id?: number
  model_name: string
  vendor: string
  model: string
  form_factor: string | null
  memory_gb: number | null
  memory_type: string | null
  tdp_watts: number | null
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

interface GpuRow {
  source_id: number | null
  id?: number
  model_name: string
  vendor: string
  model: string
  form_factor: string | null
  memory_gb: number | null
  memory_type: string | null
  tdp_watts: number | null
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

function rowToGpuSpec(row: GpuRow): GpuSpec {
  return {
    id: row.source_id ?? row.id,
    source_id: row.source_id ?? undefined,
    model_name: row.model_name,
    vendor: row.vendor,
    model: row.model,
    form_factor: row.form_factor,
    memory_gb: row.memory_gb,
    memory_type: row.memory_type,
    tdp_watts: row.tdp_watts,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'SiliconAtlas API' })
})

app.get('/api/processors', (req, res) => {
  const q = String(req.query.q ?? '').trim()
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 50, 100)
  let rows: ProcessorRow[]
  if (q) {
    const stmt = db.prepare(
      `SELECT source_id, model_name, family, model, codename, cores, threads,
              boost_clock_ghz, cache_l3_mb, tdp_watts, launch_year, max_memory_tb
       FROM processors
       WHERE model_name LIKE ?
       ORDER BY launch_year DESC, (cores * boost_clock_ghz) DESC
       LIMIT ?`
    )
    rows = stmt.all(`%${q}%`, limit) as ProcessorRow[]
  } else {
    rows = db
      .prepare(
        `SELECT source_id, model_name, family, model, codename, cores, threads,
                boost_clock_ghz, cache_l3_mb, tdp_watts, launch_year, max_memory_tb
         FROM processors
         ORDER BY launch_year DESC, (cores * boost_clock_ghz) DESC
         LIMIT ?`
      )
      .all(limit) as ProcessorRow[]
  }
  res.json(rows.map(rowToCpuSpec))
})

app.get('/api/gpus', (req, res) => {
  const q = String(req.query.q ?? '').trim()
  const limit = Math.min(parseInt(String(req.query.limit), 10) || 50, 100)
  let rows: GpuRow[]
  if (q) {
    const stmt = db.prepare(
      `SELECT source_id, model_name, vendor, model, form_factor, memory_gb, memory_type, tdp_watts
       FROM gpus
       WHERE model_name LIKE ?
       ORDER BY model_name
       LIMIT ?`
    )
    rows = stmt.all(`%${q}%`, limit) as GpuRow[]
  } else {
    rows = db
      .prepare(
        `SELECT source_id, model_name, vendor, model, form_factor, memory_gb, memory_type, tdp_watts
         FROM gpus
         ORDER BY model_name
         LIMIT ?`
      )
      .all(limit) as GpuRow[]
  }
  res.json(rows.map(rowToGpuSpec))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})