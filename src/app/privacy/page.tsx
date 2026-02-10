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

                {/* Informacion recopilada: */}
                <section className={styles.section}>
                    <h2>Información que Recopilamos</h2>
                    <p>Cuando creas una cuenta, recopilamos y almacenamos:</p>
                    <ul>
                        <li>Dirección de correo electrónico</li>
                        <li>Nombre de usuario</li>
                        <li>Foto de perfil</li>
                        <li>Contraseña</li>
                        <li>Fecha de creación de cuenta</li>
                    </ul>

                    <h2>Compartir y Divulgación de Datos</h2>
                    <p>Nos comprometemos a no compartir tus datos personales con terceros con otros fines. A menos que:</p>
                    <ul>
                        <li>Lo requiera la ley, orden judicial o solicitud gubernamental</li>
                        <li>Se investigue fraude, abuso o violaciones de nuestros términos</li>
                        <li>En caso de fusión, adquisición o transferencia de negocio, se notificará a los usuarios</li>
                    </ul>

                    <h2>Tus Derechos de Privacidad</h2>
                    <p>Tienes los siguientes derechos con respecto a tus datos:</p>

                    <ul>
                        <li>Solicitar una copia de todos los datos que tenemos sobre ti</li>
                        <li>Eliminar tu cuenta y todos los datos asociados</li>
                        <li>Optar por no participar en la recopilación de datos no esenciales</li>
                    </ul>
                </section>

                {/* Informacion tecnica: */}
                <section className={styles.section}>
                    <h2>Información Técnica</h2>
                    <p>Nuestros servidores recopilan automáticamente:</p>
                    <ul>
                        <li>Dirección IP</li>
                        <li>Tipo y versión de navegador</li>
                        <li>Sistema Operativo</li>
                        <li>URL de referencia</li>
                        <li>Duración de sesión</li>
                        <li>Último inicio de sesión</li>
                    </ul>
                    <h2>Cookies y Almacenamiento Local</h2>
                    <p>Las cookies son necesarias para que el sitio funcione, bloquearlas te impedirá usar ciertas funciones.</p>
                    <ul>
                        <li>Sesión Activa</li>
                        <li>Estado de Autenticación</li>
                        <li>Configuracion del sitio</li>
                        <li>Datos en caché para acceso sin conexión</li>
                    </ul>
                </section>

                {/* Privacidad de Menores: */}
                <section className={styles.section}>
                    <h2>Privacidad de Menores</h2>
                    <p>Nuestro servicio no está destinado a usuarios menores de 13 años. No recopilamos datos de niños. Si descubrimos que un niño menor de 13 años ha proporcionado información personal, la eliminaremos inmediatamente.</p>
                </section>
            </div>
        </main >
    )
}
