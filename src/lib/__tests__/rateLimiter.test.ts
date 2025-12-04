import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimiter'

describe('Rate Limiter', () => {
    beforeEach(() => {
        // Clear all rate limit data before each test
        jest.clearAllMocks()
    })

    describe('check method', () => {
        it('allows first request', () => {
            const result = rateLimiter.check('test-key', RATE_LIMITS.COMMENT)

            expect(result.canProceed).toBe(true)
            expect(result.remaining).toBe(RATE_LIMITS.COMMENT.maxAttempts - 1)
        })

        it('tracks multiple requests', () => {
            const key = 'test-user'
            const limit = RATE_LIMITS.COMMENT // 5 per minute

            // Make 5 requests (the limit)
            for (let i = 0; i < limit.maxAttempts; i++) {
                const result = rateLimiter.check(key, limit)
                expect(result.canProceed).toBe(true)
            }

            // 6th request should be blocked
            const result = rateLimiter.check(key, limit)
            expect(result.canProceed).toBe(false)
            expect(result.remaining).toBe(0)
        })

        it('provides correct resetIn time', () => {
            const result = rateLimiter.check('test-key', RATE_LIMITS.COMMENT)

            expect(result.resetIn).toBeGreaterThan(0)
            expect(result.resetIn).toBeLessThanOrEqual(RATE_LIMITS.COMMENT.windowMs / 1000)
        })

        it('handles different keys independently', () => {
            const limit = RATE_LIMITS.COMMENT

            rateLimiter.check('user1', limit)
            rateLimiter.check('user1', limit)

            const result1 = rateLimiter.check('user1', limit)
            const result2 = rateLimiter.check('user2', limit)

            expect(result1.remaining).toBe(2)
            expect(result2.remaining).toBe(4)
        })

        it('respects different rate limits', () => {
            const commentLimit = RATE_LIMITS.COMMENT // 5 per minute
            const passwordLimit = RATE_LIMITS.PASSWORD_CHANGE // 2 per 5 minutes

            // Use up comment limit
            for (let i = 0; i < commentLimit.maxAttempts; i++) {
                rateLimiter.check('user1', commentLimit)
            }

            // Password limit should still be available
            const result = rateLimiter.check('user1', passwordLimit)
            expect(result.canProceed).toBe(true)
        })
    })

    describe('reset method', () => {
        it('clears rate limit for specific key', () => {
            const key = 'test-user'
            const limit = RATE_LIMITS.COMMENT

            // Use up the limit
            for (let i = 0; i < limit.maxAttempts; i++) {
                rateLimiter.check(key, limit)
            }

            // Should be blocked
            let result = rateLimiter.check(key, limit)
            expect(result.canProceed).toBe(false)

            // Reset
            rateLimiter.reset(key)

            // Should now be allowed
            result = rateLimiter.check(key, limit)
            expect(result.canProceed).toBe(true)
        })
    })

    describe('RATE_LIMITS constants', () => {
        it('defines COMMENT limit correctly', () => {
            expect(RATE_LIMITS.COMMENT.maxAttempts).toBe(5)
            expect(RATE_LIMITS.COMMENT.windowMs).toBe(60000) // 1 minute
        })

        it('defines PROFILE_UPDATE limit correctly', () => {
            expect(RATE_LIMITS.PROFILE_UPDATE.maxAttempts).toBe(3)
            expect(RATE_LIMITS.PROFILE_UPDATE.windowMs).toBe(60000) // 1 minute
        })

        it('defines PASSWORD_CHANGE limit correctly', () => {
            expect(RATE_LIMITS.PASSWORD_CHANGE.maxAttempts).toBe(2)
            expect(RATE_LIMITS.PASSWORD_CHANGE.windowMs).toBe(300000) // 5 minutes
        })

        it('defines LOGIN limit correctly', () => {
            expect(RATE_LIMITS.LOGIN.maxAttempts).toBe(5)
            expect(RATE_LIMITS.LOGIN.windowMs).toBe(300000) // 5 minutes
        })

        it('defines SIGNUP limit correctly', () => {
            expect(RATE_LIMITS.SIGNUP.maxAttempts).toBe(3)
            expect(RATE_LIMITS.SIGNUP.windowMs).toBe(3600000) // 1 hour
        })
    })

    describe('sliding window behavior', () => {
        it('allows requests after window expires', (done) => {
            const key = 'test-window'
            const limit = {
                maxAttempts: 2,
                windowMs: 100 // 100ms window for testing
            }

            // Use up the limit
            rateLimiter.check(key, limit)
            rateLimiter.check(key, limit)

            // Should be blocked
            let result = rateLimiter.check(key, limit)
            expect(result.canProceed).toBe(false)

            // Wait for window to expire
            setTimeout(() => {
                result = rateLimiter.check(key, limit)
                expect(result.canProceed).toBe(true)
                done()
            }, 150)
        }, 300)
    })
})
