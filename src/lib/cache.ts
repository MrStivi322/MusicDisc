interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    clear(key: string): void {
        this.cache.delete(key);
    }

    clearAll(): void {
        this.cache.clear();
    }

    clearExpired(): void {
        const now = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            const isExpired = now - entry.timestamp > entry.ttl;
            if (isExpired) {
                this.cache.delete(key);
            }
        }
    }
}

export const cache = new SimpleCache();

if (typeof window !== 'undefined') {
    setInterval(() => {
        cache.clearExpired();
    }, 10 * 60 * 1000);
}
