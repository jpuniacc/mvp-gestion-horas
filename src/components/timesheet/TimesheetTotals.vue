<script setup lang="ts">
import { computed } from 'vue'
import { DAYS_OF_WEEK } from '@/lib/constants'
import type { TimesheetEntry } from '@/types'

interface Props {
  entries: TimesheetEntry[]
}

const props = defineProps<Props>()

const dayTotals = computed(() => {
  const totals: Record<string, number> = {}
  
  DAYS_OF_WEEK.forEach((day) => {
    const key = `hours_${day.key}` as keyof TimesheetEntry
    totals[day.key] = props.entries.reduce((sum, entry) => {
      const value = entry[key]
      return sum + (typeof value === 'number' ? value : 0)
    }, 0)
  })
  
  return totals
})

const grandTotal = computed(() => {
  return props.entries.reduce((sum, entry) => {
    const total = entry.total_hours
    return sum + (typeof total === 'number' ? total : 0)
  }, 0)
})
</script>

<template>
  <tr class="timesheet-totals-row">
    <td class="timesheet-totals-label-cell">
      <div class="timesheet-totals-label">
        <i class="pi pi-calculator timesheet-totals-icon"></i>
        <span>Total</span>
      </div>
    </td>
    <td
      v-for="day in DAYS_OF_WEEK"
      :key="day.key"
      class="timesheet-totals-day-cell"
    >
      {{ dayTotals[day.key].toFixed(2) }}
    </td>
    <td class="timesheet-totals-grand-cell">
      {{ grandTotal.toFixed(2) }}
    </td>
    <td class="timesheet-totals-empty-cell"></td>
  </tr>
</template>

<style scoped>
.timesheet-totals-row {
  background: hsl(var(--muted) / 0.3);
  border-top: 2px solid hsl(var(--primary) / 0.3);
  font-weight: 600;
}

.timesheet-totals-label-cell {
  padding: 0.875rem 1rem;
  position: sticky;
  left: 0;
  background: hsl(var(--muted) / 0.3);
  z-index: 10;
  min-width: 220px;
}

.timesheet-totals-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: hsl(var(--foreground));
}

.timesheet-totals-icon {
  font-size: 1rem;
  color: hsl(var(--primary));
}

.timesheet-totals-day-cell {
  padding: 0.875rem 1rem;
  text-align: center;
  font-size: 0.9375rem;
  color: hsl(var(--foreground));
  min-width: 90px;
}

.timesheet-totals-grand-cell {
  padding: 0.875rem 1rem;
  text-align: center;
  font-size: 1rem;
  color: hsl(var(--primary));
  font-weight: 700;
  min-width: 90px;
}

.timesheet-totals-empty-cell {
  padding: 0.875rem 1rem;
  min-width: 90px;
}

@media (max-width: 768px) {
  .timesheet-totals-label-cell {
    min-width: 180px;
  }
  
  .timesheet-totals-day-cell,
  .timesheet-totals-grand-cell {
    min-width: 75px;
    padding: 0.75rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>

