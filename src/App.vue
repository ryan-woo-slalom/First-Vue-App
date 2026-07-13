<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChartData } from 'chart.js'
import ReportCard from './components/ReportCard.vue'
import {
  useMetrics,
  periods,
  channels,
  type MetricKey,
  type PeriodKey,
  type SportKey,
  type LeagueKey,
  type ChannelKey,
} from './composables/useMetrics'
import { palette, baseLineOptions, baseBarOptions } from './charts/chartConfig'

const { meta, sports, getSeries, summarizeMetric, leagueBreakdown, productSnapshot } = useMetrics()

// --- Global filters ---
const selectedSport = ref<SportKey | 'all'>('all')
const selectedLeague = ref<LeagueKey | 'all'>('all')
const selectedChannel = ref<ChannelKey | 'all'>('all')
const selectedPeriod = ref<PeriodKey>('full')

const sportOptions = computed(() => [
  { key: 'all', label: 'All Sports', icon: 'mdi-trophy' },
  ...sports.map((s) => ({ key: s.key, label: s.label, icon: s.icon })),
])

const leagueOptions = computed(() => {
  if (selectedSport.value === 'all') return [{ key: 'all', label: 'All Leagues' }]
  const sport = sports.find((s) => s.key === selectedSport.value)
  return [{ key: 'all', label: 'All Leagues' }, ...(sport?.leagues ?? [])]
})

const leagueDisabled = computed(() => selectedSport.value === 'all')

// Reset league when the sport changes.
watch(selectedSport, () => {
  selectedLeague.value = 'all'
})

const activePeriod = computed(
  () => periods.find((p) => p.key === selectedPeriod.value) ?? periods[0]!,
)

const series = computed(() =>
  getSeries(selectedSport.value, selectedLeague.value, activePeriod.value, selectedChannel.value),
)

// --- Formatters ---
const currencyCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const currencyFull = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const numberCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const numberFull = new Intl.NumberFormat('en-US')

const fmtMoney = (n: number) => currencyCompact.format(n)
const fmtMoneyFull = (n: number) => currencyFull.format(n)
const fmtNum = (n: number) => numberCompact.format(n)
const fmtNumFull = (n: number) => numberFull.format(n)
const fmtPct = (n: number) => `${n.toFixed(1)}%`

// --- Summaries ---
const revenueSum = computed(() => summarizeMetric(series.value, 'revenue'))
const viewersSum = computed(() => summarizeMetric(series.value, 'viewers'))
const conversionsSum = computed(() => summarizeMetric(series.value, 'conversions'))
const ordersSum = computed(() => summarizeMetric(series.value, 'orders'))
const churnSum = computed(() => summarizeMetric(series.value, 'churn'))
const engagementSum = computed(() => summarizeMetric(series.value, 'engagementRate'))

