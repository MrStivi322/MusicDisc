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

                <section className={styles.section}>
                    <p className={styles.intro}>
                        ¡Bienvenido a Music Discovery! Estos Términos de Servicio ("Términos") rigen el uso de nuestro sitio web y servicios. Al crear una cuenta o usar nuestra plataforma, aceptas estos términos. Por favor, léelos cuidadosamente.
                    </p>
                </section>

                <section className={styles.section}>
                    <h2>1. Aceptación de los Términos</h2>
                    <p>Al acceder o usar Music Discovery, reconoces que has leído, entendido y aceptas estar sujeto a estos Términos y nuestra Política de Privacidad. Si no estás de acuerdo, por favor no uses nuestros servicios.</p>

                    <h3>1.1 Requisito de Edad</h3>
                    <p>Debes tener al menos 13 años para usar este servicio. Al usar Music Discovery, declaras y garantizas que cumples con este requisito de edad.</p>

                    <h3>1.2 Cambios en los Términos</h3>
                    <p>Nos reservamos el derecho de modificar estos Términos en cualquier momento. Notificaremos a los usuarios de cambios significativos por correo electrónico o mediante un aviso destacado en el sitio web. El uso continuado después de los cambios constituye la aceptación de los nuevos Términos.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. Cuentas de Usuario</h2>

                    <h3>2.1 Creación de Cuenta</h3>
                    <p>Para acceder a ciertas funciones, debes crear una cuenta proporcionando:</p>
                    <ul>
                        <li>Una dirección de correo electrónico válida</li>
                        <li>Un nombre de usuario único</li>
                        <li>Una contraseña segura</li>
                    </ul>

                    <h3>2.2 Seguridad de la Cuenta</h3>
                    <p>Eres responsable de:</p>
                    <ul>
                        <li>Mantener la confidencialidad de tu contraseña</li>
                        <li>Todas las actividades que ocurran bajo tu cuenta</li>
                        <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
                        <li>Elegir una contraseña fuerte y única</li>
                    </ul>
                    <p><strong>No somos responsables de ninguna pérdida o daño que surja de tu falta de protección de las credenciales de tu cuenta.</strong></p>

                    <h3>2.3 Exactitud de la Cuenta</h3>
                    <p>Aceptas proporcionar información precisa, actual y completa, y actualizarla según sea necesario para mantener su exactitud.</p>

                    <h3>2.4 Una Cuenta por Persona</h3>
                    <p>Cada persona solo puede crear una cuenta. Crear múltiples cuentas para eludir prohibiciones o restricciones está prohibido.</p>
                </section>

                <section className={styles.section}>
                    <h2>3. Uso Aceptable</h2>

                    <h3>3.1 Usos Permitidos</h3>
                    <p>Puedes usar Music Discovery para:</p>
                    <ul>
                        <li>Descubrir música, artistas y álbumes</li>
                        <li>Leer e interactuar con noticias musicales</li>
                        <li>Guardar artistas favoritos</li>
                        <li>Comentar en artículos de noticias (respetuosamente)</li>
                        <li>Personalizar tu perfil</li>
                    </ul>

                    <h3>3.2 Actividades Prohibidas</h3>
                    <p>Aceptas NO:</p>
                    <ul>
                        <li><strong>Spam:</strong> Publicar contenido repetitivo, irrelevante o promocional</li>
                        <li><strong>Acoso:</strong> Intimidar, amenazar o acosar a otros usuarios</li>
                        <li><strong>Discurso de Odio:</strong> Publicar contenido que promueva violencia o discriminación</li>
                        <li><strong>Contenido Ilegal:</strong> Compartir contenido que viole cualquier ley</li>
                        <li><strong>Suplantación:</strong> Hacerse pasar por otra persona o entidad</li>
                        <li><strong>Scraping:</strong> Usar herramientas automatizadas para extraer datos</li>
                        <li><strong>Hacking:</strong> Intentar vulnerar medidas de seguridad</li>
                        <li><strong>Información Falsa:</strong> Difundir deliberadamente desinformación</li>
                        <li><strong>Infracción de Derechos de Autor:</strong> Subir contenido sobre el que no tienes derechos</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>4. Contenido Generado por el Usuario</h2>

                    <h3>4.1 Tu Contenido</h3>
                    <p>Cuando publicas comentarios o subes información de perfil, nos otorgas:</p>
                    <ul>
                        <li>Una licencia no exclusiva, mundial y libre de regalías para usar, mostrar y distribuir tu contenido</li>
                        <li>El derecho a moderar, eliminar o editar contenido que viole estos Términos</li>
                    </ul>
                    <p><strong>Conservas la propiedad de tu contenido.</strong> Solo necesitamos estos derechos para operar la plataforma.</p>

                    <h3>4.2 Responsabilidad del Contenido</h3>
                    <p>Eres el único responsable del contenido que publicas. No somos responsables de ningún contenido generado por usuarios.</p>

                    <h3>4.3 Moderación de Contenido</h3>
                    <p>Nos reservamos el derecho de:</p>
                    <ul>
                        <li>Revisar todo el contenido generado por usuarios</li>
                        <li>Eliminar contenido que viole estos Términos</li>
                        <li>Tomar medidas contra cuentas que violen repetidamente las políticas</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>5. Propiedad Intelectual</h2>

                    <h3>5.1 Nuestro Contenido</h3>
                    <p>Todo el contenido en Music Discovery (excluyendo contenido generado por usuarios) incluyendo:</p>
                    <ul>
                        <li>Diseño, maquetación y gráficos</li>
                        <li>Texto, imágenes y logotipos</li>
                        <li>Software y código</li>
                        <li>Marcas comerciales y branding</li>
                    </ul>
                    <p>...es propiedad de Music Discovery o nuestros licenciantes y está protegido por leyes de derechos de autor y propiedad intelectual.</p>

                    <h3>5.2 Información de Artistas</h3>
                    <p>Las imágenes de artistas, portadas de álbumes e información de canciones son propiedad de sus respectivos dueños. Mostramos este contenido bajo uso justo con fines informativos y de descubrimiento.</p>

                    <h3>5.3 Integración con Spotify</h3>
                    <p>Los embeds de Spotify se proporcionan a través de la API oficial de embed de Spotify y están sujetos a los Términos de Servicio de Spotify.</p>

                    <h3>5.4 Quejas de Derechos de Autor (DMCA)</h3>
                    <p>Si crees que el contenido en nuestro sitio infringe tus derechos de autor, contáctanos con:</p>
                    <ul>
                        <li>Identificación de la obra protegida por derechos de autor</li>
                        <li>URL del material supuestamente infractor</li>
                        <li>Tu información de contacto</li>
                        <li>Una declaración de buena fe</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>6. Terminación y Suspensión</h2>

                    <h3>6.1 Tu Derecho a Terminar</h3>
                    <p>Puedes eliminar tu cuenta en cualquier momento a través de Ajustes → Eliminar Cuenta. Tras la eliminación:</p>
                    <ul>
                        <li>Tus datos personales se eliminarán en un plazo de 30 días</li>
                        <li>Tus comentarios se anonimizarán</li>
                        <li>Tus favoritos y perfil se eliminarán permanentemente</li>
                    </ul>

                    <h3>6.2 Nuestro Derecho a Terminar</h3>
                    <p>Podemos suspender o terminar tu cuenta si:</p>
                    <ul>
                        <li>Violas estos Términos</li>
                        <li>Participas en actividades prohibidas</li>
                        <li>Proporcionas información falsa</li>
                        <li>Representas un riesgo de seguridad</li>
                    </ul>

                    <h3>6.3 Efecto de la Terminación</h3>
                    <p>Tras la terminación, debes cesar todo uso del servicio. Las disposiciones relativas a propiedad intelectual, exenciones de responsabilidad y limitaciones de responsabilidad sobreviven a la terminación.</p>
                </section>

                <section className={styles.section}>
                    <h2>7. Exenciones de Responsabilidad y Limitaciones</h2>

                    <h3>7.1 Servicio "Tal Cual"</h3>
                    <p>Music Discovery se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD" sin garantías de ningún tipo, ya sean expresas o implícitas, incluyendo pero no limitado a:</p>
                    <ul>
                        <li>Comerciabilidad</li>
                        <li>Idoneidad para un propósito particular</li>
                        <li>No infracción</li>
                        <li>Operación ininterrumpida o libre de errores</li>
                    </ul>

                    <h3>7.2 Limitación de Responsabilidad</h3>
                    <p>En la máxima medida permitida por la ley, Music Discovery y sus operadores no serán responsables de:</p>
                    <ul>
                        <li>Daños indirectos, incidentales, especiales o consecuentes</li>
                        <li>Pérdida de beneficios, datos o buena voluntad</li>
                        <li>Interrupciones o errores del servicio</li>
                        <li>Contenido generado por usuarios</li>
                        <li>Servicios de terceros (Spotify, Supabase, etc.)</li>
                    </ul>
                    <p><strong>Nuestra responsabilidad total no excederá los $100 USD o la cantidad que nos hayas pagado (si corresponde) en los últimos 12 meses.</strong></p>

                    <h3>7.3 Enlaces de Terceros</h3>
                    <p>Nuestro servicio puede contener enlaces a sitios web externos (Spotify, redes sociales, etc.). No somos responsables del contenido o prácticas de estos sitios.</p>
                </section>

                <section className={styles.section}>
                    <h2>8. Indemnización</h2>
                    <p>Aceptas indemnizar y eximir de responsabilidad a Music Discovery, sus operadores y afiliados de cualquier reclamo, daño o gasto que surja de:</p>
                    <ul>
                        <li>Tu uso del servicio</li>
                        <li>Tu violación de estos Términos</li>
                        <li>Tu violación de cualquier derecho de otra parte</li>
                        <li>Tu contenido generado por usuario</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>9. Ley Aplicable y Disputas</h2>

                    <h3>9.1 Ley Aplicable</h3>
                    <p>Estos Términos se rigen por las leyes de los Estados Unidos, sin tener en cuenta los principios de conflicto de leyes.</p>

                    <h3>9.2 Resolución de Disputas</h3>
                    <p>En caso de una disputa, ambas partes acuerdan intentar primero la resolución mediante negociación de buena fe. Si no se resuelve después de 30 días, las disputas se resolverán mediante arbitraje vinculante.</p>

                    <h3>9.3 Renuncia a Acción Colectiva</h3>
                    <p>Aceptas resolver disputas individualmente y renuncias al derecho de participar en demandas colectivas.</p>
                </section>

                <section className={styles.section}>
                    <h2>10. Disposiciones Varias</h2>

                    <h3>10.1 Acuerdo Completo</h3>
                    <p>Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre tú y Music Discovery.</p>

                    <h3>10.2 Divisibilidad</h3>
                    <p>Si alguna disposición se considera inaplicable, las disposiciones restantes permanecen en pleno efecto.</p>

                    <h3>10.3 No Renuncia</h3>
                    <p>Nuestro incumplimiento en hacer valer cualquier derecho o disposición no constituye una renuncia a ese derecho.</p>

                    <h3>10.4 Cesión</h3>
                    <p>No puedes transferir tus derechos bajo estos Términos. Podemos asignar nuestros derechos a cualquier afiliado o sucesor.</p>
                </section>

                <section className={styles.section}>
                    <h2>11. Información de Contacto</h2>
                    <p>Para preguntas sobre estos Términos, contáctanos en:</p>
                    <ul>
                        <li><strong>Correo electrónico:</strong> legal@musicdiscovery.app (reemplaza con tu contacto real)</li>
                        <li><strong>Tiempo de respuesta:</strong> Nuestro objetivo es responder en 48 horas</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <div className={styles.summary_box}>
                        <h3>📋 Resumen Rápido</h3>
                        <p><strong>Puedes:</strong> Descubrir música, guardar favoritos, comentar respetuosamente</p>
                        <p><strong>No puedes:</strong> Hacer spam, acosar, hackear, infringir derechos de autor, crear cuentas falsas</p>
                        <p><strong>Tu contenido:</strong> Es tuyo, pero nos otorgas una licencia para mostrarlo</p>
                        <p><strong>Nuestro contenido:</strong> Protegido por derechos de autor, no lo robes</p>
                        <p><strong>Terminación:</strong> Tú o nosotros podemos finalizar el acceso a tu cuenta</p>
                        <p><strong>Responsabilidad:</strong> El servicio es "tal cual", no somos responsables de daños indirectos</p>
                    </div>
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
