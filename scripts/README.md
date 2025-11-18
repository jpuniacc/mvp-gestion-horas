# Scripts de Base de Datos

## 📝 insert_test_data.sql

Este script inserta datos de prueba en Supabase para poder probar el sistema completo.

### ✨ Qué incluye:

1. **Empresa de prueba** (`77149001-K`)

2. **3 Proyectos de prueba genéricos:**
   - Proyecto Cliente Principal (PROY-001-2024) - Facturable
   - Proyecto Desarrollo y Consultoría (PROY-002-2024) - Facturable
   - Proyecto Interno / Overhead (INTERNO-2024) - No facturable

3. **Tareas Estándar Universales:**
   - **15 Tareas Globales** (disponibles para todos los proyectos de cualquier industria):
     - Reunión con Cliente
     - Reunión Interna
     - Análisis y Planificación
     - Diseño y Especificación
     - Desarrollo / Implementación
     - Revisión y Control de Calidad
     - Pruebas y Testing
     - Documentación Técnica
     - Documentación Administrativa
     - Capacitación
     - Capacitación a Cliente
     - Administración y Gestión
     - Viajes y Movilización
     - Soporte y Mantenimiento
     - Investigación y Desarrollo
   
   - **5 Tareas Específicas por Proyecto** (ejemplos que cada empresa puede personalizar)

4. **Asignaciones de Proyecto:**
   - Asignaciones para los 3 proyectos
   - Con fechas vigentes (2024-01-01 a 2024-12-31)
   - Con tasas de costo y facturación
   - Roles diferentes

### 🚀 Cómo usar:

1. **Asegúrate de tener:**
   - Una empresa creada con RUT `77149001-K` (el script la crea si no existe)
   - Un usuario creado en Authentication
   - Un perfil creado para ese usuario

2. **Obtén el UUID de tu usuario:**
   ```sql
   SELECT id, email FROM auth.users;
   ```

3. **Abre el SQL Editor en Supabase**

4. **Copia y pega el contenido de `insert_test_data.sql`**

5. **IMPORTANTE:** Si necesitas especificar un usuario específico, reemplaza:
   ```sql
   (SELECT id FROM auth.users LIMIT 1)
   ```
   Por:
   ```sql
   'TU-UUID-AQUI'
   ```

6. **Ejecuta el script**

7. **Verifica los datos:**
   ```sql
   -- Ver proyectos
   SELECT * FROM projects WHERE empresa_rut = '77149001-K';
   
   -- Ver tareas
   SELECT * FROM tasks WHERE empresa_rut = '77149001-K';
   
   -- Ver asignaciones
   SELECT * FROM project_assignments;
   ```

### ✅ Verificación Post-Insert

Después de ejecutar el script, deberías tener:

- ✅ 1 empresa
- ✅ 3 proyectos activos
- ✅ 20 tareas (15 globales + 5 específicas)
- ✅ 3 asignaciones de proyecto

### 📌 Nota sobre Tareas Estándar

Las **15 tareas globales** están diseñadas para ser:
- ✅ **Genéricas**: Aplicables a cualquier tipo de industria
- ✅ **Reutilizables**: Útiles para múltiples tipos de proyectos
- ✅ **Extensibles**: Cada empresa puede agregar sus propias tareas específicas

**En producción**, cada empresa podrá:
- Usar estas tareas estándar como base
- Crear sus propias tareas globales personalizadas
- Crear tareas específicas para cada proyecto
- Configurar tareas según su industria (ingeniería, construcción, consultoría, IT, etc.)

---

## 📌 Notas Importantes

### Multi-tenancy

**Todas las tareas tienen `empresa_rut`** para asegurar que cada empresa vea solo sus propias tareas. Esto es correcto y necesario para el multi-tenant.

### ⚠️ Si tu tabla tasks ya existe sin empresa_rut

Si creaste la tabla `tasks` antes y no tiene el campo `empresa_rut`, ejecuta primero:
```sql
-- Ver script: scripts/migrate_tasks_empresa_rut.sql
```

Este script de migración:
1. Agrega la columna `empresa_rut` si no existe
2. Crea la relación Foreign Key con `empresas(rut)`
3. Crea el índice para mejor performance

### Tareas Globales vs Específicas

- **Tareas Globales** (`is_global = true`): Disponibles para todos los proyectos de la empresa
- **Tareas Específicas** (`is_global = false`): Solo disponibles para el proyecto asignado

### Asignaciones

Las asignaciones solo se crean para el primer usuario encontrado. Si necesitas asignarlas a un usuario específico, modifica el script antes de ejecutarlo.

