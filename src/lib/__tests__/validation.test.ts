import { validate, usernameSchema, emailSchema, passwordSchema, commentSchema, calculatePasswordStrength } from '@/lib/validation'

describe('Validation Library', () => {
    describe('validate function', () => {
        it('returns success for valid data', () => {
            const result = validate(usernameSchema, { username: 'testuser' })
            expect(result.success).toBe(true)
            expect(result.data).toEqual({ username: 'testuser' })
            expect(result.errors).toEqual({})
        })

        it('returns errors for invalid data', () => {
            const result = validate(usernameSchema, { username: 'ab' })
            expect(result.success).toBe(false)
            expect(result.data).toBeNull()
            expect(result.errors).toHaveProperty('username')
        })
    })

    describe('usernameSchema', () => {
        it('accepts valid usernames', () => {
            const validUsernames = ['user123', 'test_user', 'john-doe', 'a'.repeat(20)]

            validUsernames.forEach(username => {
                const result = validate(usernameSchema, { username })
                expect(result.success).toBe(true)
            })
        })

        it('rejects usernames that are too short', () => {
            const result = validate(usernameSchema, { username: 'ab' })
            expect(result.success).toBe(false)
            expect(result.errors.username).toContain('at least 3 characters')
        })

        it('rejects usernames that are too long', () => {
            const result = validate(usernameSchema, { username: 'a'.repeat(21) })
            expect(result.success).toBe(false)
            expect(result.errors.username).toContain('at most 20 characters')
        })

        it('rejects usernames with invalid characters', () => {
            const result = validate(usernameSchema, { username: 'user@name' })
            expect(result.success).toBe(false)
        })
    })

    describe('emailSchema', () => {
        it('accepts valid emails', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'admin+tag@company.com'
            ]

            validEmails.forEach(email => {
                const result = validate(emailSchema, { email })
                expect(result.success).toBe(true)
            })
        })

        it('rejects invalid emails', () => {
            const invalidEmails = ['not-an-email', '@example.com', 'user@', 'user @example.com']

            invalidEmails.forEach(email => {
                const result = validate(emailSchema, { email })
                expect(result.success).toBe(false)
            })
        })
    })

    describe('passwordSchema', () => {
        it('accepts strong passwords', () => {
            const strongPasswords = [
                'StrongPass123!',
                'Sup3r$ecureP@ssw0rd',
                'MyP@ssw0rd2024'
            ]

            strongPasswords.forEach(password => {
                const result = validate(passwordSchema, { password })
                expect(result.success).toBe(true)
            })
        })

        it('rejects passwords that are too short', () => {
            const result = validate(passwordSchema, { password: 'Short1!' })
            expect(result.success).toBe(false)
        })

        it('rejects passwords without uppercase letters', () => {
            const result = validate(passwordSchema, { password: 'password123!' })
            expect(result.success).toBe(false)
            expect(result.errors.password).toContain('uppercase letter')
        })

        it('rejects passwords without lowercase letters', () => {
            const result = validate(passwordSchema, { password: 'PASSWORD123!' })
            expect(result.success).toBe(false)
            expect(result.errors.password).toContain('lowercase letter')
        })

        it('rejects passwords without numbers', () => {
            const result = validate(passwordSchema, { password: 'Password!' })
            expect(result.success).toBe(false)
            expect(result.errors.password).toContain('number')
        })

        it('rejects passwords without special characters', () => {
            const result = validate(passwordSchema, { password: 'Password123' })
            expect(result.success).toBe(false)
            expect(result.errors.password).toContain('special character')
        })
    })

    describe('commentSchema', () => {
        it('accepts valid comments', () => {
            const result = validate(commentSchema, { content: 'This is a valid comment' })
            expect(result.success).toBe(true)
        })

        it('rejects empty comments', () => {
            const result = validate(commentSchema, { content: '' })
            expect(result.success).toBe(false)
        })

        it('rejects comments that are too short', () => {
            const result = validate(commentSchema, { content: 'Hi' })
            expect(result.success).toBe(false)
        })

        it('rejects comments that are too long', () => {
            const result = validate(commentSchema, { content: 'a'.repeat(1001) })
            expect(result.success).toBe(false)
        })

        it('sanitizes HTML in comments', () => {
            const result = validate(commentSchema, { content: 'Test <script>alert("xss")</script> comment' })
            expect(result.success).toBe(true)
            expect(result.data?.content).not.toContain('<script>')
        })
    })

    describe('calculatePasswordStrength', () => {
        it('returns 0 for empty password', () => {
            expect(calculatePasswordStrength('')).toBe(0)
        })

        it('returns low strength for weak passwords', () => {
            expect(calculatePasswordStrength('password')).toBeLessThanOrEqual(2)
        })

        it('returns medium strength for moderate passwords', () => {
            const strength = calculatePasswordStrength('Password123')
            expect(strength).toBeGreaterThanOrEqual(3)
            expect(strength).toBeLessThanOrEqual(4)
        })

        it('returns high strength for strong passwords', () => {
            const strength = calculatePasswordStrength('MyVeryStr0ng!P@ssw0rd')
            expect(strength).toBe(5)
        })

        it('increases strength with length', () => {
            const short = calculatePasswordStrength('Pass1!')
            const long = calculatePasswordStrength('MyLongerPassword123!')
            expect(long).toBeGreaterThan(short)
        })
    })
})
