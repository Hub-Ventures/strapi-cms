
export default {
  async beforeCreate(event) {
    await generateApiUrl(event);
  },

  async beforeUpdate(event) {
    await generateApiUrl(event);
  },
};

const generateApiUrl = async (event) => {
  const { data, where } = event.params;
  
  // Basic attributes from payload
  let slug = data.slug;
  let client_id = data.client;
  let folder_id = data.folder;
  // If update and slug/client missing, or if client is just an ID, we might need full context.
  if (where && (!slug || client_id === undefined || folder_id === undefined)) {
     const targetDocId = where.documentId ?? where.id;
     let current = null;

     if (targetDocId) {
         current = await strapi.documents('api::page.page').findOne({
             documentId: targetDocId.toString(),
             populate: ['client', 'folder'] 
         });
     }

     if (!current && where.id) {
         current = await strapi.db.query('api::page.page').findOne({
             where: { id: where.id },
             populate: ['client', 'folder'],
         });
     }
     
     if (current) {
         console.log(`[Lifecycle] Fetched current doc: id=${current.documentId}, client=${JSON.stringify(current.client)}`); // DEBUG
         slug = slug || current.slug;
         // If client was not in payload, use current
         if (client_id === undefined) {
             client_id = current.client; 
         }
         if (folder_id === undefined) {
             folder_id = current.folder;
         }
     }
  }

  const baseUrl = 'http://localhost:1337'; 
  let clientSlug = null;
  let folderSlug = null;

  if (client_id) {
      console.log(`[Lifecycle] Resolving client: type=${typeof client_id}, value=`, JSON.stringify(client_id)); // DEBUG

      let targetClientId = null;

      // Handle Object formats (set, connect, or full object)
      if (typeof client_id === 'object') {
          if (client_id.slug) {
              clientSlug = client_id.slug; // Full object
          } else if (Array.isArray(client_id.set) && client_id.set.length > 0) {
              targetClientId = client_id.set[0].id || client_id.set[0].documentId;
          } else if (Array.isArray(client_id.connect) && client_id.connect.length > 0) {
              targetClientId = client_id.connect[0].id || client_id.connect[0].documentId;
          } else if (client_id.id || client_id.documentId) {
              targetClientId = client_id.id || client_id.documentId;
          }
      } 
      // Handle Primitive formats (string ID or int ID)
      else if (typeof client_id === 'string' || typeof client_id === 'number') {
          targetClientId = client_id;
      }

      if (targetClientId && !clientSlug) {
           try {
               // Start by looking up by Document ID (common in Strapi 5)
               let client = await strapi.documents('api::client.client').findOne({
                   documentId: targetClientId.toString(), 
               });
               
               if (!client) {
                   // Fallback: look up by integer ID (common in relations)
                    client = await strapi.db.query('api::client.client').findOne({
                       where: { id: targetClientId }
                    });
               }

               if (client) {
                   clientSlug = client.slug;
               }
           } catch (e) {
               console.log('[Lifecycle] Error fetching client:', e.message);
           }
      }
  }

  if (folder_id) {
      let targetFolderId = null;

      if (typeof folder_id === 'object') {
          if (folder_id.slug) {
              folderSlug = folder_id.slug;
          } else if (Array.isArray(folder_id.set) && folder_id.set.length > 0) {
              targetFolderId = folder_id.set[0].id || folder_id.set[0].documentId;
          } else if (Array.isArray(folder_id.connect) && folder_id.connect.length > 0) {
              targetFolderId = folder_id.connect[0].id || folder_id.connect[0].documentId;
          } else if (folder_id.id || folder_id.documentId) {
              targetFolderId = folder_id.id || folder_id.documentId;
          }
      } else if (typeof folder_id === 'string' || typeof folder_id === 'number') {
          targetFolderId = folder_id;
      }

      if (targetFolderId && !folderSlug) {
          try {
              let folder = await strapi.documents('api::folder.folder').findOne({
                  documentId: targetFolderId.toString(),
              });

              if (!folder) {
                  folder = await strapi.db.query('api::folder.folder').findOne({
                      where: { id: targetFolderId },
                  });
              }

              if (folder) {
                  folderSlug = folder.slug;
              }
          } catch (e) {
              console.log('[Lifecycle] Error fetching folder:', e.message);
          }
      }
  }

  if (!slug) {
      return;
  }

  const resolvedClientSlug = clientSlug || 'global';
  const apiUrl = folderSlug
      ? `${baseUrl}/api/${resolvedClientSlug}/${folderSlug}/${slug}`
      : `${baseUrl}/api/${resolvedClientSlug}/${slug}`;

  event.params.data.api_url = apiUrl;
};
