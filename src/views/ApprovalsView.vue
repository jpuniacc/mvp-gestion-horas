<script setup lang="ts">
import { useProjectsStore } from '@/stores/projectsStore';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { Project } from '@/types';
import WeekNavigator from '@/components/timesheet/WeekNavigator.vue';
import Select from 'primevue/select';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import type { TreeNode } from 'primevue/treenode';
import { useWeekNavigation } from '@/composables/useWeekNavigation';
import { useUsersStore } from '@/stores/usersStore';
import { useTimesheetStore } from '@/stores/timesheetStore';
import { useTaskStore } from '@/stores/taskStore';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header.vue';

const projectsStore = useProjectsStore()
const usersStore = useUsersStore()
const timesheetStore = useTimesheetStore()
const taskStore = useTaskStore()
const selectedProjectId = ref<string>('')
const weekNavigation = useWeekNavigation({ syncWithRouter: false })
const { currentWeek, currentYear } = weekNavigation
const viewMode = ref<'usuario' | 'tareas'>('usuario')
const userTreeNodes = ref<TreeNode[]>([])
const expandedKeys = ref<Record<string, boolean>>({})

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
});

async function handleProjectChange(projectId: string) {
  if (!projectId) {
    usersStore.clearProjectUsers()
    userTreeNodes.value = []
    expandedKeys.value = {}
    return
  }
  
  if (viewMode.value === 'usuario') {
    await usersStore.loadProjectUsers(projectId)
  } else {
    await loadTasksForProject()
  }
}

watch(selectedProjectId, async (newProjectId) => {
  console.log('selectedProjectId', newProjectId)
  await handleProjectChange(newProjectId)
})

watch([currentWeek, currentYear], async () => {
  console.log('currentWeek', currentWeek.value)
  console.log('currentYear', currentYear.value)
  // Recargar datos cuando cambie la semana/año
  if (selectedProjectId.value) {
    // Guardar las claves expandidas antes de recargar
    const previousExpandedKeys = { ...expandedKeys.value }
    
    if (viewMode.value === 'usuario') {
      // Recargar usuarios del proyecto
      await usersStore.loadProjectUsers(selectedProjectId.value)
      
      // Esperar a que el watch de projectUsers actualice userTreeNodes
      await nextTick()
      
      // Restaurar y recargar datos de nodos expandidos
      const keysToRestore: Record<string, boolean> = {}
      for (const userKey of Object.keys(previousExpandedKeys)) {
        const node = findNodeByKey(userTreeNodes.value, userKey)
        if (node && !node.leaf) {
          keysToRestore[userKey] = true
          
          // Agregar un nodo temporal de carga
          node.children = [{
            key: `${userKey}-loading`,
            data: {
              isLoading: true,
            },
            leaf: true,
          }]
          
          const children = await loadTasksForUser(userKey)
          node.children = children
          
          // Actualizar el timesheet_week_id si hay entradas
          if (children.length > 0 && !children[0].data.isEmpty) {
            const firstEntry = children[0]
            if (firstEntry.data.timesheetWeekId) {
              node.data.timesheetWeekId = firstEntry.data.timesheetWeekId
            }
          } else {
            node.data.timesheetWeekId = undefined
          }
        }
      }
      
      expandedKeys.value = keysToRestore
    } else {
      // Modo tareas: recargar tareas
      // Guardar las claves expandidas antes de recargar
      const taskKeysToRestore = Object.keys(previousExpandedKeys)
      
      // No resetear expandedKeys al recargar desde el watch
      await loadTasksForProject(false)
      
      // Esperar a que se actualicen los nodos
      await nextTick()
      
      // Restaurar y recargar datos de nodos expandidos
      const keysToRestore: Record<string, boolean> = {}
      for (const taskKey of taskKeysToRestore) {
        const node = findNodeByKey(userTreeNodes.value, taskKey)
        if (node && !node.leaf) {
          keysToRestore[taskKey] = true
          
          // Agregar un nodo temporal de carga
          node.children = [{
            key: `${taskKey}-loading`,
            data: {
              isLoading: true,
            },
            leaf: true,
          }]
          
          const children = await loadUsersForTask(taskKey)
          node.children = children
        }
      }
      
      expandedKeys.value = keysToRestore
    }
  }
})

