import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // 1. Enable Permissions for 'authenticated' role
    const authenticatedRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (authenticatedRole) {
      const permissionsToEnable = [
        // Page
        'api::page.page.find',
        'api::page.page.findOne',
        'api::page.page.create',
        'api::page.page.update',
        'api::page.page.delete',
        'api::page.page.duplicate', 
        // Navbar
        'api::navbar.navbar.find',
        'api::navbar.navbar.findOne',
        // Footer
        'api::footer.footer.find',
        'api::footer.footer.findOne',
        // Theme
        'api::theme.theme.find',
        'api::theme.theme.findOne',
        // Upload (Media Library)
        'plugin::upload.content-api.find',
        'plugin::upload.content-api.findOne', 
        'plugin::upload.content-api.upload',
      ];
      
      for (const action of permissionsToEnable) {
        // Check if permission already exists
        const existing = await strapi.query('plugin::users-permissions.permission').findOne({
          where: {
            action,
            role: authenticatedRole.id,
          },
        });

        if (!existing) {
          console.log(`🔓 Enabling permission: ${action}`);
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: authenticatedRole.id,
            },
          });
        }
      }
    }

    // 2. Create Default User (if not exists)
    const userEmail = 'editor@elhub.com';
    const userExists = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: userEmail },
    });

    if (!userExists && authenticatedRole) {
      console.log('🚀 Creating default API user: editor@elhub.com');
      await strapi.plugin('users-permissions').service('user').add({
        username: 'Editor',
        email: userEmail,
        password: 'password123',
        role: authenticatedRole.id, // Assign to Authenticated role
        confirmed: true,
      });
    }

    // 3. Create Default Theme
    const existingThemes = await strapi.documents('api::theme.theme').findMany();
    if (existingThemes.length === 0) {
      console.log('🎨 Creating default Theme...');
      await strapi.documents('api::theme.theme').create({
        data: {
          name: 'Default Light',
          primary_color: '#3b82f6',
          secondary_color: '#1e293b',
          accent_color: '#f59e0b',
          font_heading: 'Inter',
          font_body: 'Inter',
          border_radius: 'medium',
          spacing: 'normal',
        },
      });
    }

    // 4. Create Default Navbar
    const existingNavbars = await strapi.documents('api::navbar.navbar').findMany();
    if (existingNavbars.length === 0) {
       console.log('🧭 Creating default Navbar...');
       await strapi.documents('api::navbar.navbar').create({
         data: {
           name: 'Main Navigation',
           variant: 'standard',
           items: [
             { label: 'Home', url: '/', target: '_self' },
             { label: 'About', url: '/about', target: '_self' },
             { label: 'Contact', url: '/contact', target: '_self' },
           ],
           cta_text: 'Get Started',
           cta_url: '/signup',
         }
       });
    }

    // 5. Create Default Footer
    const existingFooters = await strapi.documents('api::footer.footer').findMany();
    if (existingFooters.length === 0) {
      console.log('🦶 Creating default Footer...');
      await strapi.documents('api::footer.footer').create({
        data: {
          name: 'Main Footer',
          variant: 'simple',
          copyright: '© 2026 El Hub. All rights reserved.',
          columns: [
             { 
               title: 'Company', 
               links: [
                 { label: 'About Us', url: '/about' },
                 { label: 'Careers', url: '/careers' }
               ] 
             },
             { 
                title: 'Legal', 
                links: [
                  { label: 'Privacy', url: '/privacy' },
                  { label: 'Terms', url: '/terms' }
                ] 
              }
          ]
        }
      });
    }

    // 6. Create Default Page (Homepage)
    const existingPages = await strapi.documents('api::page.page').findMany();
    if (existingPages.length === 0) {
       console.log('📄 Creating default Homepage...');
       // We need to fetch the IDs of the relations we just created/found
       const [navbar] = await strapi.documents('api::navbar.navbar').findMany();
       const [footer] = await strapi.documents('api::footer.footer').findMany();
       const [theme] = await strapi.documents('api::theme.theme').findMany();

       await strapi.documents('api::page.page').create({
          data: {
            title: 'Homepage',
            slug: 'home', // or /?
            is_homepage: true,
            navbar: navbar?.documentId,
            footer: footer?.documentId,
            theme: theme?.documentId, 
            seo: {
              meta_title: 'Welcome to El Hub',
              meta_description: 'The best CMS in the world.',
            },
            blocks: [
              {
                __component: 'blocks.hero',
                title: 'Welcome to El Hub',
                subtitle: 'A powerful headless CMS page builder.',
                variant: 'centered',
                cta_text: 'Get Started',
                cta_url: '#'
              }
            ]
          }
       });
    }

  },
};
