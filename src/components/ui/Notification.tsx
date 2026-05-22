import { useEffect, useState } from 'react';
import styles from '@/styles/components/Notification.module.css';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
    message: string;
    type: NotificationType;
    onClose: () => void;
    duration?: number;
}

export function Notification({ message, type, onClose, duration = 2000 }: NotificationProps) {
    const [isHiding, setIsHiding] = useState(false);

    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setIsHiding(true);
        }, duration);

        const closeTimer = setTimeout(() => {
            onClose();
        }, duration + 300); // 300ms matches the slideUp animation duration

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(closeTimer);
        };
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'bx-check-circle';
            case 'error': return 'bx-x-circle';
            case 'info': return 'bx-info-circle';
        }
    };

    return (
        <div className={`${styles.notification_container} ${styles[type]} ${isHiding ? styles.hiding : ''}`} role="alert">
            <i className={`bx ${getIcon()} ${styles.icon}`}></i>
            <p className={styles.message}>{message}</p>
        </div>
    );
}
