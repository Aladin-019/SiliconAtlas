import type { GpuSpec } from '../types/gpu'

/** Raw GPU record from Compute Specs DB API */
interface ComputeSpecsDbGpu {
  id: number
  gpu_model_name: string
  vendor: string
  gpu_model: string
  form_factor: string | null
  memory_gb: number | null
  memory_type: string | null
  tdp_watts: number | null
}

export function adaptGpu(raw: ComputeSpecsDbGpu): GpuSpec {
  return {
    id: raw.id,
    modelName: raw.gpu_model_name,
    vendor: raw.vendor,
    model: raw.gpu_model,
    formFactor: raw.form_factor ?? null,
    memoryGb: raw.memory_gb ?? null,
    memoryType: raw.memory_type ?? null,
    tdpWatts: raw.tdp_watts ?? null,
  }
}

export function adaptGpus(raw: ComputeSpecsDbGpu[]): GpuSpec[] {
  return raw.map(adaptGpu)
}