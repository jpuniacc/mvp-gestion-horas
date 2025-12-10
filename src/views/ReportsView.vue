<script setup lang="ts">
import { useProjectsStore } from '@/stores/projectsStore';
import { useReportsStore } from '@/stores/reportsStore';
import { computed, onMounted, ref, watch } from 'vue';
import type { Project } from '@/types';
import Select from 'primevue/select';
import Chart from 'primevue/chart';
import DatePicker from 'primevue/datepicker';
import ToggleSwitch from 'primevue/toggleswitch';
import ProgressSpinner from 'primevue/progressspinner';
import { startOfWeek } from 'date-fns';
import Header from '@/components/Header.vue';

const projectsStore = useProjectsStore()
const reportsStore = useReportsStore()
const selectedProjectId = ref<string>('')

const chartData = ref()
const chartOptions = ref()
const selectedWeekStart = ref<Date | null>(null)
const selectedWeekEnd = ref<Date | null>(null)
const viewMode = ref<'dias' | 'semanas'>('dias')
const chartLoading = ref(false)

// Función para formatear fecha a YYYY/MM/DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

const groupedProjects = computed(() => {
  const groups = new Map<string, { label: string; items: Project[] }>()

  projectsStore.projects.forEach((project: Project) => {
    const rut = project.empresa_rut || 'Sin empresa'
    if (!groups.has(rut)) {
      groups.set(rut, { label: rut, items: [] as Project[] })
    }
    groups.get(rut)!.items.push(project)
  })

  return Array.from(groups.entries())
    .sort(([rutA], [rutB]) => rutA.localeCompare(rutB))
    .map(([label, group]) => ({
      label,
      items: [...group.items].sort((a, b) => a.name.localeCompare(b.name)),
    }))
})

