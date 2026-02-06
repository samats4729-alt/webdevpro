import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient();

        // Check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const botId = formData.get('botId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!botId) {
            return NextResponse.json({ error: 'No botId provided' }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split('.').pop() || 'bin';
        const filename = `${botId}/${timestamp}_${randomStr}.${ext}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('media')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('[upload] Storage error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(filename);

        console.log(`[upload] File uploaded: ${filename}, URL: ${urlData.publicUrl}`);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            filename: filename
        });
    } catch (error: any) {
        console.error('[upload] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
