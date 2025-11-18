# TIMESHEET MVP - Cursor.ai Project Prompt

## CONTEXTO DEL PROYECTO

Estás trabajando en un MVP de sistema de registro y aprobación de horas (Timesheet) diseñado como SaaS multi-tenant para empresas. El sistema permite a usuarios registrar horas trabajadas en proyectos, aprobar/rechazar registros, y generar reportes.

---

## STACK TECNOLÓGICO

### Frontend
- **Framework**: Vue.js 3 (Composition API + `<script setup>`)
- **UI Components**: Shadcn-vue + Radix-vue
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
- **Routing**: Vue Router
- **Language**: TypeScript
- **HTTP Client**: Supabase Client
- **Utils**: VueUse, date-fns

### Backend & Database
- **Backend**: Supabase (Auth, Database, Real-time, Storage)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth con RLS (Row Level Security)

---

## ESTRUCTURA DE COMPONENTES

**IMPORTANTE**: Todos los componentes Vue deben seguir esta estructura:

```vue
<script setup lang="ts">
// Imports
import { ref, computed, onMounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'

// Props & Emits
interface Props {
  propName: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  eventName: [payload: string]
}>()

// State & Refs
const localState = ref<string>('')

// Computeds
const computedValue = computed(() => {
  return localState.value
})

// Methods
const handleAction = () => {
  // logic
}

// Lifecycle
onMounted(() => {
  // initialization
})
</script>

<template>
  <div>
    <!-- Template content -->
  </div>
</template>
```

---

## ARQUITECTURA DE CARPETAS

```
src/
├── assets/           # Imágenes, fonts, etc.
├── components/
│   ├── ui/          # Shadcn-vue components (Button, Input, Dialog, etc.)
│   ├── layout/      # Layout components (Header, Sidebar, Footer)
│   ├── timesheet/   # Timesheet-specific components
│   ├── projects/    # Project management components
│   └── common/      # Shared/reusable components
├── views/           # Page components (mapped to routes)
├── stores/          # Pinia stores
├── composables/     # Vue composables (useAuth, useTimesheet, etc.)
├── lib/
│   ├── supabase.ts  # Supabase client config
│   ├── utils.ts     # Utility functions (cn, formatDate, etc.)
│   └── constants.ts # App constants
├── types/           # TypeScript type definitions
├── router/          # Vue Router config
├── App.vue
└── main.ts
```

---

## ROLES Y PERMISOS

### 1. **Administrador (admin)**
- Gestiona usuarios, proyectos, calendarios, feriados, centros de costo
- Define reglas globales (límites diarios/semanales, periodos cerrados)
- Acceso total a reportes, exportación y auditoría
- Cierra/reabre periodos, corrige excepciones

### 2. **Jefe de Proyecto (pm)**
- Asigna usuarios a proyectos con roles, tasas y fechas
- Aprueba/rechaza horas de sus proyectos
- Ve reportes filtrados por sus proyectos
- Cierra periodos de sus proyectos

### 3. **Colaborador (user)**
- Registra horas en proyectos asignados
- Adjunta comentarios y archivos
- Envía semanas para aprobación
- Edita solo en estado borrador o rechazado

### 4. **Revisor RR.HH./Finanzas (ops)**
- Ve reportes consolidados
- Exporta datos para nómina/facturación
- Sin permisos de edición de registros

---

## MODELO DE DATOS

### Tablas Principales

#### **empresas**
```typescript
interface Empresa {
  id: number                    // SERIAL PK (autonumérico)
  rut: string                   // Unique, ej: "77149001-K"
  razon_social: string          // TEXT
  nombre_fantasia: string       // TEXT
  logo_empresa?: string         // TEXT (URL o base64)
  estado_empresa: 'activo' | 'inactivo'
  created_at: string
  updated_at: string
}
```

**Importante**: Todas las relaciones con empresas se hacen por `rut`, no por `id`.

#### **profiles**
```typescript
interface Profile {
  id: string                    // UUID (FK to auth.users)
  empresa_rut: string           // FK to empresas.rut
  full_name: string             // TEXT
  role: 'admin' | 'pm' | 'user' | 'ops'
  is_active: boolean
  created_at: string
  updated_at: string
}
```

