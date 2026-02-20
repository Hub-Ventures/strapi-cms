export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 3000),
  url: 'https://cms.sandiego.com.co',
  proxy: true,
  app: {
    keys: env.array('APP_KEYS'),
  },
});
