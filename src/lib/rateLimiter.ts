interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
}

interface AttemptRecord {
    timestamps: number[];
}

interface RateLimitResult {
    canProceed: boolean;
    remaining: number;
    resetIn: number;
}

class RateLimiter {
    private attempts: Map<string, AttemptRecord> = new Map();

    /**
     * Check if an action can proceed based on rate limits
     * @param key - Unique identifier (e.g., 'comment_userId' or 'profile_userId')
     * @param config - Rate limit configuration
     * @returns Object with canProceed boolean, remaining attempts, and reset time
     */
    check(key: string, config: RateLimitConfig): RateLimitResult {
        const now = Date.now();
        const record = this.attempts.get(key) || { timestamps: [] };

        // Filter only timestamps within the window
        const validTimestamps = record.timestamps.filter(
            time => now - time < config.windowMs
        );

        // Can proceed if under the limit
        const canProceed = validTimestamps.length < config.maxAttempts;
        const remaining = Math.max(0, config.maxAttempts - validTimestamps.length);

        // Calculate when limit resets (in seconds)
        const oldestTimestamp = validTimestamps[0] || now;
        const resetIn = validTimestamps.length > 0
            ? Math.ceil((oldestTimestamp + config.windowMs - now) / 1000)
            : 0;

        if (canProceed) {
            validTimestamps.push(now);
            this.attempts.set(key, { timestamps: validTimestamps });
        }

        return { canProceed, remaining, resetIn };
    }

    /**
     * Reset rate limit for a specific key
     */
    reset(key: string): void {
        this.attempts.delete(key);
    }

    /**
     * Clear all rate limit records
     */
    clearAll(): void {
        this.attempts.clear();
    }

    /**
     * Clean up old records (call periodically)
     */
    cleanup(): void {
        const now = Date.now();
        const maxWindow = 5 * 60 * 1000; // 5 minutes

        for (const [key, record] of this.attempts.entries()) {
            const validTimestamps = record.timestamps.filter(
                time => now - time < maxWindow
            );

            if (validTimestamps.length === 0) {
                this.attempts.delete(key);
            } else {
                this.attempts.set(key, { timestamps: validTimestamps });
            }
        }
    }

    /**
     * Get stats for monitoring (development only)
     */
    getStats(): { totalKeys: number; totalAttempts: number } {
        let totalAttempts = 0;
        for (const record of this.attempts.values()) {
            totalAttempts += record.timestamps.length;
        }
        return {
            totalKeys: this.attempts.size,
            totalAttempts
        };
    }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        rateLimiter.cleanup();
    }, 5 * 60 * 1000);

    // Expose stats in development
    if (process.env.NODE_ENV === 'development') {
        (window as any).__rateLimiterStats = () => {
            console.table(rateLimiter.getStats());
        };
    }
}

// Pre-configured limits
export const RATE_LIMITS = {
    COMMENT: { maxAttempts: 5, windowMs: 60 * 1000 }, // 5 per minute
    PROFILE_UPDATE: { maxAttempts: 3, windowMs: 60 * 1000 }, // 3 per minute
    PASSWORD_CHANGE: { maxAttempts: 2, windowMs: 5 * 60 * 1000 }, // 2 per 5 minutes
    LOGIN: { maxAttempts: 5, windowMs: 5 * 60 * 1000 }, // 5 per 5 minutes
    SIGNUP: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
} as const;
