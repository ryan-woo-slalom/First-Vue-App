<script setup lang="ts">
import { reactive, ref } from 'vue'

const profileMenuOpen = ref(false)

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}

type RangeKey = '7d' | '30d' | '90d' | 'ytd'

const ranges: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: 'ytd', label: 'YTD' },
]

const dashboardData = {
  shipments: {
    '7d': { value: '1,284', delta: 4.6, note: 'Compared to previous 7 days', bars: [58, 63, 47, 66, 71, 68, 74] },
    '30d': { value: '5,392', delta: 6.3, note: 'Compared to previous 30 days', bars: [44, 51, 48, 56, 62, 68, 72] },
    '90d': { value: '15,742', delta: 3.1, note: 'Compared to previous 90 days', bars: [40, 45, 50, 58, 54, 63, 70] },
    ytd: { value: '61,508', delta: 8.4, note: 'Compared to same period last year', bars: [34, 42, 49, 58, 66, 72, 78] },
  },
  ontime: {
    '7d': { value: '94.8%', delta: 1.2, note: 'Improvement from prior week', gauge: 94.8 },
    '30d': { value: '93.9%', delta: 0.8, note: 'Improvement from prior month', gauge: 93.9 },
    '90d': { value: '92.6%', delta: -0.4, note: 'Slight dip over prior quarter', gauge: 92.6 },
    ytd: { value: '93.4%', delta: 1.0, note: 'Improvement versus last year', gauge: 93.4 },
  },
  regional: {
    '7d': {
      value: 'West',
      delta: 2.9,
      note: 'Top region by on-time score',
      regions: [
        { name: 'West', score: 96 },
        { name: 'Midwest', score: 94 },
        { name: 'Northeast', score: 91 },
        { name: 'South', score: 89 },
      ],
    },
    '30d': {
      value: 'Midwest',
      delta: 1.7,
      note: 'Top region by on-time score',
      regions: [
        { name: 'Midwest', score: 95 },
        { name: 'West', score: 94 },
        { name: 'Northeast', score: 90 },
        { name: 'South', score: 88 },
      ],
    },
    '90d': {
      value: 'West',
      delta: 0.9,
      note: 'Top region by on-time score',
      regions: [
        { name: 'West', score: 94 },
        { name: 'Midwest', score: 93 },
        { name: 'Northeast', score: 89 },
        { name: 'South', score: 86 },
      ],
    },
    ytd: {
      value: 'West',
      delta: 2.2,
      note: 'Top region by on-time score',
      regions: [
        { name: 'West', score: 95 },
        { name: 'Midwest', score: 94 },
        { name: 'Northeast', score: 91 },
        { name: 'South', score: 87 },
      ],
    },
  },
  exceptions: {
    '7d': { value: '47', delta: -9.5, note: 'Fewer exceptions than prior week', severity: { high: 8, medium: 15, low: 24 } },
    '30d': { value: '198', delta: -6.2, note: 'Fewer exceptions than prior month', severity: { high: 37, medium: 66, low: 95 } },
    '90d': { value: '612', delta: 2.3, note: 'Slight increase over prior quarter', severity: { high: 121, medium: 202, low: 289 } },
    ytd: { value: '2,084', delta: -4.1, note: 'Improvement versus same period last year', severity: { high: 389, medium: 701, low: 994 } },
  },
} as const

type KpiKey = keyof typeof dashboardData

const selectedRange = reactive<Record<KpiKey, RangeKey>>({
  shipments: '7d',
  ontime: '7d',
  regional: '7d',
  exceptions: '7d',
})

function setRange(kpi: KpiKey, range: RangeKey) {
  selectedRange[kpi] = range
}

function formatDelta(delta: number) {
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
}
</script>

