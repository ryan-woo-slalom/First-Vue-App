<script setup lang="ts">
import { reactive } from 'vue'
import MetricCard from './components/MetricCard.vue'

type RangeKey = '7d' | '30d' | '90d' | 'ytd'

const ranges: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
  { key: 'ytd', label: 'YTD' },
]

type KpiKey = 'shipments' | 'ontime' | 'regional' | 'exceptions'

const selectedRange = reactive<Record<KpiKey, RangeKey>>({
  shipments: '7d',
  ontime: '7d',
  regional: '7d',
  exceptions: '7d',
})
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
          <h2 class="section-title">Operations Overview</h2>
          <p class="section-subtitle">Key performance indicators across the network</p>
        </div>

        <v-row>
          <!-- Shipment Volume -->
          <v-col cols="12" md="6">
            <MetricCard
              v-model="selectedRange.shipments"
              label="Shipment Volume"
              :ranges="ranges"
            />
          </v-col>

          <!-- On-Time Delivery -->
          <v-col cols="12" md="6">
            <MetricCard
              v-model="selectedRange.ontime"
              label="On-Time Delivery Rate"
              :ranges="ranges"
            />
          </v-col>

          <!-- Regional Performance -->
          <v-col cols="12" md="6">
            <MetricCard
              v-model="selectedRange.regional"
              label="Regional Performance"
              :ranges="ranges"
            />
          </v-col>

          <!-- Open Exceptions -->
          <v-col cols="12" md="6">
            <MetricCard
              v-model="selectedRange.exceptions"
              label="Open Exceptions"
              :ranges="ranges"
            />
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
</style>