#### **projects**
```typescript
interface Project {
  id: string
  empresa_rut: string           // FK to empresas.rut
  name: string                  // TEXT
  code: string                  // TEXT, Unique per empresa
  client_name?: string          // TEXT
  year: number
  status: 'active' | 'inactive' | 'archived'
  is_billable_default: boolean
  description?: string          // TEXT
  created_by: string
  created_at: string
  updated_at: string
}
```

#### **project_assignments**
```typescript
interface ProjectAssignment {
  id: string
  user_id: string
  project_id: string
  role_name?: string
  cost_rate?: number
  billing_rate?: number
  is_billable: boolean
  start_date: string            // ISO date
  end_date?: string             // ISO date
  created_by: string
  created_at: string
  updated_at: string
}
```

#### **tasks**
```typescript
interface Task {
  id: string
  empresa_rut: string           // FK to empresas.rut
  name: string                  // TEXT
  code: string                  // TEXT
  project_id?: string           // null if global
  is_global: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}
```

#### **timesheet_weeks**
```typescript
interface TimesheetWeek {
  id: string
  user_id: string
  year: number
  week_number: number           // 1-53
  week_start_date: string       // ISO date (Monday)
  week_end_date: string         // ISO date (Sunday)
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_at?: string
  submitted_by?: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  is_locked: boolean
  total_hours: number
  created_at: string
  updated_at: string
}
```

#### **timesheet_entries**
```typescript
interface TimesheetEntry {
  id: string
  timesheet_week_id: string
  project_id: string
  task_id?: string
  assignment_id?: string
  notes?: string
  is_billable: boolean
  hours_monday: number
  hours_tuesday: number
  hours_wednesday: number
  hours_thursday: number
  hours_friday: number
  hours_saturday: number
  hours_sunday: number
  total_hours: number           // Computed column
  created_at: string
  updated_at: string
}
```

#### **holidays**
```typescript
interface Holiday {
  id: string
  date: string                  // ISO date
  name: string
  country_code: string
  is_active: boolean
  created_at: string
}
```

#### **absences**
```typescript
interface Absence {
  id: string
  user_id: string
  start_date: string
  end_date: string
  reason?: string
  approved_by?: string
  created_at: string
  updated_at: string
}
```

#### **org_settings**
```typescript
interface OrgSetting {
  id: string
  key: string                   // Unique
  value: any                    // JSONB
  description?: string
  updated_by?: string
  updated_at: string
}

// Configuraciones por defecto:
// - max_hours_per_day: 8
// - max_hours_per_week: 43
// - working_days: ["monday","tuesday","wednesday","thursday","friday"]
// - reminder_time: "16:00"
// - reminder_day: "friday"
```

#### **locked_periods**
```typescript
interface LockedPeriod {
  id: string
  year: number
  week_number: number
  locked_by: string
  locked_at: string
  reason?: string
}
```

#### **audit_logs**
```typescript
interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'submitted' | 'approved' | 'rejected' | 'reopened'
  performed_by: string
  payload: any                  // JSONB
  ip_address?: string
  user_agent?: string
  created_at: string
}
```

---

## CASOS DE USO PRINCIPALES

### 1. **Flujo de Registro de Horas (Usuario)**

```
1. Usuario accede a vista semanal (TimesheetWeekView)
2. Sistema carga o crea TimesheetWeek para semana actual
3. Usuario selecciona proyecto y tarea (filtrado por asignaciones activas)
4. Usuario ingresa horas por día en grid (L-V o L-D)
5. Sistema valida:
   - Horas >= 0
   - No exceder max_hours_per_day
   - Proyecto dentro de fechas de asignación
   - No registrar en periodo bloqueado
6. Usuario guarda borrador (estado = 'draft')
7. Usuario envía para aprobación (estado = 'submitted')
8. Sistema registra submitted_at y submitted_by
9. Sistema notifica a PM del proyecto
```

### 2. **Flujo de Aprobación (PM/Admin)**