function findNodeByKey(nodes: TreeNode[], key: string): TreeNode | null {
  for (const node of nodes) {
    if (String(node.key) === key) {
      return node
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key)
      if (found) return found
    }
  }
  return null
}

watch(
  () => usersStore.projectUsers,
  async (projectUsers) => {
    if (viewMode.value === 'usuario') {
      userTreeNodes.value = projectUsers.map((assignment) => {
        const userKey = assignment.user_id ?? assignment.id
        return {
          key: userKey,
          data: {
            email: assignment.email ?? 'Sin correo',
            name: assignment.full_name ?? assignment.user_id,
            role: assignment.role_name ?? assignment.role,
          },
          leaf: false,
        }
      })
      expandedKeys.value = {}
    }
  },
  { immediate: true }
)

async function loadTasksForProject(resetExpandedKeys = true) {
  if (!selectedProjectId.value || !currentWeek.value || !currentYear.value) {
    userTreeNodes.value = []
    if (resetExpandedKeys) {
      expandedKeys.value = {}
    }
    return
  }

  const tasks = await taskStore.loadTasksForProjectWeek({
    projectId: selectedProjectId.value,
    year: currentYear.value,
    week: currentWeek.value,
  })

  userTreeNodes.value = tasks.map((task) => ({
    key: task.id,
    data: {
      taskName: task.name || 'Tarea sin nombre',
      taskCode: task.code || '',
    },
    leaf: false,
  }))
  
  if (resetExpandedKeys) {
    expandedKeys.value = {}
  }
}

watch(viewMode, async () => {
  if (!selectedProjectId.value) {
    userTreeNodes.value = []
    return
  }

  if (viewMode.value === 'tareas') {
    await loadTasksForProject()
  } else {
    await usersStore.loadProjectUsers(selectedProjectId.value)
  }
})

async function handleNodeExpand(nodeArg: TreeNode) {
  const node = ((nodeArg as unknown as { node?: TreeNode })?.node ?? nodeArg) as TreeNode | undefined
  if (!node) return
  const key = String(node.key)

  expandedKeys.value = { ...expandedKeys.value, [key]: true }
  
  // Si ya tiene hijos cargados, solo actualizar el timesheetWeekId si no existe
  if (node.children && node.children.length && !node.children[0].data.isLoading) {
    if (viewMode.value === 'usuario' && !node.data.timesheetWeekId) {
      // Si no tiene timesheetWeekId, intentar obtenerlo de los hijos existentes
      const firstChild = node.children.find(c => !c.data.isEmpty && c.data.timesheetWeekId)
      if (firstChild) {
        node.data.timesheetWeekId = firstChild.data.timesheetWeekId
      }
    }
    return
  }

  // Agregar un nodo temporal de carga
  node.children = [{
    key: `${key}-loading`,
    data: {
      isLoading: true,
    },
    leaf: true,
  }]
  
  let children: TreeNode[] = []
  
  if (viewMode.value === 'usuario') {
    // Modo usuario: cargar tareas del usuario
    children = await loadTasksForUser(key)
    
    // Guardar el timesheet_week_id en el nodo del usuario si hay entradas
    if (children.length > 0 && !children[0].data.isEmpty) {
      const firstEntry = children[0]
      if (firstEntry.data.timesheetWeekId) {
        node.data.timesheetWeekId = firstEntry.data.timesheetWeekId
      }
    } else {
      // Si no hay entradas, limpiar el timesheetWeekId
      node.data.timesheetWeekId = undefined
    }
  } else {
    // Modo tareas: cargar usuarios de la tarea
    children = await loadUsersForTask(key)
  }
  
  node.children = children
}

