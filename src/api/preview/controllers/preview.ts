/**
 * Preview Controller
 *
 * Validates the preview secret, fetches the requested page (draft or published),
 * and renders a full HTML preview with styled block components.
 *
 * Strapi v5 dynamic zones only support `populate: '*'` (no deep targeting).
 * So we populate blocks with '*' and then manually resolve nested media.
 */

const STRAPI_BASE = (process.env.PUBLIC_URL || process.env.URL || 'http://localhost:1337')
  .trim()
  .replace(/\/+$/, '');
const META_DESCRIPTION_MAX_LENGTH = 160;

// ── Image URL Helper ─────────────────────────────────────────────────────────

function resolveImageUrl(media): string | null {
  if (!media) return null;
  const file = Array.isArray(media) ? media[0] : media;
  if (!file?.url) return null;
  if (file.url.startsWith('http')) return file.url;
  return `${STRAPI_BASE}${file.url}`;
}

function resolveAllImageUrls(media): string[] {
  if (!media) return [];
  const list = Array.isArray(media) ? media : [media];
  return list
    .map((file) => {
      if (!file?.url) return null;
      if (file.url.startsWith('http')) return file.url;
      return `${STRAPI_BASE}${file.url}`;
    })
    .filter(Boolean);
}

// ── SEO Helpers ──────────────────────────────────────────────────────────────

function normalizeMetaText(value: unknown): string {
  if (typeof value !== 'string') return '';

  const withoutTags = value.replace(/<[^>]*>/g, ' ');
  const decoded = withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  return decoded.replace(/\s+/g, ' ').trim();
}

function truncateMetaText(value: string, maxLength = META_DESCRIPTION_MAX_LENGTH): string {
  if (value.length <= maxLength) return value;

  const maxWithoutEllipsis = Math.max(maxLength - 3, 1);
  const sliced = value.slice(0, maxWithoutEllipsis);
  const lastSpace = sliced.lastIndexOf(' ');
  const boundary = Math.floor(maxWithoutEllipsis * 0.6);
  const shortened = lastSpace >= boundary ? sliced.slice(0, lastSpace) : sliced;

  return `${shortened.trimEnd()}...`;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function pickFirstTextFromBlocks(blocks, component: string, field: string): string {
  if (!Array.isArray(blocks)) return '';

  for (const block of blocks) {
    if (block?.__component !== component) continue;
    const candidate = normalizeMetaText(block?.[field]);
    if (candidate) return candidate;
  }

  return '';
}

function buildPreviewMetaDescription(page): string {
  const manualDescription =
    typeof page?.seo?.meta_description === 'string' ? page.seo.meta_description : '';

  if (manualDescription.trim()) {
    return manualDescription;
  }

  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
  const orderedCandidates = [
    pickFirstTextFromBlocks(blocks, 'blocks.text-block', 'content'),
    pickFirstTextFromBlocks(blocks, 'blocks.hero', 'subtitle'),
    pickFirstTextFromBlocks(blocks, 'blocks.cta', 'description'),
    pickFirstTextFromBlocks(blocks, 'blocks.features', 'subtitle'),
    pickFirstTextFromBlocks(blocks, 'blocks.faq', 'title'),
    pickFirstTextFromBlocks(blocks, 'blocks.team', 'title'),
    pickFirstTextFromBlocks(blocks, 'blocks.stats', 'title'),
    pickFirstTextFromBlocks(blocks, 'blocks.image-grid', 'caption'),
  ];

  const fallbackSource = orderedCandidates.find(Boolean) || normalizeMetaText(page?.title);
  return truncateMetaText(fallbackSource || '');
}

// ── Block Renderers ──────────────────────────────────────────────────────────

function renderHero(block) {
  const align = block.alignment || 'center';
  const variant = block.variant || 'centered';
  const bgUrl = resolveImageUrl(block.background_image);
  const bgStyle = bgUrl
    ? `background-image: url('${bgUrl}'); background-size: cover; background-position: center;`
    : '';

  return `
    <section class="block-hero ${variant}" style="text-align:${align}; ${bgStyle}">
      <div class="hero-overlay">
        ${block.title ? `<h1>${block.title}</h1>` : ''}
        ${block.subtitle ? `<p class="subtitle">${block.subtitle}</p>` : ''}
        ${block.cta_text ? `<a href="${ensureAbsoluteUrl(block.cta_url)}" class="cta-btn" target="_blank" rel="noopener">${block.cta_text}</a>` : ''}
      </div>
    </section>`;
}

function renderTextBlock(block) {
  return `
    <section class="block-text ${block.variant || 'simple'}" style="text-align:${block.alignment || 'left'}">
      ${block.title ? `<h2>${block.title}</h2>` : ''}
      ${block.content ? `<div class="content">${block.content}</div>` : ''}
    </section>`;
}

function renderCta(block) {
  return `
    <section class="block-cta ${block.variant || 'banner'} ${block.style || 'primary'}">
      ${block.heading ? `<h2>${block.heading}</h2>` : ''}
      ${block.description ? `<p>${block.description}</p>` : ''}
      ${block.button_text ? `<a href="${ensureAbsoluteUrl(block.button_url)}" class="cta-btn" target="_blank" rel="noopener">${block.button_text}</a>` : ''}
    </section>`;
}

function renderFaq(block) {
  const items = block.items || [];
  return `
    <section class="block-faq">
      ${block.title ? `<h2>${block.title}</h2>` : ''}
      <div class="faq-list">
        ${items.map((item) => `
          <details class="faq-item">
            <summary>${item.question || ''}</summary>
            <p>${item.answer || ''}</p>
          </details>
        `).join('')}
      </div>
    </section>`;
}

function renderFeatures(block) {
  const items = block.items || [];
  return `
    <section class="block-features">
      ${block.title ? `<h2>${block.title}</h2>` : ''}
      ${block.subtitle ? `<p class="features-subtitle">${block.subtitle}</p>` : ''}
      <div class="features-grid">
        ${items.map((item) => `
          <div class="feature-card">
            ${item.icon ? `<span class="feature-icon">${item.icon}</span>` : ''}
            <h3>${item.title || ''}</h3>
            <p>${item.description || ''}</p>
          </div>
        `).join('')}
      </div>
    </section>`;
}

function ensureAbsoluteUrl(url: string): string {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) return url;
  return `https://${url}`;
}

