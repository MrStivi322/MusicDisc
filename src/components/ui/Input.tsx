import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string; // Boxicon class name, e.g., 'bx-search'
    wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, icon, wrapperClassName = '', ...props }, ref) => {
        return (
            <div className={`input-group-container ${wrapperClassName}`}>
                {label && <label className="input-label">{label}</label>}

                <div className={`search-input-container ${icon ? 'has-icon' : ''}`}>
                    {icon && <i className={`bx ${icon}`}></i>}
                    <input
                        ref={ref}
                        className={`form-control ${className} ${error ? 'is-invalid' : ''}`}
                        {...props}
                    />
                </div>

                {error && <span className="input-error">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
