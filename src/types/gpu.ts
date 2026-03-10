/**
 * Canonical GPU spec used across the app.
 * All GPU data sources are mapped to this shape.
 */
export interface GpuSpec {
  id: number
  modelName: string
  vendor: string
  model: string
  formFactor: string | null
  memoryGb: number | null
  memoryType: string | null
  tdpWatts: number | null
}