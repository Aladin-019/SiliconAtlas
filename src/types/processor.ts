/**
 * Canonical processor (CPU) spec used across the app.
 * All CPU data sources are mapped to this shape.
 */
export interface ProcessorSpec {
  id: number
  modelName: string
  family: string
  model: string
  codename: string
  cores: number
  threads: number
  boostClockGhz: number
  cacheL3Mb: number
  tdpWatts: number
  launchYear: number
  maxMemoryTb: number
}