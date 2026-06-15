<script setup lang="ts">
import { ref } from 'vue'

const profileMenuOpen = ref(false)

function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value
}

const ranges = ['7d', '30d', '90d', 'YTD']
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
                v-for="(range, i) in ranges"
                :key="range"
                class="range-btn"
                :class="{ active: i === 0 }"
              >
                {{ range }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value" data-field="value">—</p>
            <p class="kpi-delta" data-field="delta">—</p>
          </div>
          <p class="kpi-note" data-field="note">—</p>
          <div class="mini-bars" data-field="chart"></div>
        </section>

        <!-- On-Time Delivery -->
        <section class="kpi-card" data-kpi="ontime">
          <div class="card-head">
            <h3 class="card-title">On-Time Delivery Rate</h3>
            <div class="range-controls">
              <button
                v-for="(range, i) in ranges"
                :key="range"
                class="range-btn"
                :class="{ active: i === 0 }"
              >
                {{ range }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value" data-field="value">—</p>
            <p class="kpi-delta" data-field="delta">—</p>
          </div>
          <p class="kpi-note" data-field="note">—</p>
          <div class="gauge-track">
            <div class="gauge-fill" data-field="gauge"></div>
          </div>
        </section>

        <!-- Regional Performance -->
        <section class="kpi-card" data-kpi="regional">
          <div class="card-head">
            <h3 class="card-title">Regional Performance</h3>
            <div class="range-controls">
              <button
                v-for="(range, i) in ranges"
                :key="range"
                class="range-btn"
                :class="{ active: i === 0 }"
              >
                {{ range }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value" data-field="value">—</p>
            <p class="kpi-delta" data-field="delta">—</p>
          </div>
          <p class="kpi-note" data-field="note">—</p>
          <ul class="region-list" data-field="regions"></ul>
        </section>

        <!-- Open Exceptions -->
        <section class="kpi-card" data-kpi="exceptions">
          <div class="card-head">
            <h3 class="card-title">Open Exceptions</h3>
            <div class="range-controls">
              <button
                v-for="(range, i) in ranges"
                :key="range"
                class="range-btn"
                :class="{ active: i === 0 }"
              >
                {{ range }}
              </button>
            </div>
          </div>
          <div class="kpi-value-row">
            <p class="kpi-value" data-field="value">—</p>
            <p class="kpi-delta" data-field="delta">—</p>
          </div>
          <p class="kpi-note" data-field="note">—</p>
          <div class="pill-row" data-field="severity"></div>
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
