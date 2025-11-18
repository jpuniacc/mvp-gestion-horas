<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTimesheetStore } from '@/stores/timesheetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWeekNavigation } from '@/composables/useWeekNavigation'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Alert from '@/components/ui/Alert.vue'
import AlertDescription from '@/components/ui/AlertDescription.vue'
import WeekNavigator from '@/components/timesheet/WeekNavigator.vue'
import TimesheetGrid from '@/components/timesheet/TimesheetGrid.vue'
import TimesheetActions from '@/components/timesheet/TimesheetActions.vue'
import ProjectTaskSelector from '@/components/timesheet/ProjectTaskSelector.vue'

const route = useRoute()
const timesheetStore = useTimesheetStore()
const settingsStore = useSettingsStore()
const { currentYear, currentWeek } = useWeekNavigation()

const selectorOpen = ref(false)

onMounted(async () => {
  await settingsStore.loadSettings()
  await timesheetStore.loadWeek(currentYear.value, currentWeek.value)
})

watch([() => route.params.year, () => route.params.week], async ([year, week]) => {
  if (year && week) {
    await timesheetStore.loadWeek(parseInt(String(year)), parseInt(String(week)))
  }
})

const handleAddRow = () => {
  selectorOpen.value = true
}

const handleSelectProjectTask = async (data: {
  projectId: string
  taskId?: string
  assignmentId?: string
  isBillable: boolean
}) => {
  if (!timesheetStore.currentWeek) return

  try {
    await timesheetStore.saveEntry({
      project_id: data.projectId,
      task_id: data.taskId,
      assignment_id: data.assignmentId,
      is_billable: data.isBillable,
      hours_monday: 0,
      hours_tuesday: 0,
      hours_wednesday: 0,
      hours_thursday: 0,
      hours_friday: 0,
      hours_saturday: 0,
      hours_sunday: 0,
      total_hours: 0,
    })
  } catch (error: any) {
    console.error('Error adding entry:', error)
    alert(`Error al agregar entrada: ${error.message}`)
  }
}
</script>

<template>
  <div class="space-y-6">
    <WeekNavigator />
    
    <Card v-if="timesheetStore.loading">
      <CardContent class="py-8 text-center">
        <div class="text-muted-foreground">Cargando semana...</div>
      </CardContent>
    </Card>

    <div v-else-if="timesheetStore.error">
      <Alert variant="destructive">
        <AlertDescription>{{ timesheetStore.error }}</AlertDescription>
      </Alert>
    </div>

    <div v-else-if="timesheetStore.currentWeek">
      <TimesheetGrid
        :entries="timesheetStore.entries"
        :week-status="timesheetStore.currentWeek.status ?? 'draft'"
        :is-locked="timesheetStore.currentWeek.is_locked ?? false"
      />
      
      <TimesheetActions @add-row="handleAddRow" />
      
      <ProjectTaskSelector
        :open="selectorOpen"
        @update:open="selectorOpen = $event"
        @select="handleSelectProjectTask"
      />
    </div>
  </div>
</template>

