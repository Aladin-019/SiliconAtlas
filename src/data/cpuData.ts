import type { CpuSpec } from '../types/cpu'

/** Proxied in dev (vite.config) to avoid CORS; in production, need a backend proxy. */
const API_URL = '/api/cpus'

/** 
 * Choose top 3 CPUs based on newer launch year and higher score (cores × frequency) as fallback
 * for equal launch years.
 * @param cpus - list of CPU specs
 * @returns top 3 CpuSpec objects
 */
function pickTopNCpus(cpus: CpuSpec[], n: number): CpuSpec[] {
  const scored = [...cpus].sort((a,b) => {
    if (b.launch_year !== a.launch_year) return b.launch_year - a.launch_year
    const scoreA = a.cores * a.max_turbo_frequency_ghz
    const scoreB = b.cores * b.max_turbo_frequency_ghz
    return scoreB - scoreA
  })
  return scored.slice(0, n)
}

/** 
 * Fetch top 3 CPUs from API 
 * @returns top 3 CpuSpec objects
 */
export async function fetchTopNCpus(n: number): Promise<CpuSpec[]> {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error('HTTP Error: ' + res.status)
    const data = (await res.json()) as CpuSpec[]
    return pickTopNCpus(data, n)
  } catch (error) {
    console.error('Error fetching top CPUs:', error)
    throw error
  }
}