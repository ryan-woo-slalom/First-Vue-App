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
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hasDelta = computed(() => typeof props.delta === 'number')

const trendDirection = computed<'up' | 'down'>(() => ((props.delta ?? 0) >= 0 ? 'up' : 'down'))

const formattedDelta = computed(() =>
  hasDelta.value ? `${props.delta! > 0 ? '+' : ''}${props.delta!.toFixed(1)}%` : '',
)

function onRangeChange(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <v-card class="kpi-card" rounded="xl" border flat>
    <v-card-item>
      <div class="d-flex justify-space-between align-start ga-3 flex-wrap">
        <v-card-title class="card-title pa-0">{{ label }}</v-card-title>
        <v-btn-toggle
          v-if="ranges?.length"
          :model-value="modelValue"
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
      <div class="kpi-value-row">
        <span class="kpi-value">{{ value ?? '—' }}</span>
        <span v-if="hasDelta" class="kpi-delta" :class="trendDirection">
          <v-icon :icon="trendDirection === 'up' ? 'mdi-arrow-up' : 'mdi-arrow-down'" size="16" />
          {{ formattedDelta }}
        </span>
      </div>
      <p v-if="note" class="kpi-note">{{ note }}</p>
      <slot />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.kpi-card {
  border-color: var(--card-border) !important;
}

.card-title {
  color: #3c3c42;
  font-size: 1.02rem;
  font-weight: 600;
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
</style>
