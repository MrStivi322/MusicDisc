interface CacheEntry<T> {
    data: T;
    timestamp: number;
    lastAccessed: number;
    ttl: number;
}

interface CacheStats {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    evictions: number;
    hitRate: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private maxSize: number = 100;
    private stats = {
        hits: 0,
        misses: 0,
        evictions: 0
    };

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        entry.lastAccessed = now;
        this.stats.hits++;
        return entry.data as T;
    }

    set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            lastAccessed: Date.now(),
            ttl
        });
    }

    clear(key: string): void {
        this.cache.delete(key);
    }

    clearAll(): void {
        this.cache.clear();
        this.resetStats();
    }

    clearExpired(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            const isExpired = now - entry.timestamp > entry.ttl;
            if (isExpired) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    private evictLRU(): void {
        let lruKey: string | null = null;
        let lruTime = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < lruTime) {
                lruTime = entry.lastAccessed;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.cache.delete(lruKey);
            this.stats.evictions++;
        }
    }

    getStats(): CacheStats {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.stats.hits,
            misses: this.stats.misses,
            evictions: this.stats.evictions,
            hitRate: parseFloat(hitRate.toFixed(2))
        };
    }

    private resetStats(): void {
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
    }

    setMaxSize(size: number): void {
        this.maxSize = size;
        while (this.cache.size > this.maxSize) {
            this.evictLRU();
        }
    }
}

export const cache = new SimpleCache();

if (typeof window !== 'undefined') {
    setInterval(() => {
        cache.clearExpired();
    }, 10 * 60 * 1000);

    if (process.env.NODE_ENV === 'development') {
        (window as any).__cacheStats = () => {
            console.table(cache.getStats());
        };
    }
}
