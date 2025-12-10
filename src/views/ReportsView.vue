<script setup lang="ts">
import { useProjectsStore } from '@/stores/projectsStore';
import { useReportsStore } from '@/stores/reportsStore';
import { computed, onMounted, ref, watch } from 'vue';
import type { Project } from '@/types';
import WeekNavigator from '@/components/timesheet/WeekNavigator.vue';
import Select from 'primevue/select';
import Chart from 'primevue/chart';
import { useWeekNavigation } from '@/composables/useWeekNavigation';
import Header from '@/components/Header.vue';

const projectsStore = useProjectsStore()
const reportsStore = useReportsStore()
const selectedProjectId = ref<string>('')
const weekNavigation = useWeekNavigation({ syncWithRouter: false })
const { currentWeek, currentYear } = weekNavigation

const chartData = ref()
const chartOptions = ref()

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

const setChartData = (reportData: any[]) => {
  const documentStyle = getComputedStyle(document.documentElement);
  
  // Inicializar acumuladores por status y día
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
  if (!selectedProjectId.value || !currentWeek.value || !currentYear.value) {
    chartData.value = null
    return
  }

  const data = await reportsStore.getReporteHorasProyecto({
    p_project_id: selectedProjectId.value,
    p_year: currentYear.value,
    p_week: currentWeek.value,
  })

  chartData.value = setChartData(data)
  chartOptions.value = setChartOptions()
}

watch([selectedProjectId, currentWeek, currentYear], async () => {
  await loadReportData()
})

onMounted(async () => {
  await projectsStore.loadProjects()
  chartOptions.value = setChartOptions()
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <Header />
    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold">Reportes</h1>
          <p class="text-sm text-muted-foreground">Visualiza y genera reportes de horas trabajadas.</p>
        </div>
        <WeekNavigator :navigation="weekNavigation" />
      </div>

      <div class="px-6 py-6 space-y-4">
        <div class="flex items-center gap-4">
          <div class="space-y-2 max-w-md flex-1">
            <Select
              id="project-select"
              v-model="selectedProjectId"
              :options="groupedProjects"
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionLabel="name"
              optionValue="id"
              placeholder="Selecciona un proyecto"
              class="w-full"
            >
              <template #optiongroup="slotProps">
                <div class="flex items-center">
                  <span class="text-sm font-medium">Empresa {{ slotProps.option.label }}</span>
                </div>
              </template>
              <template #option="slotProps">
                <div
                  class="flex rounded-md text-sm leading-tight hover:bg-muted/60"
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
        </div>

        <div v-if="chartData" class="card">
          <Chart type="bar" :data="chartData" :options="chartOptions" class="h-[30rem]" />
        </div>

        <div
          v-else-if="selectedProjectId && currentWeek && currentYear && reportsStore.loading"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          Cargando datos del reporte...
        </div>

        <div
          v-else-if="selectedProjectId && currentWeek && currentYear && !reportsStore.loading && !chartData"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          No hay datos disponibles para esta semana y proyecto.
        </div>
      </div>
    </div>
  </div>
</template>

