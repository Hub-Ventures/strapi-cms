export default {
  async beforeCreate(event) {
    await generateApiUrl(event);
  },

  async beforeUpdate(event) {
    await generateApiUrl(event);
  },
};

function resolvePublicBaseUrl(): string {
  const fromPublicUrl = process.env.PUBLIC_URL?.trim();
  if (fromPublicUrl) return fromPublicUrl.replace(/\/+$/, '');

  const fromUrl = process.env.URL?.trim();
  if (fromUrl) return fromUrl.replace(/\/+$/, '');

  return 'http://localhost:1337';
}

function toRelationTarget(value: any): string | number | null {
  if (!value) return null;

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object') {
    if (value.slug) return null;

    if (Array.isArray(value.set) && value.set.length > 0) {
      return value.set[0].id ?? value.set[0].documentId ?? null;
    }

    if (Array.isArray(value.connect) && value.connect.length > 0) {
      return value.connect[0].id ?? value.connect[0].documentId ?? null;
    }

    return value.id ?? value.documentId ?? null;
  }

  return null;
}

async function resolveClientSlugFromInput(clientInput: any): Promise<string | null> {
  if (!clientInput) return null;
  if (typeof clientInput === 'object' && clientInput.slug) return clientInput.slug;

  const targetClientId = toRelationTarget(clientInput);
  if (!targetClientId) return null;

  try {
    let client = await strapi.documents('api::client.client').findOne({
      documentId: targetClientId.toString(),
    });

    if (!client) {
      client = await strapi.db.query('api::client.client').findOne({
        where: { id: targetClientId },
      });
    }

    return client?.slug ?? null;
  } catch {
    return null;
  }
}

async function resolveFolderSlugFromInput(folderInput: any): Promise<string | null> {
  if (!folderInput) return null;
  if (typeof folderInput === 'object' && folderInput.slug) return folderInput.slug;

  const targetFolderId = toRelationTarget(folderInput);
  if (!targetFolderId) return null;

  try {
    let folder = await strapi.documents('api::folder.folder').findOne({
      documentId: targetFolderId.toString(),
    });

    if (!folder) {
      folder = await strapi.db.query('api::folder.folder').findOne({
        where: { id: targetFolderId },
      });
    }

    return folder?.slug ?? null;
  } catch {
    return null;
  }
}

async function resolvePageRowId(where: any): Promise<number | null> {
  if (typeof where?.id === 'number') return where.id;
  if (typeof where?.id === 'string' && /^\d+$/.test(where.id)) return Number(where.id);

  if (where?.documentId) {
    const page = await strapi.db.query('api::page.page').findOne({
      where: { documentId: where.documentId.toString() },
      select: ['id'],
    });
    return page?.id ?? null;
  }

  return null;
}

async function resolveLinkedSlugsByPageId(
  pageId: number
): Promise<{ clientSlug: string | null; folderSlug: string | null }> {
  try {
    const row = await strapi.db
      .connection('pages as p')
      .leftJoin('pages_client_lnk as pcl', 'pcl.page_id', 'p.id')
      .leftJoin('clients as c', 'c.id', 'pcl.client_id')
      .leftJoin('pages_folder_lnk as pfl', 'pfl.page_id', 'p.id')
      .leftJoin('folders as f', 'f.id', 'pfl.folder_id')
      .where('p.id', pageId)
      .select('c.slug as clientSlug', 'f.slug as folderSlug')
      .first();

    return {
      clientSlug: row?.clientSlug ?? null,
      folderSlug: row?.folderSlug ?? null,
    };
  } catch {
    return { clientSlug: null, folderSlug: null };
  }
}

const generateApiUrl = async (event) => {
  const { data, where } = event.params;

  // Basic attributes from payload
  let slug = data.slug;
  let client_id = data.client;
  let folder_id = data.folder;

  // If update and slug/client/folder are missing, fetch current persisted values.
  if (where && (!slug || client_id === undefined || folder_id === undefined)) {
    const targetDocId = where.documentId ?? where.id;
    let current = null;

    if (targetDocId) {
      current = await strapi.documents('api::page.page').findOne({
        documentId: targetDocId.toString(),
        populate: ['client', 'folder'],
      });
    }

    if (!current && where.id) {
      current = await strapi.db.query('api::page.page').findOne({
        where: { id: where.id },
        populate: ['client', 'folder'],
      });
    }

    if (current) {
      slug = slug || current.slug;
      if (client_id === undefined) {
        client_id = current.client;
      }
      if (folder_id === undefined) {
        folder_id = current.folder;
      }
    }
  }

  let clientSlug = await resolveClientSlugFromInput(client_id);
  let folderSlug = await resolveFolderSlugFromInput(folder_id);

  // Fallback: when payload/current object is incomplete, read relation links by page row id.
  const pageRowId = await resolvePageRowId(where);
  if (pageRowId && (!clientSlug || !folderSlug)) {
    const linked = await resolveLinkedSlugsByPageId(pageRowId);
    clientSlug = clientSlug || linked.clientSlug;
    folderSlug = folderSlug || linked.folderSlug;
  }

  if (!slug) {
    return;
  }

  const baseUrl = resolvePublicBaseUrl();
  const resolvedClientSlug = clientSlug || 'global';
  const apiUrl = folderSlug
    ? `${baseUrl}/api/${resolvedClientSlug}/${folderSlug}/${slug}`
    : `${baseUrl}/api/${resolvedClientSlug}/${slug}`;

  event.params.data.api_url = apiUrl;
};
