'use client';

import { useState } from 'react';

/**
 * Test component to verify ErrorBoundary is working.
 * This component can throw an error on purpose to test the error boundary.
 * 
 * Usage: Add <ErrorTest /> to any page temporarily to test error handling.
 * Remove after testing.
 */
export function ErrorTest() {
    const [shouldError, setShouldError] = useState(false);

    if (shouldError) {
        throw new Error('Test error from ErrorTest component - ErrorBoundary is working!');
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'rgba(255, 0, 0, 0.8)',
            padding: '10px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold'
        }}>
            <button
                onClick={() => setShouldError(true)}
                style={{
                    background: 'white',
                    color: 'red',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                🧪 Test Error Boundary
            </button>
        </div>
    );
}
