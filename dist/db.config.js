import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL
    },
    schema: './schemas/random_schema_name/migrations/schema.ts',
    out: './schemas/random_schema_name/migrations',
    schemaFilter: ['random_schema_name'],
    introspect: {
        casing: 'camel'
    }
});
//# sourceMappingURL=db.config.js.map