// --- Chart datasets ---
function lineData(data: number[], color: string, label: string): ChartData<'line' | 'bar'> {
  return {
    labels: series.value.labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}22`,
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 2,
        pointBackgroundColor: color,
      },
    ],
  }
}

function barData(data: number[], color: string, label: string): ChartData<'line' | 'bar'> {
  return {
    labels: series.value.labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: color,
        borderRadius: 6,
        maxBarThickness: 34,
      },
    ],
  }
}

const revenueChart = computed(() => lineData(series.value.revenue, palette.blue, 'Revenue'))
const viewersChart = computed(() => barData(series.value.viewers, palette.teal, 'Viewers'))
const conversionsChart = computed(() =>
  lineData(series.value.conversions, palette.orange, 'Conversion rate'),
)
const ordersChart = computed(() => barData(series.value.orders, palette.violet, 'Orders'))
const churnChart = computed(() => lineData(series.value.churn, palette.pink, 'Churn Rate'))
const engagementChart = computed(() =>
  lineData(series.value.engagementRate, palette.amber, 'Engagement Rate'),
)

const revenueOpts = baseLineOptions(fmtMoney)
const viewersOpts = baseBarOptions(fmtNum)
const conversionsOpts = baseLineOptions((v) => `${v}%`)
const ordersOpts = baseBarOptions(fmtNum)
const churnOpts = baseLineOptions((v) => `${v}%`)
const engagementOpts = baseLineOptions((v) => `${v}%`)

// --- Products snapshot ---
const products = computed(() =>
  productSnapshot(selectedSport.value, activePeriod.value, selectedChannel.value),
)

// --- Details modal ---
const detailsOpen = ref(false)
const activeMetric = ref<MetricKey>('revenue')

const metricMeta: Record<
  MetricKey,
  { title: string; icon: string; format: (n: number) => string; mode: 'sum' | 'avg' }
> = {
  revenue: { title: 'Revenue', icon: 'mdi-cash-multiple', format: fmtMoneyFull, mode: 'sum' },
  viewers: { title: 'Viewers', icon: 'mdi-eye', format: fmtNumFull, mode: 'sum' },
  conversions: { title: 'Conversion Rate', icon: 'mdi-percent', format: fmtPct, mode: 'avg' },
  orders: { title: 'Orders', icon: 'mdi-cart', format: fmtNumFull, mode: 'sum' },
  churn: { title: 'Subscriber Churn', icon: 'mdi-account-minus-outline', format: fmtPct, mode: 'avg' },
  engagementRate: { title: 'Engagement Rate', icon: 'mdi-heart-pulse', format: fmtPct, mode: 'avg' },
}

function openDetails(metric: MetricKey) {
  activeMetric.value = metric
  detailsOpen.value = true
}

const detailSummary = computed(() => summarizeMetric(series.value, activeMetric.value))
const detailMonthly = computed(() => {
  const s = series.value
  return s.labels.map((label, i) => ({ month: label, value: s[activeMetric.value][i] ?? 0 }))
})
const detailBreakdown = computed(() =>
  leagueBreakdown(
    selectedSport.value,
    activePeriod.value,
    activeMetric.value,
    selectedChannel.value,
  ),
)
const breakdownMax = computed(() => Math.max(1, ...detailBreakdown.value.map((r) => r.value)))

const activeSportLabel = computed(
  () => sportOptions.value.find((s) => s.key === selectedSport.value)?.label ?? 'All Sports',
)
const activeLeagueLabel = computed(
  () => leagueOptions.value.find((l) => l.key === selectedLeague.value)?.label ?? 'All Leagues',
)
const activeChannelLabel = computed(
  () => channels.find((c) => c.key === selectedChannel.value)?.label ?? 'All Channels',
)
const contextLabel = computed(() => {
  const scope =
    selectedSport.value === 'all'
      ? 'All Sports'
      : selectedLeague.value === 'all'
        ? activeSportLabel.value
        : `${activeSportLabel.value} · ${activeLeagueLabel.value}`
  const channelLabel =
    selectedChannel.value === 'all' ? 'All Channels' : activeChannelLabel.value
  return `${scope} · ${channelLabel} · ${activePeriod.value.label}`
})
</script>

<template>
  <v-app>
    <v-app-bar class="app-header" flat height="68">
      <template #prepend>
        <v-avatar class="logo-mark ms-2" size="40" rounded="lg">
          <v-icon icon="mdi-bullseye-arrow" color="white" size="24" />
        </v-avatar>
        <div class="ms-3 brand-text">
          <span class="brand-name">{{ meta.company }}</span>
          <span class="brand-sub">Sports Ad Analytics</span>
        </div>
      </template>

      <template #append>
        <v-btn icon="mdi-bell-outline" variant="text" class="me-1" />
        <v-menu location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn v-bind="props" class="profile-btn me-2" variant="text" rounded="pill">
              <v-avatar class="me-2" size="30" color="primary">
                <span class="avatar-initials">AM</span>
              </v-avatar>
              <span class="profile-name">Alex Morgan</span>
              <v-icon end icon="mdi-chevron-down" />
            </v-btn>
          </template>
          <v-list density="compact" min-width="190" rounded="lg">
            <v-list-item title="Profile" prepend-icon="mdi-account" />
            <v-list-item title="Account settings" prepend-icon="mdi-cog" />
            <v-list-item title="Sign out" prepend-icon="mdi-logout" />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main class="dashboard">
      <v-container class="py-6" fluid>
        <!-- Title + filters -->
        <div class="page-head">
          <div>
            <h1 class="page-title">Campaign Performance</h1>
            <p class="page-sub">{{ contextLabel }}</p>
          </div>
          <div class="filters">
            <v-select
              v-model="selectedSport"
              :items="sportOptions"
              item-title="label"
              item-value="key"
              label="Sport"
              variant="solo-filled"
              density="comfortable"
              hide-details
              flat
              class="filter-select"
              prepend-inner-icon="mdi-trophy-outline"
            />
            <v-select
              v-model="selectedLeague"
              :items="leagueOptions"
              item-title="label"
              item-value="key"
              label="League"
              variant="solo-filled"
              density="comfortable"
              hide-details
              flat
              class="filter-select"
              :disabled="leagueDisabled"
              prepend-inner-icon="mdi-shield-outline"
            />
            <v-select
              v-model="selectedChannel"
              :items="channels"
              item-title="label"
              item-value="key"
              label="Channel"
              variant="solo-filled"
              density="comfortable"
              hide-details
              flat
              class="filter-select"
              prepend-inner-icon="mdi-access-point"
            />
            <v-select
              v-model="selectedPeriod"
              :items="periods"
              item-title="label"
              item-value="key"
              label="Time period"
              variant="solo-filled"
              density="comfortable"
              hide-details
              flat
              class="filter-select"
              prepend-inner-icon="mdi-calendar-range"
            />
          </div>
        </div>

        <!-- Four report cards -->
        <v-row align="stretch">
          <v-col cols="12" md="6" xl="3" class="d-flex">
            <ReportCard
              title="Revenue"
              icon="mdi-cash-multiple"
              :headline="fmtMoney(revenueSum.total)"
              caption="total this period"
              :delta="revenueSum.delta"
              chart-type="line"
              :chart-data="revenueChart"
              :line-options="revenueOpts"
              @details="openDetails('revenue')"
            />
          </v-col>
          <v-col cols="12" md="6" xl="3" class="d-flex">
            <ReportCard
              title="Viewers"
              icon="mdi-eye"
              :headline="fmtNum(viewersSum.total)"
              caption="impressions reached"
              :delta="viewersSum.delta"
              chart-type="bar"
              :chart-data="viewersChart"
              :bar-options="viewersOpts"
              @details="openDetails('viewers')"
            />
          </v-col>
          <v-col cols="12" md="6" xl="3" class="d-flex">
            <ReportCard
              title="Conversion Rate"
              icon="mdi-percent"
              :headline="fmtPct(conversionsSum.average)"
              caption="period average"
              :delta="conversionsSum.delta"
              chart-type="line"
              :chart-data="conversionsChart"
              :line-options="conversionsOpts"
              @details="openDetails('conversions')"
            />
          </v-col>
          <v-col cols="12" md="6" xl="3" class="d-flex">
            <ReportCard
              title="Orders"
              icon="mdi-cart"
              :headline="fmtNum(ordersSum.total)"
              caption="orders placed"
              :delta="ordersSum.delta"
              chart-type="bar"
              :chart-data="ordersChart"
              :bar-options="ordersOpts"
              @details="openDetails('orders')"
            />
          </v-col>
          <v-col cols="12" md="6" xl="3" class="d-flex">
            <ReportCard
              title="Subscriber Churn"
              icon="mdi-account-minus-outline"
              :headline="fmtPct(churnSum.average)"
              caption="avg churn rate"
              :delta="churnSum.delta"
              :delta-positive-is-good="false"
              chart-type="line"
              :chart-data="churnChart"
              :line-options="churnOpts"
              @details="openDetails('churn')"
            />
          </v-col>
          <v-col cols="12" md="6" xl="3" class="d-flex">
            <ReportCard
              title="Engagement Rate"
              icon="mdi-heart-pulse"
              :headline="fmtPct(engagementSum.average)"
              caption="avg engagement rate"
              :delta="engagementSum.delta"
              chart-type="line"
              :chart-data="engagementChart"
              :line-options="engagementOpts"
              @details="openDetails('engagementRate')"
            />
          </v-col>
        </v-row>

        <!-- Products snapshot -->
        <v-card class="products-card mt-2" border>
          <div class="products-head">
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-package-variant-closed" color="primary" />
              <h2 class="products-title">Products Snapshot</h2>
            </div>
            <span class="products-context">{{ contextLabel }}</span>
          </div>
          <v-table class="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sport</th>
                <th class="text-right">Revenue</th>
                <th class="text-right">Orders</th>
                <th class="text-right">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.name">
                <td class="product-name">{{ p.name }}</td>
                <td>
                  <v-chip size="x-small" variant="tonal" color="primary">{{ p.sport }}</v-chip>
                </td>
                <td class="text-right num">{{ fmtMoneyFull(p.revenue) }}</td>
                <td class="text-right num">{{ fmtNumFull(p.orders) }}</td>
                <td class="text-right num">{{ fmtPct(p.conversions) }}</td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="5" class="text-center text-medium-emphasis py-6">
                  No products for this selection.
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-container>
    </v-main>

    <v-footer class="app-footer" app absolute>
      <span>© {{ meta.year }} {{ meta.company }} · Internal analytics</span>
    </v-footer>

    <!-- Report details modal -->
    <v-dialog v-model="detailsOpen" max-width="640" scrollable>
      <v-card class="details-card">
        <v-card-title class="details-header">
          <div class="d-flex align-center ga-3">
            <v-avatar class="details-icon" size="38" rounded="md">
              <v-icon :icon="metricMeta[activeMetric].icon" />
            </v-avatar>
            <div>
              <span class="details-title">{{ metricMeta[activeMetric].title }}</span>
              <span class="details-context">{{ contextLabel }}</span>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="detailsOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="details-body">
          <div class="details-summary">
            <div class="summary-block">
              <span class="summary-label">
                {{ metricMeta[activeMetric].mode === 'avg' ? 'Average' : 'Total' }}
              </span>
              <span class="summary-value">
                {{
                  metricMeta[activeMetric].format(
                    metricMeta[activeMetric].mode === 'avg'
                      ? detailSummary.average
                      : detailSummary.total,
                  )
                }}
              </span>
            </div>
            <div class="summary-block">
              <span class="summary-label">Momentum</span>
              <span class="summary-value" :class="detailSummary.delta >= 0 ? 'pos' : 'neg'">
                {{ detailSummary.delta >= 0 ? '+' : '' }}{{ detailSummary.delta.toFixed(1) }}%
              </span>
            </div>
          </div>

          <h3 class="details-section">Monthly breakdown</h3>
          <v-table density="compact" class="details-table">
            <thead>
              <tr>
                <th>Month</th>
                <th class="text-right">{{ metricMeta[activeMetric].title }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in detailMonthly" :key="row.month">
                <td>{{ row.month }}</td>
                <td class="text-right num">{{ metricMeta[activeMetric].format(row.value) }}</td>
              </tr>
            </tbody>
          </v-table>

          <h3 class="details-section">By league</h3>
          <div class="breakdown-list">
            <div
              v-for="row in detailBreakdown"
              :key="row.sport + row.league"
              class="breakdown-row"
            >
              <div class="breakdown-info">
                <span class="breakdown-league">{{ row.league }}</span>
                <span class="breakdown-sport">{{ row.sport }}</span>
              </div>
              <div class="breakdown-bar-wrap">
                <div
                  class="breakdown-bar"
                  :style="{ width: `${(row.value / breakdownMax) * 100}%` }"
                />
              </div>
              <span class="breakdown-value">{{ metricMeta[activeMetric].format(row.value) }}</span>
            </div>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="primary" @click="detailsOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
/* Header */
.app-header :deep(.v-toolbar__content) {
  background: linear-gradient(90deg, #11151c 0%, #161b22 100%);
  border-bottom: 1px solid #232a33;
}

.logo-mark {
  background: linear-gradient(145deg, #4f8cff, #22c1a6);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-name {
  font-weight: 800;
  font-size: 1.02rem;
  color: #ffffff;
}

.brand-sub {
  font-size: 0.72rem;
  color: #8b949e;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.profile-btn {
  text-transform: none;
}

.profile-name {
  color: #e6edf3;
  font-weight: 600;
}

.avatar-initials {
  font-size: 0.74rem;
  font-weight: 700;
  color: #fff;
}

/* Dashboard body */
.dashboard {
  background: #0e1117;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.page-sub {
  margin: 4px 0 0;
  color: #8b949e;
  font-size: 0.9rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-select {
  min-width: 190px;
}

/* Products */
.products-card {
  background: #161b22;
}

.products-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 18px 8px;
}

.products-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #e6edf3;
  margin: 0;
}

.products-context {
  font-size: 0.8rem;
  color: #8b949e;
}

.products-table {
  background: transparent;
}

.products-table :deep(th) {
  font-size: 0.72rem !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b949e !important;
}

.products-table :deep(td) {
  font-size: 0.88rem;
  color: #d8e0e8;
}

.product-name {
  font-weight: 600;
  color: #ffffff !important;
}

.num {
  font-variant-numeric: tabular-nums;
}

.text-right {
  text-align: right !important;
}

/* Footer */
.app-footer {
  background: #11151c;
  border-top: 1px solid #232a33;
  color: #8b949e;
  font-size: 0.8rem;
}

/* Details modal */
.details-card {
  background: #161b22;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.details-icon {
  background: rgba(79, 140, 255, 0.16);
  color: #4f8cff;
}

.details-title {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.details-context {
  font-size: 0.78rem;
  color: #8b949e;
}

.details-body {
  padding: 16px;
}

.details-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.summary-block {
  flex: 1 1 0;
  background: #0e1117;
  border: 1px solid #232a33;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b949e;
}

.summary-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
}

.summary-value.pos {
  color: #22c1a6;
}

.summary-value.neg {
  color: #ff5a6a;
}

.details-section {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b949e;
  margin: 18px 0 8px;
}

.details-table {
  background: transparent;
}

.details-table :deep(th) {
  font-size: 0.72rem !important;
  text-transform: uppercase;
  color: #8b949e !important;
}

.details-table :deep(td) {
  color: #d8e0e8;
  font-size: 0.86rem;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.breakdown-info {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.breakdown-league {
  font-size: 0.86rem;
  font-weight: 600;
  color: #e6edf3;
}

.breakdown-sport {
  font-size: 0.72rem;
  color: #8b949e;
}

.breakdown-bar-wrap {
  flex: 1 1 auto;
  height: 8px;
  background: #0e1117;
  border-radius: 6px;
  overflow: hidden;
}

.breakdown-bar {
  height: 100%;
  background: linear-gradient(90deg, #4f8cff, #22c1a6);
  border-radius: 6px;
}

.breakdown-value {
  min-width: 92px;
  text-align: right;
  font-size: 0.84rem;
  font-weight: 700;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 600px) {
  .filters {
    width: 100%;
  }
  .filter-select {
    flex: 1 1 140px;
    min-width: 0;
  }
}
</style>
