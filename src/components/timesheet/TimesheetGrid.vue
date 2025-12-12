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
  <div class="timesheet-grid-container">
    <div class="timesheet-grid-header">
      <h2 class="timesheet-grid-title">
        <i class="pi pi-clock timesheet-grid-title-icon"></i>
        Registro de Horas
      </h2>
      <Badge :variant="statusVariant" class="timesheet-status-badge">
        {{ statusLabel }}
      </Badge>
    </div>

    <div class="timesheet-table-wrapper">
      <div class="timesheet-table-scroll">
        <table class="timesheet-table">
          <thead>
            <tr class="timesheet-table-header-row">
              <th class="timesheet-table-header timesheet-table-header-sticky">
                <div class="timesheet-table-header-content">
                  <i class="pi pi-folder timesheet-table-header-icon"></i>
                  <span>Proyecto / Tarea</span>
                </div>
              </th>
              <th
                v-for="day in DAYS_OF_WEEK"
                :key="day.key"
                class="timesheet-table-header timesheet-table-header-day"
              >
                <div class="timesheet-table-day-label">{{ day.label }}</div>
                <div class="timesheet-table-day-full">{{ day.fullLabel }}</div>
              </th>
              <th class="timesheet-table-header timesheet-table-header-total">
                <i class="pi pi-calculator timesheet-table-header-icon"></i>
                Total
              </th>
              <th class="timesheet-table-header timesheet-table-header-actions">
                <i class="pi pi-cog timesheet-table-header-icon"></i>
                Acciones
              </th>
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

<style scoped>
.timesheet-grid-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timesheet-grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
}

.timesheet-grid-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.timesheet-grid-title-icon {
  font-size: 1.25rem;
  color: hsl(var(--primary));
}

.timesheet-status-badge {
  font-size: 0.8125rem;
  padding: 0.375rem 0.75rem;
}

.timesheet-table-wrapper {
  background: hsl(var(--card));
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

.timesheet-table-scroll {
  overflow-x: auto;
}

.timesheet-table {
  width: 100%;
  border-collapse: collapse;
}

.timesheet-table-header-row {
  background: hsl(var(--muted) / 0.5);
  border-bottom: 2px solid hsl(var(--border));
}

.timesheet-table-header {
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.timesheet-table-header-sticky {
  position: sticky;
  left: 0;
  background: hsl(var(--muted) / 0.5);
  z-index: 10;
  min-width: 220px;
}

.timesheet-table-header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timesheet-table-header-icon {
  font-size: 0.875rem;
  color: hsl(var(--primary));
}

.timesheet-table-header-day {
  text-align: center;
  min-width: 90px;
}

.timesheet-table-day-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.timesheet-table-day-full {
  font-size: 0.75rem;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
  margin-top: 0.125rem;
}

.timesheet-table-header-total,
.timesheet-table-header-actions {
  text-align: center;
  min-width: 90px;
}

@media (max-width: 768px) {
  .timesheet-grid-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .timesheet-table-header {
    padding: 0.75rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .timesheet-table-header-sticky {
    min-width: 180px;
  }
  
  .timesheet-table-header-day {
    min-width: 75px;
  }
}
</style>

