import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import type { TimesheetWeek, TimesheetEntry } from '@/types'

export const useTimesheetStore = defineStore('timesheet', () => {
  const authStore = useAuthStore()
  const currentWeek = ref<TimesheetWeek | null>(null)
  const entries = ref<TimesheetEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const entries2Approved = ref<TimesheetWeek[]>([]);

  const totalHours = computed(() => {
    return entries.value.reduce((sum, e) => {
      const total = e.total_hours
      return sum + (typeof total === 'number' ? total : 0)
    }, 0)
  })

  async function loadEntries2Approved(projectId: string){
    try{
      loading.value = true
      error.value = null

      const { data, error: entriesError } = await supabase
        .from('timesheet_weeks')
        .select(`year, 
                 week_number, 
                 timesheet_entries!inner(
                   hours_monday,
                   hours_tuesday,
                   hours_wednesday,
                   hours_thursday,
                   hours_friday,
                   hours_saturday,
                   hours_sunday,
                   total_hours,
                   tasks!inner(
                    name,
                    code
                   ),
                   
                )`)
        .eq('timesheet_entries.project_id', projectId)
        .order('created_at', { ascending: true })

      if (entriesError) throw entriesError
      entries2Approved.value = data || []
      
    }catch(err: any){
      console.error('Error loading entries2Aproved:', err)
      error.value = err.message || 'Error al cargar entradas2Aproved'
    }finally{
      loading.value = false
    }
  }

  async function loadWeek(year: number, week: number) {
    if (!authStore.user?.id) {
      error.value = 'Usuario no autenticado'
      return
    }

    try {
      loading.value = true
      error.value = null

      // Try to find existing week
      const { data: weekData, error: weekError } = await supabase
        .from('timesheet_weeks')
        .select('*')
        .eq('user_id', authStore.user.id)
        .eq('year', year)
        .eq('week_number', week)
        .single()

      if (weekError && weekError.code !== 'PGRST116') {
        throw weekError
      }

      if (weekData) {
        currentWeek.value = weekData
        // Load entries for this week
        await loadEntries(weekData.id)
      } else {
        // Create new week
        await createWeek(year, week)
      }
    } catch (err: any) {
      console.error('Error loading week:', err)
      error.value = err.message || 'Error al cargar semana'
    } finally {
      loading.value = false
    }
  }

  async function createWeek(year: number, week: number) {
    if (!authStore.user?.id) {
      throw new Error('Usuario no autenticado')
    }

    // Calculate week start and end dates (Monday to Sunday)
    const jan4 = new Date(year, 0, 4)
    const jan4Day = jan4.getDay() || 7
    const firstMonday = new Date(jan4)
    firstMonday.setDate(jan4.getDate() - jan4Day + 1)
    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + (week - 1) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const { data, error: createError } = await supabase
      .from('timesheet_weeks')
      .insert({
        user_id: authStore.user.id,
        year,
        week_number: week,
        week_start_date: weekStart.toISOString().split('T')[0],
        week_end_date: weekEnd.toISOString().split('T')[0],
        status: 'draft',
        is_locked: false,
        total_hours: 0,
      })
      .select()
      .single()

    if (createError) throw createError

    currentWeek.value = data
    entries.value = []
  }

  async function loadEntries(weekId: string) {
    try {
      const { data, error: entriesError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('timesheet_week_id', weekId)
        .order('created_at', { ascending: true })

      if (entriesError) throw entriesError

      entries.value = data || []
    } catch (err: any) {
      console.error('Error loading entries:', err)
      error.value = err.message || 'Error al cargar entradas'
    }
  }

  async function saveEntry(entry: Partial<TimesheetEntry>) {
    if (!currentWeek.value) {
      throw new Error('No hay semana actual')
    }

    try {
      loading.value = true
      error.value = null

      // Calculate total hours - handle nullable values
      const totalHours = [
        entry.hours_monday ?? 0,
        entry.hours_tuesday ?? 0,
        entry.hours_wednesday ?? 0,
        entry.hours_thursday ?? 0,
        entry.hours_friday ?? 0,
        entry.hours_saturday ?? 0,
        entry.hours_sunday ?? 0,
      ].reduce((sum, h) => sum + (typeof h === 'number' ? h : 0), 0)

      const entryData = {
        ...entry,
        timesheet_week_id: currentWeek.value.id,
        total_hours: totalHours,
        // Ensure all hour fields are numbers (not null)
        hours_monday: entry.hours_monday ?? 0,
        hours_tuesday: entry.hours_tuesday ?? 0,
        hours_wednesday: entry.hours_wednesday ?? 0,
        hours_thursday: entry.hours_thursday ?? 0,
        hours_friday: entry.hours_friday ?? 0,
        hours_saturday: entry.hours_saturday ?? 0,
        hours_sunday: entry.hours_sunday ?? 0,
      }

      if (entry.id) {
        // Update existing entry
        const { data, error: updateError } = await supabase
          .from('timesheet_entries')
          .update(entryData)
          .eq('id', entry.id)
          .select()
          .single()

        if (updateError) throw updateError

        const index = entries.value.findIndex((e) => e.id === entry.id)
        if (index !== -1) {
          entries.value[index] = data
        }
      } else {
        // Create new entry
        const { data, error: insertError } = await supabase
          .from('timesheet_entries')
          .insert(entryData)
          .select()
          .single()

        if (insertError) throw insertError

        entries.value.push(data)
      }

      // Update week total hours
      await updateWeekTotalHours()
    } catch (err: any) {
      console.error('Error saving entry:', err)
      error.value = err.message || 'Error al guardar entrada'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateWeekTotalHours() {
    if (!currentWeek.value) return

    const total = entries.value.reduce((sum, e) => {
      const total = e.total_hours
      return sum + (typeof total === 'number' ? total : 0)
    }, 0)

    const { error: updateError } = await supabase
      .from('timesheet_weeks')
      .update({ total_hours: total })
      .eq('id', currentWeek.value.id)

    if (updateError) {
      console.error('Error updating week total hours:', updateError)
    } else {
      if (currentWeek.value) {
        currentWeek.value.total_hours = total
      }
    }
  }

  async function submitWeek() {
    if (!currentWeek.value || currentWeek.value.status !== 'draft') {
      throw new Error('La semana no está en estado borrador')
    }

    if (!authStore.user?.id) {
      throw new Error('Usuario no autenticado')
    }

    try {
      loading.value = true
      error.value = null

      const { data, error: submitError } = await supabase
        .from('timesheet_weeks')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          submitted_by: authStore.user.id,
        })
        .eq('id', currentWeek.value.id)
        .select()
        .single()

      if (submitError) throw submitError

      currentWeek.value = data
    } catch (err: any) {
      console.error('Error submitting week:', err)
      error.value = err.message || 'Error al enviar semana'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEntry(entryId: string) {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('timesheet_entries')
        .delete()
        .eq('id', entryId)

      if (deleteError) throw deleteError

      entries.value = entries.value.filter((e) => e.id !== entryId)
      await updateWeekTotalHours()
    } catch (err: any) {
      console.error('Error deleting entry:', err)
      error.value = err.message || 'Error al eliminar entrada'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function copyPreviousWeek() {
    if (!currentWeek.value || !authStore.user?.id) {
      throw new Error('No hay semana actual')
    }

    try {
      loading.value = true
      error.value = null

      // Get previous week
      let prevYear = currentWeek.value.year
      let prevWeek = currentWeek.value.week_number - 1

      if (prevWeek < 1) {
        prevWeek = 53
        prevYear--
      }

      const { data: prevWeekData, error: prevWeekError } = await supabase
        .from('timesheet_weeks')
        .select('*')
        .eq('user_id', authStore.user.id)
        .eq('year', prevYear)
        .eq('week_number', prevWeek)
        .single()

      if (prevWeekError || !prevWeekData) {
        throw new Error('No se encontró la semana anterior')
      }

      // Load previous week entries
      const { data: prevEntries, error: entriesError } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('timesheet_week_id', prevWeekData.id)

      if (entriesError) throw entriesError

      if (prevEntries && prevEntries.length > 0) {
        // Copy entries to current week - ensure nullable fields are handled
        const newEntries = prevEntries.map((entry) => ({
          timesheet_week_id: currentWeek.value!.id,
          project_id: entry.project_id ?? null,
          task_id: entry.task_id ?? null,
          assignment_id: entry.assignment_id ?? null,
          notes: entry.notes ?? null,
          is_billable: entry.is_billable ?? false,
          hours_monday: entry.hours_monday ?? 0,
          hours_tuesday: entry.hours_tuesday ?? 0,
          hours_wednesday: entry.hours_wednesday ?? 0,
          hours_thursday: entry.hours_thursday ?? 0,
          hours_friday: entry.hours_friday ?? 0,
          hours_saturday: entry.hours_saturday ?? 0,
          hours_sunday: entry.hours_sunday ?? 0,
          total_hours: typeof entry.total_hours === 'number' ? entry.total_hours : 0,
        }))

        const { data: insertedEntries, error: insertError } = await supabase
          .from('timesheet_entries')
          .insert(newEntries)
          .select()

        if (insertError) throw insertError

        entries.value = [...entries.value, ...(insertedEntries || [])]
        await updateWeekTotalHours()
      }
    } catch (err: any) {
      console.error('Error copying previous week:', err)
      error.value = err.message || 'Error al copiar semana anterior'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    currentWeek,
    entries,
    entries2Approved,
    loading,
    error,
    totalHours,
    loadWeek,
    loadEntries2Approved,
    saveEntry,
    submitWeek,
    deleteEntry,
    copyPreviousWeek,
  }
})

