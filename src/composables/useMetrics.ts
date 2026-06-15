import metricsData from '@/data/metrics.json'

export type SportKey = string
export type LeagueKey = string
export type ChannelKey = string
export type MetricKey = 'revenue' | 'viewers' | 'conversions' | 'orders'

export interface LeagueRef {
  key: LeagueKey
  label: string
}

export interface SportRef {
  key: SportKey
  label: string
  icon: string
  leagues: LeagueRef[]
}

export interface MonthRow {
  month: string
  revenue: number
  viewers: number
  conversions: number
  conversionValue: number
  orders: number
}

export interface ProductRow {
  name: string
  sport: SportKey
  monthly: { month: string; revenue: number; orders: number; conversions: number }[]
}

export interface MetricsDataset {
  meta: {
    company: string
    year: number
    generatedAt: string
    currency: string
    notes: string
  }
  months: string[]
  sports: SportRef[]
  data: Record<SportKey, Record<LeagueKey, { monthly: MonthRow[] }>>
  products: ProductRow[]
}

const dataset = metricsData as unknown as MetricsDataset

export type PeriodKey = 'full' | 'h1' | 'h2' | 'q1' | 'q2' | 'q3' | 'q4'

export interface PeriodOption {
  key: PeriodKey
  label: string
  months: number[] // indices into dataset.months
}

