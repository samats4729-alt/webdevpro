import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Always use production URL - local dev will rarely need this callback
const SITE_URL = 'https://www.webdev-pro.kz'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${SITE_URL}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${SITE_URL}/login?error=auth`)
}
