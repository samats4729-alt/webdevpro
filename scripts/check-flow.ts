
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load envs manually to avoid dependency issues
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        process.env[key.trim()] = value.trim();
    }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFlow() {
    console.log('Starting checkFlow...');
    const botId = 'bcf74dfb-47ca-4526-98dd-9c8ea9c49bc5';
    const { data: flows, error } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!flows || flows.length === 0) {
        console.log('No flows found');
        return;
    }

    const flow = flows[0];
    const nodes = flow.nodes._nodes || flow.nodes;

    // Find node 2
    const node2 = nodes.find((n: any) => n.id === '2');
    console.log('Node 2 Data:', JSON.stringify(node2, null, 2));
}

checkFlow();
