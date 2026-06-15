<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MetricCard from './components/MetricCard.vue'
import {
  useMetrics,
  isRegionBreakdown,
  type RangeKey,
  type RegionKey,
} from './composables/useMetrics'

const { ranges, regions, snapshot } = useMetrics()

type KpiKey = 'shipments' | 'ontime' | 'regional' | 'exceptions'

const selectedRegion = ref<RegionKey>('all')

const selectedRange = reactive<Record<KpiKey, RangeKey>>({
  shipments: '7d',
  ontime: '7d',
  regional: '7d',
  exceptions: '7d',
})

const numberFmt = new Intl.NumberFormat('en-US')
const formatNumber = (n: number) => numberFmt.format(n)
const formatPercent = (n: number) => `${n.toFixed(1)}%`

const activeRegionLabel = computed(
  () => regions.find((r) => r.key === selectedRegion.value)?.label ?? 'All Regions',
)

const rangeLabel = (key: RangeKey) => ranges.find((r) => r.key === key)?.label ?? key

// Per-card snapshots reactive to the selected region and that card's range.
const shipmentsSnap = computed(() => snapshot(selectedRegion.value, selectedRange.shipments))
const ontimeSnap = computed(() => snapshot(selectedRegion.value, selectedRange.ontime))
const regionalSnap = computed(() => snapshot(selectedRegion.value, selectedRange.regional))
const exceptionsSnap = computed(() => snapshot(selectedRegion.value, selectedRange.exceptions))

const shipmentsPerDay = computed(() => {
  const days = { '7d': 7, '30d': 30, '90d': 90, ytd: 166 }[selectedRange.shipments]
  return Math.round(shipmentsSnap.value.shipments.value / days)
})

const ontimeTargetGap = computed(() => {
  const m = ontimeSnap.value.onTimeRate
  return +(m.value - m.target).toFixed(1)
})

// Regional card: either region rows (when "All") or hub rows (specific region).
const regionalRows = computed(() => regionalSnap.value.regional)
const showingRegions = computed(() => isRegionBreakdown(regionalRows.value))

// --- See Details right panel ---
const detailsOpen = ref(false)
const activeKpi = ref<KpiKey>('shipments')

const kpiMeta: Record<KpiKey, { title: string; icon: string }> = {
  shipments: { title: 'Shipment Volume', icon: 'mdi-truck-fast' },
  ontime: { title: 'On-Time Delivery Rate', icon: 'mdi-clock-check' },
  regional: { title: 'Regional Performance', icon: 'mdi-map-marker-radius' },
  exceptions: { title: 'Open Exceptions', icon: 'mdi-alert-circle' },
}

function openDetails(kpi: KpiKey) {
  activeKpi.value = kpi
  detailsOpen.value = true
}

const detailSnap = computed(() =>
  snapshot(selectedRegion.value, selectedRange[activeKpi.value]),
)

const detailRangeLabel = computed(() => rangeLabel(selectedRange[activeKpi.value]))

// Breakdown rows for the panel (regions when "All", hubs otherwise).
const detailRows = computed(() => detailSnap.value.regional)
const detailShowingRegions = computed(() => isRegionBreakdown(detailRows.value))
</script>

