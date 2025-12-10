import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types'

export const useTaskStore = defineStore('tasks', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const globalTasks = ref<Task[]>([])
  const projectTasks = ref<Task[]>([])

  async function loadTasksForProjectWeek(params: {
    projectId: string
    year: number
    week: number
  }) {
    const { projectId, year, week } = params

    if (!projectId) {
      return []
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: queryError } = await supabase
        .from('timesheet_entries')
        .select(`
          tasks!inner (
            *
          ),
          timesheet_weeks!inner (
            year,
            week_number,
            status
          )
        `)
        .eq('project_id', projectId)
        .eq('timesheet_weeks.year', year)
        .eq('timesheet_weeks.week_number', week)
        .eq('timesheet_weeks.status', 'submitted')

      if (queryError) {
        throw queryError
      }

      // Extraer las tareas únicas de los resultados
      const tasksMap = new Map<string, Task>()
      
      if (data) {
        data.forEach((entry: any) => {
          const task = Array.isArray(entry.tasks) 
            ? entry.tasks[0] 
            : entry.tasks
          
          if (task && task.id) {
            tasksMap.set(task.id, task as Task)
          }
        })
      }

      return Array.from(tasksMap.values())
    } catch (err: any) {
      console.error('Error loading tasks for project/week:', err)
      error.value = err.message ?? 'Error al cargar tareas del proyecto'
      return []
    } finally {
      loading.value = false
    }
  }

  async function loadGlobalTasks() {
    try {
      loading.value = true
      error.value = null

      const { data, error: queryError } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_global', true)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (queryError) {
        throw queryError
      }

      globalTasks.value = (data as Task[]) || []
      return globalTasks.value
    } catch (err: any) {
      console.error('Error loading global tasks:', err)
      error.value = err.message ?? 'Error al cargar tareas globales'
      return []
    } finally {
      loading.value = false
    }
  }

  async function loadProjectTasks(projectId: string) {
    if (!projectId) {
      projectTasks.value = []
      return []
    }
    console.log('Loading project tasks for project:', projectId)
    try {
      loading.value = true
      error.value = null

      const { data, error: queryError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (queryError) {
        throw queryError
      }

      projectTasks.value = (data as Task[]) || []
      return projectTasks.value
    } catch (err: any) {
      console.error('Error loading project tasks:', err)
      error.value = err.message ?? 'Error al cargar tareas del proyecto'
      return []
    } finally {
      loading.value = false
    }
  }

  async function createTask(params: {
    projectId: string
    code: string
    name: string
    isGlobal: boolean
    isActive: boolean
  }) {
    const { projectId, code, name, isGlobal, isActive } = params

    if (!projectId || !code || !name) {
      throw new Error('Faltan campos requeridos para crear la tarea')
    }

    try {
      loading.value = true
      error.value = null

      // Obtener el empresa_rut del proyecto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('empresa_rut')
        .eq('id', projectId)
        .single()

      if (projectError || !projectData) {
        throw new Error('No se pudo obtener la información del proyecto')
      }

      const empresaRut = projectData.empresa_rut

      if (!empresaRut) {
        throw new Error('El proyecto no tiene empresa_rut asociado')
      }

      // Preparar los datos para insertar
      const taskData: any = {
        code,
        name,
        empresa_rut: empresaRut,
        is_global: isGlobal,
        is_active: isActive,
      }

      // Si no es global, asociar al proyecto
      if (!isGlobal) {
        taskData.project_id = projectId
      }

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Si la tarea es del proyecto, agregarla a projectTasks
      if (!isGlobal && data) {
        projectTasks.value = [...projectTasks.value, data as Task]
      }

      return data as Task
    } catch (err: any) {
      console.error('Error creating task:', err)
      error.value = err.message ?? 'Error al crear la tarea'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(params: {
    id: string
    projectId?: string
    code: string
    name: string
    isGlobal: boolean
    isActive: boolean
  }) {
    const { id, projectId, code, name, isGlobal, isActive } = params

    if (!id || !code || !name) {
      throw new Error('Faltan campos requeridos para actualizar la tarea')
    }

    try {
      loading.value = true
      error.value = null

      const updatePayload: Partial<Task> = {
        code,
        name,
        is_global: isGlobal,
        is_active: isActive,
        project_id: isGlobal ? null : projectId ?? null,
      }

      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return data as Task
    } catch (err: any) {
      console.error('Error updating task:', err)
      error.value = err.message ?? 'Error al actualizar la tarea'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    globalTasks,
    projectTasks,
    loadTasksForProjectWeek,
    loadGlobalTasks,
    loadProjectTasks,
    createTask,
    updateTask,
  }
})

