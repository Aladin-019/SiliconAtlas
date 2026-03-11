import { initDb } from './db'
import https from 'https'
import type { IncomingMessage } from 'http'

const API_BASE = 'https://computespecsdb.com'

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res: IncomingMessage) => {
        let data = ''
        res.on('data', (chunk: Buffer | string) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
  })
}

interface RawCpu {
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

interface RawGpu {
  id: number
  gpu_model_name: string
  vendor: string
  gpu_model: string
  form_factor?: string | null
  memory_gb?: number | null
  memory_type?: string | null
  tdp_watts?: number | null
}

function adaptCpu(raw: RawCpu) {
  return {
    source_id: raw.id,
    model_name: raw.cpu_model_name,
    family: raw.family,
    model: raw.cpu_model,
    codename: raw.codename,
    cores: raw.cores,
    threads: raw.threads,
    boost_clock_ghz: raw.max_turbo_frequency_ghz,
    cache_l3_mb: raw.l3_cache_mb,
    tdp_watts: raw.tdp_watts,
    launch_year: raw.launch_year,
    max_memory_tb: raw.max_memory_tb,
  }
}

function adaptGpu(raw: RawGpu) {
  return {
    source_id: raw.id,
    model_name: raw.gpu_model_name,
    vendor: raw.vendor,
    model: raw.gpu_model,
    form_factor: raw.form_factor ?? null,
    memory_gb: raw.memory_gb ?? null,
    memory_type: raw.memory_type ?? null,
    tdp_watts: raw.tdp_watts ?? null,
  }
}

async function seed() {
  const db = initDb()

  const insertProcessor = db.prepare(`
    INSERT OR REPLACE INTO processors (source_id, model_name, family, model, codename, cores, threads, boost_clock_ghz, cache_l3_mb, tdp_watts, launch_year, max_memory_tb)
    VALUES (@source_id, @model_name, @family, @model, @codename, @cores, @threads, @boost_clock_ghz, @cache_l3_mb, @tdp_watts, @launch_year, @max_memory_tb)
  `)
  const insertGpu = db.prepare(`
    INSERT OR REPLACE INTO gpus (source_id, model_name, vendor, model, form_factor, memory_gb, memory_type, tdp_watts)
    VALUES (@source_id, @model_name, @vendor, @model, @form_factor, @memory_gb, @memory_type, @tdp_watts)
  `)

  console.log('Fetching CPUs...')
  const cpus = (await fetchJson(`${API_BASE}/api/cpus`)) as RawCpu[]
  const insertManyCpus = db.transaction((rows: ReturnType<typeof adaptCpu>[]) => {
    for (const row of rows) insertProcessor.run(row)
  })
  insertManyCpus(cpus.map(adaptCpu))
  console.log(`Inserted ${cpus.length} processors.`)

  console.log('Fetching GPUs...')
  const gpus = (await fetchJson(`${API_BASE}/api/gpus`)) as RawGpu[]
  const insertManyGpus = db.transaction((rows: ReturnType<typeof adaptGpu>[]) => {
    for (const row of rows) insertGpu.run(row)
  })
  insertManyGpus(gpus.map(adaptGpu))
  console.log(`Inserted ${gpus.length} gpus.`)

  db.close()
  console.log('Seed done.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})