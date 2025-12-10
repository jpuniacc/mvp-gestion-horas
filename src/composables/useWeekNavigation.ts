import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWeek, startOfWeek, addWeeks, format } from 'date-fns'

interface WeekNavigationOptions {
  syncWithRouter?: boolean
}

export function useWeekNavigation(options: WeekNavigationOptions = {}) {
  const { syncWithRouter = true } = options
  const route = useRoute()
  const router = useRouter()

  const routeYear = computed(() => {
    const yearParam = route.params.year as string
    if (yearParam) {
      return parseInt(yearParam)
    }
    return new Date().getFullYear()
  })

  const routeWeek = computed(() => {
    const weekParam = route.params.week as string
    if (weekParam) {
      return parseInt(weekParam)
    }
    const now = new Date()
    return getWeek(now, { weekStartsOn: 1 })
  })

  const localYear = ref(routeYear.value)
  const localWeek = ref(routeWeek.value)

  const currentYear = computed(() => syncWithRouter ? routeYear.value : localYear.value)

  const currentWeek = computed(() => syncWithRouter ? routeWeek.value : localWeek.value)

  const currentWeekStart = computed(() => {
    const year = currentYear.value
    const week = currentWeek.value
    // Calculate first day of week (Monday) for the given year and week
    const jan4 = new Date(year, 0, 4)
    const jan4Day = jan4.getDay() || 7
    const firstMonday = new Date(jan4)
    firstMonday.setDate(jan4.getDate() - jan4Day + 1)
    const weekStart = startOfWeek(addWeeks(firstMonday, week - 1), { weekStartsOn: 1 })
    return weekStart
  })

  const currentWeekEnd = computed(() => {
    const start = currentWeekStart.value
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
  })

  const weekRangeLabel = computed(() => {
    const start = currentWeekStart.value
    const end = currentWeekEnd.value
    return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`
  })

  function navigateToWeek(year: number, week: number) {
    if (syncWithRouter) {
      router.push(`/timesheet/week/${year}/${week}`)
      return
    }
    localYear.value = year
    localWeek.value = week
  }

  function nextWeek() {
    let newYear = currentYear.value
    let newWeek = currentWeek.value + 1

    if (newWeek > 53) {
      newWeek = 1
      newYear++
    }

    navigateToWeek(newYear, newWeek)
  }

  function previousWeek() {
    let newYear = currentYear.value
    let newWeek = currentWeek.value - 1

    if (newWeek < 1) {
      newWeek = 53
      newYear--
    }

    navigateToWeek(newYear, newWeek)
  }

  function goToWeek(year: number, week: number) {
    navigateToWeek(year, week)
  }

  function goToCurrentWeek() {
    const now = new Date()
    const year = now.getFullYear()
    const week = getWeek(now, { weekStartsOn: 1 })
    navigateToWeek(year, week)
  }

  return {
    currentYear,
    currentWeek,
    currentWeekStart,
    currentWeekEnd,
    weekRangeLabel,
    nextWeek,
    previousWeek,
    goToWeek,
    goToCurrentWeek,
  }
}

export type UseWeekNavigationReturn = ReturnType<typeof useWeekNavigation>

