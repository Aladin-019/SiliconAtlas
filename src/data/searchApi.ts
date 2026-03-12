import type { CpuSpec } from '../types/cpu'
import type { GpuSpec } from '../types/gpu'

export async function searchProcessors(q: string, limit = 50): Promise<CpuSpec[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (q.trim()) params.set('q', q.trim())
  const res = await fetch(`/api/processors?${params}`)
  if (!res.ok) throw new Error('HTTP Error: ' + res.status)
  return res.json()
}

export async function searchGpus(q: string, limit = 50): Promise<GpuSpec[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (q.trim()) params.set('q', q.trim())
  const res = await fetch(`/api/gpus?${params}`)
  if (!res.ok) throw new Error('HTTP Error: ' + res.status)
  return res.json()
}