"use client"

import React, { useState } from 'react';


interface FilterBarProps {
    children: React.ReactNode;
    className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
    const [isOpen, setIsOpen] = useState(false);


    return (
        <div className={`filter-bar-wrapper ${className}`}>
            <button
                className="filter-bar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Filtros"
                aria-expanded={isOpen}
            >
                <i className='bx bx-filter-alt bx-remove-padding'></i>
                <span>Filtros</span>
                <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'} bx-remove-padding`}></i>
            </button>

            <div className={`filter-bar ${isOpen ? 'filter-bar-open' : ''}`}>
                {children}
            </div>
        </div>
    );
}
