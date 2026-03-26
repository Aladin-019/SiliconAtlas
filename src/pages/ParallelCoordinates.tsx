import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { fetchTopNCpus } from '../data/cpuData'
import { searchProcessors } from '../data/searchApi'
import type { CpuSpec } from '../types/cpu'

const MARGIN = { top: 28, right: 24, bottom: 24, left: 24 }

const DIMENSIONS = [
  { key: 'cores', label: 'Cores (#)' },
  { key: 'threads', label: 'Threads (#)' },
  { key: 'max_turbo_frequency_ghz', label: 'Freq (GHz)' },
  { key: 'l3_cache_mb', label: 'L3 Cache (MB)' },
  { key: 'tdp_watts', label: 'TDP (W)' },
] as const

type DimKey = (typeof DIMENSIONS)[number]['key']

function ParallelCoordinates() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cpus, setCpus] = useState<CpuSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CpuSpec[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(null)
    fetchTopNCpus(10)
      .then((data) => {
        if (!cancelled) {
          setCpus(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch CPUs')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSearch() {
    setSearching(true)
    setSearchResults([])
    try {
      const results = await searchProcessors(searchQuery, 20)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  function addToPlot(cpu: CpuSpec) {
    setCpus((prev) => (prev.some((c) => c.id === cpu.id) ? prev : [...prev, cpu]))
  }

  function removeFromPlot(id: number) {
    setCpus((prev) => prev.filter((c) => c.id !== id))
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container || cpus.length === 0) return

    const width = container.clientWidth
    const plotHeight = 500
    const legendItemHeight = 18
    const legendHeight = Math.max(0, cpus.length * legendItemHeight + 8)
    const height = plotHeight + legendHeight
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = plotHeight - MARGIN.top - MARGIN.bottom

    d3.select(container).selectAll('svg').remove()

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    const labels = DIMENSIONS.map((d) => d.label)

    const xScale = d3
      .scalePoint()
      .domain(labels)
      .range([0, innerWidth])
      .padding(0.15)

    const yScales: Record<DimKey, d3.ScaleLinear<number, number>> = {} as Record<
      DimKey,
      d3.ScaleLinear<number, number>
    >
    DIMENSIONS.forEach(({ key }) => {
      const extent = d3.extent(cpus, (d) => d[key]) as [number, number]
      const min = extent[0] ?? 0
      const max = extent[1] ?? 1
      yScales[key] = d3
        .scaleLinear()
        .domain([min, max])
        .range([innerHeight, 0])
        .nice()
    })

    labels.forEach((label, index) => {
      const x = xScale(label) ?? 0
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#222')
        .attr('stroke-width', 1.2)

      const key = DIMENSIONS[index].key
      const axis = d3.axisLeft(yScales[key]).ticks(5).tickSize(3)
      g.append('g')
        .attr('transform', `translate(${x},0)`)
        .attr('color', '#222')
        .call(axis)
        .call((sel) => sel.selectAll('text').attr('fill', '#222').attr('font-size', 11))
        .call((sel) => sel.selectAll('path').attr('stroke', 'none'))
        .call((sel) => sel.selectAll('line').attr('stroke', '#222'))
    })

    labels.forEach((label) => {
      const x = xScale(label) ?? 0
      g.append('text')
        .attr('x', x)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#222')
        .attr('font-size', 13)
        .text(label)
    })

    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const pathGroup = g.append('g').attr('class', 'paths')

    pathGroup
      .selectAll('path')
      .data(cpus)
      .join('path')
      .attr('d', (cpu) => {
        const points = DIMENSIONS.map((d) => ({ key: d.key, label: d.label }))
        return d3
          .line<{ key: DimKey; label: string }>()
          .x((p) => xScale(p.label) ?? 0)
          .y((p) => yScales[p.key](cpu[p.key]))
          .defined(() => true)(points) ?? ''
      })
      .attr('fill', 'none')
      .attr('stroke', (_, i) => color(String(i)))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.9)

    const legend = g
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(0, ${innerHeight + 16})`)

    cpus.forEach((cpu, i) => {
      const item = legend
        .append('g')
        .attr('transform', `translate(0, ${i * legendItemHeight})`)
      item
        .append('line')
        .attr('x1', 0)
        .attr('x2', 12)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', color(String(i)))
        .attr('stroke-width', 2)
      item
        .append('text')
        .attr('x', 16)
        .attr('y', 4)
        .attr('fill', '#222')
        .attr('font-size', 12)
        .text(cpu.cpu_model_name)
    })

    return () => {
      d3.select(container).selectAll('svg').remove()
    }
  }, [cpus])

  return (
    <div>
      <h1>Parallel Coordinates</h1>
      {loading && <p>Loading CPU data…</p>}
      {error && <p style={{ color: '#8b3a2b' }}>Error: {error}</p>}

      <section style={{ marginBottom: 16 }}>
        <h2>Add processor to plot</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="Search by name (e.g. Ryzen, Intel)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ padding: '6px 10px', minWidth: 200 }}
          />
          <button type="button" onClick={handleSearch} disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {searchResults.map((p) => (
              <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13 }}>{p.cpu_model_name}</span>
                <button
                  type="button"
                  onClick={() => addToPlot(p)}
                  disabled={cpus.some((c) => c.id === p.id)}
                  style={{ fontSize: 12, padding: '2px 8px' }}
                >
                  {cpus.some((c) => c.id === p.id) ? 'In plot' : 'Add'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cpus.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <h2 style={{ margin: 0, flex: '0 0 auto' }}>In plot ({cpus.length})</h2>
            <button
              type="button"
              onClick={() => fetchTopNCpus(10).then(setCpus)}
              style={{ fontSize: 12, padding: '2px 8px' }}
            >
              Reset to top 10
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cpus.map((p) => (
              <span
                key={p.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  background: '#ddd2c0',
                  border: '1px solid #8f7f68',
                  borderRadius: 4,
                  fontSize: 12,
                  color: '#2a1f12',
                }}
              >
                {p.cpu_model}
                <button
                  type="button"
                  onClick={() => removeFromPlot(p.id)}
                  aria-label={`Remove ${p.cpu_model_name}`}
                  style={{ background: 'none', border: 'none', color: '#5a4a36', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  )
}

export default ParallelCoordinates