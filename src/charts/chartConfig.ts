import type { ChartOptions } from 'chart.js'

// Cohesive chart palette that reads well on the dark dashboard but with white plot areas.
export const palette = {
  blue: '#4f8cff',
  teal: '#22c1a6',
  orange: '#ff8a3d',
  violet: '#9b7bff',
  pink: '#ff6fae',
  amber: '#ffb648',
}

export const seriesColors = [
  palette.blue,
  palette.teal,
  palette.orange,
  palette.violet,
  palette.pink,
  palette.amber,
]

const gridColor = 'rgba(15, 23, 42, 0.08)'
const tickColor = '#5a6472'

export function baseLineOptions(yFormatter?: (v: number) => string): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: yFormatter
          ? { label: (ctx) => ` ${yFormatter(ctx.parsed.y ?? 0)}` }
          : undefined,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor } },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          callback: (v) => (yFormatter ? yFormatter(Number(v)) : String(v)),
        },
      },
    },
  }
}

export function baseBarOptions(yFormatter?: (v: number) => string): ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: yFormatter
          ? { label: (ctx) => ` ${yFormatter(ctx.parsed.y ?? 0)}` }
          : undefined,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor } },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          callback: (v) => (yFormatter ? yFormatter(Number(v)) : String(v)),
        },
      },
    },
  }
}
