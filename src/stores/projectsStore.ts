import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import type { Project, ProjectAssignment, Task } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const authStore = useAuthStore()
  const projects = ref<Project[]>([])
  const assignments = ref<ProjectAssignment[]>([])
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Proyectos activos
  const activeProjects = computed(() => {
    return projects.value.filter(p => p.status === 'active')
  })

  // Asignaciones activas del usuario actual (filtradas por fecha)
  const activeAssignments = computed(() => {
    if (!authStore.user?.id) return []
    
    const now = new Date().toISOString().split('T')[0]
    
    return assignments.value.filter(a => {
      if (a.user_id !== authStore.user!.id) return false
      if (!a.start_date) return false
      if (a.start_date > now) return false
      if (a.end_date && a.end_date < now) return false
      return true
    })
  })

  // Proyectos asignados al usuario actual
  const assignedProjects = computed(() => {
    const assignedProjectIds = new Set(activeAssignments.value.map(a => a.project_id))
    return activeProjects.value.filter(p => assignedProjectIds.has(p.id))
  })

  // Tareas globales y por proyecto
  const getTasksForProject = computed(() => {
    return (projectId?: string) => {
      if (projectId) {
        // Tareas del proyecto + tareas globales
        return tasks.value.filter(t => 
          (t.project_id === projectId || t.is_global) && t.is_active
        )
      }
      // Solo tareas globales si no hay proyecto
      return tasks.value.filter(t => t.is_global && t.is_active)
    }
  })

  async function loadProjects() {
    if (!authStore.profile?.empresa_rut) {
      error.value = 'No hay empresa asociada'
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('empresa_rut', authStore.profile.empresa_rut)
        .eq('status', 'active')
        .order('name', { ascending: true })

      if (projectsError) throw projectsError

      projects.value = data || []
    } catch (err: any) {
      console.error('Error loading projects:', err)
      error.value = err.message || 'Error al cargar proyectos'
    } finally {
      loading.value = false
    }
  }

  async function loadUserAssignments(userId: string) {
    try {
      loading.value = true
      error.value = null

      const { data, error: assignmentsError } = await supabase
        .from('project_assignments')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })

      if (assignmentsError) throw assignmentsError

      assignments.value = data || []
    } catch (err: any) {
      console.error('Error loading assignments:', err)
      error.value = err.message || 'Error al cargar asignaciones'
    } finally {
      loading.value = false
    }
  }

  async function loadTasks() {
    if (!authStore.profile?.empresa_rut) {
      error.value = 'No hay empresa asociada'
      return
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('empresa_rut', authStore.profile.empresa_rut)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (tasksError) throw tasksError

      tasks.value = data || []
    } catch (err: any) {
      console.error('Error loading tasks:', err)
      error.value = err.message || 'Error al cargar tareas'
    } finally {
      loading.value = false
    }
  }

  async function loadAll() {
    if (!authStore.user?.id || !authStore.profile) {
      return
    }

    await Promise.all([
      loadProjects(),
      loadUserAssignments(authStore.user.id),
      loadTasks(),
    ])
  }

  function getProjectById(projectId: string): Project | undefined {
    return projects.value.find(p => p.id === projectId)
  }

  function getTaskById(taskId: string): Task | undefined {
    return tasks.value.find(t => t.id === taskId)
  }

  function getAssignmentForProject(projectId: string): ProjectAssignment | undefined {
    if (!authStore.user?.id) return undefined
    return activeAssignments.value.find(a => 
      a.project_id === projectId && a.user_id === authStore.user!.id
    )
  }

  return {
    projects,
    assignments,
    tasks,
    loading,
    error,
    activeProjects,
    activeAssignments,
    assignedProjects,
    getTasksForProject,
    loadProjects,
    loadUserAssignments,
    loadTasks,
    loadAll,
    getProjectById,
    getTaskById,
    getAssignmentForProject,
  }
})

