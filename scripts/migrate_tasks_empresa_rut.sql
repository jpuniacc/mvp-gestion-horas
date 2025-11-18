-- =====================================================
-- Migración: Agregar empresa_rut a tabla tasks
-- =====================================================
-- Este script asegura que la tabla tasks tenga el campo empresa_rut
-- con su relación a la tabla empresas para multi-tenant

-- 1. Verificar si la columna empresa_rut ya existe
DO $$
BEGIN
  -- Agregar columna empresa_rut si no existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name = 'empresa_rut'
  ) THEN
    ALTER TABLE tasks 
    ADD COLUMN empresa_rut VARCHAR;
    
    RAISE NOTICE 'Columna empresa_rut agregada a tabla tasks';
  ELSE
    RAISE NOTICE 'Columna empresa_rut ya existe en tabla tasks';
  END IF;
END $$;

-- 2. Crear índice para mejorar performance de búsquedas
CREATE INDEX IF NOT EXISTS idx_tasks_empresa_rut ON tasks(empresa_rut);

-- 3. Agregar Foreign Key constraint si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_empresa_rut_fkey'
  ) THEN
    ALTER TABLE tasks
    ADD CONSTRAINT tasks_empresa_rut_fkey 
    FOREIGN KEY (empresa_rut) 
    REFERENCES empresas(rut) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key tasks_empresa_rut_fkey creado';
  ELSE
    RAISE NOTICE 'Foreign key tasks_empresa_rut_fkey ya existe';
  END IF;
END $$;

-- 4. (OPCIONAL) Actualizar tareas existentes sin empresa_rut
-- Solo ejecutar si tienes tareas existentes que necesiten actualizarse
-- UPDATE tasks 
-- SET empresa_rut = '77149001-K'  -- Reemplaza con el RUT de tu empresa
-- WHERE empresa_rut IS NULL;

-- 5. Hacer la columna NOT NULL si todas las tareas tienen empresa_rut
-- Descomenta solo después de actualizar todas las tareas existentes
-- ALTER TABLE tasks ALTER COLUMN empresa_rut SET NOT NULL;

-- 6. Verificar la estructura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name = 'empresa_rut';

-- 7. Verificar constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tasks'
AND tc.constraint_name = 'tasks_empresa_rut_fkey';

