/**
 * Multi-tenant dynamic routes for clean separation.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/:client/:folder/:slug',
      handler: 'page.findByClientFolderAndSlug',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/:client/:slug',
      handler: 'page.findByClientAndSlug',
      config: {
        auth: false, // We'll manage access via public permissions or custom middleware later
        policies: [],
      },
    },
  ],
};
