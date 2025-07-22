import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  schema: './schemas/public/migrations/schema.ts',
  out: './schemas/public/migrations',
  schemaFilter: ['public'],
  introspect: {
    casing: 'camel'
  }
});