```
1. PM accede a vista de aprobaciones (ApprovalsView)
2. Sistema muestra timesheets con status='submitted' de proyectos asignados
3. PM revisa entradas por usuario/proyecto/semana
4. PM puede:
   a) Aprobar → status='approved', approved_at, approved_by
   b) Rechazar → status='rejected', rejection_reason requerido
5. Sistema notifica al usuario la decisión
6. Si rechazado, usuario puede editar y reenviar
```

### 3. **Flujo de Asignación a Proyectos (Admin/PM)**

```
1. Admin/PM crea proyecto en ProjectsView
2. Admin/PM accede a asignaciones en ProjectAssignmentsView
3. Selecciona usuario(s) a asignar
4. Define:
   - Rol en proyecto
   - Fechas inicio/fin
   - Tasa de costo (opcional)
   - Tasa de facturación (opcional)
   - Billable: sí/no
5. Sistema valida no solapamiento de asignaciones (warning, no error)
6. Sistema crea ProjectAssignment
7. Usuario puede registrar horas en ese proyecto desde start_date
```

### 4. **Flujo de Reportes (Admin/PM/Ops)**

```
1. Usuario accede a ReportsView
2. Selecciona filtros:
   - Rango de fechas (semanas/meses)
   - Proyectos (multi-select)
   - Usuarios (multi-select)
   - Estado (aprobado, todos, etc.)
   - Billable/No Billable
3. Sistema consulta vista v_project_hours o v_timesheet_summary
4. Muestra tabla con:
   - Total horas por proyecto/usuario
   - Horas facturables vs no facturables
   - Costo estimado (si hay tasas)
5. Usuario puede:
   - Exportar a CSV/XLSX
   - Visualizar gráficos (opcional)
   - Conectar a Power BI (avanzado)
```

---

## REGLAS DE VALIDACIÓN

### **Validaciones en el Frontend**

1. **Horas diarias**: No exceder `max_hours_per_day` (config)
2. **Horas semanales**: Total no exceder `max_hours_per_week` (config)
3. **Valores numéricos**: Solo >= 0, máx. 2 decimales
4. **Proyecto activo**: Solo permitir proyectos con status='active'
5. **Asignación vigente**: Usuario debe tener assignment activa en el rango de fechas
6. **Periodo bloqueado**: No editar semanas con is_locked=true o en locked_periods
7. **Estado editable**: Solo editar timesheets con status='draft' o 'rejected'
8. **Campos obligatorios**: proyecto, tarea (si aplica), al menos 1 hora > 0

### **Validaciones en el Backend (RLS + Triggers)**

1. **Row Level Security**: Usuarios solo ven/editan sus propios timesheets
2. **Triggers**:
   - Actualizar `total_hours` al cambiar entries
   - Crear audit_log en cambios críticos
   - Validar que periodo no esté locked antes de UPDATE

---

## COMPONENTES UI (Shadcn-vue)

### **Componentes Base a Usar**

```typescript
// Layout
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Forms
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Feedback
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Toast, useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Tables
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Navigation
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
```

---

## VISTAS PRINCIPALES

### 1. **TimesheetWeekView.vue** (Usuario)

**Ruta**: `/timesheet/week/:year/:week`

**Funcionalidad**:
- Grid semanal con columnas L-D (o L-V según config)
- Filas: Proyecto + Tarea
- Celdas editables (Input numérico)
- Totales por fila (horizontal) y por día (vertical)
- Botones:
  - Guardar borrador
  - Enviar para aprobación
  - Copiar semana anterior
  - Agregar fila (proyecto/tarea)
- Indicadores visuales:
  - Feriados (fondo gris)
  - Ausencias (fondo amarillo)
  - Límites excedidos (borde rojo)
  - Billable badge (verde/gris)
- Estado de la semana (Badge)
- Navegación semana anterior/siguiente

**Componentes**:
```vue
<TimesheetWeekView>
  <WeekNavigator />
  <TimesheetGrid>
    <TimesheetRow v-for="entry in entries" />
    <TimesheetTotals />
  </TimesheetGrid>
  <TimesheetActions />
  <ProjectTaskSelector />
</TimesheetWeekView>
```