async function loadUsersForTask(taskId: string): Promise<TreeNode[]> {
  if (!selectedProjectId.value || !currentWeek.value || !currentYear.value) {
    return []
  }

  // Asegurar que los usuarios del proyecto estén cargados
  if (usersStore.projectUsers.length === 0) {
    await usersStore.loadProjectUsers(selectedProjectId.value)
  }

  // Cargar todas las entradas de esta tarea para esta semana/proyecto
  const { data, error } = await supabase
    .from('timesheet_entries')
    .select(`
      *,
      timesheet_weeks!inner (
        id,
        year,
        week_number,
        status,
        user_id
      ),
      tasks!inner (
        id,
        name,
        code
      )
    `)
    .eq('project_id', selectedProjectId.value)
    .eq('task_id', taskId)
    .eq('timesheet_weeks.year', currentYear.value)
    .eq('timesheet_weeks.week_number', currentWeek.value)
    .eq('timesheet_weeks.status', 'submitted')

  if (error || !data || data.length === 0) {
    return [{
      key: `${taskId}-empty`,
      data: {
        isEmpty: true,
        message: 'Sin usuarios para esta tarea',
      },
      leaf: true,
    }]
  }

  // Agrupar por usuario y crear nodos
  const userMap = new Map<string, { user: any, entries: any[], timesheetWeekId: string }>()
  
  data.forEach((entry: any) => {
    const timesheetWeek = Array.isArray(entry.timesheet_weeks)
      ? entry.timesheet_weeks[0]
      : entry.timesheet_weeks
    const userId = timesheetWeek?.user_id
    const timesheetWeekId = timesheetWeek?.id
    
    if (userId) {
      if (!userMap.has(userId)) {
        // Buscar el usuario en usersStore
        const user = usersStore.projectUsers.find(u => (u.user_id ?? u.id) === userId)
        userMap.set(userId, {
          user: user || { user_id: userId },
          entries: [],
          timesheetWeekId: timesheetWeekId || '',
        })
      }
      userMap.get(userId)!.entries.push(entry)
    }
  })

  return Array.from(userMap.values()).map(({ user, entries, timesheetWeekId }) => {
    // Sumar las horas de todas las entradas del usuario para esta tarea
    const totalHours = entries.reduce((sum, e) => sum + (e.total_hours || 0), 0)
    
    return {
      key: `${taskId}-${user.user_id ?? user.id}`,
      data: {
        email: user.email ?? 'Sin correo',
        name: user.full_name ?? user.user_id ?? 'Usuario sin nombre',
        hoursMonday: entries.reduce((sum, e) => sum + (e.hours_monday || 0), 0),
        hoursTuesday: entries.reduce((sum, e) => sum + (e.hours_tuesday || 0), 0),
        hoursWednesday: entries.reduce((sum, e) => sum + (e.hours_wednesday || 0), 0),
        hoursThursday: entries.reduce((sum, e) => sum + (e.hours_thursday || 0), 0),
        hoursFriday: entries.reduce((sum, e) => sum + (e.hours_friday || 0), 0),
        hoursSaturday: entries.reduce((sum, e) => sum + (e.hours_saturday || 0), 0),
        hoursSunday: entries.reduce((sum, e) => sum + (e.hours_sunday || 0), 0),
        totalHours,
        timesheetWeekId,
      },
      leaf: true,
    }
  })
}

function handleNodeCollapse(nodeArg: TreeNode) {
  const node = ((nodeArg as unknown as { node?: TreeNode })?.node ?? nodeArg) as TreeNode | undefined
  if (!node) return
  const key = String(node.key)
  const { [key]: _removed, ...rest } = expandedKeys.value
  expandedKeys.value = rest
  // No limpiar timesheetWeekId, solo ocultar el botón basándose en expandedKeys
}

