import type { CpuSpec } from '../types/cpu'

const API_URL = '/api/cpus'

function pickTopN(cpus: CpuSpec[], n: number): CpuSpec[] {
  const scored = [...cpus].sort((a, b) => {
    if (b.launch_year !== a.launch_year) return b.launch_year - a.launch_year
    return b.cores * b.max_turbo_frequency_ghz - a.cores * a.max_turbo_frequency_ghz
  })
  return scored.slice(0, n)
}

export async function fetchTopNCpus(n: number): Promise<CpuSpec[]> {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error('HTTP Error: ' + res.status)
    const raw = await res.json()
    return pickTopN(raw, n)
  } catch (error) {
    console.error('Error fetching CPUs:', error)
    throw error
  }
}