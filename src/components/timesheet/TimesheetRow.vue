<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DAYS_OF_WEEK } from '@/lib/constants'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import { useValidation } from '@/composables/useValidation'
import { useTimesheetStore } from '@/stores/timesheetStore'
import { useProjectsStore } from '@/stores/projectsStore'
import type { TimesheetEntry } from '@/types'

interface Props {
  entry: TimesheetEntry
  isLocked: boolean
}

const props = defineProps<Props>()
const timesheetStore = useTimesheetStore()
const projectsStore = useProjectsStore()
const { formatHours, validateHoursFormat, validateDailyHours, maxHoursPerDay } = useValidation()

const localEntry = ref<TimesheetEntry>({ ...props.entry })
const editingFields = ref<Record<string, boolean>>({})
const errors = ref<Record<string, string>>({})

// Obtener información del proyecto y tarea
const project = computed(() => {
  if (!localEntry.value.project_id) return null
  return projectsStore.getProjectById(localEntry.value.project_id)
})

const task = computed(() => {
  if (!localEntry.value.task_id) return null
  return projectsStore.getTaskById(localEntry.value.task_id)
})

onMounted(async () => {
  // Cargar proyectos si no están cargados
  if (projectsStore.projects.length === 0) {
    await projectsStore.loadAll()
  }
})

// Helper to get day hours property name

const dayHours = (dayKey: string): number => {
  const key = `hours_${dayKey}` as keyof TimesheetEntry
  const value = localEntry.value[key]
  return typeof value === 'number' ? value : 0
}

const updateDayHours = async (dayKey: string, value: string) => {
  const numValue = parseFloat(value) || 0
  const formattedValue = formatHours(numValue)
  const key = `hours_${dayKey}` as keyof TimesheetEntry

  // Validate format
  if (value !== '' && !validateHoursFormat(value)) {
    errors.value[key] = 'Formato inválido (máx. 2 decimales)'
    return
  }

  // Validate daily limit
  if (!validateDailyHours(formattedValue)) {
    errors.value[`hours_${dayKey}`] = `Máximo ${maxHoursPerDay.value} horas por día`
    return
  }

  delete errors.value[`hours_${dayKey}`]
  localEntry.value[key] = formattedValue as any

  // Calculate total
  const total = DAYS_OF_WEEK.reduce((sum, day) => {
    const dayKeyProp = `hours_${day.key}` as keyof TimesheetEntry
    const value = localEntry.value[dayKeyProp]
    return sum + (typeof value === 'number' ? value : 0)
  }, 0)

  localEntry.value.total_hours = formatHours(total)

  // Save after a short delay (debounce)
  setTimeout(async () => {
    if (!props.isLocked) {
      try {
        await timesheetStore.saveEntry({
          ...localEntry.value,
        })
      } catch (error) {
        console.error('Error saving entry:', error)
      }
    }
  }, 500)
}

