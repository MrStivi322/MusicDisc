
"use client"

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from '@/styles/components/Modal.module.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, children, title, size = 'lg' }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden' // Also lock html
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.body.style.overflow = 'unset'
            document.documentElement.style.overflow = 'unset'
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose()
        }
    }

    const sizeClass = styles[`modal_${size}`] || styles.modal_lg

    return createPortal(
        <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
            <div className={`${styles.modal} ${sizeClass}`} role="dialog" aria-modal="true">
                <div className={styles.header}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    <button onClick={onClose} className={styles.close_button} aria-label="Close modal">
                        <i className='bx bx-x'></i>
                    </button>
                </div>
                <div className={styles.content} data-lenis-prevent>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
