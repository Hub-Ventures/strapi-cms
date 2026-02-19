const { createStrapi } = require('@strapi/strapi');

async function start() {
  const app = await createStrapi({ distDir: './dist' });
  await app.start();
}

start();
