import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { PCA } from 'ml-pca'
import { fetchTopNCpus } from '../data/cpuData'
import type { CpuSpec } from '../types/cpu'

const MARGIN = { top: 28, right: 24, bottom: 40, left: 44 }
const N = 10

const FEATURE_KEYS = [
  'cores',
  'threads',
  'max_turbo_frequency_ghz',
  'l3_cache_mb',
  'tdp_watts',
] as const

function getFeatureMatrix(cpus: CpuSpec[]): number[][] {
  return cpus.map((cpu) =>
    FEATURE_KEYS.map((key) => cpu[key] as number)
  )
}

function PCAPlot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cpus, setCpus] = useState<CpuSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    fetchTopNCpus(N)
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
    if (!container || cpus.length < 2) return

    const width = container.clientWidth
    const height = 400
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

    const matrix = getFeatureMatrix(cpus)
    const pca = new PCA(matrix)
    const projected = pca.predict(matrix, { nComponents: 2 })
    const variance = pca.getExplainedVariance()

    const points: { pc1: number; pc2: number; cpu: CpuSpec }[] = cpus.map(
      (cpu, i) => ({
        pc1: projected.get(i, 0),
        pc2: projected.get(i, 1),
        cpu,
      })
    )

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

    const xExtent = d3.extent(points, (d) => d.pc1) as [number, number]
    const yExtent = d3.extent(points, (d) => d.pc2) as [number, number]
    const xScale = d3.scaleLinear().domain(xExtent).range([0, innerWidth]).nice()
    const yScale = d3.scaleLinear().domain(yExtent).range([innerHeight, 0]).nice()

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#888')
    g.append('g').call(d3.axisLeft(yScale)).attr('color', '#888')

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 32)
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .attr('font-size', 11)
      .text(`PC1 (${(variance[0] * 100).toFixed(1)}% var)`)
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -36)
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .attr('font-size', 11)
      .text(`PC2 (${(variance[1] * 100).toFixed(1)}% var)`)

    const color = d3.scaleOrdinal(d3.schemeCategory10)

    g.selectAll('circle')
      .data(points)
      .join('circle')
      .attr('cx', (d) => xScale(d.pc1))
      .attr('cy', (d) => yScale(d.pc2))
      .attr('r', 6)
      .attr('fill', (_, i) => color(String(i)))
      .attr('stroke', '#333')
      .attr('stroke-width', 1)

    g.selectAll('.point-label')
      .data(points)
      .join('text')
      .attr('class', 'point-label')
      .attr('x', (d) => xScale(d.pc1))
      .attr('y', (d) => yScale(d.pc2))
      .attr('dx', 8)
      .attr('dy', 4)
      .attr('fill', '#ccc')
      .attr('font-size', 10)
      .text((d) => d.cpu.cpu_model)

    return () => {
      d3.select(container).selectAll('svg').remove()
    }
  }, [cpus])

  return (
    <div>
      <h1>PCA Plot</h1>
      <p>Top {N} CPUs — first two principal components from cores, threads, freq, L3, TDP.</p>
      {loading && <p>Loading CPU data…</p>}
      {error && <p style={{ color: '#e88' }}>Error: {error}</p>}
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  )
}

export default PCAPlot