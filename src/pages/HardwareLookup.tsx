import { useState } from 'react'
import { searchProcessors, searchGpus } from '../data/searchApi'
import type { CpuSpec } from '../types/cpu'
import type { GpuSpec } from '../types/gpu'

type Tab = 'all' | 'cpus' | 'gpus'

function HardwareLookup() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [processors, setProcessors] = useState<CpuSpec[]>([])
  const [gpus, setGpus] = useState<GpuSpec[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    setError(null)
    setLoading(true)
    try {
      const limit = 30
      const [cpuRes, gpuRes] = await Promise.all([
        tab === 'gpus' ? Promise.resolve([]) : searchProcessors(query, limit),
        tab === 'cpus' ? Promise.resolve([]) : searchGpus(query, limit),
      ])
      setProcessors(cpuRes)
      setGpus(gpuRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setProcessors([])
      setGpus([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ color: '#e0e0e0', minHeight: '100%' }}>
      <h1 style={{ color: 'inherit', margin: 0 }}>Hardware Lookup</h1>
      <p style={{ color: '#aaa', marginTop: 8 }}>Search CPUs and GPUs from the database by name.</p>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          type="search"
          placeholder="e.g. Ryzen, RTX 4080"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ padding: '8px 12px', minWidth: 200 }}
        />
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          style={{ padding: '8px 12px' }}
        >
          <option value="all">All</option>
          <option value="cpus">CPUs only</option>
          <option value="gpus">GPUs only</option>
        </select>
        <button type="button" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && <p style={{ color: '#e88' }}>Error: {error}</p>}

      {!loading && (processors.length > 0 || gpus.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {processors.length > 0 && (tab === 'all' || tab === 'cpus') && (
            <section>
              <h2 style={{ color: 'inherit', marginBottom: 12 }}>CPUs ({processors.length})</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {processors.map((p) => (
                  <li
                    key={p.id}
                    style={{
                      border: '1px solid #444',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      background: '#222',
                    }}
                  >
                    <strong style={{ color: '#fff' }}>{p.cpu_model_name}</strong>
                    <div style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>
                      Family: {p.family} · Model: {p.cpu_model} · Codename: {p.codename}
                      <br />
                      Cores: {p.cores} · Threads: {p.threads} · Boost: {p.max_turbo_frequency_ghz} GHz · L3: {p.l3_cache_mb} MB · TDP: {p.tdp_watts} W · Launch: {p.launch_year} · Max memory: {p.max_memory_tb} TB
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {gpus.length > 0 && (tab === 'all' || tab === 'gpus') && (
            <section>
              <h2 style={{ color: 'inherit', marginBottom: 12 }}>GPUs ({gpus.length})</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {gpus.map((g, i) => (
                  <li
                    key={g.id ?? g.model_name + i}
                    style={{
                      border: '1px solid #444',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      background: '#222',
                    }}
                  >
                    <strong style={{ color: '#fff' }}>{g.model_name}</strong>
                    <div style={{ fontSize: 13, color: '#aaa', marginTop: 6 }}>
                      Vendor: {g.vendor} · Model: {g.model}
                      {g.form_factor != null && ` · Form: ${g.form_factor}`}
                      {g.memory_gb != null && ` · Memory: ${g.memory_gb} GB`}
                      {g.memory_type != null && ` (${g.memory_type})`}
                      {g.tdp_watts != null && ` · TDP: ${g.tdp_watts} W`}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {!loading && !error && query && processors.length === 0 && gpus.length === 0 && (
        <p style={{ color: '#888' }}>No results. Try a different search or run without a query to list recent items.</p>
      )}
    </div>
  )
}

export default HardwareLookup