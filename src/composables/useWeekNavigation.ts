import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWeek, startOfWeek, addWeeks, format } from 'date-fns'

export function useWeekNavigation() {
  const route = useRoute()
  const router = useRouter()

  const currentYear = computed(() => {
    const yearParam = route.params.year as string
    if (yearParam) {
      return parseInt(yearParam)
    }
    return new Date().getFullYear()
  })

  const currentWeek = computed(() => {
    const weekParam = route.params.week as string
    if (weekParam) {
      return parseInt(weekParam)
    }
    const now = new Date()
    return getWeek(now, { weekStartsOn: 1 })
  })

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

  function nextWeek() {
    let newYear = currentYear.value
    let newWeek = currentWeek.value + 1

    if (newWeek > 53) {
      newWeek = 1
      newYear++
    }

    router.push(`/timesheet/week/${newYear}/${newWeek}`)
  }

  function previousWeek() {
    let newYear = currentYear.value
    let newWeek = currentWeek.value - 1

    if (newWeek < 1) {
      newWeek = 53
      newYear--
    }

    router.push(`/timesheet/week/${newYear}/${newWeek}`)
  }

  function goToWeek(year: number, week: number) {
    router.push(`/timesheet/week/${year}/${week}`)
  }

  function goToCurrentWeek() {
    const now = new Date()
    const year = now.getFullYear()
    const week = getWeek(now, { weekStartsOn: 1 })
    goToWeek(year, week)
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