<template>
  <v-app>
    <v-app-bar class="top-header" flat height="84">
      <template #prepend>
        <v-avatar class="brand-icon ms-2" size="52" rounded="lg">
          <v-icon icon="mdi-truck-fast" size="32" color="white" />
        </v-avatar>
        <div class="ms-3">
          <p class="eyebrow">Operations Dashboard</p>
          <h1 class="brand-title">FastForward Logistics</h1>
        </div>
      </template>

      <template #append>
        <v-menu location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="profile-trigger me-2"
              variant="outlined"
              rounded="pill"
            >
              <v-avatar class="avatar me-2" size="30">VP</v-avatar>
              Ops Lead
              <v-icon end icon="mdi-chevron-down" />
            </v-btn>
          </template>
          <v-list density="compact" min-width="180" rounded="lg">
            <v-list-item title="Profile" prepend-icon="mdi-account" />
            <v-list-item title="Settings" prepend-icon="mdi-cog" />
            <v-list-item title="Sign out" prepend-icon="mdi-logout" />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-main class="dashboard-main">
      <v-container class="py-6">
        <div class="section-header-row">
          <div class="section-heading">
            <h2 class="section-title">Operations Overview</h2>
            <p class="section-subtitle">
              Key performance indicators for {{ activeRegionLabel }}
            </p>
          </div>

          <div class="region-picker">
            <span class="region-picker-label">Region</span>
            <v-chip-group
              v-model="selectedRegion"
              class="region-chips"
              selected-class="region-chip-active"
              mandatory
              column
            >
              <v-chip
                v-for="region in regions"
                :key="region.key"
                :value="region.key"
                size="small"
                variant="outlined"
                rounded="pill"
              >
                {{ region.label }}
              </v-chip>
            </v-chip-group>
          </div>
        </div>

        <v-row align="stretch">
          <!-- Shipment Volume -->
          <v-col cols="12" md="6" class="d-flex">
            <MetricCard
              v-model="selectedRange.shipments"
              label="Shipment Volume"
              :ranges="ranges"
              :value="formatNumber(shipmentsSnap.shipments.value)"
              :delta="shipmentsSnap.shipments.delta"
              :trend="shipmentsSnap.shipments.trend"
              :note="`≈ ${formatNumber(shipmentsPerDay)} shipments/day · ${activeRegionLabel}`"
              @see-details="openDetails('shipments')"
            />
          </v-col>

          <!-- On-Time Delivery -->
          <v-col cols="12" md="6" class="d-flex">
            <MetricCard
              v-model="selectedRange.ontime"
              label="On-Time Delivery Rate"
              :ranges="ranges"
              :value="formatPercent(ontimeSnap.onTimeRate.value)"
              :delta="ontimeSnap.onTimeRate.delta"
              :trend="ontimeSnap.onTimeRate.trend"
              @see-details="openDetails('ontime')"
            >
              <div class="ontime-target">
                <div class="target-row">
                  <span>Target {{ formatPercent(ontimeSnap.onTimeRate.target) }}</span>
                  <span :class="ontimeTargetGap >= 0 ? 'gap-good' : 'gap-bad'">
                    {{ ontimeTargetGap >= 0 ? '+' : '' }}{{ ontimeTargetGap }} pts
                  </span>
                </div>
                <v-progress-linear
                  :model-value="ontimeSnap.onTimeRate.value"
                  :max="100"
                  color="primary"
                  height="8"
                  rounded
                  bg-color="#ece6fb"
                />
              </div>
            </MetricCard>
          </v-col>

          <!-- Regional Performance -->
          <v-col cols="12" md="6" class="d-flex">
            <MetricCard
              v-model="selectedRange.regional"
              :label="showingRegions ? 'Regional Performance' : 'Hub Performance'"
              :ranges="ranges"
              @see-details="openDetails('regional')"
            >
              <v-table density="compact" class="breakdown-table">
                <thead>
                  <tr>
                    <th>{{ showingRegions ? 'Region' : 'Hub' }}</th>
                    <th class="text-right">Shipments</th>
                    <th class="text-right">On-Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in regionalRows" :key="'hub' in row ? row.hub : row.region">
                    <td>{{ 'hub' in row ? row.hub : row.label }}</td>
                    <td class="text-right">{{ formatNumber(row.shipments) }}</td>
                    <td class="text-right">
                      <span class="ontime-pill" :class="{ low: row.onTimeRate < 92 }">
                        {{ formatPercent(row.onTimeRate) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </MetricCard>
          </v-col>

          <!-- Open Exceptions -->
          <v-col cols="12" md="6" class="d-flex">
            <MetricCard
              v-model="selectedRange.exceptions"
              label="Open Exceptions"
              :ranges="ranges"
              :value="formatNumber(exceptionsSnap.exceptions.value)"
              :delta="exceptionsSnap.exceptions.delta"
              :delta-positive-is-good="false"
              note="Unresolved shipment issues"
              @see-details="openDetails('exceptions')"
            >
              <ul class="exception-list">
                <li v-for="item in exceptionsSnap.exceptions.byType" :key="item.type">
                  <span class="exc-type">{{ item.type }}</span>
                  <span class="exc-count">{{ formatNumber(item.count) }}</span>
                </li>
              </ul>
            </MetricCard>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer class="footer" app absolute>
      <v-avatar class="footer-logo me-2" size="28" rounded="md">
        <v-icon icon="mdi-truck-fast" size="18" color="white" />
      </v-avatar>
      <span>© 2026 FastForward Logistics</span>
    </v-footer>

    <!-- See Details right panel -->
    <v-navigation-drawer
      v-model="detailsOpen"
      location="right"
      temporary
      width="420"
      class="details-drawer"
      :style="{ zIndex: 9999 }"
    >
      <div class="details-header">
        <div class="d-flex align-center ga-3">
          <v-avatar class="details-icon" size="40" rounded="lg">
            <v-icon :icon="kpiMeta[activeKpi].icon" color="white" size="22" />
          </v-avatar>
          <div>
            <p class="details-eyebrow">{{ activeRegionLabel }} · {{ detailRangeLabel }}</p>
            <h3 class="details-title">{{ kpiMeta[activeKpi].title }}</h3>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="detailsOpen = false" />
      </div>

      <v-divider />

      <div class="details-body">
        <!-- Headline value -->
        <div v-if="activeKpi === 'shipments'" class="detail-headline">
          <span class="detail-value">{{ formatNumber(detailSnap.shipments.value) }}</span>
          <span class="detail-caption">total shipments</span>
        </div>
        <div v-else-if="activeKpi === 'ontime'" class="detail-headline">
          <span class="detail-value">{{ formatPercent(detailSnap.onTimeRate.value) }}</span>
          <span class="detail-caption">
            target {{ formatPercent(detailSnap.onTimeRate.target) }}
          </span>
        </div>
        <div v-else-if="activeKpi === 'exceptions'" class="detail-headline">
          <span class="detail-value">{{ formatNumber(detailSnap.exceptions.value) }}</span>
          <span class="detail-caption">open exceptions</span>
        </div>

        <!-- Exceptions: by-type breakdown -->
        <template v-if="activeKpi === 'exceptions'">
          <h4 class="detail-section-title">By type</h4>
          <ul class="detail-exc-list">
            <li v-for="item in detailSnap.exceptions.byType" :key="item.type">
              <span class="exc-type">{{ item.type }}</span>
              <span class="exc-count">{{ formatNumber(item.count) }}</span>
            </li>
          </ul>
        </template>

        <!-- Regional / hub breakdown for all KPIs -->
        <h4 class="detail-section-title">
          {{ detailShowingRegions ? 'By region' : 'By hub' }}
        </h4>
        <v-table density="compact" class="detail-table">
          <thead>
            <tr>
              <th>{{ detailShowingRegions ? 'Region' : 'Hub' }}</th>
              <th class="text-right">Shipments</th>
              <th class="text-right">On-Time</th>
              <th v-if="detailShowingRegions" class="text-right">Exc.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in detailRows" :key="'hub' in row ? row.hub : row.region">
              <td>{{ 'hub' in row ? row.hub : row.label }}</td>
              <td class="text-right">{{ formatNumber(row.shipments) }}</td>
              <td class="text-right">
                <span class="ontime-pill" :class="{ low: row.onTimeRate < 92 }">
                  {{ formatPercent(row.onTimeRate) }}
                </span>
              </td>
              <td v-if="detailShowingRegions && 'exceptions' in row" class="text-right">
                {{ formatNumber(row.exceptions) }}
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-navigation-drawer>
  </v-app>
</template>

<style scoped>
/* App bar / header */
.top-header :deep(.v-toolbar__content) {
  background: linear-gradient(95deg, #c9b8ff 0%, #ffffff 75%);
  border-bottom: 1px solid #dfd2ff;
}

.brand-icon {
  background: linear-gradient(145deg, #7049dd, #9a82e7);
}

.eyebrow {
  margin: 0;
  color: var(--brand-purple-strong);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.brand-title {
  margin: 2px 0 0;
  font-size: clamp(1.3rem, 2.2vw, 1.6rem);
  line-height: 1.1;
  color: var(--brand-purple-strong);
}

.profile-trigger {
  color: var(--brand-purple-strong);
  font-weight: 700;
  text-transform: none;
}

.avatar {
  background: #6438d4;
  color: #fff;
  font-size: 0.76rem;
}

/* Main / sections */
.dashboard-main {
  background: #ffffff;
}

.section-header-row {
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.section-heading {
  min-width: 220px;
}

.section-title {
  margin: 0;
  color: #3c3c42;
  font-size: 1.25rem;
}

.section-subtitle {
  margin: 6px 0 0;
  color: var(--text-mid);
  font-size: 0.95rem;
}

/* Region picker */
.region-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
}

.region-picker-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-purple-strong);
  white-space: nowrap;
}

.region-chips :deep(.region-chip-active) {
  background: var(--brand-purple-strong);
  color: #fff;
  border-color: var(--brand-purple-strong);
}

/* On-time target */
.ontime-target {
  margin-top: 14px;
}

.target-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-mid);
  margin-bottom: 6px;
}

.gap-good {
  color: var(--success);
  font-weight: 700;
}

.gap-bad {
  color: var(--danger);
  font-weight: 700;
}

/* Breakdown table */
.breakdown-table {
  margin-top: 6px;
  background: transparent;
}

.breakdown-table :deep(th) {
  font-size: 0.72rem !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-mid) !important;
}

