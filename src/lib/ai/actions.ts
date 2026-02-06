import { createClient } from "@/lib/supabase/server";
import { TEMPLATES } from "@/lib/templates/data";

export async function createBotAction(userId: string, name: string, niche: string) {
    const supabase = createClient();

    // 1. Create Bot
    const { data: bot, error: botError } = await supabase
        .from('bots')
        .insert([
            {
                user_id: userId,
                name: name,
                platform: 'whatsapp',
                status: 'offline'
            }
        ])
        .select()
        .single();

    if (botError) throw new Error(`Failed to create bot: ${botError.message}`);

    // 2. Create Default Flow (or specific based on niche)
    const defaultNodes = [
        {
            id: crypto.randomUUID(),
            trigger: { type: 'contains', value: 'привет' },
            action: { type: 'reply', message: 'Привет! Чем могу помочь?' },
            enabled: true
        }
    ];

    const { error: flowError } = await supabase
        .from('flows')
        .insert([{
            bot_id: bot.id,
            name: 'Основной сценарий',
            nodes: defaultNodes
        }]);

    if (flowError) throw new Error(`Failed to create flow: ${flowError.message}`);

    return { success: true, botId: bot.id, botName: bot.name };
}

export async function applyTemplateAction(userId: string, botId: string, templateType: string) {
    const supabase = createClient();

    console.log(`[Action] Applying template '${templateType}' to bot ${botId}`);

    // Aliases map
    const aliases: Record<string, string> = {
        'автосервис': 'service',
        'service': 'service',
        'beauty': 'beauty-salon',
        'beauty_salon': 'beauty-salon',
        'salon': 'beauty-salon',
        'салон': 'beauty-salon',
        'shop': 'ecommerce-assistant',
        'store': 'ecommerce-assistant'
    };

    const key = aliases[templateType.toLowerCase()] || templateType;
    const template = TEMPLATES[key];

    if (!template) {
        console.error(`[Action] Template not found: ${templateType} (resolved: ${key})`);
        throw new Error(`Template '${templateType}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`);
    }

    // 1. Verify Bot Ownership
    const { data: bot } = await supabase
        .from('bots')
        .select('id')
        .eq('id', botId)
        .eq('user_id', userId)
        .single();

    if (!bot) {
        console.error(`[Action] Bot not found or access denied: ${botId}`);
        throw new Error('Bot not found or access denied');
    }

    // Prepare JSON structure for 'nodes' column
    // The schema only has 'nodes' column (JSONB). We pack edges inside it if needed.
    const flowData = {
        _nodes: template.nodes,
        _edges: template.edges || []
    };

    // 2. Overwrite "Main Flow"
    const { data: existingFlow } = await supabase
        .from('flows')
        .select('id')
        .eq('bot_id', botId)
        .limit(1)
        .single();

    if (existingFlow) {
        console.log(`[Action] Updating existing flow: ${existingFlow.id}`);

        // IMPORTANT: We DO NOT update 'edges' column because it might not exist.
        // We put everything into 'nodes'.
        const { error: updateError } = await supabase
            .from('flows')
            .update({
                nodes: flowData
            })
            .eq('id', existingFlow.id);

        if (updateError) {
            console.error(`[Action] Update failed: ${updateError.message}`);
            throw new Error(`Failed to update flow: ${updateError.message}`);
        }
    } else {
        console.log(`[Action] Creating new flow for bot ${botId}`);
        const { error: insertError } = await supabase
            .from('flows')
            .insert([{
                bot_id: botId,
                name: 'Main Flow',
                nodes: flowData
            }]);

        if (insertError) {
            console.error(`[Action] Insert failed: ${insertError.message}`);
            throw new Error(`Failed to create flow: ${insertError.message}`);
        }
    }

    return { success: true, template: templateType };
}

