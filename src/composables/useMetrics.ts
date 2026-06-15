import metricsData from '@/data/metrics.json'

export type RangeKey = '7d' | '30d' | '90d' | 'ytd'
export type RegionKey = 'all' | 'northeast' | 'southeast' | 'midwest' | 'west' | 'southwest'

export interface RangeOption {
  key: RangeKey
  label: string
  description: string
}

export interface RegionOption {
  key: RegionKey
  label: string
}

export interface ShipmentsMetric {
  value: number
  delta: number
  trend: number[]
}

export interface OnTimeMetric {
  value: number
  delta: number
  target: number
  trend: number[]
}

export interface ExceptionType {
  type: string
  count: number
}

export interface ExceptionsMetric {
  value: number
  delta: number
  byType: ExceptionType[]
}

export interface RegionBreakdown {
  region: string
  label: string
  shipments: number
  onTimeRate: number
  exceptions: number
}

export interface HubBreakdown {
  hub: string
  shipments: number
  onTimeRate: number
}

export interface RangeSnapshot {
  shipments: ShipmentsMetric
  onTimeRate: OnTimeMetric
  exceptions: ExceptionsMetric
  regional: RegionBreakdown[] | HubBreakdown[]
}

export interface MetricsDataset {
  meta: {
    company: string
    generatedAt: string
    currency: string
    notes: string
  }
  ranges: RangeOption[]
  regions: RegionOption[]
  metrics: Record<RegionKey, Record<RangeKey, RangeSnapshot>>
}

const dataset = metricsData as unknown as MetricsDataset

export function isRegionBreakdown(
  rows: RegionBreakdown[] | HubBreakdown[],
): rows is RegionBreakdown[] {
  const first = rows[0]
  return first === undefined || 'region' in first
}

export function useMetrics() {
  const ranges = dataset.ranges
  const regions = dataset.regions

  function snapshot(region: RegionKey, range: RangeKey): RangeSnapshot {
    return dataset.metrics[region][range]
  }

  return { meta: dataset.meta, ranges, regions, snapshot }
}
