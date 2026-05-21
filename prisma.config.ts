// Use require to avoid TypeScript module resolution issues when 'prisma' lacks types
// @ts-ignore
const { defineConfig } = require('prisma');

export default defineConfig({
  datasources: {
    db: {
      provider: 'sqlite',
      url: 'file:./prisma/dev.db',
    },
  },
});
