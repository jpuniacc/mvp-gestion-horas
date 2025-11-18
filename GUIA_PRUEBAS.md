# 🧪 Guía de Pruebas - MVP Timesheet

Esta guía te ayudará a probar todas las funcionalidades implementadas.

## ✅ Checklist Pre-Prueba

Antes de probar, asegúrate de tener:

- [ ] Usuario creado en Supabase Authentication
- [ ] Perfil creado en tabla `profiles` con `empresa_rut = '77149001-K'`
- [ ] Scripts SQL ejecutados (`insert_test_data.sql`)
- [ ] Proyecto iniciado: `npm run dev`
- [ ] Login exitoso en la aplicación

---

## 🎯 Prueba 1: Login y Autenticación

### Pasos:
1. Abre `http://localhost:5173`
2. Ingresa credenciales de tu usuario
3. Click en "Iniciar Sesión"

### ✅ Resultado Esperado:
- Redirección a `/timesheet/week`
- Header muestra tu nombre y rol
- Navegación visible según tu rol

---

## 🎯 Prueba 2: Ver Timesheet Semanal

### Pasos:
1. Después del login, deberías estar en la vista semanal
2. Verifica que se muestra:
   - Semana actual (año y número de semana)
   - Rango de fechas
   - Botones de navegación (Anterior/Siguiente)

### ✅ Resultado Esperado:
- Grid semanal vacío (si no hay entradas)
- Badge de estado "Borrador"
- Botones de acción disponibles

---

## 🎯 Prueba 3: Agregar Nueva Fila (Proyecto/Tarea)

### Pasos:
1. Click en **"➕ Agregar Fila"**
2. Debería abrirse un modal
3. Selecciona un proyecto del dropdown
4. (Opcional) Selecciona una tarea
5. Click en **"Agregar"**

### ✅ Resultado Esperado:
- Modal se cierra
- Nueva fila aparece en el grid con:
  - Nombre del proyecto (no el ID)
  - Nombre de la tarea si seleccionaste una
  - Badge "Facturable" si aplica
  - Campos editables para cada día de la semana

### ❌ Si falla:
- Verifica que ejecutaste `insert_test_data.sql`
- Verifica que tienes asignaciones de proyecto activas
- Revisa la consola del navegador (F12) para errores

---

## 🎯 Prueba 4: Ingresar Horas

### Pasos:
1. En la fila creada, ingresa horas en diferentes días
2. Prueba:
   - Horas válidas (ej: 8, 4.5, 2.25)
   - Límite máximo diario (8 horas)
   - Intentar exceder el límite (debería mostrar error)

### ✅ Resultado Esperado:
- Guardado automático después de 500ms
- Total de la fila se actualiza automáticamente
- Total semanal se actualiza
- Si excedes el límite, se muestra error en rojo debajo del campo

---

## 🎯 Prueba 5: Navegar Entre Semanas

### Pasos:
1. Click en **"Siguiente →"** para ir a la próxima semana
2. Click en **"← Anterior"** para volver
3. Click en **"Semana Actual"** para volver a la semana actual

### ✅ Resultado Esperado:
- La URL cambia (ej: `/timesheet/week/2024/45`)
- El grid muestra la semana seleccionada
- Si hay datos, se cargan automáticamente

---

## 🎯 Prueba 6: Enviar para Aprobación

### Pasos:
1. Asegúrate de tener al menos una fila con horas
2. Click en **"Enviar para Aprobación"**
3. Confirma en el diálogo

### ✅ Resultado Esperado:
- Badge de estado cambia a "Enviado" (azul)
- Los campos se bloquean (no editables)
- Botones "Agregar Fila" y "Guardar Borrador" se deshabilitan

---

## 🎯 Prueba 7: Copiar Semana Anterior

### Pasos:
1. Crea horas en la semana actual
2. Navega a la siguiente semana
3. Click en **"Copiar Semana Anterior"**
4. Confirma

### ✅ Resultado Esperado:
- Las filas de la semana anterior se copian
- Horas se copian correctamente
- Puedes editarlas y guardar

---

## 🎯 Prueba 8: Validaciones

### Pasos:
1. Intenta ingresar:
   - Número negativo → Debería prevenir o corregir
   - Más de 8 horas en un día → Debería mostrar error
   - Más de 43 horas en la semana → (validación semanal)
   - Números con más de 2 decimales → Debería aceptar o formatear

### ✅ Resultado Esperado:
- Validaciones en tiempo real
- Mensajes de error claros
- Campos con borde rojo cuando hay error

---

## 🎯 Prueba 9: Visualización de Proyectos

### Pasos:
1. Agrega varias filas con diferentes proyectos
2. Observa cómo se muestran

### ✅ Resultado Esperado:
- Nombre del proyecto visible (ej: "Desarrollo de Sitio Web (WEB-2024)")
- Código del proyecto visible
- Nombre de tarea si aplica
- Badge "Facturable" si corresponde

---

## 🐛 Problemas Comunes

### No aparecen proyectos en el selector

**Causas posibles:**
- No ejecutaste `insert_test_data.sql`
- No tienes asignaciones activas para tu usuario
- Fechas de asignación no cubren la fecha actual

**Solución:**
```sql
-- Verificar asignaciones
SELECT * FROM project_assignments 
WHERE user_id = 'TU-UUID-AQUI';

-- Verificar fechas
SELECT * FROM project_assignments 
WHERE user_id = 'TU-UUID-AQUI'
AND start_date <= CURRENT_DATE
AND (end_date IS NULL OR end_date >= CURRENT_DATE);
```

### Error al guardar entrada

**Causas posibles:**
- RLS bloqueando la inserción
- Falta `timesheet_week` creada
- Campos requeridos faltantes

**Solución:**
- Verifica políticas RLS para `timesheet_entries`
- Verifica que la semana existe en `timesheet_weeks`

### No se ven nombres de proyectos, solo IDs

**Causas:**
- No se cargaron los proyectos en el store
- Error en la consulta

**Solución:**
- Abre la consola del navegador (F12)
- Verifica errores en la pestaña Console
- Verifica que `projectsStore.loadAll()` se ejecutó

---

## 📊 Datos de Prueba Disponibles

Después de ejecutar `insert_test_data.sql`, tienes:

### Proyectos:
- **Proyecto Cliente Principal** (PROY-001-2024) - Facturable
- **Proyecto Desarrollo y Consultoría** (PROY-002-2024) - Facturable  
- **Proyecto Interno** (INTERNO-2024) - No facturable

### Tareas Globales (15):
Disponibles para todos los proyectos

### Tareas Específicas (5):
- Fase 1: Análisis Inicial (PROY-001)
- Fase 2: Implementación (PROY-001)
- Fase 3: Entrega y Aceptación (PROY-001)
- Consultoría Especializada (PROY-002)
- Implementación de Solución (PROY-002)

---

## ✅ Siguiente Paso

Una vez que todas las pruebas pasen, puedes:

1. **Continuar con Fase 2**: Implementar ApprovalsView (aprobaciones)
2. **Mejorar UX**: Agregar más feedback visual, tooltips, etc.
3. **Agregar funcionalidades faltantes**: Notas en entradas, archivos adjuntos, etc.

---

¿Todo funcionando? ¡Avísame y continuamos con la siguiente fase! 🚀

