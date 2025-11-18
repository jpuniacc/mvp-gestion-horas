# Timesheet MVP - Sistema de Gestión de Horas

Sistema de registro y aprobación de horas trabajadas diseñado como SaaS multi-tenant para empresas.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ y npm
- Cuenta de Supabase (o Supabase local)

### Instalación

1. Clonar el repositorio (o navegar al directorio del proyecto)

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` y agregar tus credenciales de Supabase:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

5. Abrir en el navegador: `http://localhost:5173`

## 📦 Estructura del Proyecto

```
src/
├── assets/           # Imágenes, fonts, estilos
├── components/
│   ├── ui/          # Componentes base (Shadcn-vue)
│   ├── layout/      # Componentes de layout
│   └── timesheet/   # Componentes específicos de timesheet
├── views/           # Vistas/Pages (rutas)
├── stores/          # Stores de Pinia
├── composables/     # Composables de Vue
├── lib/             # Utilidades y configuraciones
├── types/           # Definiciones de tipos TypeScript
└── router/          # Configuración de Vue Router
```

## 🛠️ Stack Tecnológico

### Frontend
- **Vue.js 3** con Composition API y `<script setup>`
- **TypeScript** para tipado estático
- **Pinia** para gestión de estado
- **Vue Router** para enrutamiento
- **Tailwind CSS v4** para estilos
- **Shadcn-vue** + **Radix-vue** para componentes UI
- **VueUse** y **date-fns** para utilidades

### Backend
- **Supabase** (Auth, Database, Real-time, Storage)
- **PostgreSQL** (a través de Supabase)

## 📋 Fases de Desarrollo

### ✅ Fase 1 - Core (Actual)
- [x] Setup proyecto (Vite + Vue + Tailwind + Supabase)
- [x] Autenticación (Login/Logout)
- [x] TimesheetWeekView (grid básico, guardar horas)
- [x] Estado de semanas (draft → submitted)
- [x] Validaciones básicas (horas >= 0, límites)

### 🔜 Fase 2 - Aprobaciones
- [ ] ApprovalsView para PM
- [ ] Flujo aprobar/rechazar
- [ ] Notificaciones básicas (email)

### 🔜 Fase 3 - Gestión
- [ ] ProjectsView (CRUD proyectos)
- [ ] Asignaciones de usuarios a proyectos
- [ ] Configuración de tareas

### 🔜 Fase 4 - Reportes
- [ ] ReportsView básico
- [ ] Exportación CSV/XLSX
- [ ] Filtros por proyecto/usuario/fecha

### 🔜 Fase 5 - Admin
- [ ] SettingsView
- [ ] Gestión de usuarios
- [ ] Feriados y periodos bloqueados
- [ ] Audit trail

## 🗄️ Base de Datos

El proyecto requiere las siguientes tablas en Supabase:

- `empresas`
- `profiles`
- `projects`
- `project_assignments`
- `tasks`
- `timesheet_weeks`
- `timesheet_entries`
- `holidays`
- `absences`
- `org_settings`
- `locked_periods`
- `audit_logs`

Para generar los tipos de TypeScript desde Supabase:
```bash
supabase gen types typescript --local > src/types/database.types.ts
```

## 🧪 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción
- `npm run type-check` - Verifica tipos TypeScript

## 🔐 Roles y Permisos

- **admin**: Acceso total, gestión completa
- **pm**: Aprobaciones y gestión de proyectos asignados
- **user**: Registro de horas y envío para aprobación
- **ops**: Visualización de reportes y exportación

## 📝 Notas

- Todos los componentes siguen la estructura `<script setup lang="ts">`
- Los stores de Pinia usan la Composition API
- Las validaciones se realizan tanto en frontend como backend (RLS)
- El proyecto está configurado para multi-tenant usando `empresa_rut`

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"
Asegúrate de haber creado el archivo `.env` con las variables correctas.

### Error de tipos TypeScript
Ejecuta `npm run type-check` para ver detalles del error.

### Problemas de autenticación
Verifica que las tablas `profiles` y RLS estén configuradas correctamente en Supabase.

## 📚 Recursos

- [Documentación de Vue 3](https://vuejs.org/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Shadcn-vue](https://www.shadcn-vue.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 Licencia

Este proyecto es un MVP para uso interno.