.breakdown-table :deep(td) {
  font-size: 0.86rem;
}

.text-right {
  text-align: right !important;
}

.ontime-pill {
  font-weight: 700;
  color: var(--success);
}

.ontime-pill.low {
  color: #c47b00;
}

/* Exceptions list */
.exception-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}

.exception-list li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--card-border);
  font-size: 0.86rem;
}

.exception-list li:last-child {
  border-bottom: none;
}

.exc-type {
  color: var(--text-mid);
}

.exc-count {
  font-weight: 700;
  color: #2f2f34;
}

/* Footer */
.footer {
  background: linear-gradient(95deg, #ffffff 0%, #c7b3ff 100%);
  color: var(--brand-purple-strong);
  border-top: 1px solid #dfd2ff;
  font-size: 0.86rem;
  font-weight: 700;
}

.footer-logo {
  background: linear-gradient(145deg, #724bdf, #8c6ae7);
}

/* See Details drawer */
.details-drawer {
  top: 0 !important;
  height: 100vh !important;
  max-height: 100vh !important;
}

.details-drawer :deep(.v-navigation-drawer__scrim),
:deep(.v-navigation-drawer__scrim) {
  z-index: 9998;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.details-icon {
  background: linear-gradient(145deg, #7049dd, #9a82e7);
}

.details-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--brand-purple-strong);
}

.details-title {
  margin: 2px 0 0;
  font-size: 1.1rem;
  color: #3c3c42;
  line-height: 1.2;
}

.details-body {
  padding: 16px;
}

.detail-headline {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 18px;
}

.detail-value {
  font-size: 2.1rem;
  font-weight: 800;
  color: #2f2f34;
  line-height: 1;
}

.detail-caption {
  font-size: 0.84rem;
  color: var(--text-mid);
}

.detail-section-title {
  margin: 18px 0 8px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-mid);
}

.detail-table {
  background: transparent;
}

.detail-table :deep(th) {
  font-size: 0.72rem !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-mid) !important;
}

.detail-table :deep(td) {
  font-size: 0.86rem;
}

.detail-exc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.detail-exc-list li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--card-border);
  font-size: 0.88rem;
}

.detail-exc-list li:last-child {
  border-bottom: none;
}
</style>
