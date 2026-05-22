"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import styles from "@/styles/legal/Legal.module.css"


function LegalContent() {
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')

    useEffect(() => {
        const type = searchParams.get('type')
        if (type === 'terms') {
            setActiveTab('terms')
        } else {
            setActiveTab('privacy')
        }
    }, [searchParams])

    const isPrivacy = activeTab === 'privacy'

    return (
        <main className="page-main">
            <div className={styles.legal_container}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => setActiveTab('privacy')}
                        className={`btn ${isPrivacy ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Política de Privacidad
                    </button>
                    <button
                        onClick={() => setActiveTab('terms')}
                        className={`btn ${!isPrivacy ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Términos de Servicio
                    </button>
                </div>

                <div className={styles.error_container}>
                    <div className={styles.error_icon}>
                        <i className={`bx ${isPrivacy ? 'bx-lock-alt' : 'bx-shield-x'} bx-remove-padding`}></i>
                    </div>
                    <h1 className={styles.error_title}>
                        {isPrivacy ? "Acceso Restringido" : "No Disponible"}
                    </h1>
                    <p className={styles.error_message}>
                        {isPrivacy ? "La política de privacidad está protegida. Debes iniciar sesión para ver este documento." : "Los términos de servicio no están disponibles en este momento."}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="/" className="btn btn-primary">
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default function LegalPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LegalContent />
        </Suspense>
    )
}
