import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useReportsStore = defineStore('reports', () => {
  const reportData = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getReporteHorasProyecto(params: {
    p_project_id: string
    p_year: number
    p_week: number
  }) {
    const { p_project_id, p_year, p_week } = params

    if (!p_project_id || !p_year || !p_week) {
      error.value = 'Todos los parámetros son requeridos'
      return []
    }

    try {
      loading.value = true
      error.value = null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase.rpc as any)(
        'rpc_reporte_horas_projecto',
        {
          p_project_id,
          p_year,
          p_week,
        }
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

  return {
    reportData,
    loading,
    error,
    getReporteHorasProyecto,
  }
})

