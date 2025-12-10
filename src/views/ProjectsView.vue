<script setup lang="ts">
import { useProjectsStore } from '@/stores/projectsStore';
import { useUsersStore } from '@/stores/usersStore';
import { useTaskStore } from '@/stores/taskStore';
import { computed, onMounted, ref, watch } from 'vue';
import type { Project, Task } from '@/types';
import Select from 'primevue/select';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';
import Paginator from 'primevue/paginator';
import Calendar from 'primevue/calendar';
import Header from '@/components/Header.vue';

const projectsStore = useProjectsStore()
const usersStore = useUsersStore()
const taskStore = useTaskStore()
const selectedProjectId = ref<string>('')
const showAssignUserDialog = ref(false)
const showCreateTaskDialog = ref(false)
const showGlobalTasks = ref(false)
const editingTaskId = ref<string | null>(null)
const editingAssignmentId = ref<string | null>(null)

// Formulario de asignación
const assignUserForm = ref({
  userId: '',
  role: '',
  billingRate: null as number | null,
  costRate: null as number | null,
  isBillable: true,
  startDate: undefined as Date | undefined,
  endDate: undefined as Date | undefined,
})

// Formulario de creación de tarea
const createTaskForm = ref({
  code: '',
  name: '',
  isGlobal: false,
  isActive: true,
})


// Combinar tareas del proyecto con globales si el toggle está activado
const TASKS_PER_PAGE = 5
const taskPagination = ref({
  first: 0,
  rows: TASKS_PER_PAGE,
})

const displayedTasks = computed(() => {
  const tasks = [...taskStore.projectTasks]
  if (showGlobalTasks.value) {
    tasks.push(...taskStore.globalTasks)
  }
  return tasks
})

const paginatedTasks = computed(() => {
  const start = taskPagination.value.first
  const end = start + taskPagination.value.rows
  return displayedTasks.value.slice(start, end)
})

watch(displayedTasks, () => {
  taskPagination.value.first = 0
})