### 2. **ApprovalsView.vue** (PM/Admin)

**Ruta**: `/approvals`

**Funcionalidad**:
- Lista de timesheets pendientes (status='submitted')
- Filtros: usuario, proyecto, semana
- Vista detallada por timesheet (expandible)
- Botones: Aprobar / Rechazar (con modal para motivo)
- Indicadores: días desde envío, total horas, proyectos

**Componentes**:
```vue
<ApprovalsView>
  <ApprovalFilters />
  <ApprovalList>
    <ApprovalCard v-for="timesheet">
      <TimesheetSummary />
      <ApprovalActions />
    </ApprovalCard>
  </ApprovalList>
  <RejectDialog />
</ApprovalsView>
```

### 3. **ProjectsView.vue** (Admin/PM)

**Ruta**: `/projects`

**Funcionalidad**:
- Lista de proyectos (Table)
- Crear/editar proyecto (Dialog)
- Asignar usuarios (navega a ProjectAssignmentsView)
- Filtros: status, año, cliente
- Búsqueda por nombre/código

### 4. **ReportsView.vue** (Admin/PM/Ops)

**Ruta**: `/reports`

**Funcionalidad**:
- Selección de filtros (rango fechas, proyectos, usuarios)
- Tabla de resultados (agregados)
- Exportar CSV/XLSX
- Gráficos (opcional): horas por proyecto, billable vs no billable

### 5. **SettingsView.vue** (Admin)

**Ruta**: `/settings`

**Funcionalidad**:
- Tabs:
  - General (max_hours, working_days)
  - Usuarios (CRUD)
  - Feriados (CRUD)
  - Períodos bloqueados
  - Tareas globales

---

## STORES (PINIA)

### **authStore.ts**

```typescript
export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(false)

  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isPM = computed(() => profile.value?.role === 'pm')
  const isUser = computed(() => profile.value?.role === 'user')
  const isOps = computed(() => profile.value?.role === 'ops')

  async function signIn(email: string, password: string) {
    // Supabase auth logic
  }

  async function signOut() {
    // Supabase signOut
  }

  async function loadProfile() {
    // Fetch profile from profiles table
  }

  return {
    user,
    profile,
    loading,
    isAdmin,
    isPM,
    isUser,
    isOps,
    signIn,
    signOut,
    loadProfile
  }
})
```

### **timesheetStore.ts**

```typescript
export const useTimesheetStore = defineStore('timesheet', () => {
  const supabase = useSupabaseClient()
  const currentWeek = ref<TimesheetWeek | null>(null)
  const entries = ref<TimesheetEntry[]>([])
  const loading = ref(false)

  async function loadWeek(year: number, week: number) {
    // Fetch or create timesheet_week + entries
  }

  async function saveEntry(entry: Partial<TimesheetEntry>) {
    // Upsert entry
  }

  async function submitWeek() {
    // Update status to 'submitted'
  }

  async function copyPreviousWeek() {
    // Duplicate entries from previous week
  }

  const totalHours = computed(() => {
    return entries.value.reduce((sum, e) => sum + e.total_hours, 0)
  })

  return {
    currentWeek,
    entries,
    loading,
    totalHours,
    loadWeek,
    saveEntry,
    submitWeek,
    copyPreviousWeek
  }
})
```

### **projectsStore.ts**

```typescript
export const useProjectsStore = defineStore('projects', () => {
  const supabase = useSupabaseClient()
  const projects = ref<Project[]>([])
  const assignments = ref<ProjectAssignment[]>([])
  const loading = ref(false)

  async function loadProjects() {
    // Fetch active projects
  }

  async function loadUserAssignments(userId: string) {
    // Fetch assignments for user
  }

  async function createProject(project: Partial<Project>) {
    // Insert project
  }

  async function assignUser(assignment: Partial<ProjectAssignment>) {
    // Insert assignment
  }

  return {
    projects,
    assignments,
    loading,
    loadProjects,
    loadUserAssignments,
    createProject,
    assignUser
  }
})
```

