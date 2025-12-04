-- =====================================================
-- MULTIPLE CATEGORIES FOR NEWS
-- Migration Script
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. IMPORTANTE: Haz un backup de la tabla news antes de ejecutar
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
--
-- Este script migra la columna 'category' de TEXT a TEXT[]
-- para permitir múltiples categorías por noticia.
-- =====================================================

-- Paso 1: Agregar nueva columna temporal
ALTER TABLE news ADD COLUMN categories TEXT[];

-- Paso 2: Migrar datos existentes (convertir string a array)
UPDATE news 
SET categories = ARRAY[category] 
WHERE category IS NOT NULL;

-- Paso 3: Copiar datos NULL si existen
UPDATE news 
SET categories = ARRAY[]::TEXT[] 
WHERE category IS NULL;

-- Paso 4: Eliminar columna antigua
ALTER TABLE news DROP COLUMN category;

-- Paso 5: Renombrar nueva columna
ALTER TABLE news RENAME COLUMN categories TO category;

-- Paso 6: Agregar constraint para evitar arrays vacíos
ALTER TABLE news 
ADD CONSTRAINT news_category_not_empty 
CHECK (array_length(category, 1) > 0);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que la migración fue exitosa:
--
-- SELECT id, title, category 
-- FROM news 
-- LIMIT 5;
--
-- Deberías ver arrays como: {"Lanzamientos"} o {"Giras", "Lanzamientos"}
-- =====================================================

-- =====================================================
-- ROLLBACK (Si algo sale mal)
-- =====================================================
-- Si necesitas revertir los cambios:
--
-- ALTER TABLE news ADD COLUMN category_backup TEXT;
-- UPDATE news SET category_backup = category[1];
-- ALTER TABLE news DROP COLUMN category;
-- ALTER TABLE news RENAME COLUMN category_backup TO category;
-- =====================================================
