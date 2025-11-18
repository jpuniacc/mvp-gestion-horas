-- =====================================================
-- Script para insertar datos de prueba en Supabase
-- =====================================================
-- Ejecutar esto en el SQL Editor de Supabase
-- IMPORTANTE: Asegúrate de tener:
--   1. Una empresa creada con RUT '77149001-K'
--   2. Un usuario creado en Authentication
--   3. Un perfil creado para ese usuario

-- 1. Verificar/Crear empresa de prueba (si no existe)
INSERT INTO empresas (rut, razon_social, nombre_fantasia)
VALUES ('77149001-K', 'Empresa de Prueba S.A.', 'Empresa Prueba')
ON CONFLICT (rut) DO NOTHING;

-- 2. Insertar 3 Proyectos de Prueba (genéricos para diferentes tipos de empresas)
INSERT INTO projects (empresa_rut, name, code, client_name, year, status, is_billable_default, description, created_by)
VALUES 
  (
    '77149001-K',
    'Proyecto Cliente Principal',
    'PROY-001-2024',
    'Cliente ABC S.A.',
    2024,
    'active',
    true,
    'Proyecto principal del cliente con servicios profesionales completos',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    '77149001-K',
    'Proyecto Desarrollo y Consultoría',
    'PROY-002-2024',
    'Cliente XYZ Ltda.',
    2024,
    'active',
    true,
    'Servicios de desarrollo y consultoría especializada',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    '77149001-K',
    'Proyecto Interno / Overhead',
    'INTERNO-2024',
    NULL,
    2024,
    'active',
    false,
    'Proyecto interno para gestión administrativa y mejora de procesos',
    (SELECT id FROM auth.users LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- 3. Insertar Tareas Globales Estándar (genéricas para cualquier tipo de empresa)
-- Estas tareas son universales y útiles para diferentes industrias
INSERT INTO tasks (empresa_rut, name, code, is_global, is_active)
VALUES
  ('77149001-K', 'Reunión con Cliente', 'REUNION', true, true),
  ('77149001-K', 'Reunión Interna', 'REUNION-INT', true, true),
  ('77149001-K', 'Análisis y Planificación', 'ANALISIS', true, true),
  ('77149001-K', 'Diseño y Especificación', 'DISEÑO', true, true),
  ('77149001-K', 'Desarrollo / Implementación', 'DESARROLLO', true, true),
  ('77149001-K', 'Revisión y Control de Calidad', 'REVISION', true, true),
  ('77149001-K', 'Pruebas y Testing', 'TESTING', true, true),
  ('77149001-K', 'Documentación Técnica', 'DOC-TECNICA', true, true),
  ('77149001-K', 'Documentación Administrativa', 'DOC-ADMIN', true, true),
  ('77149001-K', 'Capacitación', 'CAPACITACION', true, true),
  ('77149001-K', 'Capacitación a Cliente', 'CAPACITACION-CLI', true, true),
  ('77149001-K', 'Administración y Gestión', 'ADMIN', true, true),
  ('77149001-K', 'Viajes y Movilización', 'VIAJES', true, true),
  ('77149001-K', 'Soporte y Mantenimiento', 'SOPORTE', true, true),
  ('77149001-K', 'Investigación y Desarrollo', 'I+D', true, true)
ON CONFLICT DO NOTHING;

-- 4. Insertar Tareas Específicas por Proyecto (ejemplos personalizados)
-- Las empresas pueden crear sus propias tareas específicas según su industria
-- Estas son solo ejemplos que pueden modificarse según necesidades

-- Tareas para el proyecto "Proyecto Cliente Principal"
INSERT INTO tasks (empresa_rut, name, code, project_id, is_global, is_active)
SELECT 
  '77149001-K',
  'Fase 1: Análisis Inicial',
  'PROY-001-F1',
  p.id,
  false,
  true
FROM projects p
WHERE p.code = 'PROY-001-2024' AND p.empresa_rut = '77149001-K'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (empresa_rut, name, code, project_id, is_global, is_active)
SELECT 
  '77149001-K',
  'Fase 2: Implementación',
  'PROY-001-F2',
  p.id,
  false,
  true
FROM projects p
WHERE p.code = 'PROY-001-2024' AND p.empresa_rut = '77149001-K'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (empresa_rut, name, code, project_id, is_global, is_active)
SELECT 
  '77149001-K',
  'Fase 3: Entrega y Aceptación',
  'PROY-001-F3',
  p.id,
  false,
  true
FROM projects p
WHERE p.code = 'PROY-001-2024' AND p.empresa_rut = '77149001-K'
ON CONFLICT DO NOTHING;

-- Tareas para el proyecto "Proyecto Desarrollo y Consultoría"
INSERT INTO tasks (empresa_rut, name, code, project_id, is_global, is_active)
SELECT 
  '77149001-K',
  'Consultoría Especializada',
  'PROY-002-CONS',
  p.id,
  false,
  true
FROM projects p
WHERE p.code = 'PROY-002-2024' AND p.empresa_rut = '77149001-K'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (empresa_rut, name, code, project_id, is_global, is_active)
SELECT 
  '77149001-K',
  'Implementación de Solución',
  'PROY-002-IMPL',
  p.id,
  false,
  true
FROM projects p
WHERE p.code = 'PROY-002-2024' AND p.empresa_rut = '77149001-K'
ON CONFLICT DO NOTHING;

-- Tareas para el proyecto "Proyecto Interno"
INSERT INTO tasks (empresa_rut, name, code, project_id, is_global, is_active)
SELECT 
  '77149001-K',
  'Mejora de Procesos',
  'INTERNO-PROCESOS',
  p.id,
  false,
  true
FROM projects p
WHERE p.code = 'INTERNO-2024' AND p.empresa_rut = '77149001-K'
ON CONFLICT DO NOTHING;

-- 5. Crear Asignaciones de Proyecto para el usuario actual
-- IMPORTANTE: Reemplaza 'USER_UUID_AQUI' con el UUID de tu usuario
-- Puedes obtenerlo con: SELECT id FROM auth.users WHERE email = 'tu@email.com';

-- Asignación al proyecto "Proyecto Cliente Principal"
INSERT INTO project_assignments (user_id, project_id, role_name, cost_rate, billing_rate, is_billable, start_date, end_date, created_by)
SELECT 
  u.id,
  p.id,
  'Profesional Senior',
  50000,
  120000,
  true,
  '2024-01-01'::date,
  '2024-12-31'::date,
  u.id
FROM auth.users u, projects p
WHERE p.code = 'PROY-001-2024' AND p.empresa_rut = '77149001-K'
  AND u.id = (SELECT id FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Asignación al proyecto "Proyecto Desarrollo y Consultoría"
INSERT INTO project_assignments (user_id, project_id, role_name, cost_rate, billing_rate, is_billable, start_date, end_date, created_by)
SELECT 
  u.id,
  p.id,
  'Consultor Especialista',
  55000,
  130000,
  true,
  '2024-01-01'::date,
  '2024-12-31'::date,
  u.id
FROM auth.users u, projects p
WHERE p.code = 'PROY-002-2024' AND p.empresa_rut = '77149001-K'
  AND u.id = (SELECT id FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Asignación al proyecto "Proyecto Interno" (no facturable)
INSERT INTO project_assignments (user_id, project_id, role_name, cost_rate, billing_rate, is_billable, start_date, created_by)
SELECT 
  u.id,
  p.id,
  'Profesional',
  NULL,
  NULL,
  false,
  '2024-01-01'::date,
  u.id
FROM auth.users u, projects p
WHERE p.code = 'INTERNO-2024' AND p.empresa_rut = '77149001-K'
  AND u.id = (SELECT id FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- 6. Verificar los datos insertados
-- SELECT 'Proyectos creados:' as tipo, COUNT(*) as cantidad FROM projects WHERE empresa_rut = '77149001-K'
-- UNION ALL
-- SELECT 'Tareas creadas:', COUNT(*) FROM tasks WHERE empresa_rut = '77149001-K'
-- UNION ALL
-- SELECT 'Asignaciones creadas:', COUNT(*) FROM project_assignments WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

