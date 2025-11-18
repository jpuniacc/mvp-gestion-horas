# Guía de Setup - Timesheet MVP

## Prerequisitos

Antes de empezar, necesitas:

1. **Node.js 18+** instalado
2. **Cuenta de Supabase** (o Supabase local)
3. **Base de datos configurada** con las tablas necesarias

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Puedes encontrar estas credenciales en tu proyecto de Supabase:
- Dashboard → Settings → API → Project URL y anon/public key

### 3. Configurar Base de Datos

Necesitas crear las siguientes tablas en Supabase. Puedes usar el SQL Editor o Supabase CLI:

#### Tabla: empresas
```sql
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  rut VARCHAR UNIQUE NOT NULL,
  razon_social TEXT NOT NULL,
  nombre_fantasia TEXT NOT NULL,
  logo_empresa TEXT,
  estado_empresa VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_rut VARCHAR REFERENCES empresas(rut),
  full_name TEXT NOT NULL,
  role VARCHAR(10) CHECK (role IN ('admin', 'pm', 'user', 'ops')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla: projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_rut VARCHAR REFERENCES empresas(rut),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  client_name TEXT,
  year INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  is_billable_default BOOLEAN DEFAULT false,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_rut, code)
);
```

#### Tabla: project_assignments
```sql
CREATE TABLE project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role_name TEXT,
  cost_rate DECIMAL(10,2),
  billing_rate DECIMAL(10,2),
  is_billable BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla: tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_rut VARCHAR NOT NULL REFERENCES empresas(rut) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  is_global BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para mejorar performance de búsquedas por empresa
CREATE INDEX idx_tasks_empresa_rut ON tasks(empresa_rut);

-- Constraint para asegurar que tareas globales o específicas pertenezcan a una empresa
-- (Ya manejado por empresa_rut NOT NULL)
```

#### Tabla: timesheet_weeks
```sql
CREATE TABLE timesheet_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 53),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  is_locked BOOLEAN DEFAULT false,
  total_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, week_number)
);
```

#### Tabla: timesheet_entries
```sql
CREATE TABLE timesheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_week_id UUID REFERENCES timesheet_weeks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES project_assignments(id) ON DELETE SET NULL,
  notes TEXT,
  is_billable BOOLEAN DEFAULT false,
  hours_monday DECIMAL(5,2) DEFAULT 0,
  hours_tuesday DECIMAL(5,2) DEFAULT 0,
  hours_wednesday DECIMAL(5,2) DEFAULT 0,
  hours_thursday DECIMAL(5,2) DEFAULT 0,
  hours_friday DECIMAL(5,2) DEFAULT 0,
  hours_saturday DECIMAL(5,2) DEFAULT 0,
  hours_sunday DECIMAL(5,2) DEFAULT 0,
  total_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla: org_settings
```sql
CREATE TABLE org_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla: org_settings (actualizada)
```sql
CREATE TABLE org_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  rut_empresa VARCHAR REFERENCES empresas(rut),
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Insertar Configuraciones Iniciales
```sql
-- Nota: Asegúrate de tener una empresa con RUT '77149001-K' creada antes
INSERT INTO org_settings (key, rut_empresa, value, description) VALUES
  ('max_hours_per_day', '77149001-K', '"8"', 'Máximo de horas permitidas por día'),
  ('max_hours_per_week', '77149001-K', '"43"', 'Máximo de horas permitidas por semana'),
  ('working_days', '77149001-K', '["monday","tuesday","wednesday","thursday","friday"]', 'Días laborables'),
  ('reminder_time', '77149001-K', '"16:00"', 'Hora del recordatorio'),
  ('reminder_day', '77149001-K', '"friday"', 'Día del recordatorio');
```

### 4. Configurar Row Level Security (RLS)

Para habilitar la seguridad a nivel de fila, necesitas crear políticas RLS. Ejemplo básico:

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

-- Política para profiles: usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política para timesheet_weeks: usuarios solo ven/editan sus propias semanas
CREATE POLICY "Users can manage own timesheets"
  ON timesheet_weeks FOR ALL
  USING (auth.uid() = user_id);

-- Política para timesheet_entries: usuarios solo ven/editan entradas de sus semanas
CREATE POLICY "Users can manage own entries"
  ON timesheet_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM timesheet_weeks
      WHERE timesheet_weeks.id = timesheet_entries.timesheet_week_id
      AND timesheet_weeks.user_id = auth.uid()
    )
  );
```

### 5. Iniciar el Proyecto

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## Crear Usuario de Prueba

Para probar el sistema, necesitas:

1. Crear un usuario en Supabase Auth (Dashboard → Authentication → Add user)
2. Crear un perfil asociado en la tabla `profiles`:

```sql
INSERT INTO profiles (id, empresa_rut, full_name, role)
VALUES (
  'user-uuid-from-auth',
  '77149001-K', -- RUT de empresa de prueba
  'Usuario de Prueba',
  'user'
);
```

3. Crear una empresa de prueba:

```sql
INSERT INTO empresas (rut, razon_social, nombre_fantasia)
VALUES (
  '77149001-K',
  'Empresa de Prueba S.A.',
  'Empresa de Prueba'
);
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Verificar tipos TypeScript
npm run type-check
```

## Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe y contiene las variables correctas
- Reinicia el servidor de desarrollo después de crear/modificar `.env`

### Error de autenticación
- Verifica que las tablas `profiles` y RLS estén configuradas correctamente
- Asegúrate de que el usuario tenga un perfil en la tabla `profiles`

### Error al guardar timesheet
- Verifica que las tablas `timesheet_weeks` y `timesheet_entries` existan
- Revisa las políticas RLS para asegurar permisos correctos

## Próximos Pasos

Una vez configurado el proyecto:

1. **Fase 2**: Implementar aprobaciones (ApprovalsView)
2. **Fase 3**: Gestión de proyectos y asignaciones
3. **Fase 4**: Reportes y exportación
4. **Fase 5**: Configuración administrativa

