<script setup lang="ts">
import { computed } from 'vue'

interface RangeOption {
  key: string
  label: string
}

const props = defineProps<{
  label: string
  value?: string | number
  delta?: number
  note?: string
  ranges?: RangeOption[]
  modelValue?: string
  trend?: number[]
  deltaPositiveIsGood?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'see-details': []
}>()

const hasDelta = computed(() => typeof props.delta === 'number')

const trendDirection = computed<'up' | 'down'>(() => ((props.delta ?? 0) >= 0 ? 'up' : 'down'))

// Whether the delta should be styled as good (green) or bad (red).
const deltaIsGood = computed(() => {
  const positiveGood = props.deltaPositiveIsGood ?? true
  return (props.delta ?? 0) >= 0 ? positiveGood : !positiveGood
})

const formattedDelta = computed(() =>
  hasDelta.value ? `${props.delta! > 0 ? '+' : ''}${props.delta!.toFixed(1)}%` : '',
)

// Build an SVG polyline for the sparkline, normalised to a 100x32 viewbox.
const sparklinePoints = computed(() => {
  const points = props.trend
  if (!points || points.length < 2) return ''
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const stepX = 100 / (points.length - 1)
  return points
    .map((p, i) => {
      const x = i * stepX
      const y = 30 - ((p - min) / span) * 28
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

function onRangeChange(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <v-card class="kpi-card" rounded="xl" border flat>
    <v-card-item>
      <div class="card-header">
        <v-card-title class="card-title pa-0">{{ label }}</v-card-title>
        <v-btn-toggle
          v-if="ranges?.length"
          :model-value="modelValue"
          class="range-toggle"
          color="primary"
          density="compact"
          variant="outlined"
          divided
          rounded="pill"
          mandatory
          @update:model-value="onRangeChange"
        >
          <v-btn v-for="range in ranges" :key="range.key" :value="range.key" size="small">
            {{ range.label }}
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-card-item>
    <v-card-text>
      <div v-if="value !== undefined" class="kpi-value-row">
        <span class="kpi-value">{{ value }}</span>
        <span v-if="hasDelta" class="kpi-delta" :class="deltaIsGood ? 'good' : 'bad'">
          <v-icon :icon="trendDirection === 'up' ? 'mdi-arrow-up' : 'mdi-arrow-down'" size="16" />
          {{ formattedDelta }}
        </span>
      </div>
      <p v-if="note" class="kpi-note">{{ note }}</p>
      <svg
        v-if="sparklinePoints"
        class="kpi-sparkline"
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        role="img"
        :aria-label="`${label} trend`"
      >
        <polyline :points="sparklinePoints" />
      </svg>
      <slot />
    </v-card-text>
    <v-card-actions class="card-actions">
      <v-spacer />
      <v-btn
        class="details-btn"
        variant="text"
        color="primary"
        size="small"
        append-icon="mdi-arrow-right"
        @click="emit('see-details')"
      >
        See Details
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.kpi-card {
  border-color: var(--card-border) !important;
  height: 100%;
  width: 100%;
  min-height: 360px;
  display: flex;
  flex-direction: column;
}

.kpi-card :deep(.v-card-text) {
  flex: 1 1 auto;
}

.card-actions {
  padding: 8px 16px 12px;
}

.details-btn {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-height: 30px;
}

.card-title {
  color: #3c3c42;
  font-size: 0.98rem;
  line-height: 1.2;
  font-weight: 600;
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: normal;
}

.range-toggle {
  flex: 0 0 auto;
}

.kpi-value-row {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.kpi-value {
  font-size: 2.05rem;
  line-height: 1;
  font-weight: 800;
  color: #2f2f34;
}

.kpi-delta {
  font-size: 0.9rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.kpi-delta.good {
  color: var(--success);
}

.kpi-delta.bad {
  color: var(--danger);
}

.kpi-note {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: var(--text-mid);
}

.kpi-sparkline {
  display: block;
  width: 100%;
  height: 38px;
  margin: 12px 0 4px;
  overflow: visible;
}

.kpi-sparkline polyline {
  fill: none;
  stroke: #16a3b8;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
</style>
