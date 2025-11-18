<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import { useTimesheetStore } from '@/stores/timesheetStore'
import { TIMESHEET_STATUS } from '@/lib/constants'

const emit = defineEmits<{
  'add-row': []
}>()

const timesheetStore = useTimesheetStore()

const canEdit = computed(() => {
  if (!timesheetStore.currentWeek) return false
  const status = timesheetStore.currentWeek.status
  return status === TIMESHEET_STATUS.DRAFT || status === TIMESHEET_STATUS.REJECTED
})

const canSubmit = computed(() => {
  return canEdit.value && timesheetStore.entries.length > 0 && timesheetStore.totalHours > 0
})

const handleSaveDraft = () => {
  // Draft is auto-saved on input changes
  // This could trigger a confirmation message
  console.log('Borrador guardado automáticamente')
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  if (confirm('¿Estás seguro de enviar esta semana para aprobación?')) {
    try {
      await timesheetStore.submitWeek()
      alert('Semana enviada exitosamente para aprobación')
    } catch (error: any) {
      alert(`Error al enviar semana: ${error.message}`)
    }
  }
}

const handleCopyPrevious = async () => {
  if (confirm('¿Copiar las horas de la semana anterior?')) {
    try {
      await timesheetStore.copyPreviousWeek()
      alert('Semana anterior copiada exitosamente')
    } catch (error: any) {
      alert(`Error al copiar semana: ${error.message}`)
    }
  }
}
</script>

<template>
  <div class="flex items-center gap-4 mt-6">
    <Button
      variant="outline"
      @click="emit('add-row')"
      :disabled="!canEdit"
    >
      ➕ Agregar Fila
    </Button>
    
    <Button
      variant="outline"
      @click="handleSaveDraft"
      :disabled="!canEdit"
    >
      Guardar Borrador
    </Button>
    
    <Button
      @click="handleSubmit"
      :disabled="!canSubmit"
    >
      Enviar para Aprobación
    </Button>
    
    <Button
      variant="ghost"
      @click="handleCopyPrevious"
      :disabled="!canEdit"
    >
      Copiar Semana Anterior
    </Button>
  </div>
</template>

