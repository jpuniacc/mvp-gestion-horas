<script setup lang="ts">
import { useProjectsStore } from '@/stores/projectsStore';
import { useReportsStore } from '@/stores/reportsStore';
import { computed, onMounted, ref, watch } from 'vue';
import type { Project } from '@/types';
import Select from 'primevue/select';
import Chart from 'primevue/chart';
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import RadioButton from 'primevue/radiobutton';
import { startOfWeek } from 'date-fns';
import Header from '@/components/Header.vue';
import { useReports } from '@/composables/useReports';

const projectsStore = useProjectsStore()
const reportsStore = useReportsStore()
const selectedProjectId = ref<string>('')

const {
  rawReportData,
  groupByMode,
  groupBy,
  setChartData,
  setChartOptions,
  getTableData,
  getChartType,
} = useReports()

const chartData = ref()
const chartOptions = ref()
const selectedWeekStart = ref<Date | null>(null)
const selectedWeekEnd = ref<Date | null>(null)
const chartLoading = ref(false)

// Datos para la tabla
const tableData = computed(() => {
  return getTableData(chartData.value)
})

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


async function loadReportData() {
  if (!selectedProjectId.value) {
    chartData.value = null
    chartLoading.value = false
    return
  }

  chartLoading.value = true

  try {
    // Calcular lunes de la semana de inicio (p_start) si existe, sino null
    const pStart: string | null = selectedWeekStart.value
      ? formatDate(startOfWeek(selectedWeekStart.value, { weekStartsOn: 1 })) // Formato YYYY/MM/DD
      : null

    // Si hay semana de fin, calcular domingo (p_end), sino null
    const pEnd: string | null = selectedWeekEnd.value
      ? formatDate(selectedWeekEnd.value) // Formato YYYY/MM/DD
      : null

    const params: {
      p_project_id: string
      p_start: string | null
      p_end: string | null
    } = {
      p_project_id: selectedProjectId.value,
      p_start: pStart,
      p_end: pEnd,
    }

    // Asegurar que el loading se muestre por al menos 1 segundo
    const [data] = await Promise.all([
      reportsStore.getReporteHorasProyecto(params),
      new Promise(resolve => setTimeout(resolve, 1000))
    ])
    console.log(params)

    // Guardar datos originales para reprocesar cuando cambie groupByMode o groupBy
    rawReportData.value = data
    chartData.value = setChartData(data)
    chartOptions.value = setChartOptions()
  } finally {
    chartLoading.value = false
  }
}

watch([selectedProjectId, selectedWeekStart, selectedWeekEnd], async () => {
  await loadReportData()
})

// Reprocesar datos cuando cambie el modo de agrupación o la agrupación
watch([groupByMode, groupBy], () => {
  if (rawReportData.value.length > 0) {
    chartData.value = setChartData(rawReportData.value)
    chartOptions.value = setChartOptions()
  }
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
  } else {
    // Si se limpia la fecha, establecer null
    selectedWeekStart.value = null
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
  // No inicializar fecha por defecto para permitir búsqueda sin filtro de fechas
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
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
            <label class="text-xs font-medium text-muted-foreground">Semana Inicio (opcional)</label>
            <DatePicker
              v-model="selectedWeekStart"
              :show-week="true"
              selection-mode="single"
              date-format="dd/mm/yy"
              placeholder="Semana inicio (opcional)"
              class="w-full text-sm"
              :first-day-of-week="1"
              :manual-input="false"
              :show-clear="true"
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

        <div class="flex items-center justify-end gap-4">
          <div class="flex items-center gap-3">
            <RadioButton 
              inputId="group-by-dias" 
              value="dias" 
              v-model="groupBy" 
            />
            <label for="group-by-dias" class="text-sm font-medium text-muted-foreground cursor-pointer">
              Por días
            </label>
          </div>
          <div class="flex items-center gap-3">
            <RadioButton 
              inputId="group-by-semanas" 
              value="semanas" 
              v-model="groupBy" 
            />
            <label for="group-by-semanas" class="text-sm font-medium text-muted-foreground cursor-pointer">
              Por semanas
            </label>
          </div>
          <div class="flex items-center gap-3">
            <RadioButton 
              inputId="group-by-total" 
              value="total" 
              v-model="groupBy" 
            />
            <label for="group-by-total" class="text-sm font-medium text-muted-foreground cursor-pointer">
              Total
            </label>
          </div>
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
            :type="getChartType()" 
            :data="chartData" 
            :options="chartOptions" 
            class="h-[30rem]" 
          />
        </div>

        <div v-if="chartData || chartLoading" class="mt-4 flex items-center gap-4">
          <div class="flex items-center gap-3">
            <RadioButton 
              inputId="group-by-defecto" 
              value="defecto" 
              v-model="groupByMode" 
            />
            <label for="group-by-defecto" class="text-sm font-medium text-muted-foreground cursor-pointer">
              Por defecto
            </label>
          </div>
          <div class="flex items-center gap-3">
            <RadioButton 
              inputId="group-by-usuario" 
              value="usuario" 
              v-model="groupByMode" 
            />
            <label for="group-by-usuario" class="text-sm font-medium text-muted-foreground cursor-pointer">
              Ver por usuario
            </label>
          </div>
          <div class="flex items-center gap-3">
            <RadioButton 
              inputId="group-by-tarea" 
              value="tarea" 
              v-model="groupByMode" 
            />
            <label for="group-by-tarea" class="text-sm font-medium text-muted-foreground cursor-pointer">
              Ver por tarea
            </label>
          </div>
        </div>

        <div v-if="chartData || chartLoading" class="mt-4">
          <h2 class="text-lg font-semibold mb-3">Datos del Reporte</h2>
          
          <div v-if="chartLoading" class="border rounded-lg p-4">
            <div class="space-y-3">
              <!-- Header skeleton -->
              <div class="flex gap-4 pb-3 border-b">
                <Skeleton width="30%" height="1.5rem" />
                <Skeleton width="20%" height="1.5rem" />
              </div>
              <!-- Rows skeleton -->
              <div v-for="i in 7" :key="i" class="flex gap-4 py-2">
                <Skeleton width="30%" height="1.25rem" />
                <Skeleton width="20%" height="1.25rem" />
              </div>
            </div>
          </div>
          
          <DataTable 
            v-else-if="chartData && tableData.length > 0"
            :value="tableData" 
            :paginator="false"
            class="text-sm"
            :pt="{
              root: { class: 'border rounded-lg' },
              header: { class: 'bg-muted/50' }
            }"
          >
            <!-- Columna de etiqueta (usuario/tarea) -->
            <Column field="label" header="Etiqueta" :sortable="false">
              <template #body="{ data }">
                <span class="font-medium">{{ data.label }}</span>
              </template>
            </Column>
            
            <!-- Columnas dinámicas para labels (días/semanas) -->
            <Column 
              v-for="label in chartData?.labels" 
              :key="label"
              :field="label" 
              :header="`${label} (h)`" 
              :sortable="false"
            >
              <template #body="{ data }">
                {{ (data[label] || 0).toFixed(2) }}
              </template>
            </Column>
            
            <!-- Columna total -->
            <Column field="total" header="Total (h)" :sortable="false">
              <template #body="{ data }">
                <span class="font-semibold">{{ (data.total || 0).toFixed(2) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>

        <div
          v-else-if="selectedProjectId && reportsStore.loading"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          Cargando datos del reporte...
        </div>

        <div
          v-else-if="selectedProjectId && !reportsStore.loading && !chartData"
          class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
        >
          No hay datos disponibles para este rango y proyecto.
        </div>
      </div>
    </div>
  </div>
</template>

