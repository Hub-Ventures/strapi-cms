const path = require('node:path');
const { createStrapi } = require('@strapi/strapi');

async function start() {
  const app = await createStrapi({
    appDir: __dirname,
    distDir: path.join(__dirname, 'dist'),
  });
  await app.start();
}

start();
