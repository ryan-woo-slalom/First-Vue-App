<script setup lang="ts">
import { computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'

const props = withDefaults(
  defineProps<{
    title: string
    icon: string
    headline: string
    caption?: string
    delta: number
    deltaPositiveIsGood?: boolean
    chartType: 'line' | 'bar'
    chartData: ChartData<'line' | 'bar'>
    lineOptions?: ChartOptions<'line'>
    barOptions?: ChartOptions<'bar'>
  }>(),
  { deltaPositiveIsGood: true },
)

const emit = defineEmits<{ details: [] }>()

const deltaIsGood = computed(() => {
  const positiveGood = props.deltaPositiveIsGood
  return props.delta >= 0 ? positiveGood : !positiveGood
})

const formattedDelta = computed(
  () => `${props.delta > 0 ? '+' : ''}${props.delta.toFixed(1)}%`,
)
</script>

<template>
  <v-card class="report-card" border>
    <div class="report-head">
      <div class="report-title-wrap">
        <v-avatar class="report-icon" size="34" rounded="md">
          <v-icon :icon="icon" size="20" />
        </v-avatar>
        <span class="report-title">{{ title }}</span>
      </div>
      <span class="report-delta" :class="deltaIsGood ? 'good' : 'bad'">
        <v-icon :icon="delta >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'" size="16" />
        {{ formattedDelta }}
      </span>
    </div>

    <div class="report-headline">
      <span class="report-value">{{ headline }}</span>
      <span v-if="caption" class="report-caption">{{ caption }}</span>
    </div>

    <div class="chart-surface">
      <Line
        v-if="chartType === 'line'"
        :data="(chartData as ChartData<'line'>)"
        :options="lineOptions"
      />
      <Bar v-else :data="(chartData as ChartData<'bar'>)" :options="barOptions" />
    </div>

    <v-divider />
    <div class="report-actions">
      <v-btn
        variant="tonal"
        color="primary"
        size="small"
        block
        append-icon="mdi-open-in-new"
        @click="emit('details')"
      >
        View details
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.report-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #161b22;
  padding: 4px;
}

.report-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 4px;
}

.report-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.report-icon {
  background: rgba(79, 140, 255, 0.16);
  color: #4f8cff;
}

.report-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #e6edf3;
  letter-spacing: 0.01em;
}

.report-delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.report-delta.good {
  color: #22c1a6;
}

.report-delta.bad {
  color: #ff5a6a;
}

.report-headline {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 14px 8px;
  flex-wrap: wrap;
}

.report-value {
  font-size: 1.7rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
}

.report-caption {
  font-size: 0.8rem;
  color: #8b949e;
}

/* White plot area for the data, per brief */
.chart-surface {
  flex: 1 1 auto;
  min-height: 190px;
  margin: 4px 12px 12px;
  padding: 12px;
  background: #ffffff;
  border-radius: 10px;
}

.report-actions {
  padding: 10px 12px;
}
</style>
