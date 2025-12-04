'use client';

import { Component, ReactNode } from 'react';
import styles from '@/styles/components/ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: string;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error);
            console.error('Error Info:', errorInfo);
        }

        // In production, you would log to a service like Sentry
        // Example: Sentry.captureException(error, { extra: errorInfo });

        this.setState({
            errorInfo: errorInfo.componentStack || undefined
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={styles.error_container}>
                    <div className={styles.error_card}>
                        <div className={styles.error_icon}>
                            <i className='bx bx-error-circle'></i>
                        </div>

                        <h1 className={styles.error_title}>Oops! Something went wrong</h1>

                        <p className={styles.error_message}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className={styles.error_details}>
                                <summary>Error Details (Development Only)</summary>
                                <pre className={styles.error_stack}>
                                    {this.state.error?.stack}
                                </pre>
                                <pre className={styles.error_stack}>
                                    {this.state.errorInfo}
                                </pre>
                            </details>
                        )}

                        <div className={styles.error_actions}>
                            <button
                                onClick={this.handleReset}
                                className={`${styles.btn} ${styles.btn_primary}`}
                            >
                                <i className='bx bx-refresh'></i>
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReload}
                                className={`${styles.btn} ${styles.btn_secondary}`}
                            >
                                <i className='bx bx-home'></i>
                                Reload Page
                            </button>
                        </div>

                        <p className={styles.error_help}>
                            If this problem persists, please contact support or try again later.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
