
"use client"

import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { CreateThreadFixedForm } from '@/components/forum/CreateThreadFixedForm'
import type { ForumCategory } from '@/lib/database.types'
import styles from '@/styles/pages/Forum.module.css'

interface ForumHeaderActionsProps {
    categories: ForumCategory[]
}

export function ForumHeaderActions({ categories }: ForumHeaderActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={styles.create_button}
            >
                <i className='bx bx-plus'></i>
                Nueva Discusión
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Crear Nueva Discusión"
            >
                <CreateThreadFixedForm
                    categories={categories}
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </>
    )
}
