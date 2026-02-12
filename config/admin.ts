/**
 * Preview URL pathname resolver.
 * Returns the frontend path for a given content type, or null to hide the Preview button.
 */
const getPreviewPathname = (uid: string, { document }): string | null => {
  if (uid === 'api::page.page') {
    const { slug } = document;
    return slug === 'home' ? '/' : `/${slug}`;
  }
  // Other content types: no preview
  return null;
};

export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL'),
      async handler(uid, { documentId, locale, status }) {
        const document = await strapi.documents(uid).findOne({ documentId });
        const pathname = getPreviewPathname(uid, { document });

        if (!pathname) {
          return null;
        }

        const clientUrl = env('CLIENT_URL');
        const previewSecret = env('PREVIEW_SECRET');
        const params = new URLSearchParams({
          url: pathname,
          secret: previewSecret,
          status,
        });

        return `${clientUrl}/api/preview?${params}`;
      },
    },
  },
});