---

## COMPOSABLES

### **useWeekNavigation.ts**

```typescript
export function useWeekNavigation() {
  const route = useRoute()
  const router = useRouter()

  const currentYear = computed(() => parseInt(route.params.year as string))
  const currentWeek = computed(() => parseInt(route.params.week as string))

  function nextWeek() {
    // Calculate next week, handle year boundary
    // router.push(...)
  }

  function previousWeek() {
    // Calculate previous week
  }

  function goToWeek(year: number, week: number) {
    router.push(`/timesheet/week/${year}/${week}`)
  }

  return {
    currentYear,
    currentWeek,
    nextWeek,
    previousWeek,
    goToWeek
  }
}
```

### **useValidation.ts**

```typescript
export function useValidation() {
  const settingsStore = useSettingsStore()

  function validateDailyHours(hours: number): boolean {
    return hours <= settingsStore.maxHoursPerDay
  }

  function validateWeeklyHours(total: number): boolean {
    return total <= settingsStore.maxHoursPerWeek
  }

  function validateAssignment(
    userId: string, 
    projectId: string, 
    date: Date
  ): boolean {
    // Check if user has active assignment for project on date
  }

  return {
    validateDailyHours,
    validateWeeklyHours,
    validateAssignment
  }
}
```

---

## CONFIGURACIÓN DE SUPABASE

### **lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
```

### **.env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## ROUTING

### **router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    redirect: '/timesheet/week'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/timesheet',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'week/:year?/:week?',
        component: () => import('@/views/TimesheetWeekView.vue'),
        name: 'timesheet-week'
      }
    ]
  },
  {
    path: '/approvals',
    component: () => import('@/views/ApprovalsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm'] }
  },
  {
    path: '/projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm'] }
  },
  {
    path: '/reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm', 'ops'] }
  },
  {
    path: '/settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.user) {
    return next('/login')
  }
  
  if (to.meta.roles && !to.meta.roles.includes(authStore.profile?.role)) {
    return next('/')
  }
  
  next()
})

export default router
```

---

## NOTIFICACIONES

### **Email (Supabase Edge Functions)**

Crear funciones serverless para:
- Recordatorio de envío (viernes 16:00)
- Notificación de rechazo
- Alerta a PM sobre horas pendientes

**Ejemplo**: `supabase/functions/send-reminder/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Query users with draft timesheets
  const { data: users } = await supabase
    .from('timesheet_weeks')
    .select('user_id, profiles(email)')
    .eq('status', 'draft')
    .eq('week_number', getCurrentWeek())

  // Send emails via Resend/SendGrid/etc.

  return new Response(JSON.stringify({ sent: users.length }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## EXPORTACIÓN DE REPORTES

### **CSV/XLSX (Frontend)**

```typescript
// composables/useExport.ts
import { utils, writeFile } from 'xlsx'