const setChartData = (reportData: any[], mode: 'dias' | 'semanas' = 'dias') => {
  const documentStyle = getComputedStyle(document.documentElement);
  
  if (mode === 'dias') {
    // Modo por días: agrupar por días de la semana
    const statusData: Record<string, number[]> = {
      draft: [0, 0, 0, 0, 0, 0, 0],
      approved: [0, 0, 0, 0, 0, 0, 0],
      submitted: [0, 0, 0, 0, 0, 0, 0],
    }

    // Procesar datos y sumar horas por status y día
    reportData.forEach((row) => {
      const status = row.status || 'draft'
      if (statusData[status]) {
        statusData[status][0] += parseFloat(row.hours_monday || 0)
        statusData[status][1] += parseFloat(row.hours_tuesday || 0)
        statusData[status][2] += parseFloat(row.hours_wednesday || 0)
        statusData[status][3] += parseFloat(row.hours_thursday || 0)
        statusData[status][4] += parseFloat(row.hours_friday || 0)
        statusData[status][5] += parseFloat(row.hours_saturday || 0)
        statusData[status][6] += parseFloat(row.hours_sunday || 0)
      }
    })

    return {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      datasets: [
        {
          type: 'bar',
          label: 'Draft',
          backgroundColor: documentStyle.getPropertyValue('--p-gray-500'),
          data: statusData.draft,
        },
        {
          type: 'bar',
          label: 'Approved',
          backgroundColor: documentStyle.getPropertyValue('--p-cyan-500'),
          data: statusData.approved,
        },
        {
          type: 'bar',
          label: 'Submitted',
          backgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
          data: statusData.submitted,
        },
      ],
    }
  } else {
    // Modo por semanas: agrupar por número de semana y sumar todos los estados
    const weekMap = new Map<string, number>()

    // Procesar datos y agrupar por semana, sumando todos los estados
    reportData.forEach((row) => {
      const weekNumber = row.week_number
      const year = row.year
      const weekKey = `${year}-S${weekNumber}`
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, 0)
      }
      
      const totalHours = parseFloat(row.total || 0)
      weekMap.set(weekKey, weekMap.get(weekKey)! + totalHours)
    })

    // Ordenar semanas y crear arrays de datos
    const sortedWeeks = Array.from(weekMap.entries()).sort(([keyA], [keyB]) => {
      const [yearA, weekA] = keyA.split('-S').map(Number)
      const [yearB, weekB] = keyB.split('-S').map(Number)
      if (yearA !== yearB) return yearA - yearB
      return weekA - weekB
    })

    const labels = sortedWeeks.map(([key]) => key)
    const totalData = sortedWeeks.map(([, total]) => total)

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Total Horas',
          borderColor: documentStyle.getPropertyValue('--p-primary-500') || documentStyle.getPropertyValue('--p-cyan-500'),
          backgroundColor: documentStyle.getPropertyValue('--p-primary-500') || documentStyle.getPropertyValue('--p-cyan-500'),
          data: totalData,
          tension: 0.4,
          fill: false,
        },
      ],
    }
  }
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  return {
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
        stacked: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        stacked: true,
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

async function loadReportData() {
  if (!selectedProjectId.value || !selectedWeekStart.value) {
    chartData.value = null
    chartLoading.value = false
    return
  }

  chartLoading.value = true

  try {
    // Calcular lunes de la semana de inicio (p_start)
    const weekStart = startOfWeek(selectedWeekStart.value, { weekStartsOn: 1 })
    const pStart = formatDate(weekStart) // Formato YYYY/MM/DD

    // Si hay semana de fin, calcular domingo (p_end), sino null
    const pEnd: string | null = selectedWeekEnd.value
      ? formatDate(selectedWeekEnd.value) // Formato YYYY/MM/DD
      : null

    const params: {
      p_project_id: string
      p_start: string
      p_end: string | null
    } = {
      p_project_id: selectedProjectId.value,
      p_start: pStart,
      p_end: pEnd,
    }

    const data = await reportsStore.getReporteHorasProyecto(params)
    console.log(params)

    chartData.value = setChartData(data, viewMode.value)
    chartOptions.value = setChartOptions()
  } finally {
    chartLoading.value = false
  }
}

watch([selectedProjectId, selectedWeekStart, selectedWeekEnd, viewMode], async () => {
  await loadReportData()
})

function handleWeekStartSelect(event: any) {
  const date = event.value || event
  if (date && date instanceof Date) {
    // Asegurar que se selecciona el lunes de la semana
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    selectedWeekStart.value = weekStart
    
    // Si la semana de fin es anterior a la de inicio, limpiarla
    if (selectedWeekEnd.value && selectedWeekEnd.value < weekStart) {
      selectedWeekEnd.value = null
    }
  }
}

function handleWeekEndSelect(event: any) {
  const date = event.value || event
  if (date && date instanceof Date) {
    // Calcular el lunes de la semana seleccionada
    const weekMonday = startOfWeek(date, { weekStartsOn: 1 })
    // Calcular el domingo de esa semana (lunes + 6 días)
    const weekSunday = new Date(weekMonday)
    weekSunday.setDate(weekMonday.getDate() + 6)
    
    // Validar que la semana de fin sea posterior o igual a la de inicio
    if (selectedWeekStart.value && weekSunday >= selectedWeekStart.value) {
      selectedWeekEnd.value = weekSunday
    } else if (!selectedWeekStart.value) {
      // Si no hay semana de inicio, establecerla también (lunes)
      selectedWeekStart.value = weekMonday
    }
  }
}

onMounted(async () => {
  await projectsStore.loadProjects()
  chartOptions.value = setChartOptions()
  // Inicializar con la semana actual
  const now = new Date()
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  selectedWeekStart.value = currentWeekStart
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <Header />
    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-border px-6 py-4">
        <div>
          <h1 class="text-2xl font-bold">Reportes</h1>
          <p class="text-sm text-muted-foreground">Visualiza y genera reportes de horas trabajadas.</p>
        </div>
      </div>

      <div class="px-6 py-6 space-y-4">
        <div class="grid grid-cols-3 gap-4 items-end">
          <div class="space-y-2">
            <Select
              id="project-select"
              v-model="selectedProjectId"
              :options="groupedProjects"
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionLabel="name"
              optionValue="id"
              placeholder="Selecciona un proyecto"
              class="w-full text-sm"
            >
              <template #optiongroup="slotProps">
                <div class="flex items-center">
                  <span class="text-xs font-medium">Empresa {{ slotProps.option.label }}</span>
                </div>
              </template>
              <template #option="slotProps">
                <div
                  class="flex rounded-md text-xs leading-tight hover:bg-muted/60"
                >
                  <span class="text-muted-foreground">
                    {{ slotProps.option.name }}
                    <span class="text-xs italic text-muted-foreground/80">
                      ({{ slotProps.option.code }})
                    </span>
                  </span>
                </div>
              </template>
            </Select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">Semana Inicio</label>
            <DatePicker
              v-model="selectedWeekStart"
              :show-week="true"
              selection-mode="single"
              date-format="dd/mm/yy"
              placeholder="Semana inicio"
              class="w-full text-sm"
              :first-day-of-week="1"
              :manual-input="false"
              @date-select="handleWeekStartSelect"
            >
              <template #date="slotProps">
                <div class="flex items-center justify-center h-full w-full">
                  <span class="text-xs">{{ slotProps.date.day }}</span>
                </div>
              </template>
            </DatePicker>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">Semana Fin (opcional)</label>
            <DatePicker
              v-model="selectedWeekEnd"
              :show-week="true"
              selection-mode="single"
              date-format="dd/mm/yy"
              placeholder="Semana fin"
              class="w-full text-sm"
              :first-day-of-week="1"
              :min-date="selectedWeekStart || undefined"
              :manual-input="false"
              @date-select="handleWeekEndSelect"
            >
              <template #date="slotProps">
                <div class="flex items-center justify-center h-full w-full">
                  <span class="text-xs">{{ slotProps.date.day }}</span>
                </div>
              </template>
            </DatePicker>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3">
          <label for="view-mode-toggle" class="text-sm font-medium text-muted-foreground">
            Por días
          </label>
          <ToggleSwitch
            id="view-mode-toggle"
            v-model="viewMode"
            :trueValue="'semanas'"
            :falseValue="'dias'"
          />
          <label for="view-mode-toggle" class="text-sm font-medium text-muted-foreground">
            Por semanas
          </label>
        </div>

        <div v-if="chartData || chartLoading" class="card relative">
          <div
            v-if="chartLoading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg"
          >
            <ProgressSpinner style="width: 38px; height: 38px" strokeWidth="4" />
          </div>
          <Chart 
            v-if="chartData"
            :type="viewMode === 'semanas' ? 'line' : 'bar'" 
            :data="chartData" 
            :options="chartOptions" 
            class="h-[30rem]" 
          />
        </div>

        <div
          v-else-if="selectedProjectId && selectedWeekStart && reportsStore.loading"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          Cargando datos del reporte...
        </div>

        <div
          v-else-if="selectedProjectId && selectedWeekStart && !reportsStore.loading && !chartData"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          No hay datos disponibles para este rango y proyecto.
        </div>
      </div>
    </div>
  </div>
</template>

