-- =====================================================
-- SUPABASE DATABASE INDEXES
-- Music Discovery App - Performance Optimization
-- =====================================================
-- 
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Copia y pega este script
-- 3. Ejecuta el script
--
-- Estos índices mejoran el rendimiento de las queries
-- más comunes en la aplicación.
-- =====================================================

-- =========================
-- ARTISTAS
-- =========================

-- Filtro por género (usado en página de artistas)
CREATE INDEX IF NOT EXISTS idx_artists_genre 
ON artists(genre);

-- Filtro de artistas destacados
CREATE INDEX IF NOT EXISTS idx_artists_is_top 
ON artists(is_top) 
WHERE is_top = true;

-- Ordenamiento por seguidores (más popular primero)
CREATE INDEX IF NOT EXISTS idx_artists_followers_desc 
ON artists(followers_count DESC);

-- Búsqueda por nombre (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_artists_name_lower 
ON artists(LOWER(name));

-- =========================
-- NOTICIAS
-- =========================

-- Filtro por categoría
CREATE INDEX IF NOT EXISTS idx_news_category 
ON news(category);

-- Ordenamiento por fecha de publicación
CREATE INDEX IF NOT EXISTS idx_news_published_desc 
ON news(published_at DESC);

-- Índice compuesto para listado con categoría
CREATE INDEX IF NOT EXISTS idx_news_category_published 
ON news(category, published_at DESC);

-- =========================
-- COMENTARIOS
-- =========================

-- Comentarios por noticia (muy usado)
CREATE INDEX IF NOT EXISTS idx_comments_news_id 
ON comments(news_id);

-- Ordenamiento de comentarios por fecha
CREATE INDEX IF NOT EXISTS idx_comments_created_desc 
ON comments(news_id, created_at DESC);

-- =========================
-- CANCIONES
-- =========================

-- Canciones por artista
CREATE INDEX IF NOT EXISTS idx_songs_artist_id 
ON songs(artist_id);

-- Top canciones por reproducciones
CREATE INDEX IF NOT EXISTS idx_songs_plays_desc 
ON songs(artist_id, plays_count DESC);

-- =========================
-- ALBUMS
-- =========================

-- Albums por artista
CREATE INDEX IF NOT EXISTS idx_albums_artist_id 
ON albums(artist_id);

-- Albums ordenados por año
CREATE INDEX IF NOT EXISTS idx_albums_year_desc 
ON albums(artist_id, release_year DESC);

-- =========================
-- PERFILES
-- =========================

-- Búsqueda por username
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que los índices se crearon correctamente:
--
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public';
-- =====================================================
