import React from 'react';

interface FilterBarProps {
    children: React.ReactNode;
    className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
    return (
        <div className={`filter-bar ${className}`}>
            {children}
        </div>
    );
}
