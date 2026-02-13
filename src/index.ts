import type { Core } from '@strapi/strapi';

const PAGE_CONTENT_MANAGER_KEY =
  'plugin_content_manager_configuration_content_types::api::page.page';
const PAGE_OPTIONAL_FIELDS = ['navbar', 'footer', 'theme', 'seo'] as const;
const ADMIN_CONTENT_EDITOR_ROLE_CODES = ['strapi-editor', 'strapi-author'] as const;
const ADMIN_ALLOWED_CONTENT_SUBJECTS = new Set(['api::page.page', 'api::folder.folder']);

async function ensurePageOptionalFieldsAtEnd(strapi: Core.Strapi) {
  const coreStoreRow = await strapi.db
    .connection('strapi_core_store_settings')
    .where({ key: PAGE_CONTENT_MANAGER_KEY })
    .first();

  if (!coreStoreRow?.value) return;

  let parsed: any;
  try {
    parsed = JSON.parse(coreStoreRow.value);
  } catch {
    return;
  }

  const editLayout = parsed?.layouts?.edit;
  if (!Array.isArray(editLayout) || editLayout.length === 0) return;

  const optionalFieldMap = new Map<string, { name: string; size?: number }>();
  const layoutWithoutOptional = editLayout
    .map((row: unknown) => {
      if (!Array.isArray(row)) return [];

      return row.filter((field: any) => {
        const fieldName = field?.name;
        if (
          typeof fieldName === 'string' &&
          (PAGE_OPTIONAL_FIELDS as readonly string[]).includes(fieldName)
        ) {
          if (!optionalFieldMap.has(fieldName)) {
            optionalFieldMap.set(fieldName, field);
          }
          return false;
        }
        return true;
      });
    })
    .filter((row: unknown[]) => row.length > 0);

  const navbarField = optionalFieldMap.get('navbar');
  const footerField = optionalFieldMap.get('footer');
  const themeField = optionalFieldMap.get('theme');
  const seoField = optionalFieldMap.get('seo');

  const optionalRows: Array<Array<{ name: string; size: number }>> = [];

  if (navbarField || footerField) {
    const navbarFooterRow: Array<{ name: string; size: number }> = [];
    if (navbarField) {
      navbarFooterRow.push({ name: 'navbar', size: navbarField.size ?? 6 });
    }
    if (footerField) {
      navbarFooterRow.push({ name: 'footer', size: footerField.size ?? 6 });
    }
    optionalRows.push(navbarFooterRow);
  }

  if (themeField) {
    optionalRows.push([{ name: 'theme', size: themeField.size ?? 6 }]);
  }

  if (seoField) {
    optionalRows.push([{ name: 'seo', size: seoField.size ?? 12 }]);
  }

  const nextEditLayout = [...layoutWithoutOptional, ...optionalRows];

  if (JSON.stringify(editLayout) === JSON.stringify(nextEditLayout)) {
    return;
  }

  parsed.layouts.edit = nextEditLayout;

  await strapi.db.connection('strapi_core_store_settings').where({ id: coreStoreRow.id }).update({
    value: JSON.stringify(parsed),
  });

  strapi.log.info(
    'Updated Content Manager layout: moved page optional fields (navbar/footer/theme/seo) to the end.'
  );
}

