/**
 * Custom page routes — extends the default CRUD routes.
 * Strapi v5 loads all route files from the routes/ directory.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/pages/:id/duplicate',
      handler: 'page.duplicate',
      config: {
        policies: [],
      },
    },
  ],
};
