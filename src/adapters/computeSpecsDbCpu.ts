import type { ProcessorSpec } from '../types/processor'

/** Raw CPU record from Compute Specs DB API */
interface ComputeSpecsDbCpu {
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

export function adaptCpu(raw: ComputeSpecsDbCpu): ProcessorSpec {
  return {
    id: raw.id,
    modelName: raw.cpu_model_name,
    family: raw.family,
    model: raw.cpu_model,
    codename: raw.codename,
    cores: raw.cores,
    threads: raw.threads,
    boostClockGhz: raw.max_turbo_frequency_ghz,
    cacheL3Mb: raw.l3_cache_mb,
    tdpWatts: raw.tdp_watts,
    launchYear: raw.launch_year,
    maxMemoryTb: raw.max_memory_tb,
  }
}

export function adaptCpus(raw: ComputeSpecsDbCpu[]): ProcessorSpec[] {
  return raw.map(adaptCpu)
}