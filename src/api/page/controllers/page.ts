/**
 * page controller
 */
import { factories } from '@strapi/strapi';

/**
 * Shared populate configuration for Page queries.
 * Ensures all relations, components, and Dynamic Zone blocks
 * are fully populated in every response.
 */
const pagePopulate = {
  seo: {
    populate: {
      og_image: true,
    },
  },
  navbar: {
    populate: {
      logo: true,
      items: true,
    },
  },
  footer: {
    populate: {
      columns: {
        populate: {
          links: true,
        },
      },
    },
  },
  theme: {
    populate: {
      logo: true,
      favicon: true,
    },
  },
  folder: true,
  blocks: {
    populate: '*',
  },
};

function resolveBaseUrl(ctx: any): string {
  const configured = process.env.URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');

  const origin = ctx?.request?.origin;
  if (typeof origin === 'string' && origin.trim()) {
    return origin.replace(/\/+$/, '');
  }

  return 'http://localhost:1337';
}

function buildAbsoluteUrl(url: unknown, baseUrl: string): string | null {
  if (typeof url !== 'string' || !url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${normalizedPath}`;
}

function isUploadMediaEntity(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== 'object') return false;
  const media = value as Record<string, any>;
  if (typeof media.url !== 'string') return false;

  return (
    typeof media.mime === 'string' ||
    typeof media.ext === 'string' ||
    typeof media.provider === 'string' ||
    media.formats !== undefined
  );
}

function buildLibraryApiUrl(media: Record<string, any>, baseUrl: string): string | null {
  if (media.id !== undefined && media.id !== null) {
    return `${baseUrl}/api/upload/files/${media.id}`;
  }

  if (typeof media.documentId === 'string' && media.documentId) {
    const encodedDocId = encodeURIComponent(media.documentId);
    return `${baseUrl}/api/upload/files?filters[documentId][$eq]=${encodedDocId}`;
  }

  return null;
}

function enrichMediaUrlsDeep(payload: unknown, baseUrl: string): unknown {
  if (Array.isArray(payload)) {
    return payload.map((item) => enrichMediaUrlsDeep(item, baseUrl));
  }

  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const record = payload as Record<string, unknown>;

  if (isUploadMediaEntity(record)) {
    const absoluteUrl = buildAbsoluteUrl(record.url, baseUrl);
    if (absoluteUrl) {
      record.absolute_url = absoluteUrl;
    }

    const libraryApiUrl = buildLibraryApiUrl(record, baseUrl);
    if (libraryApiUrl) {
      record.library_api_url = libraryApiUrl;
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (value && typeof value === 'object') {
      record[key] = enrichMediaUrlsDeep(value, baseUrl);
    }
  }

  return record;
}

async function attachBlockMediaIfMissing(strapi: any, blocks: unknown): Promise<void> {
  if (!Array.isArray(blocks) || blocks.length === 0) return;
  const knex = strapi.db.connection;

  for (const block of blocks as Array<Record<string, any>>) {
    // blocks.hero.background_image
    if (block.__component === 'blocks.hero' && block.id && !block.background_image?.url) {
      try {
        const rows = await knex('files_related_mph')
          .join('files', 'files.id', 'files_related_mph.file_id')
          .where({
            'files_related_mph.related_type': 'blocks.hero',
            'files_related_mph.related_id': block.id,
            'files_related_mph.field': 'background_image',
          })
          .select('files.*')
          .orderBy('files_related_mph.order', 'asc');

        if (rows.length > 0) {
          block.background_image = rows[0];
        }
      } catch {
        // no-op: keep API response stable even if media hydration fails
      }
    }

    // shared.team-member.photo (inside blocks.team.members)
    if (block.__component === 'blocks.team' && Array.isArray(block.members)) {
      for (const member of block.members as Array<Record<string, any>>) {
        if (!member?.id || member.photo?.url) continue;

        try {
          const rows = await knex('files_related_mph')
            .join('files', 'files.id', 'files_related_mph.file_id')
            .where({
              'files_related_mph.related_type': 'shared.team-member',
              'files_related_mph.related_id': member.id,
              'files_related_mph.field': 'photo',
            })
            .select('files.*')
            .orderBy('files_related_mph.order', 'asc');

          if (rows.length > 0) {
            member.photo = rows[0];
          }
        } catch {
          // no-op
        }
      }
    }

    // blocks.image-grid.images (multiple media)
    if (block.__component === 'blocks.image-grid' && block.id) {
      const hasImageUrls = Array.isArray(block.images) && block.images.some((img: any) => !!img?.url);
      if (!hasImageUrls) {
        try {
          const rows = await knex('files_related_mph')
            .join('files', 'files.id', 'files_related_mph.file_id')
            .where({
              'files_related_mph.related_type': 'blocks.image-grid',
              'files_related_mph.related_id': block.id,
              'files_related_mph.field': 'images',
            })
            .select('files.*')
            .orderBy('files_related_mph.order', 'asc');

          if (rows.length > 0) {
            block.images = rows;
          }
        } catch {
          // no-op
        }
      }
    }
  }
}

async function enhancePageMediaResponse(
  strapi: any,
  payload: unknown,
  baseUrl: string
): Promise<unknown> {
  if (!payload || typeof payload !== 'object') return payload;

  const maybeData = (payload as Record<string, any>).data;
  const pages = Array.isArray(maybeData) ? maybeData : maybeData ? [maybeData] : [];

  for (const page of pages) {
    await attachBlockMediaIfMissing(strapi, page?.blocks);
  }

  return enrichMediaUrlsDeep(payload, baseUrl);
}

/**
 * Recursively strips `id`, `documentId`, `createdAt`, `updatedAt`
 * from nested objects/arrays so the data can be passed to `create`.
 */
function sanitizeForClone(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(sanitizeForClone);
  }
  if (data !== null && typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale'].includes(key)) {
        continue;
      }
      cleaned[key] = sanitizeForClone(value);
    }
    return cleaned;
  }
  return data;
}

export default factories.createCoreController('api::page.page', ({ strapi }) => ({
  /**
   * Override find to auto-populate all relations and blocks.
   */
  async find(ctx) {
    const baseUrl = resolveBaseUrl(ctx);
    ctx.query = {
      ...ctx.query,
      populate: pagePopulate,
    };
    const response = await super.find(ctx);
    return await enhancePageMediaResponse(strapi, response, baseUrl);
  },

  /**
   * Override findOne to auto-populate all relations and blocks.
   */
  async findOne(ctx) {
    const baseUrl = resolveBaseUrl(ctx);
    ctx.query = {
      ...ctx.query,
      populate: pagePopulate,
    };
    const response = await super.findOne(ctx);
    return await enhancePageMediaResponse(strapi, response, baseUrl);
  },

  /**
   * Duplicate an existing page with a new title and slug.
   * POST /api/pages/:id/duplicate
   */
  async duplicate(ctx) {
    const baseUrl = resolveBaseUrl(ctx);
    const { id } = ctx.params;

    const originalPage = await strapi.documents('api::page.page').findOne({
      documentId: id,
      populate: pagePopulate,
    });

    if (!originalPage) {
      return ctx.notFound('Page not found');
    }

    // Sanitize: strip system fields and nested IDs for clean clone
    const sanitized = sanitizeForClone(originalPage) as Record<string, unknown>;

    // Extract relation IDs for proper linking
    const navbarId = (originalPage as any).navbar?.documentId ?? null;
    const footerId = (originalPage as any).footer?.documentId ?? null;
    const themeId = (originalPage as any).theme?.documentId ?? null;

    const newPage = await strapi.documents('api::page.page').create({
      data: {
        title: `${originalPage.title} (copy)`,
        slug: `${originalPage.slug}-copy-${Date.now()}`,
        is_homepage: false,
        seo: sanitized.seo as any,
        blocks: sanitized.blocks as any,
        navbar: navbarId,
        footer: footerId,
        theme: themeId,
      },
      populate: pagePopulate,
    });

    ctx.body = await enhancePageMediaResponse(strapi, { data: newPage }, baseUrl);
  },

  /**
   * Find a page by Client Slug and Page Slug.
   * GET /api/pages/:client/:slug
   */
  async findByClientAndSlug(ctx) {
    const baseUrl = resolveBaseUrl(ctx);
    const { client: clientSlug, slug: pageSlug } = ctx.params;

    const filters: any = {
      slug: pageSlug,
    };

    // If client is 'global', look for pages with no client (main homepage etc)
    if (clientSlug === 'global' || clientSlug === 'shared') {
      filters.client = { $null: true };
    } else {
      filters.client = {
        slug: { $eq: clientSlug },
      };
    }

    const page = await strapi.documents('api::page.page').findFirst({
      filters,
      populate: pagePopulate,
      publicationState: 'live',
    });

    if (!page) {
      return ctx.notFound('Page not found or not published');
    }

    return await enhancePageMediaResponse(strapi, { data: page }, baseUrl);
  },

  /**
   * Find a page by Client Slug, Folder Slug and Page Slug.
   * GET /api/pages/:client/:folder/:slug
   */
  async findByClientFolderAndSlug(ctx) {
    const baseUrl = resolveBaseUrl(ctx);
    const { client: clientSlug, folder: folderSlug, slug: pageSlug } = ctx.params;

    const filters: any = {
      slug: pageSlug,
      folder: {
        slug: { $eq: folderSlug },
      },
    };

    if (clientSlug === 'global' || clientSlug === 'shared') {
      filters.client = { $null: true };
    } else {
      filters.client = {
        slug: { $eq: clientSlug },
      };
    }

    const page = await strapi.documents('api::page.page').findFirst({
      filters,
      populate: pagePopulate,
      publicationState: 'live',
    });

    if (!page) {
      return ctx.notFound('Page not found or not published');
    }

    return await enhancePageMediaResponse(strapi, { data: page }, baseUrl);
  },
}));
