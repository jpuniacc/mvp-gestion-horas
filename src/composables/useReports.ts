import { computed, ref } from 'vue'

export type GroupByMode = 'usuario' | 'tarea' | 'defecto'
export type GroupBy = 'dias' | 'semanas' | 'total'

interface ReportRow {
  project_id: string
  year: number
  week_number: number
  week_start_date: string
  week_end_date: string
  full_name: string
  task: string
  hours_monday: number
  hours_tuesday: number
  hours_wednesday: number
  hours_thursday: number
  hours_friday: number
  hours_saturday: number
  hours_sunday: number
  total: number
}

export function useReports() {
  const rawReportData = ref<ReportRow[]>([])
  const groupByMode = ref<GroupByMode>('defecto')
  const groupBy = ref<GroupBy>('dias')

  const setChartData = (reportData: ReportRow[]) => {
    const documentStyle = getComputedStyle(document.documentElement)
    
    // Colores para las series
    const colors = [
      documentStyle.getPropertyValue('--p-primary-500') || '#3b82f6',
      documentStyle.getPropertyValue('--p-cyan-500') || '#06b6d4',
      documentStyle.getPropertyValue('--p-orange-500') || '#f97316',
      documentStyle.getPropertyValue('--p-green-500') || '#22c55e',
      documentStyle.getPropertyValue('--p-purple-500') || '#a855f7',
      documentStyle.getPropertyValue('--p-pink-500') || '#ec4899',
      documentStyle.getPropertyValue('--p-yellow-500') || '#eab308',
      documentStyle.getPropertyValue('--p-red-500') || '#ef4444',
    ]

    // DEFECTO + DIAS: Total horas por día
    if (groupByMode.value === 'defecto' && groupBy.value === 'dias') {
      const dayTotals = [0, 0, 0, 0, 0, 0, 0]
      reportData.forEach((row) => {
        dayTotals[0] += parseFloat(String(row.hours_monday || 0))
        dayTotals[1] += parseFloat(String(row.hours_tuesday || 0))
        dayTotals[2] += parseFloat(String(row.hours_wednesday || 0))
        dayTotals[3] += parseFloat(String(row.hours_thursday || 0))
        dayTotals[4] += parseFloat(String(row.hours_friday || 0))
        dayTotals[5] += parseFloat(String(row.hours_saturday || 0))
        dayTotals[6] += parseFloat(String(row.hours_sunday || 0))
      })

      return {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [{
          type: 'bar',
          label: 'Total Horas',
          backgroundColor: colors[0],
          data: dayTotals,
        }],
      }
    }

    // DEFECTO + SEMANAS: Total horas por semana
    if (groupByMode.value === 'defecto' && groupBy.value === 'semanas') {
      const weekMap = new Map<string, number>()
      reportData.forEach((row) => {
        const weekKey = `${row.year}-S${row.week_number}`
        const total = parseFloat(String(row.total || 0))
        weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + total)
      })

      const sortedWeeks = Array.from(weekMap.entries()).sort(([keyA], [keyB]) => {
        const [yearA, weekA] = keyA.split('-S').map(Number)
        const [yearB, weekB] = keyB.split('-S').map(Number)
        if (yearA !== yearB) return yearA - yearB
        return weekA - weekB
      })

      return {
        labels: sortedWeeks.map(([key]) => key),
        datasets: [{
          type: 'bar',
          label: 'Total Horas',
          backgroundColor: colors[0],
          data: sortedWeeks.map(([, total]) => total),
        }],
      }
    }

    // DEFECTO + TOTAL: Total general
    if (groupByMode.value === 'defecto' && groupBy.value === 'total') {
      const total = reportData.reduce((sum, row) => sum + parseFloat(String(row.total || 0)), 0)
      return {
        labels: ['Total'],
        datasets: [{
          type: 'bar',
          label: 'Total Horas',
          backgroundColor: colors[0],
          data: [total],
        }],
      }
    }

    // USUARIO + DIAS: Barras agrupadas - días en X, series por usuario
    if (groupByMode.value === 'usuario' && groupBy.value === 'dias') {
      const users = new Set<string>()
      reportData.forEach((row) => {
        if (row.full_name) users.add(row.full_name)
      })
      const sortedUsers = Array.from(users).sort()

      const datasets = sortedUsers.map((user, index) => {
        const dayTotals = [0, 0, 0, 0, 0, 0, 0]
        reportData
          .filter((row) => row.full_name === user)
          .forEach((row) => {
            dayTotals[0] += parseFloat(String(row.hours_monday || 0))
            dayTotals[1] += parseFloat(String(row.hours_tuesday || 0))
            dayTotals[2] += parseFloat(String(row.hours_wednesday || 0))
            dayTotals[3] += parseFloat(String(row.hours_thursday || 0))
            dayTotals[4] += parseFloat(String(row.hours_friday || 0))
            dayTotals[5] += parseFloat(String(row.hours_saturday || 0))
            dayTotals[6] += parseFloat(String(row.hours_sunday || 0))
          })

        return {
          type: 'bar',
          label: user,
          backgroundColor: colors[index % colors.length],
          data: dayTotals,
        }
      })

      return {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets,
      }
    }

    // USUARIO + SEMANAS: Barras agrupadas - semanas en X, series por usuario
    if (groupByMode.value === 'usuario' && groupBy.value === 'semanas') {
      const users = new Set<string>()
      const weeks = new Set<string>()
      
      reportData.forEach((row) => {
        if (row.full_name) users.add(row.full_name)
        weeks.add(`${row.year}-S${row.week_number}`)
      })

      const sortedUsers = Array.from(users).sort()
      const sortedWeeks = Array.from(weeks).sort((keyA, keyB) => {
        const [yearA, weekA] = keyA.split('-S').map(Number)
        const [yearB, weekB] = keyB.split('-S').map(Number)
        if (yearA !== yearB) return yearA - yearB
        return weekA - weekB
      })

      const datasets = sortedUsers.map((user, index) => {
        const weekTotals = sortedWeeks.map((weekKey) => {
          const [year, week] = weekKey.split('-S').map(Number)
          return reportData
            .filter((row) => 
              row.full_name === user && 
              row.year === year && 
              row.week_number === week
            )
            .reduce((sum, row) => sum + parseFloat(String(row.total || 0)), 0)
        })

        return {
          type: 'bar',
          label: user,
          backgroundColor: colors[index % colors.length],
          data: weekTotals,
        }
      })

      return {
        labels: sortedWeeks,
        datasets,
      }
    }

    // USUARIO + TOTAL: Total por usuario
    if (groupByMode.value === 'usuario' && groupBy.value === 'total') {
      const userMap = new Map<string, number>()
      reportData.forEach((row) => {
        const user = row.full_name || 'Sin usuario'
        const total = parseFloat(String(row.total || 0))
        userMap.set(user, (userMap.get(user) || 0) + total)
      })

      const sortedUsers = Array.from(userMap.entries()).sort(([userA], [userB]) => 
        userA.localeCompare(userB)
      )

      return {
        labels: sortedUsers.map(([user]) => user),
        datasets: [{
          type: 'bar',
          label: 'Total Horas',
          backgroundColor: colors[0],
          data: sortedUsers.map(([, total]) => total),
        }],
      }
    }

    // TAREA + DIAS: Barras apiladas - días en X, series por tarea
    if (groupByMode.value === 'tarea' && groupBy.value === 'dias') {
      const tasks = new Set<string>()
      reportData.forEach((row) => {
        if (row.task) tasks.add(row.task)
      })

      // Calcular totales por tarea para ordenar por mayor aporte
      const taskTotals = new Map<string, number>()
      Array.from(tasks).forEach((task) => {
        const total = reportData
          .filter((row) => row.task === task)
          .reduce((sum, row) => {
            return sum + 
              parseFloat(String(row.hours_monday || 0)) +
              parseFloat(String(row.hours_tuesday || 0)) +
              parseFloat(String(row.hours_wednesday || 0)) +
              parseFloat(String(row.hours_thursday || 0)) +
              parseFloat(String(row.hours_friday || 0)) +
              parseFloat(String(row.hours_saturday || 0)) +
              parseFloat(String(row.hours_sunday || 0))
          }, 0)
        taskTotals.set(task, total)
      })

      // Ordenar tareas por total (de mayor a menor)
      const sortedTasks = Array.from(tasks).sort((taskA, taskB) => {
        const totalA = taskTotals.get(taskA) || 0
        const totalB = taskTotals.get(taskB) || 0
        return totalB - totalA // Orden descendente
      })

      const datasets = sortedTasks.map((task, index) => {
        const dayTotals = [0, 0, 0, 0, 0, 0, 0]
        reportData
          .filter((row) => row.task === task)
          .forEach((row) => {
            dayTotals[0] += parseFloat(String(row.hours_monday || 0))
            dayTotals[1] += parseFloat(String(row.hours_tuesday || 0))
            dayTotals[2] += parseFloat(String(row.hours_wednesday || 0))
            dayTotals[3] += parseFloat(String(row.hours_thursday || 0))
            dayTotals[4] += parseFloat(String(row.hours_friday || 0))
            dayTotals[5] += parseFloat(String(row.hours_saturday || 0))
            dayTotals[6] += parseFloat(String(row.hours_sunday || 0))
          })

        return {
          type: 'bar',
          label: task,
          backgroundColor: colors[index % colors.length],
          data: dayTotals,
        }
      })

      return {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets,
      }
    }

    // TAREA + SEMANAS: Barras apiladas - semanas en X, series por tarea
    if (groupByMode.value === 'tarea' && groupBy.value === 'semanas') {
      const tasks = new Set<string>()
      const weeks = new Set<string>()
      
      reportData.forEach((row) => {
        if (row.task) tasks.add(row.task)
        weeks.add(`${row.year}-S${row.week_number}`)
      })

      const sortedWeeks = Array.from(weeks).sort((keyA, keyB) => {
        const [yearA, weekA] = keyA.split('-S').map(Number)
        const [yearB, weekB] = keyB.split('-S').map(Number)
        if (yearA !== yearB) return yearA - yearB
        return weekA - weekB
      })

      // Calcular totales por tarea para ordenar por mayor aporte
      const taskTotals = new Map<string, number>()
      Array.from(tasks).forEach((task) => {
        const total = reportData
          .filter((row) => row.task === task)
          .reduce((sum, row) => sum + parseFloat(String(row.total || 0)), 0)
        taskTotals.set(task, total)
      })

      // Ordenar tareas por total (de mayor a menor)
      const sortedTasks = Array.from(tasks).sort((taskA, taskB) => {
        const totalA = taskTotals.get(taskA) || 0
        const totalB = taskTotals.get(taskB) || 0
        return totalB - totalA // Orden descendente
      })

      const datasets = sortedTasks.map((task, index) => {
        const weekTotals = sortedWeeks.map((weekKey) => {
          const [year, week] = weekKey.split('-S').map(Number)
          return reportData
            .filter((row) => 
              row.task === task && 
              row.year === year && 
              row.week_number === week
            )
            .reduce((sum, row) => sum + parseFloat(String(row.total || 0)), 0)
        })

        return {
          type: 'bar',
          label: task,
          backgroundColor: colors[index % colors.length],
          data: weekTotals,
        }
      })

      return {
        labels: sortedWeeks,
        datasets,
      }
    }

    // TAREA + TOTAL: Total por tarea
    if (groupByMode.value === 'tarea' && groupBy.value === 'total') {
      const taskMap = new Map<string, number>()
      reportData.forEach((row) => {
        const task = row.task || 'Sin tarea'
        const total = parseFloat(String(row.total || 0))
        taskMap.set(task, (taskMap.get(task) || 0) + total)
      })

      const sortedTasks = Array.from(taskMap.entries()).sort(([taskA], [taskB]) => 
        taskA.localeCompare(taskB)
      )

      return {
        labels: sortedTasks.map(([task]) => task),
        datasets: [{
          type: 'bar',
          label: 'Total Horas',
          backgroundColor: colors[0],
          data: sortedTasks.map(([, total]) => total),
        }],
      }
    }

    // Fallback
    return {
      labels: [],
      datasets: [],
    }
  }

  const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue('--p-text-color')
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color')
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color')

    // Usar stacked para tarea + dias y tarea + semanas (muchas tareas, mejor apiladas)
    // Las demás combinaciones usan barras agrupadas
    const useStacked = groupByMode.value === 'tarea' && (groupBy.value === 'dias' || groupBy.value === 'semanas')

    return {
      indexAxis: 'y' as const, // Hacer los gráficos horizontales
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          stacked: useStacked,
          beginAtZero: true, // En gráficos horizontales, beginAtZero va en X
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          stacked: useStacked,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    }
  }

  const getTableData = (chartData: any) => {
    if (!chartData || !chartData.labels || !chartData.datasets) return []

    const labels = chartData.labels
    const datasets = chartData.datasets

    // Si hay múltiples datasets (series agrupadas: usuarios o tareas)
    // Transponer: cada dataset es una fila, cada label es una columna
    if (datasets.length > 1) {
      const result: any[] = []
      datasets.forEach((dataset: any) => {
        const row: any = { label: dataset.label }
        // Cada label (día/semana) se convierte en una columna
        labels.forEach((label: string, index: number) => {
          row[label] = dataset.data[index] || 0
        })
        // Calcular total por fila (suma de todas las columnas)
        row.total = labels.reduce((sum: number, _label: string, index: number) => 
          sum + (dataset.data[index] || 0), 0
        )
        result.push(row)
      })
      return result
    }

    // Un solo dataset (modo defecto)
    // Transponer: una sola fila con los valores, labels como columnas
    const totalData = datasets[0]?.data || []
    const row: any = { label: datasets[0]?.label || 'Total' }
    labels.forEach((label: string, index: number) => {
      row[label] = totalData[index] || 0
    })
    row.total = totalData.reduce((sum: number, value: number) => sum + (value || 0), 0)
    return [row]
  }

  const getChartType = (): 'bar' | 'line' => {
    // Todos los gráficos son barras ahora
    return 'bar'
  }

  return {
    rawReportData,
    groupByMode,
    groupBy,
    setChartData,
    setChartOptions,
    getTableData,
    getChartType,
  }
}

