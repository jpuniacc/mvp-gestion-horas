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
  <tr class="border-t-2 bg-muted/30 font-semibold">
    <td class="p-3 sticky left-0 bg-muted/30 z-10">Total</td>
    <td
      v-for="day in DAYS_OF_WEEK"
      :key="day.key"
      class="p-3 text-center"
    >
      {{ dayTotals[day.key].toFixed(2) }}
    </td>
    <td class="p-3 text-center">
      {{ grandTotal.toFixed(2) }}
    </td>
    <td class="p-3"></td>
  </tr>
</template>

