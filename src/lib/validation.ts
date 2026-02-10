import { z, ZodError, ZodSchema } from 'zod';

// Basic validation schemas
export const usernameSchema = z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .trim();

export const emailSchema = z.string()
    .email('Invalid email format')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long')
    .toLowerCase()
    .trim();

export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const commentContentSchema = z.string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long (max 500 characters)')
    .trim()
    .refine(
        (val) => !/<script|javascript:|onerror=|onclick=|onload=/i.test(val),
        'Invalid content detected'
    );

// Composite schemas
export const signupSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
    username: usernameSchema.optional(),
    email: emailSchema
});

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
});

export const commentSchema = z.object({
    content: commentContentSchema
});



// Helper function to format Zod errors
export function formatZodErrors(error: ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    error.issues.forEach((err) => {
        if (err.path.length > 0) {
            errors[err.path[0].toString()] = err.message;
        }
    });
    return errors;
}

// Helper function to validate and return typed result
export function validate<T>(schema: ZodSchema<T>, data: unknown): {
    success: boolean;
    data: T | null;
    errors: Record<string, string>;
} {
    try {
        const validData = schema.parse(data);
        return { success: true, data: validData, errors: {} };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, data: null, errors: formatZodErrors(error) };
        }
        return { success: false, data: null, errors: { general: 'Validation failed' } };
    }
}

// Password strength calculator (compatible with existing system)
export function calculatePasswordStrength(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 5);
}
