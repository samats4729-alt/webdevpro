import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { phone, code } = await req.json();

        if (!phone || !code) {
            return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Clean phone number
        const cleanPhone = phone.replace(/\D/g, '');

        // Find OTP
        const { data: otpRecord, error: findError } = await supabase
            .from('phone_otps')
            .select('*')
            .eq('phone', cleanPhone)
            .eq('code', code)
            .eq('verified', false)
            .single();

        if (findError || !otpRecord) {
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
        }

        // Check expiration
        if (new Date(otpRecord.expires_at) < new Date()) {
            // Delete expired OTP
            await supabase.from('phone_otps').delete().eq('id', otpRecord.id);
            return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
        }

        // Mark as verified
        await supabase
            .from('phone_otps')
            .update({ verified: true })
            .eq('id', otpRecord.id);

        // Check if user with this phone exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, user_id')
            .eq('phone', cleanPhone)
            .single();

        if (existingProfile) {
            // User exists - sign them in
            // For phone auth, we use a special email format
            const phoneEmail = `${cleanPhone}@phone.webdevpro.local`;

            // Try to sign in with phone-based email
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: phoneEmail,
                password: `phone_${cleanPhone}_secret`
            });

            if (signInError) {
                // If sign in fails, the user might have registered with real email
                // In this case, return success but without session
                return NextResponse.json({
                    success: true,
                    message: 'Phone verified. Please login with your email.',
                    requiresEmailLogin: true
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Logged in successfully',
                session: signInData.session
            });
        } else {
            // New user - create account
            const phoneEmail = `${cleanPhone}@phone.webdevpro.local`;
            const phonePassword = `phone_${cleanPhone}_secret`;

            // Sign up new user
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: phoneEmail,
                password: phonePassword,
                options: {
                    data: {
                        phone: cleanPhone,
                        auth_method: 'phone'
                    }
                }
            });

            if (signUpError) {
                console.error('Sign up error:', signUpError);
                return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
            }

            // Update profile with phone
            if (signUpData.user) {
                await supabase
                    .from('profiles')
                    .update({ phone: cleanPhone })
                    .eq('user_id', signUpData.user.id);
            }

            // Auto sign in after registration
            const { data: autoSignIn } = await supabase.auth.signInWithPassword({
                email: phoneEmail,
                password: phonePassword
            });

            return NextResponse.json({
                success: true,
                message: 'Account created and logged in',
                session: autoSignIn?.session,
                isNewUser: true
            });
        }

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
