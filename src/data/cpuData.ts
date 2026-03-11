import type { CpuSpec } from '../types/cpu'

/** Fetches top N processors from our DB */
export async function fetchTopNCpus(n: number): Promise<CpuSpec[]> {
  const limit = Math.max(1, Math.min(n, 100))
  const res = await fetch(`/api/processors?limit=${limit}`)
  if (!res.ok) throw new Error('HTTP Error: ' + res.status)
  const data: CpuSpec[] = await res.json()
  return data
}