import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import type { Project, ProjectAssignment, Task, TimesheetEntry } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const authStore = useAuthStore()
  const projects = ref<Project[]>([])
  const assignments = ref<ProjectAssignment[]>([])
  const tasks = ref<Task[]>([])
  const assignableUsers = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Proyectos activos
  const activeProjects = computed(() => {
    return projects.value.filter((p: Project) => p.status === 'active')
  })

  // Asignaciones activas del usuario actual (filtradas por fecha)
  const activeAssignments = computed(() => {
    if (!authStore.user?.id) return []
    
    const now = new Date().toISOString().split('T')[0]
    
    return assignments.value.filter((a: ProjectAssignment) => {
      if (a.user_id !== authStore.user!.id) return false
      if (!a.start_date) return false
      if (a.start_date > now) return false
      if (a.end_date && a.end_date < now) return false
      return true
    })
  })

  // Proyectos asignados al usuario actual
  const assignedProjects = computed(() => {
    const assignedProjectIds = new Set(activeAssignments.value.map((a: ProjectAssignment) => a.project_id))
    return activeProjects.value.filter((p: Project) => assignedProjectIds.has(p.id))
  })

  // Tareas globales y por proyecto
  const getTasksForProject = computed(() => {
    return (projectId?: string) => {
      if (projectId) {
        // Tareas del proyecto + tareas globales
        return tasks.value.filter((t: Task) => 
          (t.project_id === projectId || t.is_global) && t.is_active
        )
      }
      // Solo tareas globales si no hay proyecto
      return tasks.value.filter((t: Task) => t.is_global && t.is_active)
    }
  })

  async function loadProjects() {
    /*if (!authStore.profile?.empresa_rut) {
      error.value = 'No hay empresa asociada'
      return
    }*/

    try {
      loading.value = true
      error.value = null

      const { data, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        //.eq('empresa_rut', authStore.profile.empresa_rut)
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
    return projects.value.find((p: Project) => p.id === projectId)
  }

  function getTaskById(taskId: string): Task | undefined {
    return tasks.value.find((t: Task) => t.id === taskId)
  }

  function getAssignmentForProject(projectId: string): ProjectAssignment | undefined {
    if (!authStore.user?.id) return undefined
    return activeAssignments.value.find((a: ProjectAssignment) => 
      a.project_id === projectId && a.user_id === authStore.user!.id
    )
  }

  async function loadTimesheetEntriesForWeek(params: {
    userId: string
    projectId: string
    year: number
    week: number
  }) {
    const { userId, projectId, year, week } = params

    if (!userId || !projectId) {
      return []
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: entriesError } = await supabase
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
        .eq('project_id', projectId)
        .eq('timesheet_weeks.user_id', userId)
        .eq('timesheet_weeks.year', year)
        .eq('timesheet_weeks.week_number', week)
        .eq('timesheet_weeks.status', 'submitted')

      if (entriesError) {
        throw entriesError
      }

      return data as (TimesheetEntry & {
        tasks: Pick<Task, 'id' | 'name' | 'code'>
        timesheet_weeks: {
          id: string
          year: number
          week_number: number
          status: string
          user_id: string
        }
      })[]
    } catch (err: any) {
      console.error('Error loading timesheet entries:', err)
      error.value = err.message ?? 'Error al cargar tiempos del usuario'
      return []
    } finally {
      loading.value = false
    }
  }

  async function loadAssignableUsers(projectId: string) {
    if (!projectId) {
      assignableUsers.value = []
      return []
    }

    try {
      loading.value = true
      error.value = null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase.rpc as any)(
        'usuarios_asignables_projecto',
        { p_project_id: projectId }
      )

      if (rpcError) {
        throw rpcError
      }

      assignableUsers.value = data || []
      return assignableUsers.value
    } catch (err: any) {
      console.error('Error loading assignable users:', err)
      error.value = err.message ?? 'Error al cargar usuarios asignables'
      assignableUsers.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function createProjectAssignment(params: {
    userId: string
    projectId: string
    role?: string
    costRate?: number | null
    billingRate?: number | null
    isBillable?: boolean
    startDate?: Date | null
    endDate?: Date | null
  }) {
    const { userId, projectId, role, costRate, billingRate, isBillable, startDate, endDate } = params

    if (!userId || !projectId) {
      throw new Error('user_id y project_id son requeridos')
    }

    try {
      loading.value = true
      error.value = null

      // Convertir fechas a formato ISO string (YYYY-MM-DD)
      // start_date es requerido, usar fecha actual si no se proporciona
      const startDateISO = startDate 
        ? startDate.toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0]
      const endDateISO = endDate ? endDate.toISOString().split('T')[0] : null

      const { data, error: insertError } = await supabase
        .from('project_assignments')
        .insert({
          user_id: userId,
          project_id: projectId,
          role_name: role || '',
          cost_rate: costRate ?? null,
          billing_rate: billingRate ?? null,
          is_billable: isBillable ?? null,
          start_date: startDateISO,
          end_date: endDateISO,
          created_by: authStore.user?.id || null,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return data as ProjectAssignment
    } catch (err: any) {
      console.error('Error creating project assignment:', err)
      error.value = err.message ?? 'Error al crear asignación de proyecto'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProjectAssignment(
    assignmentId: string,
    params: {
      role?: string
      costRate?: number | null
      billingRate?: number | null
      isBillable?: boolean
      startDate?: Date | null
      endDate?: Date | null
    }
  ) {
    const { role, costRate, billingRate, isBillable, startDate, endDate } = params

    try {
      loading.value = true
      error.value = null

      // Convertir fechas a formato ISO string (YYYY-MM-DD)
      const startDateISO = startDate ? startDate.toISOString().split('T')[0] : undefined
      const endDateISO = endDate ? endDate.toISOString().split('T')[0] : undefined

      const updateData: any = {}
      if (role !== undefined) updateData.role_name = role || ''
      if (costRate !== undefined) updateData.cost_rate = costRate ?? null
      if (billingRate !== undefined) updateData.billing_rate = billingRate ?? null
      if (isBillable !== undefined) updateData.is_billable = isBillable ?? null
      if (startDateISO !== undefined) updateData.start_date = startDateISO
      if (endDateISO !== undefined) updateData.end_date = endDateISO

      const { data, error: updateError } = await supabase
        .from('project_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return data as ProjectAssignment
    } catch (err: any) {
      console.error('Error updating project assignment:', err)
      error.value = err.message ?? 'Error al actualizar asignación de proyecto'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProject(params: {
    empresa_rut: string
    name: string
    code: string
    year: number
    client_name?: string | null
    description?: string | null
    status?: string | null
    is_billable_default?: boolean | null
  }) {
    const { empresa_rut, name, code, year, client_name, description, status, is_billable_default } = params

    if (!empresa_rut || !name || !code || !year) {
      throw new Error('empresa_rut, name, code y year son requeridos')
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          empresa_rut,
          name,
          code,
          year,
          client_name: client_name || null,
          description: description || null,
          status: status || 'active',
          is_billable_default: is_billable_default ?? null,
          created_by: authStore.user?.id || null,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Agregar el nuevo proyecto a la lista
      projects.value.push(data as Project)
      
      return data as Project
    } catch (err: any) {
      console.error('Error creating project:', err)
      error.value = err.message ?? 'Error al crear proyecto'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    assignments,
    tasks,
    assignableUsers,
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
    loadTimesheetEntriesForWeek,
    loadAssignableUsers,
    createProjectAssignment,
    updateProjectAssignment,
    createProject,
  }
})