const handleDelete = async () => {
  if (confirm('¿Estás seguro de eliminar esta entrada?')) {
    try {
      await timesheetStore.deleteEntry(props.entry.id)
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }
}
</script>

<template>
  <tr class="timesheet-row">
    <td class="timesheet-row-project-cell">
      <div class="timesheet-row-project">
        <div class="timesheet-row-project-name">
          <i class="pi pi-folder timesheet-row-project-icon"></i>
          <span>{{ project ? `${project.name} (${project.code})` : entry.project_id || 'Sin proyecto' }}</span>
        </div>
        <div v-if="task" class="timesheet-row-task">
          <i class="pi pi-list timesheet-row-task-icon"></i>
          <span>{{ task.name }} ({{ task.code }})</span>
        </div>
        <div v-else-if="entry.task_id" class="timesheet-row-task">
          <i class="pi pi-list timesheet-row-task-icon"></i>
          <span>Tarea: {{ entry.task_id }}</span>
        </div>
        <div v-if="entry.is_billable" class="timesheet-row-badge">
          <Badge variant="default" class="timesheet-billable-badge">
            <i class="pi pi-dollar timesheet-badge-icon"></i>
            Facturable
          </Badge>
        </div>
      </div>
    </td>
    <td
      v-for="day in DAYS_OF_WEEK"
      :key="day.key"
      class="timesheet-row-day-cell"
    >
      <div class="timesheet-input-wrapper">
        <Input
          :model-value="dayHours(day.key)"
          type="number"
          step="0.25"
          min="0"
          :max="8"
          :disabled="isLocked"
          :class="['timesheet-input', { 'timesheet-input-error': errors[`hours_${day.key}`] }]"
          @update:model-value="(v) => updateDayHours(day.key, String(v))"
          @blur="editingFields[`hours_${day.key}`] = false"
          @focus="editingFields[`hours_${day.key}`] = true"
        />
        <div v-if="errors[`hours_${day.key}`]" class="timesheet-input-error-message">
          {{ errors[`hours_${day.key}`] }}
        </div>
      </div>
    </td>
    <td class="timesheet-row-total-cell">
      <div class="timesheet-row-total">
        {{ (typeof localEntry.total_hours === 'number' ? localEntry.total_hours : 0).toFixed(2) }}
      </div>
    </td>
    <td class="timesheet-row-actions-cell">
      <button
        v-if="!isLocked"
        class="timesheet-delete-button"
        @click="handleDelete"
        title="Eliminar entrada"
      >
        <i class="pi pi-trash"></i>
      </button>
    </td>
  </tr>
</template>

<style scoped>
.timesheet-row {
  border-bottom: 1px solid hsl(var(--border));
  transition: background-color 0.15s ease-in-out;
}

.timesheet-row:hover {
  background: hsl(var(--muted) / 0.3);
}

.timesheet-row-project-cell {
  padding: 0.875rem 1rem;
  position: sticky;
  left: 0;
  background: hsl(var(--background));
  z-index: 5;
  min-width: 220px;
}

.timesheet-row:hover .timesheet-row-project-cell {
  background: hsl(var(--muted) / 0.3);
}

.timesheet-row-project {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.timesheet-row-project-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}

.timesheet-row-project-icon {
  font-size: 0.875rem;
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.timesheet-row-task {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  margin-left: 1.375rem;
}

.timesheet-row-task-icon {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.timesheet-row-badge {
  margin-top: 0.25rem;
}

.timesheet-billable-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.timesheet-badge-icon {
  font-size: 0.625rem;
}

.timesheet-row-day-cell {
  padding: 0.75rem 0.5rem;
  min-width: 90px;
}

.timesheet-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timesheet-input {
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.timesheet-input-error {
  border-color: hsl(var(--destructive));
}

.timesheet-input-error-message {
  font-size: 0.6875rem;
  color: hsl(var(--destructive));
  text-align: center;
  line-height: 1.2;
}

.timesheet-row-total-cell {
  padding: 0.875rem 1rem;
  text-align: center;
  min-width: 90px;
}

.timesheet-row-total {
  font-weight: 600;
  font-size: 0.9375rem;
  color: hsl(var(--foreground));
}

.timesheet-row-actions-cell {
  padding: 0.875rem 1rem;
  text-align: center;
  min-width: 90px;
}

.timesheet-delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid hsl(var(--border));
  border-radius: 0.375rem;
  background: hsl(var(--background));
  color: hsl(var(--destructive));
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.timesheet-delete-button:hover {
  background: hsl(var(--destructive) / 0.1);
  border-color: hsl(var(--destructive) / 0.5);
  transform: scale(1.05);
}

.timesheet-delete-button i {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .timesheet-row-project-cell {
    min-width: 180px;
    padding: 0.75rem 0.75rem;
  }
  
  .timesheet-row-day-cell,
  .timesheet-row-total-cell,
  .timesheet-row-actions-cell {
    min-width: 75px;
    padding: 0.625rem 0.5rem;
  }
  
  .timesheet-input {
    font-size: 0.8125rem;
    padding: 0.375rem;
  }
}
</style>

