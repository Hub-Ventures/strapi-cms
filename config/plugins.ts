export default () => ({
  'content-manager': {
    enabled: true,
    config: {
      collectionTypes: [
        'api::page.page',
        'api::navbar.navbar',
        'api::footer.footer',
        'api::theme.theme',
        'api::site-setting.site-setting',
        'api::page-section.page-section',
        'plugin::users-permissions.user',
      ],
      // singleTypes: [],
    },
  },

});
