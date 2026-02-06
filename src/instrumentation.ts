export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        if ((global as any).__instrumentation_initialized) {
            return;
        }
        (global as any).__instrumentation_initialized = true;

        console.log('[Instrumentation] Server starting, initializing WhatsApp restoration...');

        // Dynamic import to avoid bundling issues in non-node environments (though check ensures nodejs)
        const { restoreSessions } = await import('./lib/whatsapp/restore');
        // Do not await this, let it run in background to not block server startup
        restoreSessions().catch(console.error);
    }
}