const groupedProjects = computed(() => {
  const groups = new Map<string, { label: string; items: Project[] }>()

  projectsStore.projects.forEach((project: Project) => {
    const rut = project.empresa_rut || 'Sin empresa'
    if (!groups.has(rut)) {
      groups.set(rut, { label: rut, items: [] as Project[] })
    }
    groups.get(rut)!.items.push(project)
  })

  return Array.from(groups.entries())
    .sort(([rutA], [rutB]) => rutA.localeCompare(rutB))
    .map(([label, group]) => ({
      label,
      items: [...group.items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
})

onMounted(async () => {
  await projectsStore.loadProjects()
  await taskStore.loadGlobalTasks()
});

watch(selectedProjectId, async (newProjectId) => {
  if (newProjectId) {
    await usersStore.loadProjectUsers(newProjectId)
    await taskStore.loadProjectTasks(newProjectId)
  } else {
    usersStore.clearProjectUsers()
    await taskStore.loadProjectTasks('')
  }
})

watch(showGlobalTasks, async (show) => {
  if (show && taskStore.globalTasks.length === 0) {
    await taskStore.loadGlobalTasks()
  }
})

async function openAssignUserDialog() {
  if (selectedProjectId.value) {
    console.log('selectedProjectId', selectedProjectId.value);
    await projectsStore.loadAssignableUsers(selectedProjectId.value)
  }
  assignUserForm.value = {
    userId: '',
    role: '',
    billingRate: null,
    costRate: null,
    isBillable: true,
    startDate: undefined,
    endDate: undefined,
  }
  showAssignUserDialog.value = true
}

function closeAssignUserDialog() {
  showAssignUserDialog.value = false
  editingAssignmentId.value = null
  assignUserForm.value = {
    userId: '',
    role: '',
    billingRate: null,
    costRate: null,
    isBillable: true,
    startDate: undefined,
    endDate: undefined,
  }
}

function openEditAssignmentDialog(assignment: any) {
  editingAssignmentId.value = assignment.id
  assignUserForm.value = {
    userId: assignment.user_id || '',
    role: assignment.role_name || '',
    billingRate: assignment.billing_rate || null,
    costRate: assignment.cost_rate || null,
    isBillable: assignment.is_billable ?? true,
    startDate: assignment.start_date ? new Date(assignment.start_date) : undefined,
    endDate: assignment.end_date ? new Date(assignment.end_date) : undefined,
  }
  
  // Si el usuario actual no está en la lista de usuarios asignables, agregarlo
  if (assignment.user_id && assignment.full_name) {
    const userExists = projectsStore.assignableUsers.some(
      (u: any) => u.user_id === assignment.user_id
    )
    if (!userExists) {
      projectsStore.assignableUsers.push({
        user_id: assignment.user_id,
        nombre: assignment.full_name,
      })
    }
  }
  
  showAssignUserDialog.value = true
}

async function handleAssignUser() {
  if (!selectedProjectId.value) {
    return
  }

  // Si estamos editando, no requerimos userId porque ya está asignado
  if (editingAssignmentId.value) {
    if (!editingAssignmentId.value) {
      return
    }

    try {
      await projectsStore.updateProjectAssignment(editingAssignmentId.value, {
        role: assignUserForm.value.role || undefined,
        costRate: assignUserForm.value.costRate,
        billingRate: assignUserForm.value.billingRate,
        isBillable: assignUserForm.value.isBillable,
        startDate: assignUserForm.value.startDate || undefined,
        endDate: assignUserForm.value.endDate || undefined,
      })
      
      closeAssignUserDialog()
      
      // Recargar los usuarios del proyecto
      await usersStore.loadProjectUsers(selectedProjectId.value)
    } catch (err) {
      console.error('Error al actualizar asignación:', err)
    }
  } else {
    // Modo creación
    if (!assignUserForm.value.userId) {
      return
    }

    try {
      await projectsStore.createProjectAssignment({
        userId: assignUserForm.value.userId,
        projectId: selectedProjectId.value,
        role: assignUserForm.value.role || undefined,
        costRate: assignUserForm.value.costRate,
        billingRate: assignUserForm.value.billingRate,
        isBillable: assignUserForm.value.isBillable,
        startDate: assignUserForm.value.startDate || undefined,
        endDate: assignUserForm.value.endDate || undefined,
      })
      
      closeAssignUserDialog()
      
      // Recargar los usuarios del proyecto
      await usersStore.loadProjectUsers(selectedProjectId.value)
    } catch (err) {
      console.error('Error al asignar usuario:', err)
    }
  }
}

function openCreateTaskDialog() {
  editingTaskId.value = null
  createTaskForm.value = {
    code: '',
    name: '',
    isGlobal: false,
    isActive: true,
  }
  showCreateTaskDialog.value = true
}

function openEditTaskDialog(task: Task) {
  editingTaskId.value = task.id
  createTaskForm.value = {
    code: task.code ?? '',
    name: task.name ?? '',
    isGlobal: Boolean(task.is_global),
    isActive: task.is_active ?? true,
  }
  showCreateTaskDialog.value = true
}

function closeCreateTaskDialog() {
  showCreateTaskDialog.value = false
  editingTaskId.value = null
  createTaskForm.value = {
    code: '',
    name: '',
    isGlobal: false,
    isActive: true,
  }
}

async function handleCreateTask() {
  if (!editingTaskId.value && !selectedProjectId.value) {
    return
  }

  try {
    const isGlobal = createTaskForm.value.isGlobal
    if (editingTaskId.value) {
      await taskStore.updateTask({
        id: editingTaskId.value,
        projectId: selectedProjectId.value,
        code: createTaskForm.value.code,
        name: createTaskForm.value.name,
        isGlobal,
        isActive: createTaskForm.value.isActive,
      })
    } else {
      await taskStore.createTask({
        projectId: selectedProjectId.value,
        code: createTaskForm.value.code,
        name: createTaskForm.value.name,
        isGlobal,
        isActive: createTaskForm.value.isActive,
      })
    }
    closeCreateTaskDialog()
    // Recargar las tareas del proyecto
    if (selectedProjectId.value) {
      await taskStore.loadProjectTasks(selectedProjectId.value)
    }
    // Si se creó una tarea global y el toggle está activado, recargar globales
    if (isGlobal && showGlobalTasks.value) {
      await taskStore.loadGlobalTasks()
    }
  } catch (err) {
    console.error('Error al crear tarea:', err)
  }
}

function handleTaskPageChange(event: { first: number; rows: number }) {
  taskPagination.value.first = event.first
  taskPagination.value.rows = event.rows
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <Header />
    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Proyectos</h1>
          <p class="text-sm text-muted-foreground">Gestiona los proyectos de la empresa.</p>
        </div>
      </div>

      <div class="px-6 py-6 space-y-4">
        <div class="flex items-center gap-4">
          <div class="space-y-2 max-w-md flex-1">
            <Select
              id="project-select"
              v-model="selectedProjectId"
              :options="groupedProjects"
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionLabel="name"
              optionValue="id"
              placeholder="Selecciona un proyecto"
              class="w-full"
            >
              <template #optiongroup="slotProps">
                <div class="flex items-center">
                  <span class="text-sm font-medium">Empresa {{ slotProps.option.label }}</span>
                </div>
              </template>
              <template #option="slotProps">
                <div
                  class="flex rounded-md text-sm leading-tight hover:bg-muted/60"
                >
                  <span class="text-muted-foreground">
                    {{ slotProps.option.name }}
                    <span class="text-xs italic text-muted-foreground/80">
                      ({{ slotProps.option.code }})
                    </span>
                  </span>
                </div>
              </template>
            </Select>
          </div>
        </div>

        <TabView>
          <TabPanel header="Usuarios" value="usuarios">
            <div class="py-4 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-md font-semibold"><span v-if="selectedProjectId">Usuarios asignados al proyecto</span></h3>
                <Button
                  label="Asignar Usuario"
                  icon="pi pi-plus"
                  @click="openAssignUserDialog"
                  :disabled="!selectedProjectId"
                />
              </div>
              <div class="relative">
                <div
                  v-if="usersStore.loading"
                  class="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg border"
                >
                  <ProgressSpinner style="width: 38px; height: 38px" strokeWidth="4" />
                </div>
                <DataTable
                  v-if="selectedProjectId && usersStore.projectUsers.length > 0"
                  :value="usersStore.projectUsers"
                  :loading="usersStore.loading"
                  class="rounded-lg border bg-card text-sm"
                >
                  <Column field="full_name" header="Nombre" sortable>
                    <template #body="{ data }">
                      {{ data.full_name ?? data.user_id ?? 'Sin nombre' }}
                    </template>
                  </Column>
                  <Column field="role" header="Rol" sortable>
                    <template #body="{ data }">
                      {{ data.role_name ?? data.role ?? 'Sin rol' }}
                    </template>
                  </Column>
                  <Column field="billing_rate" header="Tarifa de Facturación" sortable>
                    <template #body="{ data }">
                      {{ data.billing_rate ? `$${data.billing_rate.toLocaleString()}` : '-' }}
                    </template>
                  </Column>
                  <Column field="start_date" header="Fecha de Inicio" sortable>
                    <template #body="{ data }">
                      {{ data.start_date ? new Date(data.start_date).toLocaleDateString('es-ES') : '-' }}
                    </template>
                  </Column>
                  <Column field="end_date" header="Fecha de Fin" sortable>
                    <template #body="{ data }">
                      {{ data.end_date ? new Date(data.end_date).toLocaleDateString('es-ES') : '-' }}
                    </template>
                  </Column>
                  <Column header="Acciones">
                    <template #body="{ data }">
                      <i
                        class="pi pi-pencil cursor-pointer text-primary hover:text-primary/80"
                        @click="openEditAssignmentDialog(data)"
                      />
                    </template>
                  </Column>
                </DataTable>
                <div
                  v-else-if="selectedProjectId && !usersStore.loading && usersStore.projectUsers.length === 0"
                  class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
                >
                  No hay usuarios asignados a este proyecto.
                </div>
                <div
                  v-else-if="!selectedProjectId"
                  class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
                >
                  Selecciona un proyecto para ver los usuarios asignados.
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Tareas" value="tareas">
            <div class="py-4 space-y-4">
              <div class="flex items-center justify-end gap-4">
                <div class="flex items-center gap-2">
                  <label for="show-global-toggle" class="text-sm font-medium">Mostrar globales</label>
                  <ToggleSwitch
                    id="show-global-toggle"
                    v-model="showGlobalTasks"
                    :disabled="!selectedProjectId"
                  />
                </div>
                <Button
                  label="Crear Tarea"
                  icon="pi pi-plus"
                  @click="openCreateTaskDialog"
                  :disabled="!selectedProjectId"
                />
              </div>
              <div class="relative">
                <div
                  v-if="taskStore.loading"
                  class="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg border"
                >
                  <ProgressSpinner style="width: 38px; height: 38px" strokeWidth="4" />
                </div>
                <DataTable
                  v-if="selectedProjectId && displayedTasks.length > 0"
                  :value="paginatedTasks"
                  :loading="taskStore.loading"
                  class="rounded-lg border bg-card"
                >
                  <Column field="code" header="Código" sortable>
                    <template #body="{ data }">
                      {{ data.code || '-' }}
                    </template>
                  </Column>
                  <Column field="name" header="Nombre" sortable>
                    <template #body="{ data }">
                      {{ data.name || '-' }}
                    </template>
                  </Column>
                  <Column field="is_global" header="Global" sortable>
                    <template #body="{ data }">
                      <span :class="data.is_global ? 'text-blue-600' : 'text-gray-600'">
                        {{ data.is_global ? 'Sí' : 'No' }}
                      </span>
                    </template>
                  </Column>
                  <Column field="is_active" header="Activa" sortable>
                    <template #body="{ data }">
                      <span :class="data.is_active ? 'text-green-600' : 'text-red-600'">
                        {{ data.is_active ? 'Sí' : 'No' }}
                      </span>
                    </template>
                  </Column>
                  <Column header="Acciones">
                    <template #body="{ data }">
                      <Button
                        label="Editar"
                        icon="pi pi-pencil"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="openEditTaskDialog(data)"
                      />
                    </template>
                  </Column>
                </DataTable>
                <div
                  v-else-if="selectedProjectId && !taskStore.loading && displayedTasks.length === 0"
                  class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
                >
                  No hay tareas disponibles para este proyecto.
                </div>
                <div
                  v-else-if="!selectedProjectId"
                  class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
                >
                  Selecciona un proyecto para ver sus tareas.
                </div>
                <Paginator
                  v-if="selectedProjectId && displayedTasks.length > 0"
                  class="mt-4"
                  :rows="taskPagination.rows"
                  :first="taskPagination.first"
                  :totalRecords="displayedTasks.length"
                  :rowsPerPageOptions="[TASKS_PER_PAGE]"
                  @page="handleTaskPageChange"
                />
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>

    <Dialog
      v-model:visible="showAssignUserDialog"
      modal
      :header="editingAssignmentId ? 'Editar Asignación de Usuario' : 'Asignar Usuario al Proyecto'"
      :style="{ width: '600px' }"
      @hide="closeAssignUserDialog"
    >
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label for="user-select" class="block text-sm font-medium">Usuario</label>
          <Select
            id="user-select"
            v-model="assignUserForm.userId"
            :options="projectsStore.assignableUsers"
            optionLabel="nombre"
            optionValue="user_id"
            placeholder="Selecciona un usuario"
            class="w-full"
            :loading="projectsStore.loading"
            :disabled="!!editingAssignmentId"
          />
        </div>

        <div class="space-y-2">
          <label for="role-input" class="block text-sm font-medium">Rol</label>
          <InputText
            id="role-input"
            v-model="assignUserForm.role"
            placeholder="Ej: Desarrollador, PM, etc."
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="cost-rate-input" class="block text-sm font-medium">Cost Rate</label>
          <InputNumber
            id="cost-rate-input"
            v-model="assignUserForm.costRate"
            mode="currency"
            currency="USD"
            locale="es-US"
            :min="0"
            :maxFractionDigits="2"
            placeholder="0.00"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="billing-rate-input" class="block text-sm font-medium">Tarifa de Facturación</label>
          <InputNumber
            id="billing-rate-input"
            v-model="assignUserForm.billingRate"
            mode="currency"
            currency="USD"
            locale="es-US"
            :min="0"
            :maxFractionDigits="2"
            placeholder="0.00"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="is-billable-toggle" class="block text-sm font-medium">Facturable</label>
            <ToggleSwitch
              id="is-billable-toggle"
              v-model="assignUserForm.isBillable"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            Indica si las horas trabajadas son facturables
          </p>
        </div>

        <div class="space-y-2">
          <label for="start-date-input" class="block text-sm font-medium">Fecha de Inicio</label>
          <Calendar
            id="start-date-input"
            v-model="assignUserForm.startDate"
            dateFormat="dd/mm/yy"
            placeholder="Selecciona una fecha"
            class="w-full"
            showIcon
          />
        </div>

        <div class="space-y-2">
          <label for="end-date-input" class="block text-sm font-medium">Fecha de Fin</label>
          <Calendar
            id="end-date-input"
            v-model="assignUserForm.endDate"
            dateFormat="dd/mm/yy"
            placeholder="Selecciona una fecha (opcional)"
            class="w-full"
            showIcon
            :minDate="assignUserForm.startDate"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="closeAssignUserDialog"
        />
        <Button
          :label="editingAssignmentId ? 'Actualizar' : 'Asignar'"
          @click="handleAssignUser"
          :disabled="editingAssignmentId ? false : !assignUserForm.userId"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showCreateTaskDialog"
      modal
      :header="editingTaskId ? 'Editar Tarea' : 'Crear Tarea'"
      :style="{ width: '500px' }"
      @hide="closeCreateTaskDialog"
    >
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label for="task-code-input" class="block text-sm font-medium">Código</label>
          <InputText
            id="task-code-input"
            v-model="createTaskForm.code"
            placeholder="Ej: TASK-001"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <label for="task-name-input" class="block text-sm font-medium">Nombre</label>
          <InputText
            id="task-name-input"
            v-model="createTaskForm.name"
            placeholder="Nombre de la tarea"
            class="w-full"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="task-global-toggle" class="block text-sm font-medium">Tarea Global</label>
            <ToggleSwitch
              id="task-global-toggle"
              v-model="createTaskForm.isGlobal"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            Las tareas globales están disponibles para todos los proyectos
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label for="task-active-toggle" class="block text-sm font-medium">Activa</label>
            <ToggleSwitch
              id="task-active-toggle"
              v-model="createTaskForm.isActive"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            Las tareas inactivas no estarán disponibles para seleccionar
          </p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="closeCreateTaskDialog"
        />
        <Button
          :label="editingTaskId ? 'Actualizar' : 'Crear'"
          @click="handleCreateTask"
          :disabled="!createTaskForm.code || !createTaskForm.name"
        />
      </template>
    </Dialog>
  </div>
</template>

