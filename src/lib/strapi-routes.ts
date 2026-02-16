// ──────────────────────────────────────────────
// Strapi Route Helper for Astro
// Drop-in helper that generates dynamic routes
// from a Strapi CMS with Client → Folder → Page hierarchy.
// ──────────────────────────────────────────────

// ── Types ─────────────────────────────────────

export interface ParsedRoute {
    client: string;
    folder: string;
    page: string;
}

export interface StrapiPage {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    api_url: string | null;
    is_homepage: boolean;
    folder: { id: number; slug: string; name: string } | null;
    blocks: any[];
    navbar?: any;
    footer?: any;
    theme?: any;
    seo?: any;
    [key: string]: unknown;
}

interface StrapiListResponse {
    data: StrapiPage[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

interface StrapiSingleResponse {
    data: StrapiPage;
}

// ── Internal fetch ────────────────────────────

async function strapiGet<T>(cmsUrl: string, path: string): Promise<T> {
    const baseUrl = cmsUrl.replace(/\/+$/, '');
    const url = `${baseUrl}${path}`;

    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Strapi fetch failed [${res.status}]: ${url}\n${body}`);
    }

    return res.json() as Promise<T>;
}

// ── Core Functions ────────────────────────────

/**
 * Parse a Strapi `api_url` to extract client, folder, and page slugs.
 *
 * Input:  "http://localhost:1337/api/demo-client/home/index"
 * Output: { client: "demo-client", folder: "home", page: "index" }
 */
export function parseApiUrl(apiUrl: string): ParsedRoute | null {
    try {
        const url = new URL(apiUrl);
        // pathname = "/api/demo-client/home/index"
        const parts = url.pathname.split('/').filter(Boolean);

        // Expected: ["api", clientSlug, folderSlug, pageSlug]
        if (parts.length >= 4 && parts[0] === 'api') {
            return {
                client: parts[1],
                folder: parts[2],
                page: parts[3],
            };
        }

        // Fallback for 2-segment: ["api", clientSlug, pageSlug]
        if (parts.length === 3 && parts[0] === 'api') {
            return {
                client: parts[1],
                folder: '',
                page: parts[2],
            };
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Fetch all published pages from Strapi.
 */
export async function fetchAllPages(cmsUrl: string): Promise<StrapiPage[]> {
    const allPages: StrapiPage[] = [];
    let page = 1;
    let pageCount = 1;

    while (page <= pageCount) {
        const params = new URLSearchParams();
        params.set('pagination[page]', String(page));
        params.set('pagination[pageSize]', '100');
        params.set('publicationState', 'live');

        const response = await strapiGet<StrapiListResponse>(
            cmsUrl,
            `/api/pages?${params}`
        );

        allPages.push(...response.data);
        pageCount = response.meta.pagination.pageCount;
        page++;
    }

    return allPages;
}

/**
 * Build static paths compatible with Astro's getStaticPaths().
 *
 * Returns an array like:
 * [
 *   { params: { slug: "demo-client/home/index" }, props: { page: {...} } },
 *   { params: { slug: "demo-client/home/about" }, props: { page: {...} } },
 * ]
 */
export async function buildStaticPaths(cmsUrl: string) {
    const pages = await fetchAllPages(cmsUrl);
    const paths: Array<{ params: { slug: string }; props: { page: StrapiPage } }> = [];

    for (const page of pages) {
        if (!page.api_url) continue;

        const parsed = parseApiUrl(page.api_url);
        if (!parsed) continue;

        // Build the slug: "client/folder/page"
        const slugParts = [parsed.client, parsed.folder, parsed.page].filter(Boolean);
        const slug = slugParts.join('/');

        paths.push({
            params: { slug },
            props: { page },
        });
    }

    return paths;
}

/**
 * Fetch a specific page by its client, folder, and page slug.
 * Uses the Strapi custom route: GET /api/:client/:folder/:slug
 */
export async function fetchPageByPath(
    cmsUrl: string,
    client: string,
    folder: string,
    slug: string
): Promise<StrapiPage | null> {
    try {
        const path = folder
            ? `/${client}/${folder}/${slug}`
            : `/${client}/${slug}`;

        const response = await strapiGet<StrapiSingleResponse>(cmsUrl, `/api${path}`);
        return response.data ?? null;
    } catch {
        return null;
    }
}

/**
 * Fetch the homepage. Looks for a page with is_homepage=true.
 */
export async function fetchHomepage(cmsUrl: string): Promise<StrapiPage | null> {
    const params = new URLSearchParams();
    params.set('filters[is_homepage][$eq]', 'true');
    params.set('publicationState', 'live');

    const response = await strapiGet<StrapiListResponse>(
        cmsUrl,
        `/api/pages?${params}`
    );

    return response.data[0] ?? null;
}

/**
 * Resolve absolute URL for a Strapi media file.
 */
export function resolveMediaUrl(cmsUrl: string, url: string | undefined | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = cmsUrl.replace(/\/+$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
