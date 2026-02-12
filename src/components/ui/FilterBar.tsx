"use client"

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterBarProps {
    children: React.ReactNode;
    className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useLanguage();

    return (
        <div className={`filter-bar-wrapper ${className}`}>
            <button
                className="filter-bar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('common.filters')}
                aria-expanded={isOpen}
            >
                <i className='bx bx-filter-alt'></i>
                <span>{t('common.filters')}</span>
                <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </button>

            <div className={`filter-bar ${isOpen ? 'filter-bar-open' : ''}`}>
                {children}
            </div>
        </div>
    );
}
