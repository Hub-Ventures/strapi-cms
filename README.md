# Strapi Integration Kit

Este branch (`strapi-kit`) contiene únicamente los archivos esenciales para integrar Strapi con tu frontend (Astro, Next.js, etc.).

## Contenido

1.  **`src/lib/strapi-routes.ts`**
    *   **Qué hace:** Helper para leer páginas de Strapi y generar rutas dinámicas.
    *   **Uso:** Impórtalo en tu proyecto para usar `buildStaticPaths` o `fetchPageByPath`.
    *   **Dependencias:** Ninguna (usa `fetch` nativo).

2.  **`scripts/setup-webhook.ts`**
    *   **Qué hace:** Script para configurar automáticamente el webhook de rebuild en Strapi.
    *   **Uso:** `npx tsx scripts/setup-webhook.ts` (requiere variables de entorno).
    *   **Dependencias:** Node.js 18+.

## Instrucciones

Para usar estos archivos en tu proyecto principal:

```bash
# Opción A: Copiar manualmente
cp src/lib/strapi-routes.ts TU_PROYECTO/src/lib/
cp scripts/setup-webhook.ts TU_PROYECTO/scripts/

# Opción B: Merge (con cuidado)
git checkout main
git checkout strapi-kit -- src/lib/strapi-routes.ts scripts/setup-webhook.ts
```