export async function createCustomBotAction(userId: string, name: string, description: string) {
    const supabase = createClient();
    const { generateFlowFromPrompt } = await import('@/lib/ai/generator');

    // 1. Create Bot
    const { data: bot, error: botError } = await supabase
        .from('bots')
        .insert([{
            user_id: userId,
            name: name,
            platform: 'whatsapp',
            status: 'offline'
        }])
        .select()
        .single();

    if (botError) throw new Error(`Failed to create bot: ${botError.message}`);

    // 2. Generate Flow
    console.log(`[Action] Generating custom flow for "${name}": ${description}`);
    let flowData;
    try {
        flowData = await generateFlowFromPrompt(description);
        // Pack into existing structure if needed, or just use as is
        // Our schema expects 'nodes' column to hold everything
        const packedData = {
            _nodes: flowData.nodes,
            _edges: flowData.edges
        };

        // 3. Save Flow
        const { error: flowError } = await supabase
            .from('flows')
            .insert([{
                bot_id: bot.id,
                name: 'Generated Flow',
                nodes: packedData
            }]);

        if (flowError) throw new Error(`Failed to save flow: ${flowError.message}`);

    } catch (e: any) {
        console.error("Generator Failed:", e);
        // Fallback to default if generation fails
        const defaultNodes = [{ id: '1', type: 'trigger', data: { triggerValue: 'hello' }, position: { x: 100, y: 100 } }];
        await supabase.from('flows').insert([{ bot_id: bot.id, name: 'Fallback Flow', nodes: defaultNodes }]);
        throw new Error(`Flow generation failed (bot created though): ${e.message}`);
    }

    return { success: true, botId: bot.id, botName: bot.name, generated: true };
}

export async function updateNodeAction(userId: string, botId: string, nodeId: string, newContent: string) {
    const supabase = createClient();

    // 1. Get Flow
    const { data: flow } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId)
        .single();

    if (!flow) throw new Error('Flow not found');

    // 2. Find and Update Node
    // 'nodes' column can be array OR object { _nodes, _edges }
    let nodesArray: any[] = [];
    let flowObj: any = {};
    let isObjectFormat = false;

    if (Array.isArray(flow.nodes)) {
        nodesArray = JSON.parse(JSON.stringify(flow.nodes));
    } else if (flow.nodes && (flow.nodes as any)._nodes) {
        flowObj = JSON.parse(JSON.stringify(flow.nodes));
        nodesArray = flowObj._nodes;
        isObjectFormat = true;
    }

    // Attempt to find node by ID
    console.log(`[UpdateNode] Searching for node ${nodeId} in ${nodesArray.length} nodes.`);
    console.log(`[UpdateNode] Available IDs: ${nodesArray.map((n: any) => n.id).join(', ')}`);

    let nodeIndex = nodesArray.findIndex((n: any) => n.id === nodeId);

    // Fallback: if not found by ID, try to find the first text response node?
    // This is a heuristic for "Change greeting" where AI might not know the ID.
    if (nodeIndex === -1) {
        console.warn(`Node ${nodeId} not found. Available IDs: ${nodesArray.map((n: any) => n.id).join(', ')}`);
        throw new Error(`Node not found with ID ${nodeId}`);
    }

    console.log(`[UpdateNode] Found node at index ${nodeIndex}. Type: ${nodesArray[nodeIndex].type}`);
    console.log(`[UpdateNode] BEFORE update:`, JSON.stringify(nodesArray[nodeIndex]));

    // Update data.message for message nodes
    if (nodesArray[nodeIndex].data && nodesArray[nodeIndex].data.message) {
        nodesArray[nodeIndex].data.message = newContent;
    } else if (nodesArray[nodeIndex].type === 'reply') {
        // legacy structure check
        if ((nodesArray[nodeIndex] as any).message) {
            (nodesArray[nodeIndex] as any).message = newContent;
        }
    }

    console.log(`[UpdateNode] AFTER update:`, JSON.stringify(nodesArray[nodeIndex]));

    // 3. Save back
    let newColumnValue;
    if (isObjectFormat) {
        flowObj._nodes = nodesArray;
        newColumnValue = flowObj;
    } else {
        newColumnValue = nodesArray;
    }

    console.log(`[UpdateNode] Modifying Node ${nodeId}. New Content: "${newContent}"`);
    console.log(`[UpdateNode] Target Node Data:`, JSON.stringify(nodesArray[nodeIndex].data));

    const { error } = await supabase
        .from('flows')
        .update({ nodes: newColumnValue })
        .eq('id', flow.id);

    if (error) {
        console.error('[UpdateNode] DB Error:', error);
        throw new Error(error.message);
    }

    console.log('[UpdateNode] Success saving to DB');
    return { success: true };
}

