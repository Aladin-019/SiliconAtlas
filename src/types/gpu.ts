/** GPU record from Compute Specs DB */
export interface GpuSpec {
  id?: number
  source_id?: number
  model_name: string
  vendor: string
  model: string
  form_factor: string | null
  memory_gb: number | null
  memory_type: string | null
  tdp_watts: number | null
  created_at?: string
}