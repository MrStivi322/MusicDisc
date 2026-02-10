import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    href?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Button({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    href,
    leftIcon,
    rightIcon,
    disabled,
    ...props
}: ButtonProps) {
    const baseClass = `btn btn-${variant} btn-${size} ${className}`;

    const content = (
        <>
            {isLoading && <i className='bx bx-loader-alt bx-spin' />}
            {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={baseClass} aria-disabled={disabled || isLoading}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={baseClass}
            disabled={disabled || isLoading}
            {...props}
        >
            {content}
        </button>
    );
}
