import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // Use production URL or detect from headers
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'www.webdev-pro.kz'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const siteUrl = `${protocol}://${host}`

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${siteUrl}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${siteUrl}/login?error=auth`)
}
