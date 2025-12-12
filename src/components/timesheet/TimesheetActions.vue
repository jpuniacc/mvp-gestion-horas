<script setup lang="ts">
import { computed } from 'vue'
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
  <div class="timesheet-actions">
    <div class="timesheet-actions-group">
      <button
        class="action-button action-button-primary"
        @click="emit('add-row')"
        :disabled="!canEdit"
        title="Agregar nueva fila"
      >
        <i class="pi pi-plus action-icon"></i>
        <span>Agregar Fila</span>
      </button>
      
      <button
        class="action-button action-button-secondary"
        @click="handleSaveDraft"
        :disabled="!canEdit"
        title="Guardar borrador"
      >
        <i class="pi pi-save action-icon"></i>
        <span>Guardar Borrador</span>
      </button>
    </div>
    
    <div class="timesheet-actions-group">
      <button
        class="action-button action-button-success"
        @click="handleSubmit"
        :disabled="!canSubmit"
        title="Enviar para aprobación"
      >
        <i class="pi pi-send action-icon"></i>
        <span>Enviar para Aprobación</span>
      </button>
      
      <button
        class="action-button action-button-ghost"
        @click="handleCopyPrevious"
        :disabled="!canEdit"
        title="Copiar semana anterior"
      >
        <i class="pi pi-copy action-icon"></i>
        <span>Copiar Semana Anterior</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.timesheet-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: hsl(var(--card));
  border-radius: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.timesheet-actions-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.action-icon {
  font-size: 0.875rem;
}

.action-button-primary {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.action-button-primary:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px 0 hsl(var(--primary) / 0.3);
}

.action-button-secondary {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.action-button-secondary:hover:not(:disabled) {
  background: hsl(var(--muted));
  border-color: hsl(var(--primary) / 0.5);
  color: hsl(var(--primary));
}

.action-button-success {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
}

.action-button-success:hover:not(:disabled) {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px 0 hsl(var(--primary) / 0.3);
}

.action-button-ghost {
  background: transparent;
  border-color: transparent;
  color: hsl(var(--muted-foreground));
}

.action-button-ghost:hover:not(:disabled) {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

@media (max-width: 768px) {
  .timesheet-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .timesheet-actions-group {
    width: 100%;
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>