async function loadTasksForUser(userKey: string): Promise<TreeNode[]> {
  if (!selectedProjectId.value || !currentWeek.value || !currentYear.value) {
    return []
  }

  const entries = await projectsStore.loadTimesheetEntriesForWeek({
    userId: userKey,
    projectId: selectedProjectId.value,
    year: currentYear.value,
    week: currentWeek.value,
  })
  
  if (entries.length === 0) {
    // Devolver un nodo especial para mostrar el estado vacío
    return [{
      key: `${userKey}-empty`,
      data: {
        isEmpty: true,
        message: 'Sin tareas para aprobar',
      },
      leaf: true,
    }]
  }

  // Obtener el timesheet_week_id de la primera entrada (todas tienen el mismo)
  const timesheetWeek = Array.isArray((entries[0] as any).timesheet_weeks)
    ? (entries[0] as any).timesheet_weeks[0]
    : (entries[0] as any).timesheet_weeks
  const timesheetWeekId = timesheetWeek?.id

  return entries.map((entry) => {
    // Supabase puede devolver tasks como objeto o array, manejamos ambos casos
    const task = Array.isArray((entry as any).tasks) 
      ? (entry as any).tasks[0] 
      : (entry as any).tasks || (entry as any).task
    
    return {
      key: entry.id,
      data: {
        taskName: task?.name || 'Tarea sin nombre',
        taskCode: task?.code || '',
        hoursMonday: entry.hours_monday || 0,
        hoursTuesday: entry.hours_tuesday || 0,
        hoursWednesday: entry.hours_wednesday || 0,
        hoursThursday: entry.hours_thursday || 0,
        hoursFriday: entry.hours_friday || 0,
        hoursSaturday: entry.hours_saturday || 0,
        hoursSunday: entry.hours_sunday || 0,
        totalHours: entry.total_hours || 0,
        timesheetWeekId, // Incluir el ID para que esté disponible en los hijos
      },
      leaf: true,
    }
  })
}

async function handleApprove(timesheetWeekId: string) {
  try {
    await timesheetStore.approveWeek(timesheetWeekId)
    
    // Recargar datos según el modo
    if (selectedProjectId.value) {
      if (viewMode.value === 'usuario') {
        await usersStore.loadProjectUsers(selectedProjectId.value)
      } else {
        await loadTasksForProject()
      }
    }
  } catch (err: any) {
    console.error('Error al aprobar semana:', err)
    // TODO: Mostrar mensaje de error al usuario (Toast, Dialog, etc.)
  }
}

</script>

