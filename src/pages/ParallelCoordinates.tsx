import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 }
const METRICS_DIMS = ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4']

function ParallelCoordinates() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = 400
    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

    // remove any previous SVG
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

    const xScale = d3
      .scalePoint()
      .domain(METRICS_DIMS)
      .range([0, innerWidth])
      .padding(0.1)

    // Draw empty axes (vertical lines only)
    METRICS_DIMS.forEach((dim) => {
      const x = xScale(dim) ?? 0
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
    })

    // Axis labels
    g.selectAll('.dim-label')
      .data(METRICS_DIMS)
      .join('text')
      .attr('class', 'dim-label')
      .attr('x', (d: string) => xScale(d) ?? 0)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .attr('font-size', 12)
      .text((d: string) => d)

    return () => {
      d3.select(container).selectAll('svg').remove()
    }
  }, [])

  return (
    <div>
      <h1>Parallel Coordinates</h1>
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  )
}

export default ParallelCoordinates
