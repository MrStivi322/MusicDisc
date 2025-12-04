import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
    console.warn('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!supabaseServiceRoleKey) {
    // Warn but don't crash, as this might be imported in client-side code by mistake
    // or during build time where env vars might not be present
    console.warn('Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.')
}

/**
 * Supabase Admin Client
 * 
 * WARNING: This client has full access to your database and bypasses Row Level Security (RLS).
 * It should ONLY be used in server-side contexts (API Routes, Server Actions, getServerSideProps).
 * NEVER import or use this in client-side components.
 */
export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
