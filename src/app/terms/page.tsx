"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import styles from "@/styles/pages/Legal.module.css"

export default function TermsPage() {
    const { t } = useLanguage()
    const lastUpdated = "3 de diciembre de 2025"

    return (
        <main className="page-main">
            <div className={styles.legal_container}>
                <h1 className={styles.title}>Términos de Servicio</h1>
                <p className={styles.updated}>Última actualización: {lastUpdated}</p>
                <p className={styles.intro}>
                    ¡Bienvenido a Music Discovery! Estos Términos de Servicio rigen el uso de nuestro sitio web y servicios. Al crear una cuenta o usar nuestra plataforma, aceptas estos términos.
                </p>

                <section className={styles.section}>
                    <h2>Requisito de Edad</h2>
                    <p>Debes tener al menos 13 años para usar este servicio. Al usar Music Discovery, declaras y garantizas que cumples con este requisito de edad.</p>
                </section>

                <section className={styles.section}>
                    <h2>Seguridad de la Cuenta</h2>
                    <p><strong>Eres responsable de:</strong></p>
                    <ul>
                        <li>Mantener la confidencialidad de tu contraseña</li>
                        <li>Todas las actividades que ocurran bajo tu cuenta</li>
                        <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
                    </ul>
                    <p>No somos responsables de ninguna pérdida o daño que surja de tu falta de protección de las credenciales de tu cuenta.</p>

                    <p>Aceptas proporcionar información precisa, actual y completa, y actualizarla según sea necesario para mantener su exactitud.</p>

                    <p>Cada persona solo puede crear una cuenta. Crear múltiples cuentas para eludir prohibiciones o restricciones está prohibido.</p>
                </section>

                <section className={styles.section}>
                    <h2>Actividades Prohibidas</h2>
                    <ul>
                        <li><strong>Spam y contenido promocional</strong></li>
                        <li><strong>Acoso</strong></li>
                        <li><strong>Discurso de odio</strong></li>
                        <li><strong>Contenido ilegal o contenido que viole cualquier ley</strong></li>
                        <li><strong>Hacer suplantación de identidad</strong></li>
                        <li><strong>Difundir información falsa</strong></li>
                        <li><strong>Infracción de derechos de autor</strong></li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Contenido Generado por el Usuario</h2>
                    <p>Cuando publicas comentarios o subes información de perfil, nos otorgas:</p>
                    <ul>
                        <li>Una licencia no exclusiva, mundial y libre de regalías para usar, mostrar y distribuir tu contenido</li>
                        <li>El derecho a moderar, eliminar o editar contenido que viole estos Términos</li>
                    </ul>
                    <p><strong>Conservas la propiedad de tu contenido.</strong> Solo necesitamos estos derechos para operar la plataforma.</p>
                    <p>Eres el único responsable del contenido que publicas. No somos responsables de ningún contenido generado por usuarios.</p>

                    <h2>Moderación de Contenido</h2>
                    <p>Nos reservamos el derecho de:</p>
                    <ul>
                        <li>Revisar todo el contenido generado por usuarios</li>
                        <li>Eliminar contenido que viole estos Términos</li>
                        <li>Tomar medidas contra cuentas que violen repetidamente las políticas</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Propiedad Intelectual</h2>
                    <p>Todo el contenido en Music Discovery es propiedad de Music Discovery o nuestros licenciantes y está protegido por leyes de derechos de autor y propiedad intelectual.</p>
                    <ul>
                        <li>Diseño, maquetación y gráficos</li>
                        <li>Texto, imágenes y logotipos</li>
                        <li>Software y código</li>
                        <li>Marcas comerciales y branding</li>
                    </ul>

                    <h2>Información de Artistas</h2>
                    <p>Las imágenes de artistas, portadas de álbumes e información de canciones son propiedad de sus respectivos dueños. Mostramos este contenido bajo uso justo con fines informativos y de descubrimiento.</p>

                </section>

                <section className={styles.section}>
                    <h2>Terminación y Suspensión</h2>

                    <p>Puedes eliminar tu cuenta en cualquier momento.</p>
                    <ul>
                        <li>Tus datos personales se eliminarán definitivamente en un plazo de 30 días</li>
                        <li>Tus comentarios y perfil se eliminarán permanentemente</li>
                    </ul>

                    <h2>Nuestro Derecho a Terminar</h2>
                    <p>Podemos suspender o terminar tu cuenta si:</p>
                    <ul>
                        <li>Violas estos Términos</li>
                        <li>Participas en actividades prohibidas</li>
                        <li>Proporcionas información falsa</li>
                        <li>Representas un riesgo de seguridad</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Limitación de Responsabilidad</h2>
                    <p>En la máxima medida permitida por la ley, Music Discovery y sus operadores no serán responsables de:</p>
                    <ul>
                        <li>Daños indirectos, incidentales, especiales o consecuentes</li>
                        <li>Pérdida de beneficios, datos o buena voluntad</li>
                        <li>Interrupciones o errores del servicio</li>
                        <li>Contenido generado por usuarios</li>
                        <li>Servicios de terceros</li>
                        <li>Contenido generado por terceros</li>
                        <li>Enlaces a sitios web externos</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Indemnización</h2>
                    <p>Aceptas indemnizar y eximir de responsabilidad a Music Discovery, sus operadores y afiliados de cualquier reclamo, daño o gasto que surja de:</p>
                    <ul>
                        <li>Tu uso del servicio</li>
                        <li>Tu violación de estos Términos</li>
                        <li>Tu violación de cualquier derecho de otra parte</li>
                        <li>Tu contenido generado por usuario</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>Resolución de Disputas</h2>
                    <p>En caso de una disputa, ambas partes acuerdan intentar primero la resolución mediante negociación de buena fe. Si no se resuelve después de 30 días, las disputas se resolverán mediante arbitraje vinculante.</p>

                    <h2>Renuncia a Acción Colectiva</h2>
                    <p>Aceptas resolver disputas individualmente y renuncias al derecho de participar en demandas colectivas.</p>
                </section>

                <section className={styles.section}>
                    <p className={styles.legal_notice}>
                        <strong>Al usar Music Discovery, reconoces que has leído, entendido y aceptas estar sujeto a estos Términos de Servicio.</strong>
                    </p>
                </section>
            </div>
        </main>
    )
}
