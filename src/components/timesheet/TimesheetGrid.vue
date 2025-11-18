<script setup lang="ts">
import { computed } from 'vue'
import { DAYS_OF_WEEK, TIMESHEET_STATUS, TIMESHEET_STATUS_LABELS } from '@/lib/constants'
import Badge from '@/components/ui/Badge.vue'
import TimesheetRow from './TimesheetRow.vue'
import TimesheetTotals from './TimesheetTotals.vue'
import type { TimesheetEntry } from '@/types'

interface Props {
  entries: TimesheetEntry[]
  weekStatus: string | null
  isLocked: boolean
}

const props = defineProps<Props>()

const statusVariant = computed(() => {
  const status = props.weekStatus || TIMESHEET_STATUS.DRAFT
  switch (status) {
    case TIMESHEET_STATUS.DRAFT:
      return 'secondary'
    case TIMESHEET_STATUS.SUBMITTED:
      return 'default'
    case TIMESHEET_STATUS.APPROVED:
      return 'default'
    case TIMESHEET_STATUS.REJECTED:
      return 'destructive'
    default:
      return 'secondary'
  }
})

const statusLabel = computed(() => {
  const status = props.weekStatus || TIMESHEET_STATUS.DRAFT
  return TIMESHEET_STATUS_LABELS[status as keyof typeof TIMESHEET_STATUS_LABELS] || status
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Registro de Horas</h2>
      <Badge :variant="statusVariant">
        {{ statusLabel }}
      </Badge>
    </div>

    <div class="border rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="p-3 text-left font-medium text-sm sticky left-0 bg-muted/50 z-10 min-w-[200px]">
                Proyecto / Tarea
              </th>
              <th
                v-for="day in DAYS_OF_WEEK"
                :key="day.key"
                class="p-3 text-center font-medium text-sm min-w-[80px]"
              >
                <div>{{ day.label }}</div>
                <div class="text-xs text-muted-foreground font-normal">{{ day.fullLabel }}</div>
              </th>
              <th class="p-3 text-center font-medium text-sm min-w-[80px]">Total</th>
              <th class="p-3 text-center font-medium text-sm min-w-[80px]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <TimesheetRow
              v-for="entry in entries"
              :key="entry.id"
              :entry="entry"
              :is-locked="isLocked || (weekStatus !== TIMESHEET_STATUS.DRAFT && weekStatus !== TIMESHEET_STATUS.REJECTED)"
            />
            <TimesheetTotals :entries="entries" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

