"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
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