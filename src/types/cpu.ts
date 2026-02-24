/** CPU record from Compute Specs DB */
export interface CpuSpec {
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