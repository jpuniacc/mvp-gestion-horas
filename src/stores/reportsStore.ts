import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useReportsStore = defineStore('reports', () => {
  const reportData = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getReporteHorasProyecto(params: {
    p_project_id: string
    p_start: string
    p_end: string | null
  }) {
    const { p_project_id, p_start, p_end } = params

    if (!p_project_id || !p_start) {
      error.value = 'p_project_id y p_start son requeridos'
      return []
    }

    try {
      loading.value = true
      error.value = null

      const rpcParams: any = {
        p_project_id,
        p_start,
        p_end, // Siempre enviar p_end, puede ser null
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

  return {
    reportData,
    loading,
    error,
    getReporteHorasProyecto,
  }
})

