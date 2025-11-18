import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'

export function useValidation() {
  const settingsStore = useSettingsStore()

  const maxHoursPerDay = computed(() => settingsStore.maxHoursPerDay)
  const maxHoursPerWeek = computed(() => settingsStore.maxHoursPerWeek)

  function validateDailyHours(hours: number): boolean {
    return hours >= 0 && hours <= maxHoursPerDay.value
  }

  function validateWeeklyHours(total: number): boolean {
    return total >= 0 && total <= maxHoursPerWeek.value
  }

  function validateHoursFormat(value: string | number): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return false
    // Allow max 2 decimal places
    const decimalPlaces = (num.toString().split('.')[1] || '').length
    return decimalPlaces <= 2 && num >= 0
  }

  function formatHours(value: string | number): number {
    const num = typeof value === 'string' ? parseFloat(value) || 0 : value
    return Math.round(num * 100) / 100 // Round to 2 decimal places
  }

  return {
    maxHoursPerDay,
    maxHoursPerWeek,
    validateDailyHours,
    validateWeeklyHours,
    validateHoursFormat,
    formatHours,
  }
}