function renderTeam(block) {
  const members = block.members || [];
  return `
    <section class="block-team">
      ${block.title ? `<h2>${block.title}</h2>` : ''}
      <div class="team-grid">
        ${members.map((m) => {
          const photoUrl = resolveImageUrl(m.photo);
          const linkedinUrl = m.linkedin ? ensureAbsoluteUrl(m.linkedin) : '';
          return `
          <div class="team-card">
            ${photoUrl ? `<img src="${photoUrl}" alt="${m.name || ''}" />` : '<div class="avatar-placeholder"></div>'}
            <h3>${m.name || ''}</h3>
            <p class="role">${m.role || ''}</p>
            ${linkedinUrl ? `<a href="${linkedinUrl}" class="linkedin-link" target="_blank" rel="noopener">LinkedIn</a>` : ''}
          </div>`;
        }).join('')}
      </div>
    </section>`;
}

function renderStats(block) {
  const items = block.statistics || [];
  return `
    <section class="block-stats">
      ${block.title ? `<h2>${block.title}</h2>` : ''}
      <div class="stats-grid">
        ${items.map((s) => `
          <div class="stat-card">
            <span class="stat-value">${s.number || ''}</span>
            <span class="stat-label">${s.label || ''}</span>
          </div>
        `).join('')}
      </div>
    </section>`;
}

function renderImageGrid(block) {
  const urls = resolveAllImageUrls(block.images);
  const cols = block.columns || 3;
  return `
    <section class="block-image-grid">
      ${block.caption ? `<h2>${block.caption}</h2>` : ''}
      <div class="image-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
        ${urls.map((url) => `
          <div class="grid-image">
            <img src="${url}" alt="" />
          </div>
        `).join('')}
      </div>
    </section>`;
}

