import { ref } from 'vue'

export type GroupByMode = 'usuario' | 'tarea' | 'defecto'
export type GroupBy = 'dias' | 'semanas' | 'total'

interface CostReportRow {
  project_id: string
  year: number
  week_number: number
  week_start_date: string
  week_end_date: string
  hours: number
  hours_monday: number
  hours_tuesday: number
  hours_wednesday: number
  hours_thursday: number
  hours_friday: number
  hours_saturday: number
  hours_sunday: number
  cost_rate: number
  billing_rate: number
  full_name: string
  task: string
}

export function useReportsCost() {
  const rawReportData = ref<CostReportRow[]>([])
  const groupByMode = ref<GroupByMode>('defecto')
  const groupBy = ref<GroupBy>('dias')

  // Calcular costo total: cost_rate + (billing_rate * hours)
  const calculateCost = (row: CostReportRow): number => {
    const costRate = parseFloat(String(row.cost_rate || 0))
    const billingRate = parseFloat(String(row.billing_rate || 0))
    const hours = parseFloat(String(row.hours || 0))
    return costRate + (billingRate * hours)
  }

  // Calcular costo por día específico: (cost_rate / 7) + (billing_rate * hours_day)
  // Distribuimos cost_rate entre los 7 días y sumamos el billing_rate por las horas del día
  const calculateCostByDay = (row: CostReportRow, dayHours: number): number => {
    const costRate = parseFloat(String(row.cost_rate || 0))
    const billingRate = parseFloat(String(row.billing_rate || 0))
    const hours = parseFloat(String(dayHours || 0))
    return (costRate / 7) + (billingRate * hours)
  }

  const setChartData = (reportData: CostReportRow[]) => {
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

    // DEFECTO + DIAS: Total costos por día
    if (groupByMode.value === 'defecto' && groupBy.value === 'dias') {
      const dayTotals = [0, 0, 0, 0, 0, 0, 0]
      reportData.forEach((row) => {
        dayTotals[0] += calculateCostByDay(row, row.hours_monday || 0)
        dayTotals[1] += calculateCostByDay(row, row.hours_tuesday || 0)
        dayTotals[2] += calculateCostByDay(row, row.hours_wednesday || 0)
        dayTotals[3] += calculateCostByDay(row, row.hours_thursday || 0)
        dayTotals[4] += calculateCostByDay(row, row.hours_friday || 0)
        dayTotals[5] += calculateCostByDay(row, row.hours_saturday || 0)
        dayTotals[6] += calculateCostByDay(row, row.hours_sunday || 0)
      })

      return {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [{
          type: 'bar',
          label: 'Total Costos',
          backgroundColor: colors[0],
          data: dayTotals,
        }],
      }
    }

    // DEFECTO + SEMANAS: Total costos por semana
    if (groupByMode.value === 'defecto' && groupBy.value === 'semanas') {
      const weekMap = new Map<string, number>()
      reportData.forEach((row) => {
        const weekKey = `${row.year}-S${row.week_number}`
        const cost = calculateCost(row)
        weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + cost)
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
          label: 'Total Costos',
          backgroundColor: colors[0],
          data: sortedWeeks.map(([, total]) => total),
        }],
      }
    }

    // DEFECTO + TOTAL: Total general
    if (groupByMode.value === 'defecto' && groupBy.value === 'total') {
      const total = reportData.reduce((sum, row) => sum + calculateCost(row), 0)
      return {
        labels: ['Total'],
        datasets: [{
          type: 'bar',
          label: 'Total Costos',
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
        const userRows = reportData.filter((row) => row.full_name === user)
        userRows.forEach((row) => {
          dayTotals[0] += calculateCostByDay(row, row.hours_monday || 0)
          dayTotals[1] += calculateCostByDay(row, row.hours_tuesday || 0)
          dayTotals[2] += calculateCostByDay(row, row.hours_wednesday || 0)
          dayTotals[3] += calculateCostByDay(row, row.hours_thursday || 0)
          dayTotals[4] += calculateCostByDay(row, row.hours_friday || 0)
          dayTotals[5] += calculateCostByDay(row, row.hours_saturday || 0)
          dayTotals[6] += calculateCostByDay(row, row.hours_sunday || 0)
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
            .reduce((sum, row) => sum + calculateCost(row), 0)
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
        const cost = calculateCost(row)
        userMap.set(user, (userMap.get(user) || 0) + cost)
      })

      const sortedUsers = Array.from(userMap.entries()).sort(([userA], [userB]) => 
        userA.localeCompare(userB)
      )

      return {
        labels: sortedUsers.map(([user]) => user),
        datasets: [{
          type: 'bar',
          label: 'Total Costos',
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
          .reduce((sum, row) => sum + calculateCost(row), 0)
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
        const taskRows = reportData.filter((row) => row.task === task)
        taskRows.forEach((row) => {
          dayTotals[0] += calculateCostByDay(row, row.hours_monday || 0)
          dayTotals[1] += calculateCostByDay(row, row.hours_tuesday || 0)
          dayTotals[2] += calculateCostByDay(row, row.hours_wednesday || 0)
          dayTotals[3] += calculateCostByDay(row, row.hours_thursday || 0)
          dayTotals[4] += calculateCostByDay(row, row.hours_friday || 0)
          dayTotals[5] += calculateCostByDay(row, row.hours_saturday || 0)
          dayTotals[6] += calculateCostByDay(row, row.hours_sunday || 0)
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
          .reduce((sum, row) => sum + calculateCost(row), 0)
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
            .reduce((sum, row) => sum + calculateCost(row), 0)
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
        const cost = calculateCost(row)
        taskMap.set(task, (taskMap.get(task) || 0) + cost)
      })

      const sortedTasks = Array.from(taskMap.entries()).sort(([taskA], [taskB]) => 
        taskA.localeCompare(taskB)
      )

      return {
        labels: sortedTasks.map(([task]) => task),
        datasets: [{
          type: 'bar',
          label: 'Total Costos',
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
        datalabels: {
          display: true,
          formatter: (_value: number, context: any) => {
            // Calcular el total de la barra (suma de todos los datasets en esa posición)
            const dataIndex = context.dataIndex
            const chart = context.chart
            const datasets = chart.data.datasets
            
            // Calcular el total sumando todos los valores de todos los datasets en esta posición
            const total = datasets.reduce((sum: number, dataset: any) => {
              return sum + (dataset.data[dataIndex] || 0)
            }, 0)
            
            // Mostrar solo el total, no valores individuales
            if (total === 0) return ''
            
            // Solo mostrar en el último dataset para evitar duplicados
            const datasetIndex = context.datasetIndex
            if (datasetIndex !== datasets.length - 1) return ''
            
            return new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(total)
          },
          anchor: 'end',
          align: 'right',
          color: textColor,
          font: {
            weight: 'bold' as const,
            size: 11,
          },
        },
      },
      scales: {
        x: {
          stacked: useStacked,
          beginAtZero: true, // En gráficos horizontales, beginAtZero va en X
          ticks: {
            color: textColorSecondary,
            callback: function(value: any) {
              // Formatear como moneda
              return new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)
            },
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

    // Si hay múltiples datasets (series agrupadas)
    if (datasets.length > 1) {
      const result: any[] = []
      labels.forEach((label: string, index: number) => {
        const row: any = { label }
        datasets.forEach((dataset: any) => {
          row[dataset.label] = dataset.data[index] || 0
        })
        row.total = datasets.reduce((sum: number, dataset: any) => 
          sum + (dataset.data[index] || 0), 0
        )
        result.push(row)
      })
      return result
    }

    // Un solo dataset
    const totalData = datasets[0]?.data || []
    return labels.map((label: string, index: number) => ({
      label,
      total: totalData[index] || 0,
    }))
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

