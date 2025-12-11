import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useReportsStore = defineStore('reports', () => {
  const reportData = ref<any[]>([])
  const costReportData = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getReporteHorasProyecto(params: {
    p_project_id: string
    p_start: string | null
    p_end: string | null
  }) {
    const { p_project_id, p_start, p_end } = params

    if (!p_project_id) {
      error.value = 'p_project_id es requerido'
      return []
    }

    try {
      loading.value = true
      error.value = null

      const rpcParams: any = {
        p_project_id,
        p_start, // Puede ser null, si es null no aplica filtro de fechas
        p_end, // Puede ser null, si es null no aplica filtro de fechas
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase.rpc as any)(
        'rpc_reporte_horas_projecto',
        rpcParams
      )

      if (rpcError) {
        throw rpcError
      }

      reportData.value = data || []
      return reportData.value
    } catch (err: any) {
      console.error('Error loading report:', err)
      error.value = err.message ?? 'Error al cargar reporte'
      reportData.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function getReporteCostosProyecto(params: {
    p_project_id: string
    p_start: string | null
    p_end: string | null
  }) {
    const { p_project_id, p_start, p_end } = params

    if (!p_project_id) {
      error.value = 'p_project_id es requerido'
      return []
    }

    try {
      loading.value = true
      error.value = null

      const rpcParams: any = {
        p_project_id,
        p_start, // Puede ser null, si es null no aplica filtro de fechas
        p_end, // Puede ser null, si es null no aplica filtro de fechas
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase.rpc as any)(
        'rpc_reporte_costos_projecto',
        rpcParams
      )

      if (rpcError) {
        throw rpcError
      }

      costReportData.value = data || []
      return costReportData.value
    } catch (err: any) {
      console.error('Error loading cost report:', err)
      error.value = err.message ?? 'Error al cargar reporte de costos'
      costReportData.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    reportData,
    costReportData,
    loading,
    error,
    getReporteHorasProyecto,
    getReporteCostosProyecto,
  }
})