export async function findAndUpdateNodeAction(userId: string, botId: string, searchText: string, newContent: string) {
    const supabase = createClient();
    console.log(`[FindUpdate] Searching for text param "${searchText}" to replace with "${newContent}" for bot ${botId}`);

    // 1. Get Flow
    const { data: flow } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId)
        .single();

    if (!flow) throw new Error('Flow not found');

    // 2. Parse Nodes
    let nodesArray: any[] = [];
    let flowObj: any = {};
    let isObjectFormat = false;

    if (Array.isArray(flow.nodes)) {
        nodesArray = JSON.parse(JSON.stringify(flow.nodes));
    } else if (flow.nodes && (flow.nodes as any)._nodes) {
        flowObj = JSON.parse(JSON.stringify(flow.nodes));
        nodesArray = flowObj._nodes;
        isObjectFormat = true;
    }

    // 3. Find Node by content
    // Check message OR buttons
    const targetIndex = nodesArray.findIndex((n: any) => {
        if (!n.data) return false;

        // Check message (text node)
        if (n.data.message && n.data.message.toLowerCase().includes(searchText.toLowerCase())) return true;

        // Check Buttons keys
        if (n.type === 'buttons' && n.data.buttons && Array.isArray(n.data.buttons)) {
            // Check if any button text matches
            const hasMatch = n.data.buttons.some((btn: any) => btn.text && btn.text.toLowerCase().includes(searchText.toLowerCase()));
            if (hasMatch) return true;
        }

        return false;
    });

    if (targetIndex === -1) {
        throw new Error(`Could not find any text or button containing "${searchText}"`);
    }

    console.log(`[FindUpdate] Found match in node ${nodesArray[targetIndex].id}. Replacing...`);

    // 4. Update Logic (Smart)
    // Check if newContent is JSON (for structural updates like adding buttons)
    let isJson = false;
    try {
        if (newContent.trim().startsWith('{')) {
            const parsed = JSON.parse(newContent);
            if (typeof parsed === 'object') {
                isJson = true;
                // Merge/Replace data
                nodesArray[targetIndex].data = { ...nodesArray[targetIndex].data, ...parsed };
                console.log(`[FindUpdate] Applied JSON update to node data.`);
            }
        }
    } catch (e) {
        // Not JSON, treat as string
    }

    if (!isJson) {
        // Treat as simple text replacement
        if (nodesArray[targetIndex].type === 'message' || nodesArray[targetIndex].data.message) {
            nodesArray[targetIndex].data.message = newContent;
        } else if (nodesArray[targetIndex].type === 'buttons') {
            // If user tries to "update text" of a button node but sends string, assume they mean the prompt message?
            // Or throw error? Let's assume prompt message if it exists, otherwise error.
            if (nodesArray[targetIndex].data.message) {
                nodesArray[targetIndex].data.message = newContent;
            } else {
                throw new Error("Cannot update Button Node with simple text string. Send JSON data to update buttons structure.");
            }
        }
    }

    // 5. Save
    let newColumnValue;
    if (isObjectFormat) {
        flowObj._nodes = nodesArray;
        newColumnValue = flowObj;
    } else {
        newColumnValue = nodesArray;
    }

    const { error } = await supabase
        .from('flows')
        .update({ nodes: newColumnValue })
        .eq('id', flow.id);

    if (error) throw new Error(error.message);

    return { success: true, updatedNodeId: nodesArray[targetIndex].id, oldTextSnippet: searchText };
}

export async function getBotFlowAction(userId: string, botId: string) {
    const supabase = createClient();

    // 1. Get Flow
    const { data: flow } = await supabase
        .from('flows')
        .select('*')
        .eq('bot_id', botId)
        .single();

    if (!flow) return "Flow not found or empty.";

    // 2. Parse
    let nodesArray: any[] = [];
    if (Array.isArray(flow.nodes)) {
        nodesArray = flow.nodes;
    } else if (flow.nodes && (flow.nodes as any)._nodes) {
        nodesArray = (flow.nodes as any)._nodes;
    }

    if (nodesArray.length === 0) return "Flow is empty.";

    // 3. Summarize
    const summary = nodesArray.map((n: any) => {
        let content = '';
        if (n.data.message) {
            let msg = n.data.message;
            if (typeof msg === 'object') {
                msg = msg.text || msg.message || JSON.stringify(msg);
            }
            // Increased limit to 150 chars to avoid cutting off important context like phone numbers
            const displayMsg = String(msg).length > 150 ? String(msg).substring(0, 150) + '...' : String(msg);
            content = `📝 Text: "${displayMsg}"`;
        }
        if (n.data.buttons) content = `🔘 Buttons: ${n.data.buttons.map((b: any) => `[${b.text}]`).join(' ')}`;

        return `🔹 **Block ${n.id}** (${n.type}) | ${content}`;
    }).join('\n\n');

    return summary;
}

