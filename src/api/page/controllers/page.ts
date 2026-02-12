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
  blocks: {
    populate: '*',
  },
};

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
    ctx.query = {
      ...ctx.query,
      populate: pagePopulate,
    };
    return await super.find(ctx);
  },

  /**
   * Override findOne to auto-populate all relations and blocks.
   */
  async findOne(ctx) {
    ctx.query = {
      ...ctx.query,
      populate: pagePopulate,
    };
    return await super.findOne(ctx);
  },

  /**
   * Duplicate an existing page with a new title and slug.
   * POST /api/pages/:id/duplicate
   */
  async duplicate(ctx) {
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

    ctx.body = { data: newPage };
  },
}));