<template>
  <div class="max-w-7xl mx-auto">
    <Header />
    <div class="approvals-container">
      <div class="approvals-header">
        <div class="approvals-header-grid">
          <div class="approvals-title-section">
            <h1 class="approvals-title">
              <i class="pi pi-check-circle approvals-title-icon"></i>
              Aprobaciones
            </h1>
            <p class="approvals-description">Gestiona las horas pendientes de aprobación.</p>
          </div>
          <div class="approvals-navigator-section">
            <WeekNavigator :navigation="weekNavigation" />
          </div>
        </div>
      </div>

      <div class="approvals-content">
        <div class="approvals-filters">
          <div class="approvals-filter-project">
            <label for="project-select" class="approvals-filter-label">
              <i class="pi pi-folder approvals-filter-icon"></i>
              Proyecto
            </label>
            <Select
              id="project-select"
              v-model="selectedProjectId"
              :options="groupedProjects"
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionLabel="name"
              optionValue="id"
              placeholder="Selecciona un proyecto"
              class="approvals-select"
            >
              <template #optiongroup="slotProps">
                <div class="approvals-select-group">
                  <i class="pi pi-building approvals-select-group-icon"></i>
                  <span>Empresa {{ slotProps.option.label }}</span>
                </div>
              </template>
              <template #option="slotProps">
                <div class="approvals-select-option">
                  <span class="approvals-select-option-name">{{ slotProps.option.name }}</span>
                  <span class="approvals-select-option-code">({{ slotProps.option.code }})</span>
                </div>
              </template>
            </Select>
          </div>
          <div class="approvals-filter-view">
            <label for="view-mode-toggle" class="approvals-filter-label">
              <i class="pi pi-eye approvals-filter-icon"></i>
              Vista por:
            </label>
            <div class="approvals-view-toggle">
              <button
                :class="['approvals-view-button', { 'approvals-view-button-active': viewMode === 'usuario' }]"
                @click="viewMode = 'usuario'"
              >
                <i class="pi pi-users"></i>
                <span>Usuario</span>
              </button>
              <button
                :class="['approvals-view-button', { 'approvals-view-button-active': viewMode === 'tareas' }]"
                @click="viewMode = 'tareas'"
              >
                <i class="pi pi-list"></i>
                <span>Tareas</span>
              </button>
            </div>
          </div>
        </div>

        <div class="approvals-table-section">
          <div class="approvals-table-wrapper">
            <div
              v-if="viewMode === 'usuario' ? usersStore.loading : taskStore.loading"
              class="approvals-loading-overlay"
            >
              <ProgressSpinner style="width: 38px; height: 38px" strokeWidth="4" />
            </div>
            <TreeTable
              v-if="userTreeNodes.length"
              :value="userTreeNodes"
              :lazy="true"
              :loading="viewMode === 'usuario' ? usersStore.loading : taskStore.loading"
              :expandedKeys="expandedKeys"
              @node-expand="handleNodeExpand"
              @node-collapse="handleNodeCollapse"
              class="approvals-tree-table"
            >
              <Column field="email" :header="viewMode === 'usuario' ? 'Usuario' : 'Tarea'" expander>
                <template #body="{ node }">
                  <div v-if="node.leaf && node.data.isLoading" class="approvals-loading-cell">
                    <ProgressSpinner style="width: 16px; height: 16px" strokeWidth="3" />
                    <span>Cargando...</span>
                  </div>
                  <div v-else-if="node.leaf && node.data.isEmpty" class="approvals-empty-cell">
                    {{ node.data.message || (viewMode === 'usuario' ? 'Sin tareas para aprobar' : 'Sin usuarios para esta tarea') }}
                  </div>
                  <div v-else-if="node.leaf" class="approvals-leaf-cell">
                    <!-- Nodo hoja: muestra tarea en modo usuario, o usuario en modo tareas -->
                    <template v-if="viewMode === 'usuario'">
                      <div class="approvals-cell-content">
                        <i class="pi pi-list approvals-cell-icon"></i>
                        <div>
                          <div class="approvals-cell-title">{{ node.data.taskName || 'Tarea sin nombre' }}</div>
                          <div v-if="node.data.taskCode" class="approvals-cell-subtitle">
                            {{ node.data.taskCode }}
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="approvals-cell-content">
                        <i class="pi pi-user approvals-cell-icon"></i>
                        <div>
                          <div class="approvals-cell-title">{{ node.data.name || 'Usuario sin nombre' }}</div>
                          <div class="approvals-cell-subtitle">{{ node.data.email }}</div>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div v-else class="approvals-parent-cell">
                    <!-- Nodo padre: muestra usuario en modo usuario, o tarea en modo tareas -->
                    <template v-if="viewMode === 'usuario'">
                      <div class="approvals-cell-content">
                        <i class="pi pi-user approvals-cell-icon"></i>
                        <div>
                          <div class="approvals-cell-title">{{ node.data.name || 'Usuario sin nombre' }}</div>
                          <div class="approvals-cell-subtitle">{{ node.data.email }}</div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="approvals-cell-content">
                        <i class="pi pi-list approvals-cell-icon"></i>
                        <div>
                          <div class="approvals-cell-title">{{ node.data.taskName || 'Tarea sin nombre' }}</div>
                          <div v-if="node.data.taskCode" class="approvals-cell-subtitle">
                            {{ node.data.taskCode }}
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </Column>
              <Column field="hoursMonday" style="width: 40px">
                <template #header>
                  <div class="flex items-center justify-center h-full w-full">
                    <span class="transform -rotate-45 whitespace-nowrap text-sm font-bold">Lun</span>
                  </div>
                </template>
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm text-center">
                    {{ node.data.hoursMonday || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="hoursTuesday" style="width: 40px">
                <template #header>
                  <div class="flex items-center justify-center h-full w-full">
                    <span class="transform -rotate-45 whitespace-nowrap text-sm font-bold">Mar</span>
                  </div>
                </template>
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm text-center">
                    {{ node.data.hoursTuesday || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="hoursWednesday" style="width: 40px">
                <template #header>
                  <div class="flex items-center justify-center h-full w-full">
                    <span class="transform -rotate-45 whitespace-nowrap text-sm font-bold">Mié</span>
                  </div>
                </template>
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm text-center">
                    {{ node.data.hoursWednesday || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="hoursThursday" style="width: 40px">
                <template #header>
                  <div class="flex items-center justify-center h-full w-full">
                    <span class="transform -rotate-45 whitespace-nowrap text-sm font-bold">Jue</span>
                  </div>
                </template>
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm text-center">
                    {{ node.data.hoursThursday || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="hoursFriday" style="width: 40px">
                <template #header>
                  <div class="flex items-center justify-center h-full w-full">
                    <span class="transform -rotate-45 whitespace-nowrap text-sm font-bold">Vie</span>
                  </div>
                </template>
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm text-center">
                    {{ node.data.hoursFriday || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="hoursSaturday" style="width: 40px">
                <template #header>
                  <div class="flex items-center justify-center h-full w-full">
                    <span class="transform -rotate-45 whitespace-nowrap text-sm font-bold">Sáb</span>
                  </div>
                </template>
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm text-center">
                    {{ node.data.hoursSaturday || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="hoursSunday" style="width: 40px">
                <template #header>
                  <div class="flex items-center justify-center h-full w-full">
                    <span class="transform -rotate-45 whitespace-nowrap text-sm font-bold">Dom</span>
                  </div>
                </template>
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm text-center">
                    {{ node.data.hoursSunday || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="totalHours" header="Total" style="width: 65px">
                <template #body="{ node }">
                  <div v-if="node.leaf && !node.data.isEmpty && !node.data.isLoading" class="text-sm font-medium text-center">
                    {{ node.data.totalHours || 0 }}
                  </div>
                </template>
              </Column>
              <Column field="actions" header="Acciones" style="width: 140px">
                <template #body="{ node }">
                  <!-- En modo usuario: botón en nodo padre (usuario) solo si está expandido -->
                  <!-- En modo tareas: botón en nodo hoja (usuario) -->
                  <div v-if="node.data.timesheetWeekId && (viewMode === 'usuario' ? (!node.leaf && expandedKeys[String(node.key)]) : (node.leaf && !node.data.isEmpty && !node.data.isLoading))" class="approvals-actions-cell">
                    <button
                      class="approvals-approve-button"
                      @click="handleApprove(node.data.timesheetWeekId)"
                      title="Aprobar semana"
                    >
                      <i class="pi pi-check approvals-approve-icon"></i>
                      <span>Aprobar</span>
                    </button>
                  </div>
                </template>
              </Column>
            </TreeTable>

            <div
              v-else
              class="approvals-empty-state"
            >
              <i class="pi pi-inbox approvals-empty-icon"></i>
              <p>Selecciona un proyecto para ver los usuarios asignados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approvals-container {
  background: hsl(var(--card));
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  overflow: hidden;
}

.approvals-header {
  border-bottom: 1px solid hsl(var(--border));
  padding: 0 1rem;
}

.approvals-header-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: center;
}

.approvals-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.approvals-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.approvals-title-icon {
  font-size: 1.375rem;
  color: hsl(var(--primary));
}

.approvals-description {
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  margin-left: 1.875rem;
}

.approvals-navigator-section {
  display: flex;
  justify-content: flex-end;
}

.approvals-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.approvals-filters {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.approvals-filter-project {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.approvals-filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.approvals-filter-icon {
  font-size: 0.875rem;
  color: hsl(var(--primary));
}

.approvals-select {
  width: 100%;
}

.approvals-select-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.approvals-select-group-icon {
  font-size: 0.875rem;
  color: hsl(var(--primary));
}

.approvals-select-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.approvals-select-option-name {
  color: hsl(var(--foreground));
}

.approvals-select-option-code {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.approvals-filter-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.approvals-view-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: hsl(var(--muted) / 0.5);
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.approvals-view-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.approvals-view-button:hover {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
}

.approvals-view-button-active {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.approvals-view-button i {
  font-size: 0.875rem;
}

.approvals-table-section {
  margin-top: 0.5rem;
}

.approvals-table-wrapper {
  position: relative;
  background: hsl(var(--card));
  border-radius: 0.75rem;
  overflow: hidden;
}

.approvals-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--background) / 0.7);
  backdrop-filter: blur(4px);
  border-radius: 0.75rem;
}

.approvals-tree-table {
  border-radius: 0.75rem;
}

:deep(.approvals-tree-table .p-treetable) {
  border: none;
}

:deep(.approvals-tree-table .p-treetable-thead > tr > th) {
  background: hsl(var(--muted) / 0.5);
  border-bottom: 2px solid hsl(var(--border));
  padding: 0.875rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.approvals-tree-table .p-treetable-tbody > tr) {
  border-bottom: 1px solid hsl(var(--border));
  transition: background-color 0.15s ease-in-out;
}

:deep(.approvals-tree-table .p-treetable-tbody > tr:hover) {
  background: hsl(var(--muted) / 0.3);
}

:deep(.approvals-tree-table .p-treetable-tbody > tr > td) {
  padding: 0.875rem 1rem;
}

.approvals-loading-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
}

.approvals-empty-cell {
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.approvals-leaf-cell,
.approvals-parent-cell {
  font-size: 0.875rem;
}

.approvals-cell-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.approvals-cell-icon {
  font-size: 1rem;
  color: hsl(var(--primary));
  flex-shrink: 0;
}

.approvals-cell-title {
  font-weight: 600;
  color: hsl(var(--foreground));
  line-height: 1.4;
}

.approvals-cell-subtitle {
  font-size: 0.8125rem;
  color: hsl(var(--muted-foreground));
  margin-top: 0.125rem;
}

.approvals-actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.approvals-approve-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid hsl(var(--primary));
  border-radius: 0.5rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.approvals-approve-button:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px 0 hsl(var(--primary) / 0.3);
}

.approvals-approve-icon {
  font-size: 0.875rem;
}

.approvals-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  border: 1px dashed hsl(var(--border));
  border-radius: 0.75rem;
  text-align: center;
}

.approvals-empty-icon {
  font-size: 3rem;
  color: hsl(var(--muted-foreground));
}

.approvals-empty-state p {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

@media (max-width: 768px) {
  .approvals-header {
    padding: 0.625rem 1rem;
  }
  
  .approvals-header-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .approvals-title {
    font-size: 1.125rem;
  }
  
  .approvals-description {
    margin-left: 1.875rem;
    font-size: 0.75rem;
  }
  
  .approvals-navigator-section {
    justify-content: stretch;
  }
  
  .approvals-content {
    padding: 1rem;
  }
  
  .approvals-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .approvals-filter-project {
    min-width: 100%;
  }
  
  .approvals-view-toggle {
    width: 100%;
  }
  
  .approvals-view-button {
    flex: 1;
    justify-content: center;
  }
}
</style>

