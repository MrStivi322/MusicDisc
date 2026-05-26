"use client"

import React, { useState } from 'react';
import styles from '@/styles/components/FilterBar.module.css';

interface FilterBarProps {
    children: React.ReactNode;
    className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <button className={styles.toggle_btn} onClick={() => setIsOpen(!isOpen)}
                aria-label="Filtros"
                aria-expanded={isOpen}
                aria-controls="filter-bar-panel">
                <i className='bx bx-filter bx-remove-padding'></i>
                <span>Filtros</span>
                <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'} bx-remove-padding`}></i>
            </button>

            <div id="filter-bar-panel"
                className={`${styles.panel} ${isOpen ? styles.panel_open : ''}`}>
                {children}
            </div>
        </div>
    );
}

