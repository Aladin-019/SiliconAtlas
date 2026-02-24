import type { CpuSpec } from '../types/cpu'
import topCpus from './topCpus.json'

const API_URL = 'https://computespecsdb.com/api/cpus'

/** 
 * Choose top 3 CPUs based on newer launch year and higher score (cores × frequency) as fallback
 * for equal launch years.
 * @param cpus - list of CPU specs
 * @returns top 3 CpuSpec objects
 */
function pickTopThree(cpus: CpuSpec[]): CpuSpec[] {
  const scored = [...cpus].sort((a,b) => {
    if (b.launch_year !== a.launch_year) return b.launch_year - a.launch_year
    const scoreA = a.cores * a.max_turbo_frequency_ghz
    const scoreB = b.cores * b.max_turbo_frequency_ghz
    return scoreB - scoreA
  })
  return scored.slice(0, 3)
}

/** 
 * Fetch top 3 CPUs from API 
 * @returns top 3 CpuSpec objects
 */
export async function fetchTopCpus(): Promise<CpuSpec[]> {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error('HTTP Error: ' + res.status)
    const data = (await res.json()) as CpuSpec[]
    return pickTopThree(data)
  } catch (error) {
    console.error('Error fetching top CPUs:', error)
    return topCpus as CpuSpec[]
  }
}