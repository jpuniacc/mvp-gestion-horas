import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import { DEFAULT_SETTINGS } from '@/lib/constants'
import type { OrgSetting } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const authStore = useAuthStore()
  const settings = ref<Record<string, any>>({})
  const loading = ref(false)

  const maxHoursPerDay = computed(() => {
    return settings.value.max_hours_per_day ?? DEFAULT_SETTINGS.max_hours_per_day
  })

  const maxHoursPerWeek = computed(() => {
    return settings.value.max_hours_per_week ?? DEFAULT_SETTINGS.max_hours_per_week
  })

  const workingDays = computed(() => {
    return settings.value.working_days ?? DEFAULT_SETTINGS.working_days
  })

  async function loadSettings() {
    try {
      loading.value = true

      // Get empresa_rut from profile if available
      const empresaRut = authStore.profile?.empresa_rut

      let query = supabase
        .from('org_settings')
        .select('*')

      // Filter by empresa_rut if available (multi-tenant)
      if (empresaRut) {
        query = query.eq('rut_empresa', empresaRut)
      }

      const { data, error } = await query

      if (error) throw error

      if (data && data.length > 0) {
        // Convert array of settings to object
        const settingsObj: Record<string, any> = {}
        data.forEach((setting: OrgSetting) => {
          settingsObj[setting.key] = setting.value
        })
        settings.value = settingsObj
      } else {
        // Use defaults if no settings found
        settings.value = {
          ...DEFAULT_SETTINGS,
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      // Fallback to defaults on error
      settings.value = {
        ...DEFAULT_SETTINGS,
      }
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    maxHoursPerDay,
    maxHoursPerWeek,
    workingDays,
    loadSettings,
  }
})

