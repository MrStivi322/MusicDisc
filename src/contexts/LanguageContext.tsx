"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'es'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const translations = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.artists': 'Artists',
        'nav.news': 'News',
        'nav.login': 'Login',
        'nav.signup': 'Sign Up',

        // User Menu
        'user.profile': 'Profile',
        'user.settings': 'Settings',
        'user.logout': 'Logout',
        'user.anonymous': 'Anonymous',

        // Settings
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.language.desc': 'Select your preferred language for the interface.',
        'settings.personal_info': 'Personal Information',
        'settings.security': 'Security',
        'settings.change_password': 'Change Password',
        'settings.edit': 'Edit',
        'settings.cancel': 'Cancel',
        'settings.avatar.change': 'Change Avatar',
        'settings.avatar.uploading': 'Uploading...',
        'settings.avatar.success': 'Avatar uploaded successfully!',
        'settings.form.username': 'Username',
        'settings.form.email': 'Email',
        'settings.form.current_password': 'Current Password',
        'settings.form.new_password': 'New Password',
        'settings.form.confirm_password': 'Confirm Password',
        'settings.form.save': 'Save Changes',
        'settings.form.saving': 'Saving...',
        'settings.form.update_password': 'Update Password',
        'settings.profile.success': 'Profile updated successfully!',
        'settings.password.success': 'Password updated successfully!',
        'settings.error.password_mismatch': 'Passwords do not match',
        'settings.error.password_length': 'Password must be at least 6 characters',
        'settings.error.current_password_incorrect': 'Incorrect current password',
        'settings.error.file_size': 'File size must be less than 5MB',
        'settings.security.last_changed': 'Last Password Change',
        'settings.security.level': 'Security Level',
        'settings.security.weak': 'Weak',
        'settings.security.medium': 'Medium',
        'settings.security.strong': 'Strong',
        'settings.security.never': 'Never',

        // Auth
        'auth.login.title': 'Sign in to your account',
        'auth.login.subtitle': "Don't have an account?",
        'auth.login.cta': 'Sign up',
        'auth.login.button': 'Sign in',
        'auth.login.signing_in': 'Signing in...',
        'auth.signup.title': 'Create your account',
        'auth.signup.subtitle': 'Already have an account?',
        'auth.signup.cta': 'Sign in',
        'auth.signup.button': 'Create Account',
        'auth.signup.creating': 'Creating account...',
        'auth.form.email': 'Email address',
        'auth.form.password': 'Password',
        'auth.form.username': 'Username',
        'auth.form.confirm_password': 'Confirm Password',
        'auth.error.password_match': 'Passwords do not match',
        'auth.error.password_length': 'Password must be at least 6 characters',
        'auth.error.password_symbol': 'Password must contain at least one symbol',
        'auth.error.username_required': 'Username is required',
        'auth.error.username_length': 'Username must be at least 3 characters',
        'auth.error.email_required': 'Email is required',
        'auth.error.email_invalid': 'Please enter a valid email address',

        // News
        'news.title': 'Music News',
        'news.subtitle': 'Stay updated with the latest stories, reviews, and industry insights from the music world.',
        'news.loading': 'Loading news...',
        'news.empty': 'No news found in this category.',
        'news.views': 'views',
        'news.comments.title': 'Comments',
        'news.comments.placeholder': 'Leave a comment...',
        'news.comments.post': 'Post Comment',
        'news.comments.posting': 'Posting...',
        'news.comments.login_prompt': 'Please login to leave a comment.',
        'news.comments.empty': 'No comments yet. Be the first to comment!',

        // Artists
        'artists.title': 'Discover Artists',
        'artists.subtitle': 'Find your new favorite sound from our curated collection. Filter by genre or popularity.',
        'artists.search_placeholder': 'Search artists...',
        'artists.top_only': 'Top Artists Only',
        'artists.show_top': 'Show Top Artists',
        'artists.clear': 'Clear Filters',
        'artists.found': 'found',
        'artists.loading': 'Loading artists...',
        'artists.empty': 'No artists found',
        'artists.empty_desc': 'Try adjusting your search or filters',
        'artist.about': 'About',
        'artist.popular_songs': 'Popular Songs',
        'artist.discography': 'Discography',
        'artist.listeners': 'Monthly Listeners',
        'artist.top_songs': 'Top Songs',
        'artist.albums': 'Albums',
        'artist.total_plays': 'Total Plays',
        'artist.plays': 'plays',
        'artist.not_found': 'Artist not found',
        'artist.stats': 'Artist Stats',
        'artist.now_playing': 'Now Playing',

        // Home
        'home.hero.badge': 'Discover New Music',
        'home.hero.title': 'Discover Your Next Favorite Artist',
        'home.hero.subtitle': 'Explore a world of music, from chart-topping hits to underground gems.',
        'home.hero.cta': 'Start Listening',
        'home.scroll': 'Scroll to explore',
        'home.featured.title': 'Featured Artists',
        'home.featured.subtitle': 'Hand-picked artists making waves right now.',
        'home.news.title': 'Latest News',
        'home.news.subtitle': "What's happening in the music world.",
        'home.contact.title': 'Get in Touch',
        'home.contact.subtitle': "We'd love to hear from you.",
        'home.contact.cta': 'Contact Us',
        'home.popularSongs.title': 'Popular Songs',
        'home.stats.artists': 'Artists',
        'home.stats.news': 'News Articles',
        'home.stats.updates': 'Updates',
        'home.features.title': 'Why Choose MusicDisc?',
        'home.features.discover.title': 'Discover',
        'home.features.discover.desc': 'Explore thousands of artists from every genre',
        'home.features.news.title': 'Stay Updated',
        'home.features.news.desc': 'Latest music news and releases daily',
        'home.features.listen.title': 'Listen',
        'home.features.listen.desc': 'Preview tracks directly from Spotify',
        'home.features.save.title': 'Save Favorites',
        'home.features.save.desc': 'Create your personal music collection',

        // Contact
        'contact.title': 'Contact Us',
        'contact.subtitle': "Have questions or suggestions? We'd love to hear from you.",
        'contact.form.name': 'Name',
        'contact.form.name_placeholder': 'Your name',
        'contact.form.email': 'Email',
        'contact.form.email_placeholder': 'your@email.com',
        'contact.form.message': 'Message',
        'contact.form.message_placeholder': 'How can we help you?',
        'contact.form.send': 'Send Message',
        'contact.form.sending': 'Sending...',
        'contact.form.success': 'Message sent successfully!',
        'contact.form.error': 'Error sending message. Please try again.',
        'contact.social.title': 'Social Media',

        // Footer
        'footer.description': 'Discover new artists, explore music news, and stay connected with the global music community.',
        'footer.platform': 'Platform',
        'footer.resources': 'Resources',
        'footer.legal': 'Legal',
        'footer.about': 'About',
        'footer.contact': 'Contact',
        'footer.faq': 'FAQ',
        'footer.help': 'Help Center',
        'footer.api': 'API',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.cookies': 'Cookie Policy',
        'footer.rights': 'All rights reserved.',
        'footer.secure': 'Secure',
        'footer.trusted': 'Trusted',

        // Genres (no need to translate, they're universal)
        'genre.Pop': 'Pop',
        'genre.Rock': 'Rock',
        'genre.Indie': 'Indie',
        'genre.Hip Hop': 'Hip Hop',
        'genre.Rap': 'Rap',
        'genre.Electronic': 'Electronic',
        'genre.Jazz': 'Jazz',
        'genre.Classical': 'Classical',
        'genre.Metal': 'Metal',
        'genre.Country': 'Country',
        'genre.R&B': 'R&B',

        // Categories
        'category.Industry': 'Industry',
        'category.Reviews': 'Reviews',
        'category.Releases': 'Releases',
        'category.Live': 'Live',
    },
    es: {
        // Navigation
        'nav.home': 'Inicio',
        'nav.artists': 'Artistas',
        'nav.news': 'Noticias',
        'nav.login': 'Iniciar Sesión',
        'nav.signup': 'Registrarse',

        // User Menu
        'user.profile': 'Perfil',
        'user.settings': 'Ajustes',
        'user.logout': 'Cerrar Sesión',
        'user.anonymous': 'Anónimo',

        // Settings
        'settings.title': 'Ajustes',
        'settings.language': 'Idioma',
        'settings.language.desc': 'Selecciona tu idioma preferido para la interfaz.',
        'settings.personal_info': 'Información Personal',
        'settings.security': 'Seguridad',
        'settings.change_password': 'Cambiar Contraseña',
        'settings.edit': 'Editar',
        'settings.cancel': 'Cancelar',
        'settings.avatar.change': 'Cambiar Avatar',
        'settings.avatar.uploading': 'Subiendo...',
        'settings.avatar.success': '¡Avatar subido con éxito!',
        'settings.form.username': 'Nombre de usuario',
        'settings.form.email': 'Correo electrónico',
        'settings.form.current_password': 'Contraseña Actual',
        'settings.form.new_password': 'Nueva Contraseña',
        'settings.form.confirm_password': 'Confirmar Contraseña',
        'settings.form.save': 'Guardar Cambios',
        'settings.form.saving': 'Guardando...',
        'settings.form.update_password': 'Actualizar Contraseña',
        'settings.profile.success': '¡Perfil actualizado con éxito!',
        'settings.password.success': '¡Contraseña actualizada con éxito!',
        'settings.error.password_mismatch': 'Las contraseñas no coinciden',
        'settings.error.password_length': 'La contraseña debe tener al menos 6 caracteres',
        'settings.error.current_password_incorrect': 'La contraseña actual es incorrecta',
        'settings.error.file_size': 'El archivo debe pesar menos de 5MB',
        'settings.security.last_changed': 'Último cambio de contraseña',
        'settings.security.level': 'Nivel de seguridad',
        'settings.security.weak': 'Débil',
        'settings.security.medium': 'Medio',
        'settings.security.strong': 'Fuerte',
        'settings.security.never': 'Nunca',

        // Auth
        'auth.login.title': 'Inicia sesión en tu cuenta',
        'auth.login.subtitle': '¿No tienes una cuenta?',
        'auth.login.cta': 'Regístrate',
        'auth.login.button': 'Iniciar sesión',
        'auth.login.signing_in': 'Iniciando sesión...',
        'auth.signup.title': 'Crea tu cuenta',
        'auth.signup.subtitle': '¿Ya tienes una cuenta?',
        'auth.signup.cta': 'Inicia sesión',
        'auth.signup.button': 'Crear Cuenta',
        'auth.signup.creating': 'Creando cuenta...',
        'auth.form.email': 'Correo electrónico',
        'auth.form.password': 'Contraseña',
        'auth.form.username': 'Nombre de usuario',
        'auth.form.confirm_password': 'Confirmar Contraseña',
        'auth.error.password_match': 'Las contraseñas no coinciden',
        'auth.error.password_length': 'La contraseña debe tener al menos 6 caracteres',
        'auth.error.password_symbol': 'La contraseña debe contener al menos un símbolo',
        'auth.error.username_required': 'El nombre de usuario es obligatorio',
        'auth.error.username_length': 'El nombre de usuario debe tener al menos 3 caracteres',
        'auth.error.email_required': 'El correo electrónico es obligatorio',
        'auth.error.email_invalid': 'Por favor introduce un correo válido',

        // News
        'news.title': 'Noticias Musicales',
        'news.subtitle': 'Mantente actualizado con las últimas historias, reseñas y noticias de la industria musical.',
        'news.loading': 'Cargando noticias...',
        'news.empty': 'No se encontraron noticias en esta categoría.',
        'news.views': 'vistas',
        'news.comments.title': 'Comentarios',
        'news.comments.placeholder': 'Deja un comentario...',
        'news.comments.post': 'Publicar Comentario',
        'news.comments.posting': 'Publicando...',
        'news.comments.login_prompt': 'Por favor inicia sesión para dejar un comentario.',
        'news.comments.empty': 'Aún no hay comentarios. ¡Sé el primero en comentar!',

        // Artists
        'artists.title': 'Descubrir Artistas',
        'artists.subtitle': 'Encuentra tu nuevo sonido favorito en nuestra colección curada. Filtra por género o popularidad.',
        'artists.search_placeholder': 'Buscar artistas...',
        'artists.top_only': 'Solo Top Artistas',
        'artists.show_top': 'Mostrar Top Artistas',
        'artists.clear': 'Limpiar Filtros',
        'artists.found': 'encontrados',
        'artists.loading': 'Cargando artistas...',
        'artists.empty': 'No se encontraron artistas',
        'artists.empty_desc': 'Intenta ajustar tu búsqueda o filtros',
        'artist.about': 'Acerca de',
        'artist.popular_songs': 'Canciones Populares',
        'artist.discography': 'Discografía',
        'artist.listeners': 'Oyentes Mensuales',
        'artist.top_songs': 'Top Canciones',
        'artist.albums': 'Álbumes',
        'artist.total_plays': 'Reproducciones Totales',
        'artist.plays': 'reproducciones',
        'artist.not_found': 'Artista no encontrado',
        'artist.stats': 'Estadísticas del Artista',
        'artist.now_playing': 'Reproduciendo Ahora',

        // Home
        'home.hero.badge': 'Descubre Nueva Música',
        'home.hero.title': 'Descubre tu Próximo Artista Favorito',
        'home.hero.subtitle': 'Explora un mundo de música, desde éxitos de las listas hasta joyas underground.',
        'home.hero.cta': 'Empezar a Escuchar',
        'home.scroll': 'Desplázate para explorar',
        'home.featured.title': 'Artistas Destacados',
        'home.featured.subtitle': 'Artistas seleccionados que están marcando tendencia ahora mismo.',
        'home.news.title': 'Últimas Noticias',
        'home.news.subtitle': 'Lo que está pasando en el mundo de la música.',
        'home.contact.title': 'Ponte en Contacto',
        'home.contact.subtitle': 'Nos encantaría saber de ti.',
        'home.contact.cta': 'Contáctanos',
        'home.popularSongs.title': 'Canciones Populares',
        'home.stats.artists': 'Artistas',
        'home.stats.news': 'Artículos',
        'home.stats.updates': 'Actualizaciones',
        'home.features.title': '¿Por qué elegir MusicDisc?',
        'home.features.discover.title': 'Descubre',
        'home.features.discover.desc': 'Explora artistas de todos los géneros',
        'home.features.news.title': 'Mantente Actualizado',
        'home.features.news.desc': 'Últimas noticias musicales y lanzamientos diarios',
        'home.features.listen.title': 'Escucha',
        'home.features.listen.desc': 'Previsualiza canciones directamente desde Spotify',
        'home.features.save.title': 'Guarda Favoritos',
        'home.features.save.desc': 'Crea tu colección personal de música',

        // Contact
        'contact.title': 'Contáctanos',
        'contact.subtitle': '¿Tienes preguntas o sugerencias? Nos encantaría escucharte.',
        'contact.form.name': 'Nombre',
        'contact.form.name_placeholder': 'Tu nombre',
        'contact.form.email': 'Correo Electrónico',
        'contact.form.email_placeholder': 'tu@correo.com',
        'contact.form.message': 'Mensaje',
        'contact.form.message_placeholder': 'Escribe tu mensaje',
        'contact.form.send': 'Enviar Mensaje',
        'contact.form.sending': 'Enviando...',
        'contact.form.success': '¡Mensaje enviado con éxito!',
        'contact.form.error': 'Error al enviar el mensaje. Inténtalo de nuevo.',
        'contact.social.title': 'Redes Sociales',

        // Footer
        'footer.description': 'Descubre nuevos artistas, explora noticias musicales y mantente conectado con la comunidad musical global.',
        'footer.platform': 'Plataforma',
        'footer.resources': 'Recursos',
        'footer.legal': 'Legal',
        'footer.about': 'Acerca de',
        'footer.contact': 'Contacto',
        'footer.faq': 'Preguntas Frecuentes',
        'footer.help': 'Centro de Ayuda',
        'footer.api': 'API',
        'footer.privacy': 'Política de Privacidad',
        'footer.terms': 'Términos de Servicio',
        'footer.cookies': 'Política de Cookies',
        'footer.rights': 'Todos los derechos reservados.',
        'footer.secure': 'Seguro',
        'footer.trusted': 'Confiable',

        // Genres
        'genre.Pop': 'Pop',
        'genre.Rock': 'Rock',
        'genre.Indie': 'Indie',
        'genre.Hip Hop': 'Hip Hop',
        'genre.Rap': 'Rap',
        'genre.Electronic': 'Electrónica',
        'genre.Jazz': 'Jazz',
        'genre.Classical': 'Clásica',
        'genre.Metal': 'Metal',
        'genre.Country': 'Country',
        'genre.R&B': 'R&B',

        // Categories
        'category.Industry': 'Industria',
        'category.Reviews': 'Reseñas',
        'category.Releases': 'Lanzamientos',
        'category.Live': 'En Vivo',
    },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es')

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language
        if (savedLang && Object.keys(translations).includes(savedLang)) {
            setLanguageState(savedLang)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('language', lang)
    }

    const t = (key: string): string => {
        const langData = translations[language] as Record<string, string>
        return langData[key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
