import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { fetchTopNCpus } from '../data/cpuData'
import type { CpuSpec } from '../types/cpu'

const MARGIN = { top: 28, right: 24, bottom: 24, left: 24 }

const DIMENSIONS = [
  { key: 'cores', label: 'Cores' },
  { key: 'threads', label: 'Threads' },
  { key: 'max_turbo_frequency_ghz', label: 'Freq (GHz)' },
  { key: 'l3_cache_mb', label: 'L3 (MB)' },
  { key: 'tdp_watts', label: 'TDP (W)' },
] as const

type DimKey = (typeof DIMENSIONS)[number]['key']

function ParallelCoordinates() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cpus, setCpus] = useState<CpuSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    const container = containerRef.current
    if (!container || cpus.length === 0) return

    const width = container.clientWidth
    const height = 400
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

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

    labels.forEach((label) => {
      const x = xScale(label) ?? 0
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#555')
        .attr('stroke-width', 1)
    })

    labels.forEach((label) => {
      const x = xScale(label) ?? 0
      g.append('text')
        .attr('x', x)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ccc')
        .attr('font-size', 11)
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
        .attr('transform', `translate(${i * (innerWidth / cpus.length)}, 0)`)
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
        .attr('fill', '#ccc')
        .attr('font-size', 10)
        .text(cpu.cpu_model)
    })

    return () => {
      d3.select(container).selectAll('svg').remove()
    }
  }, [cpus])

  return (
    <div>
      <h1>Parallel Coordinates</h1>
      {loading && <p>Loading CPU data…</p>}
      {error && <p style={{ color: '#e88' }}>Error: {error}</p>}
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  )
}

export default ParallelCoordinates