function renderFooterBlock(block) {
  return `
    <footer class="block-footer">
      ${block.copyright ? `<p class="copyright">${block.copyright}</p>` : ''}
      <div class="social-links">
        ${block.social_facebook ? `<a href="${ensureAbsoluteUrl(block.social_facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
        ${block.social_instagram ? `<a href="${ensureAbsoluteUrl(block.social_instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}
        ${block.social_twitter ? `<a href="${ensureAbsoluteUrl(block.social_twitter)}" target="_blank" rel="noopener">Twitter</a>` : ''}
        ${block.social_linkedin ? `<a href="${ensureAbsoluteUrl(block.social_linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
      </div>
    </footer>`;
}

function renderSpacer(block) {
  const heights = { small: '24px', medium: '48px', large: '80px', xlarge: '120px' };
  const h = heights[block.variant] || heights.medium;
  return `<div class="block-spacer" style="height:${h}"></div>`;
}

function renderBlock(block) {
  const type = block.__component;
  switch (type) {
    case 'blocks.hero': return renderHero(block);
    case 'blocks.text-block': return renderTextBlock(block);
    case 'blocks.cta': return renderCta(block);
    case 'blocks.faq': return renderFaq(block);
    case 'blocks.features': return renderFeatures(block);
    case 'blocks.team': return renderTeam(block);
    case 'blocks.stats': return renderStats(block);
    case 'blocks.image-grid': return renderImageGrid(block);
    case 'blocks.footer': return renderFooterBlock(block);
    case 'blocks.spacer': return renderSpacer(block);
    default:
      return `<section class="block-unknown"><p>Block: ${type}</p></section>`;
  }
}

// ── Dynamic Styles (driven by Theme) ─────────────────────────────────────────

function generateStyles(theme) {
  // Theme defaults (fallback if no theme assigned)
  const primary = theme?.primary_color || '#0e172a';
  const secondary = theme?.secondary_color || '#64748b';
  const accent = theme?.accent_color || '#f59e0b';
  const fontHeading = theme?.font_heading || 'Inter';
  const fontBody = theme?.font_body || 'Inter';

  // Border radius mapping
  const radiusMap = { none: '0', small: '4px', medium: '8px', large: '16px' };
  const radius = radiusMap[theme?.border_radius] || radiusMap.medium;

  // Spacing mapping
  const spacingMap = { compact: '32px', normal: '48px', relaxed: '64px' };
  const sectionPadding = spacingMap[theme?.spacing] || spacingMap.normal;

  return `
  :root {
    --primary: ${primary};
    --secondary: ${secondary};
    --accent: ${accent};
    --font-heading: '${fontHeading}', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-body: '${fontBody}', -apple-system, BlinkMacSystemFont, sans-serif;
    --radius: ${radius};
    --section-padding: ${sectionPadding};
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--font-body);
    color: #1e293b;
    background: #ffffff;
    line-height: 1.6;
  }
  h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
  .draft-banner {
    background: var(--accent); color: #000; text-align: center;
    padding: 8px 16px; font-size: 13px; font-weight: 600; letter-spacing: 0.02em;
  }
  .block-hero {
    padding: 80px 40px; background: linear-gradient(135deg, var(--primary), ${secondary});
    color: #fff; position: relative;
  }
  .block-hero .hero-overlay { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
  .block-hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 12px; }
  .block-hero .subtitle { font-size: 1.2rem; opacity: 0.9; margin-bottom: 24px; }
  .block-hero .cta-btn,
  .block-cta .cta-btn {
    display: inline-block; padding: 12px 28px; background: #fff; color: var(--primary);
    border-radius: var(--radius); font-weight: 600; text-decoration: none; transition: transform 0.2s;
  }
  .block-hero .cta-btn:hover, .block-cta .cta-btn:hover { transform: translateY(-2px); }
  .block-text { padding: var(--section-padding) 40px; max-width: 800px; margin: 0 auto; }
  .block-text h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 16px; }
  .block-text .content { font-size: 1rem; color: var(--secondary); }
  .block-cta { padding: var(--section-padding) 40px; text-align: center; background: #f8fafc; }
  .block-cta.primary { background: var(--primary); color: #fff; }
  .block-cta h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 12px; }
  .block-cta p { margin-bottom: 20px; opacity: 0.85; }
  .block-faq { padding: var(--section-padding) 40px; max-width: 800px; margin: 0 auto; }
  .block-faq h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 20px; }
  .faq-item { border: 1px solid #e2e8f0; border-radius: var(--radius); margin-bottom: 8px; overflow: hidden; }
  .faq-item summary { padding: 14px 18px; cursor: pointer; font-weight: 500; list-style: none; }
  .faq-item summary::-webkit-details-marker { display: none; }
  .faq-item p { padding: 0 18px 14px; color: var(--secondary); }
  .block-features { padding: var(--section-padding) 40px; max-width: 1000px; margin: 0 auto; }
  .block-features h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 8px; text-align: center; }
  .features-subtitle { text-align: center; color: var(--secondary); margin-bottom: 24px; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
  .feature-card { background: #f8fafc; padding: 24px; border-radius: var(--radius); text-align: center; }
  .feature-icon { font-size: 2rem; display: block; margin-bottom: 12px; }
  .feature-card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
  .feature-card p { color: var(--secondary); font-size: 0.9rem; }
  .block-team { padding: var(--section-padding) 40px; max-width: 1000px; margin: 0 auto; }
  .block-team h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 24px; text-align: center; }
  .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
  .team-card { text-align: center; }
  .team-card img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; }
  .avatar-placeholder { width: 120px; height: 120px; border-radius: 50%; background: #e2e8f0; margin: 0 auto 12px; }
  .team-card h3 { font-size: 1rem; font-weight: 600; }
  .team-card .role { font-size: 0.85rem; color: var(--secondary); }
  .linkedin-link { display: inline-block; margin-top: 6px; font-size: 0.8rem; color: #0077b5; text-decoration: none; }
  .block-stats { padding: var(--section-padding) 40px; max-width: 1000px; margin: 0 auto; }
  .block-stats h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 24px; text-align: center; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px; }
  .stat-card { text-align: center; padding: 24px; background: #f8fafc; border-radius: var(--radius); }
  .stat-value { display: block; font-size: 2rem; font-weight: 800; color: var(--primary); }
  .stat-label { font-size: 0.85rem; color: var(--secondary); }
  .block-image-grid { padding: var(--section-padding) 40px; }
  .block-image-grid h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 24px; text-align: center; }
  .image-grid { display: grid; gap: 16px; }
  .grid-image img { width: 100%; border-radius: var(--radius); }
  .block-footer { padding: 32px 40px; background: var(--primary); color: rgba(255,255,255,0.7); text-align: center; }
  .block-footer .copyright { margin-bottom: 12px; }
  .social-links a { color: rgba(255,255,255,0.7); text-decoration: none; margin: 0 8px; font-size: 0.9rem; }
  .social-links a:hover { color: #fff; }
  .block-spacer { width: 100%; }
  .block-unknown { padding: 24px 40px; background: #fef3c7; border-radius: var(--radius); margin: 16px 40px; }
  .empty-preview {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; color: var(--secondary);
  }
  .empty-preview h2 { font-size: 1.5rem; color: var(--secondary); margin-bottom: 8px; }
  `;
}

// ── Controller ───────────────────────────────────────────────────────────────

export default {
  async preview(ctx) {
    const { secret, url, status } = ctx.query;

    // 1. Validate secret
    const previewSecret = process.env.PREVIEW_SECRET;
    if (!previewSecret || secret !== previewSecret) {
      ctx.status = 401;
      ctx.body = '<h1>401 — Invalid preview token</h1>';
      ctx.type = 'text/html';
      return;
    }

    // 2. Determine slug from URL
    const slug = (!url || url === '/') ? 'home' : url.replace(/^\//, '');

    // 3. Fetch page — dynamic zones only support populate: '*' (one level)
    const isDraft = status === 'draft';
    let pages;
    try {
      pages = await strapi.documents('api::page.page').findMany({
        filters: { slug: { $eq: slug } },
        status: isDraft ? 'draft' : 'published',
        populate: {
          seo: true,
          navbar: true,
          footer: true,
          theme: true,
          blocks: {
            populate: '*',
          },
        },
      });
    } catch (err) {
      console.error('Preview fetch error (level 1):', err);
      pages = [];
    }

    const page = pages?.[0];

    if (!page) {
      ctx.type = 'text/html';
      ctx.body = `<!DOCTYPE html>
        <html><head><meta charset="utf-8"><title>Preview — Not Found</title>
        <style>${generateStyles(null)}</style></head>
        <body>
          <div class="empty-preview">
            <h2>Página no encontrada</h2>
            <p>No se encontró la página con slug "${slug}" (status: ${status}).</p>
          </div>
        </body></html>`;
      return;
    }

    // 4. Resolve nested media that `populate: '*'` doesn't reach.
    //    Use Knex to directly query the files_related_mph join table
    //    to find upload files linked to component entries.
    if (page.blocks) {
      const knex = strapi.db.connection;

      for (const block of page.blocks) {
        // ── Hero: background_image ──
        if (block.__component === 'blocks.hero' && !block.background_image?.url && block.id) {
          try {
            const rows = await knex('files_related_mph')
              .join('files', 'files.id', 'files_related_mph.file_id')
              .where({
                'files_related_mph.related_type': 'blocks.hero',
                'files_related_mph.field': 'background_image',
              })
              .select('files.*');
            if (rows.length > 0) {
              block.background_image = rows[0];
            }
          } catch { /* ignore */ }
        }

        // ── Team: members → photo ──
        if (block.__component === 'blocks.team' && block.members) {
          for (const member of block.members) {
            if (member.id && (!member.photo || !member.photo?.url)) {
              try {
                const rows = await knex('files_related_mph')
                  .join('files', 'files.id', 'files_related_mph.file_id')
                  .where({
                    'files_related_mph.related_type': 'shared.team-member',
                    'files_related_mph.related_id': member.id,
                    'files_related_mph.field': 'photo',
                  })
                  .select('files.*');
                if (rows.length > 0) {
                  member.photo = rows[0];
                }
              } catch { /* ignore */ }
            }
          }
        }

        // ── Image Grid: images (multiple media) ──
        if (block.__component === 'blocks.image-grid' && block.id) {
          const hasUrls = Array.isArray(block.images) && block.images.length > 0 && block.images[0]?.url;
          if (!hasUrls) {
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
            } catch { /* ignore */ }
          }
        }
      }
    }


    // 5. Render blocks
    const blocks = page.blocks || [];
    const blocksHtml = blocks.length > 0
      ? blocks.map(renderBlock).join('\n')
      : `<div class="empty-preview"><h2>${page.title}</h2><p>Esta página no tiene bloques aún.</p></div>`;

    const draftBanner = isDraft
      ? `<div class="draft-banner">⚠ DRAFT PREVIEW — This content is not published</div>`
      : '';

    const seoTitle = page.seo?.meta_title || page.title;
    const seoDescription = buildPreviewMetaDescription(page);
    const theme = page.theme || null;
    const styles = generateStyles(theme);

    // Build Google Fonts link dynamically from theme
    const fontHeading = theme?.font_heading || 'Inter';
    const fontBody = theme?.font_body || 'Inter';
    const fontFamilies = [...new Set([fontHeading, fontBody])]
      .map(f => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`)
      .join('&');
    const fontsLink = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;

    // 6. Respond with full HTML
    ctx.type = 'text/html';
    ctx.body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${seoTitle} — Preview</title>
  <meta name="description" content="${escapeHtmlAttribute(seoDescription)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="${fontsLink}" rel="stylesheet" />
  <style>${styles}</style>
</head>
<body>
  ${draftBanner}
  ${blocksHtml}
</body>
</html>`;
  },
};
