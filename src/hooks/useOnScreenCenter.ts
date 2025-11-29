import { useState, useEffect, useRef } from 'react';

export function useOnScreenCenter(options = { threshold: 0.2, delay: 600 }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isCentered, setIsCentered] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkCenter = () => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const center = windowHeight / 2;
            const elementCenter = rect.top + rect.height / 2;

            // Check if element center is close to window center
            // Use a percentage of window height as tolerance (e.g., 20%)
            const distance = Math.abs(center - elementCenter);
            const isClose = distance < windowHeight * options.threshold;

            if (isClose) {
                if (!timeoutRef.current && !isCentered) {
                    timeoutRef.current = setTimeout(() => {
                        setIsCentered(true);
                    }, options.delay);
                }
            } else {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                setIsCentered(false);
            }
        };

        // Only run on mobile/touch devices or small screens
        if (window.matchMedia('(max-width: 768px)').matches) {
            window.addEventListener('scroll', checkCenter);
            checkCenter(); // Initial check
        }

        return () => {
            window.removeEventListener('scroll', checkCenter);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [options.threshold, options.delay, isCentered]);

    return [ref, isCentered] as const;
}
