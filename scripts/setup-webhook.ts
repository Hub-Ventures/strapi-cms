/**
 * Setup Webhook — Registra un webhook en Strapi para auto-rebuild.
 *
 * Este script usa la API de Strapi para crear un webhook que notifica
 * a tu hosting (Vercel, Netlify, etc.) cuando el contenido cambia.
 *
 * Uso:
 *   npx tsx scripts/setup-webhook.ts
 *
 * Variables de entorno requeridas:
 *   STRAPI_URL         — URL del CMS (ej: http://localhost:1337)
 *   STRAPI_API_TOKEN   — Token de Admin API de Strapi (Admin JWT)
 *   REBUILD_HOOK_URL   — URL del deploy hook de tu hosting
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.PUBLIC_CMS_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const REBUILD_HOOK_URL = process.env.REBUILD_HOOK_URL;

if (!STRAPI_URL || !STRAPI_API_TOKEN || !REBUILD_HOOK_URL) {
    console.error("❌ Faltan variables de entorno:");
    if (!STRAPI_URL) console.error("   - STRAPI_URL (o PUBLIC_CMS_URL)");
    if (!STRAPI_API_TOKEN) console.error("   - STRAPI_API_TOKEN");
    if (!REBUILD_HOOK_URL) console.error("   - REBUILD_HOOK_URL");
    console.error("\nEjemplo:");
    console.error(
        '  STRAPI_URL=http://localhost:1337 STRAPI_API_TOKEN=xxx REBUILD_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/xxx npx tsx scripts/setup-webhook.ts'
    );
    process.exit(1);
}

const WEBHOOK_NAME = "astro-rebuild";

// Eventos que disparan el rebuild
const WEBHOOK_EVENTS = [
    "entry.publish",
    "entry.unpublish",
    "entry.update",
    "entry.delete",
    "entry.create",
];

async function listWebhooks(): Promise<any[]> {
    const res = await fetch(`${STRAPI_URL}/admin/webhooks`, {
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    });
    if (!res.ok) {
        throw new Error(`Error listando webhooks: ${res.status} ${res.statusText}`);
    }
    const data: any = await res.json();
    return data.data || data;
}

async function deleteWebhook(id: number): Promise<void> {
    const res = await fetch(`${STRAPI_URL}/admin/webhooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
    });
    if (!res.ok) {
        throw new Error(`Error eliminando webhook ${id}: ${res.status}`);
    }
}

async function createWebhook(): Promise<any> {
    const res = await fetch(`${STRAPI_URL}/admin/webhooks`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: WEBHOOK_NAME,
            url: REBUILD_HOOK_URL,
            headers: {},
            events: WEBHOOK_EVENTS,
        }),
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Error creando webhook: ${res.status} — ${body}`);
    }
    return await res.json();
}

async function main() {
    console.log(`\n🔧 Configurando webhook "${WEBHOOK_NAME}"...`);
    console.log(`   Strapi:  ${STRAPI_URL}`);
    console.log(`   Hook:    ${REBUILD_HOOK_URL}`);
    console.log(`   Eventos: ${WEBHOOK_EVENTS.join(", ")}\n`);

    // 1. Verificar si ya existe
    const existing = await listWebhooks();
    const old = existing.filter((w: any) => w.name === WEBHOOK_NAME);

    if (old.length > 0) {
        console.log(`⚠️  Encontrado webhook existente "${WEBHOOK_NAME}", reemplazando...`);
        for (const w of old) {
            await deleteWebhook(w.id);
        }
    }

    // 2. Crear nuevo
    const created = await createWebhook();
    console.log(`✅ Webhook creado exitosamente!`);
    console.log(`   ID: ${created.data?.id || created.id}`);
    console.log(`\n   Ahora cada vez que publiques/edites contenido en Strapi,`);
    console.log(`   se disparará un rebuild automático del sitio.\n`);
}

main().catch((err) => {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
});