export const periods: PeriodOption[] = [
  { key: 'full', label: 'Full Year', months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { key: 'h1', label: 'H1 (Jan–Jun)', months: [0, 1, 2, 3, 4, 5] },
  { key: 'h2', label: 'H2 (Jul–Dec)', months: [6, 7, 8, 9, 10, 11] },
  { key: 'q1', label: 'Q1', months: [0, 1, 2] },
  { key: 'q2', label: 'Q2', months: [3, 4, 5] },
  { key: 'q3', label: 'Q3', months: [6, 7, 8] },
  { key: 'q4', label: 'Q4', months: [9, 10, 11] },
]

export interface ChannelRef {
  key: ChannelKey
  label: string
  icon: string
  share: number // portion of spend/audience attributed to this channel
  conversionFactor: number // relative conversion effectiveness vs. the blended rate
}

// Channel mix used to split the blended metrics. Shares sum to 1.
export const channels: ChannelRef[] = [
  { key: 'all', label: 'All Channels', icon: 'mdi-rhombus-split', share: 1, conversionFactor: 1 },
  { key: 'internet', label: 'Internet', icon: 'mdi-web', share: 0.34, conversionFactor: 1.15 },
  { key: 'tv', label: 'TV', icon: 'mdi-television-classic', share: 0.3, conversionFactor: 0.95 },
  { key: 'social', label: 'Social', icon: 'mdi-thumb-up-outline', share: 0.18, conversionFactor: 1.25 },
  { key: 'radio', label: 'Radio', icon: 'mdi-radio', share: 0.1, conversionFactor: 0.8 },
  { key: 'print', label: 'Print', icon: 'mdi-newspaper-variant-outline', share: 0.08, conversionFactor: 0.7 },
]

function channelOf(key: ChannelKey | 'all'): ChannelRef {
  return channels.find((c) => c.key === key) ?? channels[0]!
}

export interface MetricSeries {
  labels: string[]
  revenue: number[]
  viewers: number[]
  conversions: number[]
  orders: number[]
  conversionValue: number[]
}

const EMPTY_ROW = (month: string): MonthRow => ({
  month,
  revenue: 0,
  viewers: 0,
  conversions: 0,
  conversionValue: 0,
  orders: 0,
})

// Collect the league monthly arrays that match a sport/league selection.
function selectedLeagueRows(sport: SportKey | 'all', league: LeagueKey | 'all'): MonthRow[][] {
  const rows: MonthRow[][] = []
  const sportKeys = sport === 'all' ? dataset.sports.map((s) => s.key) : [sport]
  for (const sk of sportKeys) {
    const leagues = dataset.data[sk]
    if (!leagues) continue
    const leagueKeys = sport !== 'all' && league !== 'all' ? [league] : Object.keys(leagues)
    for (const lk of leagueKeys) {
      const entry = leagues[lk]
      if (entry) rows.push(entry.monthly)
    }
  }
  return rows
}

// Aggregate selected leagues into a single 12-month series (conversions = weighted avg by orders).
function aggregateMonthly(rows: MonthRow[][]): MonthRow[] {
  return dataset.months.map((month, m) => {
    const acc = EMPTY_ROW(month)
    let convWeight = 0
    for (const series of rows) {
      const r = series[m]
      if (!r) continue
      acc.revenue += r.revenue
      acc.viewers += r.viewers
      acc.orders += r.orders
      acc.conversionValue += r.conversionValue
      acc.conversions += r.conversions * r.orders
      convWeight += r.orders
    }
    acc.conversions = convWeight > 0 ? acc.conversions / convWeight : 0
    return acc
  })
}

export interface MetricSummary {
  total: number
  delta: number // % momentum: 2nd half vs 1st half of the selected range
  average: number
}

function summarize(values: number[], mode: 'sum' | 'avg'): MetricSummary {
  if (values.length === 0) return { total: 0, delta: 0, average: 0 }
  const total = values.reduce((a, b) => a + b, 0)
  const average = total / values.length
  const mid = Math.floor(values.length / 2)
  const firstHalf = values.slice(0, mid)
  const secondHalf = values.slice(mid)
  const sumFirst = firstHalf.reduce((a, b) => a + b, 0) || 0
  const avgFirst = firstHalf.length ? sumFirst / firstHalf.length : 0
  const avgSecond = secondHalf.length
    ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    : 0
  const delta = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0
  return { total, average, delta: Math.round(delta * 10) / 10 }
}

export function useMetrics() {
  const meta = dataset.meta
  const months = dataset.months
  const sports = dataset.sports

  function getSeries(
    sport: SportKey | 'all',
    league: LeagueKey | 'all',
    period: PeriodOption,
    channel: ChannelKey | 'all' = 'all',
  ): MetricSeries {
    const monthly = aggregateMonthly(selectedLeagueRows(sport, league))
    const ch = channelOf(channel)
    const idx = period.months
    return {
      labels: idx.map((m) => months[m] ?? ''),
      revenue: idx.map((m) => Math.round((monthly[m]?.revenue ?? 0) * ch.share)),
      viewers: idx.map((m) => Math.round((monthly[m]?.viewers ?? 0) * ch.share)),
      conversions: idx.map(
        (m) => Math.round((monthly[m]?.conversions ?? 0) * ch.conversionFactor * 100) / 100,
      ),
      orders: idx.map((m) => Math.round((monthly[m]?.orders ?? 0) * ch.share)),
      conversionValue: idx.map((m) => Math.round((monthly[m]?.conversionValue ?? 0) * ch.share)),
    }
  }

  function summarizeMetric(series: MetricSeries, metric: MetricKey): MetricSummary {
    const mode = metric === 'conversions' ? 'avg' : 'sum'
    return summarize(series[metric], mode)
  }

  // Per-league breakdown for a metric over the selected period (for detail modals).
  function leagueBreakdown(
    sport: SportKey | 'all',
    period: PeriodOption,
    metric: MetricKey,
    channel: ChannelKey | 'all' = 'all',
  ) {
    const ch = channelOf(channel)
    const rows: { sport: string; league: string; value: number }[] = []
    const sportRefs = sport === 'all' ? sports : sports.filter((s) => s.key === sport)
    for (const s of sportRefs) {
      for (const lg of s.leagues) {
        const monthly = dataset.data[s.key]?.[lg.key]?.monthly ?? []
        let value = 0
        if (metric === 'conversions') {
          let w = 0
          for (const m of period.months) {
            const r = monthly[m]
            if (r) {
              value += r.conversions * r.orders
              w += r.orders
            }
          }
          value = w > 0 ? (value / w) * ch.conversionFactor : 0
        } else {
          for (const m of period.months) value += monthly[m]?.[metric] ?? 0
          value *= ch.share
        }
        rows.push({ sport: s.label, league: lg.label, value: Math.round(value * 100) / 100 })
      }
    }
    return rows.sort((a, b) => b.value - a.value)
  }

  // Products snapshot filtered by sport over the selected period.
  function productSnapshot(
    sport: SportKey | 'all',
    period: PeriodOption,
    channel: ChannelKey | 'all' = 'all',
  ) {
    const ch = channelOf(channel)
    const list = dataset.products.filter((p) => sport === 'all' || p.sport === sport)
    return list
      .map((p) => {
        let revenue = 0
        let orders = 0
        let convSum = 0
        for (const m of period.months) {
          const r = p.monthly[m]
          if (r) {
            revenue += r.revenue
            orders += r.orders
            convSum += r.conversions
          }
        }
        const conversions =
          period.months.length > 0 ? (convSum / period.months.length) * ch.conversionFactor : 0
        const sportLabel = sports.find((s) => s.key === p.sport)?.label ?? p.sport
        return {
          name: p.name,
          sport: sportLabel,
          revenue: Math.round(revenue * ch.share),
          orders: Math.round(orders * ch.share),
          conversions: Math.round(conversions * 100) / 100,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  }

  return {
    meta,
    months,
    sports,
    periods,
    getSeries,
    summarizeMetric,
    leagueBreakdown,
    productSnapshot,
  }
}
