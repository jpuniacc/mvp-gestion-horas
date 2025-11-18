# 🔐 Guía para Probar la Autenticación

Esta guía te ayudará a configurar y probar el sistema de autenticación del MVP.

## 📋 Prerrequisitos

1. **Cuenta de Supabase** (gratuita)
   - Ve a https://supabase.com
   - Crea una cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Node.js instalado** (versión 18+)

---

## 🚀 Paso 1: Configurar Supabase

### 1.1 Crear Proyecto en Supabase

1. Ve al Dashboard de Supabase: https://app.supabase.com
2. Click en "New Project"
3. Completa:
   - **Name**: `mvp-gestion-horas` (o el nombre que prefieras)
   - **Database Password**: Guárdala bien, la necesitarás
   - **Region**: Elige la más cercana
4. Espera ~2 minutos a que se cree el proyecto

### 1.2 Obtener Credenciales

1. En el Dashboard, ve a **Settings** → **API**
2. Copia estas dos cosas:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (la key larga)

### 1.3 Configurar Variables de Entorno

En tu proyecto, crea el archivo `.env`:

```bash
# En la raíz del proyecto
touch .env
```

Edita el archivo `.env` y agrega:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Reemplaza** `tu-proyecto` y `tu-anon-key-aqui` con los valores reales.

---

## 🗄️ Paso 2: Crear Tablas en Supabase

Necesitas crear las tablas básicas para autenticación. Ve al **SQL Editor** en Supabase.

### 2.1 Crear Tabla de Empresas

Ejecuta este SQL:

```sql
-- Crear tabla empresas
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

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_empresas_rut ON empresas(rut);
```

### 2.2 Crear Tabla de Profiles

```sql
-- Crear tabla profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_rut VARCHAR REFERENCES empresas(rut),
  full_name TEXT NOT NULL,
  role VARCHAR(10) CHECK (role IN ('admin', 'pm', 'user', 'ops')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuarios pueden actualizar su propio perfil (solo algunos campos)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 2.3 Insertar Empresa de Prueba

```sql
-- Insertar empresa de prueba
INSERT INTO empresas (rut, razon_social, nombre_fantasia)
VALUES (
  '77149001-K',
  'Empresa de Prueba S.A.',
  'Empresa Prueba'
);
```

---

## 👤 Paso 3: Crear Usuario de Prueba

### Opción A: Desde el Dashboard de Supabase (Más Fácil)

1. Ve a **Authentication** → **Users**
2. Click en **Add User** → **Create new user**
3. Completa:
   - **Email**: `test@example.com` (o el que prefieras)
   - **Password**: `test123456` (o el que prefieras)
   - **Auto Confirm User**: ✅ Activa esta opción
4. Click en **Create User**

5. **Copia el UUID del usuario creado** (lo verás en la lista de usuarios)

### Opción B: Desde la Aplicación (Registro)

Si implementamos registro, podrías crear usuarios desde la app (por ahora usemos Opción A).

---

## 📝 Paso 4: Crear Perfil para el Usuario

En el **SQL Editor**, ejecuta:

```sql
-- Reemplaza 'USER_ID_AQUI' con el UUID que copiaste del usuario
INSERT INTO profiles (id, empresa_rut, full_name, role)
VALUES (
  'USER_ID_AQUI',  -- ⚠️ REEMPLAZA ESTO con el UUID del usuario
  '77149001-K',    -- RUT de la empresa de prueba
  'Usuario de Prueba',
  'user'           -- Rol: user, admin, pm, o ops
);
```

### Para obtener el UUID del usuario:

1. Ve a **Authentication** → **Users**
2. Click en el usuario que creaste
3. Copia el **User UID** (algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

---

## 🎮 Paso 5: Iniciar el Proyecto

En tu terminal:

```bash
# Si no has instalado dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre tu navegador en: `http://localhost:5173`

---

## 🔍 Paso 6: Probar el Login

1. Deberías ver la pantalla de **Login**
2. Ingresa las credenciales:
   - **Email**: `test@example.com` (el que creaste)
   - **Password**: `test123456` (la que configuraste)
3. Click en **Iniciar Sesión**

### ✅ Si funciona correctamente:
- Deberías ser redirigido a `/timesheet/week`
- Verás el layout principal con tu nombre en el header
- Puedes navegar por el sistema

### ❌ Si hay errores:

#### Error: "Email not confirmed"
- Ve a **Authentication** → **Users** en Supabase
- Click en el usuario
- Verifica que el email esté confirmado
- Si no, verifica que creaste el usuario con "Auto Confirm User" activado

#### Error: "Invalid login credentials"
- Verifica que el email y password sean correctos
- Asegúrate de haber creado el usuario correctamente

#### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env` existe
- Verifica que las variables están correctas
- **Reinicia el servidor** después de crear/modificar `.env`

#### Error: "Error al cargar perfil"
- Verifica que creaste el registro en la tabla `profiles`
- Verifica que el `id` del profile coincide con el UUID del usuario
- Verifica que `empresa_rut` existe en la tabla `empresas`

---

## 🧪 Crear Múltiples Usuarios de Prueba

Para probar diferentes roles, crea más usuarios:

```sql
-- Ejemplo: Usuario Admin
INSERT INTO profiles (id, empresa_rut, full_name, role)
VALUES (
  'UUID_DEL_USUARIO_ADMIN',
  '77149001-K',
  'Admin de Prueba',
  'admin'
);

-- Ejemplo: Usuario PM (Project Manager)
INSERT INTO profiles (id, empresa_rut, full_name, role)
VALUES (
  'UUID_DEL_USUARIO_PM',
  '77149001-K',
  'PM de Prueba',
  'pm'
);
```

---

## 🔐 Verificar RLS (Row Level Security)

Para asegurar que RLS funciona:

1. Ve a **Authentication** → **Policies** (o **Table Editor** → **profiles** → **Policies**)
2. Deberías ver las políticas que creaste
3. Solo deberías poder ver tu propio perfil desde la app

---

## 📝 Checklist Rápido

- [ ] Proyecto de Supabase creado
- [ ] Credenciales copiadas (URL y anon key)
- [ ] Archivo `.env` creado con las credenciales
- [ ] Tabla `empresas` creada
- [ ] Tabla `profiles` creada con RLS
- [ ] Empresa de prueba insertada
- [ ] Usuario de prueba creado en Authentication
- [ ] Perfil creado para el usuario
- [ ] `npm install` ejecutado
- [ ] `npm run dev` ejecutado
- [ ] Login probado exitosamente

---

## 🐛 Solución de Problemas Avanzada

### Ver logs de autenticación:

Abre la consola del navegador (F12) y busca errores.

### Verificar conexión a Supabase:

En la consola del navegador, ejecuta:

```javascript
// Debería mostrar tu configuración
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### Probar directamente con Supabase CLI (Opcional):

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Iniciar Supabase localmente (opcional, para desarrollo)
supabase start
```

---

## ✅ Una vez que funcione

Si el login funciona, puedes:

1. **Probar el guardado de sesión**: Cierra el navegador y vuelve a abrir, deberías seguir logueado
2. **Probar logout**: Click en "Salir" en el header
3. **Probar navegación**: Ve a diferentes rutas según tu rol

---

¿Necesitas ayuda con algún paso específico? ¡Pregúntame!