<template>
  <div class="page-shell">
    <header class="top-header">
      <div class="brand-block">
        <div class="brand-icon">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M8 24h22M8 14h28M8 34h16" />
            <path d="M30 16l8 8-8 8" />
          </svg>
        </div>
        <div>
          <p class="eyebrow">Operations Dashboard</p>
          <h1>FastForward Logistics</h1>
        </div>
      </div>

      <div class="profile-menu-wrap">
        <button
          id="profileButton"
          class="profile-trigger"
          :aria-expanded="profileMenuOpen"
          @click.stop="toggleProfileMenu"
        >
          <span class="avatar">VP</span>
          <span>Ops Lead</span>
        </button>
        <div id="profileMenu" class="profile-menu" v-show="profileMenuOpen">
          <button type="button">Profile</button>
          <button type="button">Settings</button>
          <button type="button">Sign out</button>
        </div>
      </div>
    </header>

    <main class="content">
      <div class="section-header-row">
        <h2 class="section-title">Operations Overview</h2>
        <p class="section-subtitle">Key performance indicators across the network</p>
      </div>

      <div class="card-grid">
        <!-- Shipment Volume -->
        <section class="kpi-card" data-kpi="shipments">
          <div class="card-head">
            <h3 class="card-title">Shipment Volume</h3>
            <div class="range-controls">
              <button
                v-for="range in ranges"
                :key="range.key"
                class="range-btn"
                :class="{ active: selectedRange.shipments === range.key }"
                @click="setRange('shipments', range.key)"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value">{{ dashboardData.shipments[selectedRange.shipments].value }}</p>
            <p
              class="kpi-delta"
              :class="dashboardData.shipments[selectedRange.shipments].delta >= 0 ? 'up' : 'down'"
            >
              {{ formatDelta(dashboardData.shipments[selectedRange.shipments].delta) }}
            </p>
          </div>
          <p class="kpi-note">{{ dashboardData.shipments[selectedRange.shipments].note }}</p>
          <div class="mini-bars">
            <span
              v-for="(bar, i) in dashboardData.shipments[selectedRange.shipments].bars"
              :key="i"
              :style="{ height: bar + '%' }"
            ></span>
          </div>
        </section>

        <!-- On-Time Delivery -->
        <section class="kpi-card" data-kpi="ontime">
          <div class="card-head">
            <h3 class="card-title">On-Time Delivery Rate</h3>
            <div class="range-controls">
              <button
                v-for="range in ranges"
                :key="range.key"
                class="range-btn"
                :class="{ active: selectedRange.ontime === range.key }"
                @click="setRange('ontime', range.key)"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value">{{ dashboardData.ontime[selectedRange.ontime].value }}</p>
            <p
              class="kpi-delta"
              :class="dashboardData.ontime[selectedRange.ontime].delta >= 0 ? 'up' : 'down'"
            >
              {{ formatDelta(dashboardData.ontime[selectedRange.ontime].delta) }}
            </p>
          </div>
          <p class="kpi-note">{{ dashboardData.ontime[selectedRange.ontime].note }}</p>
          <div class="gauge-track">
            <div
              class="gauge-fill"
              :style="{ width: Math.max(0, Math.min(100, dashboardData.ontime[selectedRange.ontime].gauge)) + '%' }"
            ></div>
          </div>
        </section>

        <!-- Regional Performance -->
        <section class="kpi-card" data-kpi="regional">
          <div class="card-head">
            <h3 class="card-title">Regional Performance</h3>
            <div class="range-controls">
              <button
                v-for="range in ranges"
                :key="range.key"
                class="range-btn"
                :class="{ active: selectedRange.regional === range.key }"
                @click="setRange('regional', range.key)"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value">{{ dashboardData.regional[selectedRange.regional].value }}</p>
            <p
              class="kpi-delta"
              :class="dashboardData.regional[selectedRange.regional].delta >= 0 ? 'up' : 'down'"
            >
              {{ formatDelta(dashboardData.regional[selectedRange.regional].delta) }}
            </p>
          </div>
          <p class="kpi-note">{{ dashboardData.regional[selectedRange.regional].note }}</p>
          <ul class="region-list">
            <li v-for="region in dashboardData.regional[selectedRange.regional].regions" :key="region.name">
              <div class="region-label">
                <span>{{ region.name }}</span><span>{{ region.score }}%</span>
              </div>
              <div class="region-bar-track">
                <div class="region-bar-fill" :style="{ width: region.score + '%' }"></div>
              </div>
            </li>
          </ul>
        </section>

        <!-- Open Exceptions -->
        <section class="kpi-card" data-kpi="exceptions">
          <div class="card-head">
            <h3 class="card-title">Open Exceptions</h3>
            <div class="range-controls">
              <button
                v-for="range in ranges"
                :key="range.key"
                class="range-btn"
                :class="{ active: selectedRange.exceptions === range.key }"
                @click="setRange('exceptions', range.key)"
              >
                {{ range.label }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value">{{ dashboardData.exceptions[selectedRange.exceptions].value }}</p>
            <p
              class="kpi-delta"
              :class="dashboardData.exceptions[selectedRange.exceptions].delta >= 0 ? 'up' : 'down'"
            >
              {{ formatDelta(dashboardData.exceptions[selectedRange.exceptions].delta) }}
            </p>
          </div>
          <p class="kpi-note">{{ dashboardData.exceptions[selectedRange.exceptions].note }}</p>
          <div class="pill-row">
            <span class="pill high">High: {{ dashboardData.exceptions[selectedRange.exceptions].severity.high }}</span>
            <span class="pill medium">Medium: {{ dashboardData.exceptions[selectedRange.exceptions].severity.medium }}</span>
            <span class="pill low">Low: {{ dashboardData.exceptions[selectedRange.exceptions].severity.low }}</span>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-logo">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 24h22M8 14h28M8 34h16" />
          <path d="M30 16l8 8-8 8" />
        </svg>
      </div>
      <span>© 2026 FastForward Logistics</span>
    </footer>
  </div>
</template>

<style scoped>
.page-shell {
  width: 100%;
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  border: 0;
  box-shadow: none;
  background: #fff;
}

.top-header {
  background: linear-gradient(95deg, #c9b8ff 0%, #ffffff 75%);
  color: var(--brand-purple-strong);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #dfd2ff;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(145deg, #7049dd, #9a82e7);
}

.brand-icon svg,
.footer-logo svg {
  width: 34px;
  height: 34px;
}

.brand-icon path,
.footer-logo path {
  fill: none;
  stroke: #fff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.eyebrow {
  margin: 0;
  color: var(--brand-purple-strong);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

h1 {
  margin: 2px 0 0;
  font-size: clamp(1.3rem, 2.2vw, 1.8rem);
  line-height: 1.1;
  color: var(--brand-purple-strong);
}

.profile-menu-wrap {
  position: relative;
}

.profile-trigger {
  border: 1px solid #c7b4ff;
  background: rgba(255, 255, 255, 0.86);
  border-radius: 999px;
  padding: 6px 12px 6px 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--brand-purple-strong);
  font-weight: 700;
  cursor: pointer;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #6438d4;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.76rem;
}

.profile-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 180px;
  background: #fff;
  border: 1px solid #d6c8ff;
  border-radius: 10px;
  box-shadow: 0 14px 35px rgba(90, 47, 186, 0.18);
  padding: 6px;
  z-index: 20;
}

.profile-menu button {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  color: var(--text-dark);
  padding: 9px 10px;
  border-radius: 7px;
  font: inherit;
  cursor: pointer;
}

.profile-menu button:hover {
  background: #f5f0ff;
}

.content {
  flex: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  background: #ffffff;
}

.section-header-row {
  margin-bottom: 18px;
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.kpi-card {
  border: 1px solid var(--card-border);
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  margin: 0;
  color: #3c3c42;
  font-size: 1.02rem;
}

.range-controls {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.range-btn {
  border: 1px solid #c8b8ff;
  border-radius: 999px;
  background: #fff;
  color: #5730bf;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 10px;
  cursor: pointer;
}

.range-btn.active {
  background: #6a42d6;
  border-color: #6a42d6;
  color: #fff;
}

.kpi-value-row {
  margin-top: 14px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.kpi-value {
  margin: 0;
  font-size: 2.05rem;
  line-height: 1;
  font-weight: 800;
  color: #2f2f34;
}

.kpi-delta {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
}

.kpi-delta.up {
  color: var(--success);
}

.kpi-delta.down {
  color: var(--danger);
}

.kpi-note {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: var(--text-mid);
}

.mini-bars {
  margin-top: 12px;
  height: 72px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: end;
  gap: 6px;
}

.mini-bars span {
  border-radius: 8px 8px 3px 3px;
  background: linear-gradient(180deg, var(--chart-cyan), var(--chart-blue));
}

.gauge-track {
  margin-top: 14px;
  height: 14px;
  border-radius: 999px;
  background: #ece5ff;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #00c0a9, #2f85ff);
  transition: width 0.28s ease;
}

.region-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.region-list li {
  display: grid;
  gap: 4px;
}

.region-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #37373d;
}

.region-bar-track {
  height: 10px;
  border-radius: 999px;
  background: #eee8ff;
  overflow: hidden;
}

.region-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--chart-orange), #ff6f61);
}

.pill-row {
  margin-top: 13px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  border-radius: 999px;
  color: #fff;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 5px 9px;
}

.pill.high {
  background: #ce2f4a;
}

.pill.medium {
  background: #e19009;
}

.pill.low {
  background: #228f76;
}

.footer {
  background: linear-gradient(95deg, #ffffff 0%, #c7b3ff 100%);
  color: var(--brand-purple-strong);
  border-top: 1px solid #dfd2ff;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.86rem;
  font-weight: 700;
}

.footer-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(145deg, #724bdf, #8c6ae7);
  display: grid;
  place-items: center;
}

.footer-logo svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 980px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .page-shell {
    min-height: 100dvh;
  }

  .top-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-menu-wrap {
    width: 100%;
  }

  .profile-trigger {
    width: 100%;
    justify-content: space-between;
  }

  .profile-menu {
    left: 0;
    right: 0;
  }
}
</style>
