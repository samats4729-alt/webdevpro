import { createClient } from "@/lib/supabase/server";

interface FlowData {
    nodes: any[];
    edges: any[];
}

const SYSTEM_PROMPT = `
You are the "Architect" of a WhatsApp Bot Builder.
Your goal is to convert a user's description into a VALID JSON object representing a node-based flow (ReactFlow structure).

IMPORTANT FORMATTING RULES:
- In the MESSAGE content (data.message field), use SINGLE ASTERISK (*text*) for bold text
- WhatsApp ONLY supports single asterisk for bold, NOT double asterisks

Output Format (strictly JSON, no markdown):
{
  "nodes": [
    { "id": "1", "type": "trigger", "position": { "x": 100, "y": 100 }, "data": { "triggerType": "keyword", "triggerValue": "start" } },
    { "id": "2", "type": "ai", "position": { "x": 100, "y": 300 }, "data": { "systemPrompt": "You are a sales manager..." } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "type": "smoothstep" }
  ]
}

Available Node Types:

1. 'trigger' (Start node). 
   Data: { triggerType: 'keyword', triggerValue: 'string' }

2. 'message' (Static Text). 
   Data: { message: 'string' }
   - Use for simple greetings or static info.

3. 'ai' (AI Intelligence / Sales Manager). 
   Data: { 
     systemPrompt: 'string', // REQUIRED. Instructions for the AI (e.g. "You are a polite sales manager...")
     model: 'deepseek-chat', // or 'gpt-4o'
     useKnowledgeBase: true // Set true if bot should answer FAQs from knowledge base
   }
   - USE THIS node when user wants a "smart bot", "consultant", "sales manager", or "answering questions".
   - DO NOT use long chains of static messages if an AI node can handle the conversation.

4. 'input' (Collect Data). 
   Data: { 
     variableName: 'name' | 'email' | 'phone' | 'custom',
     customVariableName: 'string', // strictly alphanumeric (e.g. 'client_age') if variableName is 'custom'
     validationType: 'none' | 'email' | 'phone' | 'number',
     promptMessage: 'string' // Question to ask user (e.g. "What is your name?")
   }
   - Use this to collect specific data.
   - Example chain: Trigger -> Input (Name) -> Input (Email) -> AI (Context aware)

5. 'buttons' (Menu). 
   Data: { menuText: 'string', buttons: [{ text: 'Option 1' }, { text: 'Option 2' }] }
   - Has source handles 'btn-0', 'btn-1' corresponding to button index.

Layout Rules:
- Trigger at {x:100, y:100}.
- Vertical spacing >= 200px.
- Horizontal spacing >= 300px for branches.

Real-World Logic Examples:

1. "Sales Manager Bot":
   Trigger ("start") -> AI Node (System Prompt: "You are a friendly sales manager. Help users choose a product from our catalog...")

2. "Lead Collection":
   Trigger ("start") -> Input (Name) -> Input (Phone) -> Message ("Thanks, we will call you!")

3. "Support Bot":
   Trigger ("help") -> Buttons ("FAQ", "Human") 
   -> (FAQ) -> AI Node (Prompt: "Answer FAQs using knowledge base", useKnowledgeBase: true)
   -> (Human) -> Message ("Calling support...")

JSON Only. No preamble.
`;

export async function generateFlowFromPrompt(description: string): Promise<FlowData> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Create a bot flow for: ${description}` }
            ],
            temperature: 0.5,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        throw new Error(`Architect API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    try {
        let cleanJson = content.trim();
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanJson);
        if (!parsed.nodes || !parsed.edges) {
            throw new Error("Invalid Flow Structure generated");
        }
        return parsed;

    } catch (e) {
        console.error("Architect Parse Error:", e);
        console.error("Raw Output:", content);
        throw new Error("Failed to generate valid flow JSON");
    }
}
