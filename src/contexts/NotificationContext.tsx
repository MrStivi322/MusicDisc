"use client"
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Notification, NotificationType } from '@/components/ui/Notification';

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<{ message: string, type: NotificationType, id: number } | null>(null);

    const showNotification = useCallback((message: string, type: NotificationType) => {
        setNotification({ message, type, id: Date.now() });
    }, []);

    const handleClose = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <Notification 
                    key={notification.id}
                    message={notification.message} 
                    type={notification.type} 
                    onClose={handleClose} 
                />
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