async function ensureAdminMenuPermissionsByRole(strapi: Core.Strapi) {
  const roles = await strapi.db
    .connection('admin_roles')
    .select('id', 'code')
    .whereIn('code', [...ADMIN_CONTENT_EDITOR_ROLE_CODES]);

  if (!Array.isArray(roles) || roles.length === 0) return;

  for (const role of roles) {
    const permissions = await strapi.db
      .connection('admin_permissions as p')
      .join('admin_permissions_role_lnk as l', 'l.permission_id', 'p.id')
      .select('p.id as permissionId', 'p.subject')
      .where('l.role_id', role.id)
      .andWhere('p.action', 'like', 'plugin::content-manager.explorer.%');

    const disallowedPermissionIds = permissions
      .filter((perm: any) => {
        if (typeof perm?.subject !== 'string') return false;
        return !ADMIN_ALLOWED_CONTENT_SUBJECTS.has(perm.subject);
      })
      .map((perm: any) => perm.permissionId)
      .filter((id: unknown): id is number => typeof id === 'number');

    if (disallowedPermissionIds.length === 0) continue;

    await strapi.db
      .connection('admin_permissions_role_lnk')
      .where({ role_id: role.id })
      .whereIn('permission_id', disallowedPermissionIds)
      .del();

    strapi.log.info(
      `Updated admin role ${role.code}: hid non-editor content types from Content Manager menu.`
    );
  }
}

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
    await ensurePageOptionalFieldsAtEnd(strapi);
    await ensureAdminMenuPermissionsByRole(strapi);

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
        'api::page.page.findByClientAndSlug', 
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

      // Enable Public Permissions for Client and Folder for easier testing
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const publicPermissions = [
          'api::client.client.find',
          'api::client.client.findOne',
          'api::folder.folder.find',
          'api::folder.folder.findOne',
          'api::page.page.find',
          'api::page.page.findOne',
          'api::page.page.findByClientAndSlug',
        ];

        for (const action of publicPermissions) {
           const existing = await strapi.query('plugin::users-permissions.permission').findOne({
            where: {
              action,
              role: publicRole.id,
            },
          });
          if (!existing) {
             console.log(`🔓 Enabling PUBLIC permission: ${action}`);
             await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
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


    // 7. Create Demo Client and Folders Data
    // We'll check for the client slightly differently to be robust
    let client = await strapi.documents('api::client.client').findFirst({
        filters: { slug: 'demo-client' }
    });

    if (!client) {
      console.log('🏢 Creating Demo Client...');
      client = await strapi.documents('api::client.client').create({
        data: {
          name: 'Demo Client',
          slug: 'demo-client',
          domain: 'demo.example.com'
        }
      });
    }

    // Always ensure folder structure exists for this client
    let homeFolder = await strapi.documents('api::folder.folder').findFirst({
        filters: { 
          slug: 'home', 
          client: { documentId: client.documentId } 
        }
    });

    if (!homeFolder) {
       console.log('📂 Creating Home Folder...');
       homeFolder = await strapi.documents('api::folder.folder').create({
        data: {
          name: 'Home',
          slug: 'home',
          client: client.documentId
        }
      });
    }

    let docsFolder = await strapi.documents('api::folder.folder').findFirst({
        filters: { 
          slug: 'docs', 
          client: { documentId: client.documentId } 
        }
    });

    if (!docsFolder) {
       console.log('📂 Creating Docs Folder...');
       docsFolder = await strapi.documents('api::folder.folder').create({
        data: {
          name: 'Documentation',
          slug: 'docs',
          client: client.documentId,
          parent: homeFolder.documentId
        }
      });
    }

    // Check for Demo Home Page
    const demoHome = await strapi.documents('api::page.page').findFirst({
        filters: { 
          slug: 'index'
        },
        populate: ['client']
    });

    if (!demoHome) {
      console.log('📄 Creating Demo Home Page...');
      // Get Theme/Navbar/Footer to reuse
      const [navbar] = await strapi.documents('api::navbar.navbar').findMany();
      const [footer] = await strapi.documents('api::footer.footer').findMany();
      const [theme] = await strapi.documents('api::theme.theme').findMany();

      const page = await strapi.documents('api::page.page').create({
        data: {
          title: 'Demo Home',
          slug: 'index',
          client: client.documentId,
          folder: homeFolder.documentId,
          navbar: navbar?.documentId,
          footer: footer?.documentId,
          theme: theme?.documentId,
          blocks: [
            {
              __component: 'blocks.hero',
              title: 'Demo Client Home',
              subtitle: 'Multi-tanency works!',
              variant: 'centered' 
            }
          ]
        },
        status: 'published' 
      });
      
      await strapi.documents('api::page.page').publish({
        documentId: page.documentId
      });
    } else if (!(demoHome as any).client) {
        console.log('🔗 Linking existing Demo Home to Client...');
        await strapi.documents('api::page.page').update({
            documentId: demoHome.documentId,
            data: {
                client: client.documentId
            }
        });
    }

    // 8. Publish all draft pages (Except draft-test)
    const draftPages = await strapi.documents('api::page.page').findMany({
      publicationState: 'preview',
      filters: {
        publishedAt: {
          $null: true,
        },
        slug: {
          $ne: 'draft-test'
        }
      },
    });

    if (draftPages.length > 0) {
      console.log(`🚀 Publishing ${draftPages.length} draft pages...`);
      for (const page of draftPages) {
         await strapi.documents('api::page.page').publish({
            documentId: page.documentId
         });
      }
    }

    // Restore Draft Page Creation - Ensure it remains a draft
    const draftPage = await strapi.documents('api::page.page').findMany({
      filters: { slug: 'draft-test' },
      publicationState: 'preview'
    });

    if (draftPage.length === 0) {
      console.log('📝 Creating Draft Test Page...');
      const [navbar] = await strapi.documents('api::navbar.navbar').findMany();
      const [footer] = await strapi.documents('api::footer.footer').findMany();
      const [theme] = await strapi.documents('api::theme.theme').findMany();

      await strapi.documents('api::page.page').create({
        data: {
          title: 'Draft Test Page',
          slug: 'draft-test',
          client: client.documentId,
          folder: homeFolder.documentId,
          navbar: navbar?.documentId,
          footer: footer?.documentId,
          theme: theme?.documentId,
          blocks: [
              {
              __component: 'blocks.text-block',
              content: 'This is a draft page.' 
            }
          ]
        },
        status: 'draft' 
      });
    }

    // 6. Create Default Page (Homepage) - Global
    const existingPages = await strapi.documents('api::page.page').findMany();
    // Use findFirst to check specifically for 'home' slug global page if needed, but existingPages check is fine for now
    
    // Note: The previous logic checked if ANY page exists. 
    // Since we just created Demo Home, existingPages might be > 0.
    // We should check specifically for the Global Home page.
    const globalHome = await strapi.documents('api::page.page').findFirst({
        filters: { 
          slug: 'home', 
          client: null 
        }
    });

    if (!globalHome) {
       console.log('📄 Creating default Global Homepage...');
       // Re-fetch these as they might not be in scope if the demo client block was skipped
       const [navbar] = await strapi.documents('api::navbar.navbar').findMany();
       const [footer] = await strapi.documents('api::footer.footer').findMany();
       const [theme] = await strapi.documents('api::theme.theme').findMany();

       try {
           const page = await strapi.documents('api::page.page').create({
              data: {
                title: 'Homepage',
                slug: 'home', 
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
                ],
                api_url: 'http://localhost:1337/api/global/home' 
              },
              status: 'published'
           });
           
           await strapi.documents('api::page.page').publish({
              documentId: page.documentId
           });
       } catch (error) {
           console.log('⚠️ Global Homepage might already exist or conflict:', error.message);
       }
    }



    // 9. MIGRATION: Ensure api_url is set for all pages
    const allPages = await strapi.db.query('api::page.page').findMany({
        populate: ['client', 'folder'],
    });
    
    console.log(`🔄 Updating api_url for ${allPages.length} pages...`);
    for (const page of allPages) {
        const p = page as any;
        const slug = p.slug || '';
        
        // Explicitly calculate API URL to ensure migration works even if lifecycle doesn't trigger
        let clientSlug = 'global';
        if (p.client && typeof p.client === 'object' && p.client.slug) {
            clientSlug = p.client.slug;
        }

        let folderSlug = null;
        if (p.folder && typeof p.folder === 'object' && p.folder.slug) {
            folderSlug = p.folder.slug;
        }

        const apiUrl = folderSlug
            ? `http://localhost:1337/api/${clientSlug}/${folderSlug}/${slug}`
            : `http://localhost:1337/api/${clientSlug}/${slug}`;
    
        await strapi.db.query('api::page.page').update({
            where: { id: p.id },
            data: { api_url: apiUrl },
        });
    }

    // Verify counts
    const clientCount = await strapi.documents('api::client.client').count({});
    const pageCount = await strapi.documents('api::page.page').count({});
    console.log(`✅ Bootstrap Complete. DB Counts: Clients=${clientCount}, Pages=${pageCount}`);

    // DEBUG: Verify api_url for draft page
    const debugDraft = await strapi.documents('api::page.page').findFirst({
        filters: { slug: 'draft-test' },
        publicationState: 'preview'
    });
    console.log('🔍 Debug Draft api_url:', debugDraft?.api_url || 'MISSING');

    // DEBUG: Verify Uniqueness
    // Create logic to test unique endpoints (Simulated)
    // We expect the lifecycle to handle this.
    // If I were to create two pages with same slug 'about', one for Client A, one for Global.
    // URL A: ...slug=about&filters[client][slug]=client-a
    // URL B: ...slug=about&filters[client][$null]=true
    // They are different.
    
    // Let's force an update on the draft page to ensure it gets the URL if missing
    if (debugDraft && !debugDraft.api_url) {
        console.log('⚠️ Fixing missing api_url for draft...');
        await strapi.documents('api::page.page').update({
            documentId: debugDraft.documentId,
            data: { slug: debugDraft.slug }
        });
        const fixedDraft = await strapi.documents('api::page.page').findFirst({
             filters: { slug: 'draft-test' },
             publicationState: 'preview'
        });
        console.log('✅ Fixed Draft api_url:', fixedDraft?.api_url);
    }

  },
};
