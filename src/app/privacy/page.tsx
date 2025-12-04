"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/pages/Legal.module.css"

export default function PrivacyPage() {
    const { t } = useLanguage()
    const lastUpdated = "3 de diciembre de 2025"

    return (
        <main className="page-main">
            <div className={styles.legal_container}>
                <h1 className={styles.title}>Política de Privacidad</h1>
                <p className={styles.updated}>Última actualización: {lastUpdated}</p>

                <section className={styles.section}>
                    <p className={styles.intro}>
                        En Music Discovery, estamos comprometidos con proteger tu privacidad y ser transparentes sobre qué datos recopilamos y cómo los usamos. Esta política explica en detalle toda la información que nuestro sitio web recopila, almacena y utiliza.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>1. Información que Recopilamos</h2>

                    <h3>1.1 Información de Cuenta</h3>
                    <p>Cuando creas una cuenta, recopilamos y almacenamos:</p>
                    <ul>
                        <li><strong>Dirección de correo electrónico</strong> - Requerido para la creación de cuenta y comunicación</li>
                        <li><strong>Nombre de usuario</strong> - Tu nombre de visualización elegido</li>
                        <li><strong>Nombre completo</strong> - Opcional, para personalización del perfil</li>
                        <li><strong>Foto de perfil</strong> - Opcional, si eliges subir una</li>
                        <li><strong>Contraseña</strong> - Cifrada y hasheada de forma segura (nunca almacenamos contraseñas en texto plano)</li>
                        <li><strong>Fecha de creación de cuenta</strong> - Marca de tiempo de cuando te uniste</li>
                    </ul>

                    <h3>1.2 Datos de Actividad</h3>
                    <p>Para proporcionar funciones personalizadas, recopilamos:</p>
                    <ul>
                        <li><strong>Artistas favoritos</strong> - Artistas que has marcado como favoritos</li>
                        <li><strong>Comentarios</strong> - Contenido de texto, marca de tiempo y artículo de noticias asociado</li>
                        <li><strong>Contador de vistas</strong> - Número de veces que has visto artículos/perfiles</li>
                        <li><strong>Último inicio de sesión</strong> - Marca de tiempo de tu sesión más reciente</li>
                    </ul>

                    <h3>1.3 Información Técnica</h3>
                    <p>Nuestros servidores recopilan automáticamente:</p>
                    <ul>
                        <li><strong>Dirección IP</strong> - Usada para seguridad y limitación de tasa</li>
                        <li><strong>Tipo y versión de navegador</strong> - Chrome, Firefox, Safari, etc.</li>
                        <li><strong>Sistema Operativo</strong> - Windows, macOS, Linux, iOS, Android</li>
                        <li><strong>Información del dispositivo</strong> - Móvil, tablet o escritorio</li>
                        <li><strong>Resolución de pantalla</strong> - Para optimización de diseño responsivo</li>
                        <li><strong>URL de referencia</strong> - De dónde vienes (si aplica)</li>
                        <li><strong>Duración de sesión</strong> - Cuánto tiempo permaneces en el sitio</li>
                        <li><strong>Páginas visitadas</strong> - Ruta de navegación a través de nuestro sitio</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>2. Cookies y Almacenamiento Local</h2>

                    <h3>2.1 Cookies Esenciales</h3>
                    <p>Usamos las siguientes cookies que son necesarias para que el sitio funcione:</p>
                    <ul>
                        <li><strong>Token de Sesión</strong> - Te mantiene conectado (expira cuando cierras sesión o después de 7 días)</li>
                        <li><strong>Token CSRF</strong> - Medida de seguridad para prevenir falsificación de peticiones entre sitios</li>
                        <li><strong>Estado de Autenticación</strong> - Gestiona tu estado de inicio de sesión</li>
                    </ul>

                    <h3>2.2 Cookies de Preferencia</h3>
                    <ul>
                        <li><strong>Preferencia de tema (musicdisc-theme)</strong> - Guarda tu elección de modo oscuro/claro</li>
                        <li><strong>Preferencia de idioma</strong> - Recuerda tu idioma seleccionado</li>
                        <li><strong>Configuración de filtros</strong> - Guarda tus últimos filtros usados en páginas de noticias/artistas</li>
                        <li><strong>Posición de desplazamiento</strong> - Restaura tu posición al navegar hacia atrás</li>
                    </ul>

                    <h3>2.3 Datos de Almacenamiento Local</h3>
                    <p>Almacenamos lo siguiente en el almacenamiento local de tu navegador:</p>
                    <ul>
                        <li>Posición de desplazamiento de noticias (datos temporales de sesión)</li>
                        <li>Últimos filtros aplicados (selecciones de categoría)</li>
                        <li>Datos en caché para acceso sin conexión (eliminados periódicamente)</li>
                    </ul>

                    <h3>2.4 Cómo Gestionar las Cookies</h3>
                    <p>Puedes controlar las cookies a través de la configuración de tu navegador:</p>
                    <ul>
                        <li>Chrome: Configuración → Privacidad y Seguridad → Cookies</li>
                        <li>Firefox: Configuración → Privacidad y Seguridad → Cookies y Datos del Sitio</li>
                        <li>Safari: Preferencias → Privacidad → Administrar Datos del Sitio Web</li>
                    </ul>
                    <p><strong>Nota:</strong> Bloquear las cookies esenciales te impedirá iniciar sesión o usar ciertas funciones.</p>
                </section>

                <section className={styles.section}>
                    <h2>3. Cómo Usamos tu Información</h2>
                    <p>Usamos los datos recopilados para los siguientes propósitos:</p>
                    <ul>
                        <li><strong>Gestión de Cuenta</strong> - Crear, mantener y asegurar tu cuenta</li>
                        <li><strong>Personalización</strong> - Mostrar tus favoritos, recordar preferencias</li>
                        <li><strong>Seguridad</strong> - Limitación de tasa, prevención de fraude, detección de spam</li>
                        <li><strong>Analíticas</strong> - Entender cómo los usuarios interactúan con nuestro sitio (solo datos agregados anonimizados)</li>
                        <li><strong>Rendimiento</strong> - Optimizar tiempos de carga y experiencia de usuario</li>
                        <li><strong>Comunicación</strong> - Enviar notificaciones importantes relacionadas con la cuenta (NO enviamos correos de marketing)</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>4. Almacenamiento y Seguridad de Datos</h2>

                    <h3>4.1 Dónde Almacenamos los Datos</h3>
                    <p>Todos los datos de usuario se almacenan de forma segura usando:</p>
                    <ul>
                        <li><strong>Supabase</strong> - Nuestro proveedor de base de datos (basado en PostgreSQL, seguridad estándar de la industria)</li>
                        <li><strong>Ubicación:</strong> Servidores en la nube con redundancia geográfica</li>
                        <li><strong>Cifrado:</strong> Datos cifrados en reposo y en tránsito (TLS/SSL)</li>
                    </ul>

                    <h3>4.2 Medidas de Seguridad</h3>
                    <ul>
                        <li>Hashing de contraseñas usando algoritmo bcrypt</li>
                        <li>Seguridad a Nivel de Fila (RLS) en la base de datos</li>
                        <li>Cifrado HTTPS para todas las conexiones</li>
                        <li>Limitación de tasa para prevenir abusos</li>
                        <li>Auditorías y actualizaciones de seguridad regulares</li>
                        <li>Sin scripts de analíticas o rastreo de terceros</li>
                    </ul>

                    <h3>4.3 Retención de Datos</h3>
                    <ul>
                        <li><strong>Cuentas activas:</strong> Datos retenidos mientras la cuenta exista</li>
                        <li><strong>Cuentas eliminadas:</strong> Datos personales eliminados en 30 días</li>
                        <li><strong>Comentarios:</strong> Retenidos indefinidamente (nombre de usuario eliminado si se elimina la cuenta)</li>
                        <li><strong>Analíticas:</strong> Datos agregados retenidos para monitoreo de rendimiento</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>5. Servicios de Terceros</h2>
                    <p>Usamos los siguientes servicios externos:</p>

                    <h3>5.1 Supabase (Base de Datos y Autenticación)</h3>
                    <ul>
                        <li>Propósito: Autenticación de usuario y almacenamiento de datos</li>
                        <li>Datos compartidos: Correo electrónico, información de perfil, contenido generado por usuario</li>
                        <li>Política de Privacidad: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></li>
                    </ul>

                    <h3>5.2 Embeds de Spotify (Opcional)</h3>
                    <ul>
                        <li>Propósito: Widgets de reproducción de música</li>
                        <li>Datos compartidos: Tu dirección IP cuando reproduces una canción</li>
                        <li>Política de Privacidad: <a href="https://www.spotify.com/privacy" target="_blank" rel="noopener noreferrer">spotify.com/privacy</a></li>
                        <li><strong>Nota:</strong> Los widgets de Spotify solo se cargan cuando los ves explícitamente</li>
                    </ul>

                    <h3>5.3 Google Fonts y Boxicons</h3>
                    <ul>
                        <li>Propósito: Tipografía e iconos</li>
                        <li>Datos compartidos: Tu dirección IP (petición HTTP estándar)</li>
                        <li>Alternativas: Estamos considerando auto-hospedar las fuentes en futuras actualizaciones</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>6. Compartir y Divulgación de Datos</h2>
                    <p><strong>NO vendemos, alquilamos ni compartimos tus datos personales con terceros con fines de marketing.</strong></p>

                    <p>Podemos divulgar datos solo en estos casos específicos:</p>
                    <ul>
                        <li><strong>Obligación legal:</strong> Si lo requiere la ley, orden judicial o solicitud gubernamental</li>
                        <li><strong>Seguridad:</strong> Para investigar fraude, abuso o violaciones de nuestros términos</li>
                        <li><strong>Transferencia de negocio:</strong> En caso de fusión o adquisición (se notificará a los usuarios)</li>
                        <li><strong>Con tu consentimiento:</strong> Cualquier otro intercambio requerirá permiso explícito</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>7. Tus Derechos de Privacidad</h2>
                    <p>Tienes los siguientes derechos con respecto a tus datos:</p>

                    <h3>7.1 Acceso</h3>
                    <p>Solicitar una copia de todos los datos que tenemos sobre ti (Perfil → Ajustes → Descargar Mis Datos - próximamente)</p>

                    <h3>7.2 Corrección</h3>
                    <p>Actualizar tu información de perfil en cualquier momento a través de Ajustes</p>

                    <h3>7.3 Eliminación</h3>
                    <p>Eliminar tu cuenta y todos los datos asociados (Ajustes → Eliminar Cuenta)</p>

                    <h3>7.4 Portabilidad</h3>
                    <p>Exportar tus datos en formato JSON (próximamente)</p>

                    <h3>7.5 Objeción</h3>
                    <p>Optar por no participar en la recopilación de datos no esenciales (contáctanos)</p>
                </section>

                <section className={styles.section}>
                    <h2>8. Privacidad de Menores</h2>
                    <p>Nuestro servicio no está destinado a usuarios menores de 13 años. No recopilamos datos de niños a sabiendas. Si descubrimos que un niño menor de 13 años ha proporcionado información personal, la eliminaremos inmediatamente. Los padres/tutores deben contactarnos si esto ocurre.</p>
                </section>

                <section className={styles.section}>
                    <h2>9. Usuarios Internacionales</h2>
                    <p>Este servicio se opera desde los Estados Unidos. Si accedes desde la UE/EEE, tienes derechos adicionales bajo el RGPD. Contáctanos para ejercer estos derechos.</p>
                </section>

                <section className={styles.section}>
                    <h2>10. Cambios a Esta Política</h2>
                    <p>Podemos actualizar esta política de privacidad periódicamente. Los cambios se publicarán en esta página con una fecha de "Última actualización" actualizada. Los cambios significativos se comunicarán por correo electrónico a los usuarios registrados.</p>
                </section>

                <section className={styles.section}>
                    <h2>11. Contáctanos</h2>
                    <p>Para preguntas relacionadas con la privacidad, solicitudes de datos o inquietudes, contáctanos en:</p>
                    <ul>
                        <li><strong>Correo electrónico:</strong> privacy@musicdiscovery.app (reemplaza con tu contacto real)</li>
                        <li><strong>Tiempo de respuesta:</strong> Nuestro objetivo es responder en 48 horas</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <div className={styles.summary_box}>
                        <h3>📋 Resumen Rápido</h3>
                        <p><strong>Lo que recopilamos:</strong> Correo electrónico, nombre de usuario, datos de perfil, favoritos, comentarios, dirección IP, información del navegador</p>
                        <p><strong>Cookies:</strong> Sesión, preferencia de tema, idioma, filtros (todas esenciales o basadas en preferencias)</p>
                        <p><strong>Terceros:</strong> Supabase (hosting), Spotify (embeds), Google (fuentes)</p>
                        <p><strong>Tus derechos:</strong> Acceso, corrección, eliminación, portabilidad</p>
                        <p><strong>NO hacemos:</strong> Vender datos, usar anuncios de rastreo, enviar spam, compartir con marketers</p>
                    </div>
                </section>
            </div>
        </main>
    )
}