export function useExport() {
  function exportToCSV(data: any[], filename: string) {
    const csv = data.map(row => Object.values(row).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadBlob(blob, `${filename}.csv`)
  }

  function exportToExcel(data: any[], filename: string) {
    const worksheet = utils.json_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Report')
    writeFile(workbook, `${filename}.xlsx`)
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  return {
    exportToCSV,
    exportToExcel
  }
}
```

---

## CONSIDERACIONES DE UX

### **Indicadores Visuales**

1. **Estados de Timesheet**:
   - `draft`: Badge gris "Borrador"
   - `submitted`: Badge azul "Enviado"
   - `approved`: Badge verde "Aprobado"
   - `rejected`: Badge rojo "Rechazado"

2. **Días especiales**:
   - Feriados: Fondo gris claro, no editable
   - Ausencias: Fondo amarillo claro, tooltip con motivo
   - Fines de semana: Fondo gris muy claro (si working_days no incluye)

3. **Validaciones en tiempo real**:
   - Borde rojo si excede límite diario
   - Alerta amarilla si se acerca a límite semanal
   - Tooltip explicativo al hover

4. **Loading states**:
   - Skeleton loaders en tablas
   - Spinner en botones de acción
   - Progress bar en exportación

### **Atajos de Teclado (Opcional)**

- `Ctrl/Cmd + S`: Guardar borrador
- `Ctrl/Cmd + Enter`: Enviar para aprobación
- `Tab`: Navegar entre celdas del grid
- `Escape`: Cerrar modales

---

## PRIORIDADES PARA MVP

### **Fase 1 - Core (Semanas 1-2)**

1. Setup proyecto (Vite + Vue + Tailwind + Supabase)
2. Autenticación (Login/Logout)
3. TimesheetWeekView (grid básico, guardar horas)
4. Estado de semanas (draft → submitted)
5. Validaciones básicas (horas >= 0, límites)

### **Fase 2 - Aprobaciones (Semana 3)**

6. ApprovalsView para PM
7. Flujo aprobar/rechazar
8. Notificaciones básicas (email)

### **Fase 3 - Gestión (Semana 4)**

9. ProjectsView (CRUD proyectos)
10. Asignaciones de usuarios a proyectos
11. Configuración de tareas

### **Fase 4 - Reportes (Semana 5)**

12. ReportsView básico
13. Exportación CSV/XLSX
14. Filtros por proyecto/usuario/fecha

### **Fase 5 - Admin (Semana 6)**

15. SettingsView
16. Gestión de usuarios
17. Feriados y periodos bloqueados
18. Audit trail

### **Mejoras Post-MVP**

- Responsive móvil (entrada por día)
- Gráficos interactivos (Chart.js)
- Notificaciones in-app (real-time)
- Adjuntar archivos a entradas
- Búsqueda avanzada
- Internacionalización (i18n)
- Temas claro/oscuro
- Integración Power BI

---

## MEJORES PRÁCTICAS

### **Vue 3**

- Usar Composition API con `<script setup>`
- Definir props e emits con TypeScript
- Extraer lógica reutilizable a composables
- Usar `computed` para valores derivados
- Evitar refs innecesarias, preferir `reactive` para objetos

### **TypeScript**

- Tipar todas las props, emits, y funciones
- Definir interfaces en `types/`
- Usar `satisfies` para inferencia de tipos
- No usar `any`, preferir `unknown` si es necesario

### **Supabase**

- Usar RLS para seguridad
- Crear índices en columnas frecuentemente filtradas
- Usar vistas materializadas para reportes pesados
- Batch updates cuando sea posible
- Manejar errores de red (retry logic)

### **Performance**

- Lazy load rutas con `import()`
- Virtualizar listas largas (vue-virtual-scroller)
- Debounce inputs de búsqueda
- Cachear queries con `keepalive`
- Optimistic updates en mutaciones

### **Seguridad**

- Validar en frontend Y backend
- Sanitizar inputs
- Usar HTTPS siempre
- No exponer claves en código
- Implementar rate limiting en API

---

## NOTAS FINALES PARA CURSOR.AI

**Al trabajar en este proyecto**:

1. **SIEMPRE** usar `<script setup lang="ts">` antes de `<template>`
2. **SIEMPRE** tipar props, emits y refs con TypeScript
3. **SIEMPRE** validar permisos de usuario antes de operaciones críticas
4. **NUNCA** hacer queries sin filtros de usuario en tablas con RLS
5. **PRIORIZAR** UX: feedback inmediato, loading states, error handling
6. **MANTENER** consistencia en naming: camelCase para JS, kebab-case para componentes
7. **DOCUMENTAR** funciones complejas con JSDoc
8. **TESTEAR** flujos críticos: registro, aprobación, reportes

**Comandos rápidos**:

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Supabase
supabase start
supabase db reset
supabase migration new migration_name
supabase gen types typescript --local > src/types/database.types.ts
```

**Estructura de archivos a crear**:

```
- Crear componente: src/components/[carpeta]/[Nombre].vue
- Crear store: src/stores/[nombre]Store.ts
- Crear vista: src/views/[Nombre]View.vue
- Crear composable: src/composables/use[Nombre].ts
- Crear tipo: src/types/[nombre].types.ts
```

**¡Éxito con el MVP! 🚀**