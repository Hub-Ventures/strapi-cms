export default {
  routes: [
    {
      method: 'GET',
      path: '/preview',
      handler: 'preview.preview',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
