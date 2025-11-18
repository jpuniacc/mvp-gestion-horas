<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projectsStore'
import Label from '@/components/ui/Label.vue'
import Select from '@/components/ui/Select.vue'
import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import DialogHeader from '@/components/ui/DialogHeader.vue'
import DialogTitle from '@/components/ui/DialogTitle.vue'
import DialogDescription from '@/components/ui/DialogDescription.vue'
import DialogContent from '@/components/ui/DialogContent.vue'
import DialogFooter from '@/components/ui/DialogFooter.vue'
import DialogClose from '@/components/ui/DialogClose.vue'
import Alert from '@/components/ui/Alert.vue'
import AlertDescription from '@/components/ui/AlertDescription.vue'

interface Props {
  open?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'select': [data: { projectId: string; taskId?: string; assignmentId?: string; isBillable: boolean }]
}>()

const projectsStore = useProjectsStore()

const selectedProjectId = ref<string>('')
const selectedTaskId = ref<string>('')
const error = ref<string>('')

const isOpen = computed({
  get: () => props.open ?? false,
  set: (value) => emit('update:open', value),
})

const availableProjects = computed(() => {
  return projectsStore.assignedProjects
})

const availableTasks = computed(() => {
  if (!selectedProjectId.value) return []
  return projectsStore.getTasksForProject(selectedProjectId.value)
})

const selectedAssignment = computed(() => {
  if (!selectedProjectId.value) return undefined
  return projectsStore.getAssignmentForProject(selectedProjectId.value)
})

const isBillable = computed(() => {
  return selectedAssignment.value?.is_billable ?? false
})

watch(() => props.open, async (newValue) => {
  if (newValue) {
    // Cargar proyectos y asignaciones cuando se abre el modal
    await projectsStore.loadAll()
    // Resetear selecciones
    selectedProjectId.value = ''
    selectedTaskId.value = ''
    error.value = ''
  }
})

watch(selectedProjectId, () => {
  // Resetear tarea cuando cambia el proyecto
  selectedTaskId.value = ''
})

function handleSubmit() {
  if (!selectedProjectId.value) {
    error.value = 'Por favor selecciona un proyecto'
    return
  }

  const assignment = selectedAssignment.value
  if (!assignment) {
    error.value = 'No tienes una asignación activa para este proyecto'
    return
  }

  emit('select', {
    projectId: selectedProjectId.value,
    taskId: selectedTaskId.value || undefined,
    assignmentId: assignment.id,
    isBillable: isBillable.value,
  })

  isOpen.value = false
}

function handleClose() {
  isOpen.value = false
  selectedProjectId.value = ''
  selectedTaskId.value = ''
  error.value = ''
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="isOpen = $event">
    <DialogContent class="max-w-md">
      <DialogClose @close="handleClose" />
      <DialogHeader>
        <DialogTitle>Agregar Proyecto/Tarea</DialogTitle>
        <DialogDescription>
          Selecciona un proyecto y opcionalmente una tarea para agregar horas
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="project">Proyecto *</Label>
          <Select
            id="project"
            v-model="selectedProjectId"
            placeholder="Selecciona un proyecto"
          >
            <option
              v-for="project in availableProjects"
              :key="project.id"
              :value="project.id"
            >
              {{ project.name }} ({{ project.code }})
            </option>
          </Select>
        </div>

        <div v-if="selectedProjectId" class="space-y-2">
          <Label for="task">Tarea (Opcional)</Label>
          <Select
            id="task"
            v-model="selectedTaskId"
            placeholder="Selecciona una tarea (opcional)"
          >
            <option value="">Sin tarea</option>
            <option
              v-for="task in availableTasks"
              :key="task.id"
              :value="task.id"
            >
              {{ task.name }} ({{ task.code }})
              <span v-if="task.is_global"> - Global</span>
            </option>
          </Select>
        </div>

        <div v-if="selectedAssignment" class="rounded-md bg-muted p-3 text-sm">
          <div class="font-medium">Asignación</div>
          <div class="text-muted-foreground">
            Desde: {{ new Date(selectedAssignment.start_date).toLocaleDateString('es-ES') }}
            <span v-if="selectedAssignment.end_date">
              - Hasta: {{ new Date(selectedAssignment.end_date).toLocaleDateString('es-ES') }}
            </span>
          </div>
          <div v-if="selectedAssignment.role_name" class="text-muted-foreground">
            Rol: {{ selectedAssignment.role_name }}
          </div>
        </div>

        <Alert v-if="error" variant="destructive">
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">
          Cancelar
        </Button>
        <Button @click="handleSubmit" :disabled="!selectedProjectId">
          Agregar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

