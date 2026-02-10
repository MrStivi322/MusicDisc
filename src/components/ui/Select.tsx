import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: { value: string; label: string }[];
    wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, options, children, wrapperClassName = '', ...props }, ref) => {
        return (
            <div className={`input-group-container ${wrapperClassName}`}>
                {label && <label className="input-label">{label}</label>}

                <div className="select-wrapper">
                    <select
                        ref={ref}
                        className={`form-control ${className} ${error ? 'is-invalid' : ''}`}
                        {...props}
                    >
                        {options
                            ? options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))
                            : children
                        }
                    </select>
                </div>

                {error && <span className="input-error">{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
