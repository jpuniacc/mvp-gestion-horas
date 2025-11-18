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
  <tr class="border-b hover:bg-muted/50 transition-colors">
    <td class="p-3 sticky left-0 bg-background z-10">
      <div class="space-y-1">
        <div class="font-medium">
          {{ project ? `${project.name} (${project.code})` : entry.project_id || 'Sin proyecto' }}
        </div>
        <div v-if="task" class="text-sm text-muted-foreground">
          {{ task.name }} ({{ task.code }})
        </div>
        <div v-else-if="entry.task_id" class="text-sm text-muted-foreground">
          Tarea: {{ entry.task_id }}
        </div>
        <div class="flex items-center gap-2 mt-1">
          <Badge v-if="entry.is_billable" variant="default" class="text-xs">Facturable</Badge>
        </div>
      </div>
    </td>
    <td
      v-for="day in DAYS_OF_WEEK"
      :key="day.key"
      class="p-2"
    >
      <Input
        :model-value="dayHours(day.key)"
        type="number"
        step="0.25"
        min="0"
        :max="8"
        :disabled="isLocked"
        :class="{ 'border-destructive': errors[`hours_${day.key}`] }"
        @update:model-value="(v) => updateDayHours(day.key, String(v))"
        @blur="editingFields[`hours_${day.key}`] = false"
        @focus="editingFields[`hours_${day.key}`] = true"
        class="w-full text-center"
      />
      <div v-if="errors[`hours_${day.key}`]" class="text-xs text-destructive mt-1">
        {{ errors[`hours_${day.key}`] }}
      </div>
    </td>
    <td class="p-3 text-center font-medium">
      {{ (typeof localEntry.total_hours === 'number' ? localEntry.total_hours : 0).toFixed(2) }}
    </td>
    <td class="p-3">
      <Button
        v-if="!isLocked"
        variant="ghost"
        size="sm"
        @click="handleDelete"
      >
        Eliminar
      </Button>
    </td>
  </tr>
</template>

