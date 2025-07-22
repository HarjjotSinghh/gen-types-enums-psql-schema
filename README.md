# PostgreSQL Schema Types & Enums Generator

A CLI tool to automatically generate TypeScript types and enums from any PostgreSQL DB schema.

## Installation & Usage

```bash
# Install dependencies
bun install

# Full process - pull schema from database and generate types
gen-types-enums-postgres <schema_name>

# Only regenerate types from existing schema (without querying the database)
gen-types-enums-postgres <schema_name> --types-only

# Show help
gen-types-enums-postgres --help
```

### Examples

```bash
# Generate types for the public schema
gen-types-enums-postgres public

# Generate types for a user management schema  
gen-types-enums-postgres user_management

# Regenerate types only (skip database pull)
gen-types-enums-postgres analytics --types-only
```

## Configuration

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required for schema pull)

### Database Config Files

The tool automatically creates schema-specific database configuration files named `db.config.<schema_name>.ts` using the template in `db.config.ts`. For example:
- `db.config.public.ts` for the public schema
- `db.config.user_management.ts` for the user_management schema

If a config file already exists, it will be skipped to avoid overwriting any custom configurations.

## What it does

### Full Mode (`gen-types-enums-postgres <schema_name>`)

1. Pulls the entire database schema with the provided schema-specific configuration
2. Processes the generated schema to create TypeScript enums and types
3. Moves the schema from the migrations directory to the schema root directory  
4. Creates `enums.ts`, `types.ts`, and `index.ts` files with monorepo-style imports
5. Cleans up the migrations directory after processing
6. Runs ESLint to fix any style issues

### Types-Only Mode (`gen-types-enums-postgres <schema_name> --types-only`)

1. Skips the database pull step
2. Looks for schema.ts in the schema root directory first, then falls back to migrations directory
3. Uses the existing schema file to generate enums and types
4. Useful when you've manually modified the schema file and want to regenerate types without pulling from the database again

## Generated Files

For a schema named `my_schema`, the following files will be generated:

- `./schemas/my_schema/schema.ts` - Processed schema with renamed identifiers
- `./schemas/my_schema/enums.ts`  - TypeScript enums generated from the schema
- `./schemas/my_schema/types.ts`  - TypeScript types generated from the schema  
- `./schemas/my_schema/index.ts`  - Exports from the schema, types, and enums

## Key Features

- **Configurable**: Works with any PostgreSQL schema, not just a specific one
- **TypeScript Enums**: Generates properly formatted TypeScript enums for each database enum
- **Type Safety**: Creates TypeScript types for all tables with proper naming conventions
- **Flexible Modes**: Provides both full and types-only modes for different workflows
- **Code Quality**: Automatically fixes code style issues with ESLint
- **Clean Output**: Streamlines development workflow by automating types generation

## Schema File Structure

The generated files follow this structure:
```
./schemas/
├── public/
│   ├── schema.ts
│   ├── types.ts
│   ├── enums.ts
│   └── index.ts
├── user_management/
│   ├── schema.ts
│   ├── types.ts
│   ├── enums.ts
│   └── index.ts
└── analytics/
    ├── schema.ts
    ├── types.ts
    ├── enums.ts
    └── index.ts
```

# Contibute

If anyone wants to contribute, you can introduce the following flags/featrues:

- `all` - pulls all schemas

- `remove_schema` - removes the schema.ts file after the enums are generated, this would also remove the types.ts file

- `disable_eslint` - disables the last eslint step

To contribute further, create a `.sh` script that does this, would be super useful.

PS: I'm just using this section as my pesonal to-do list lol

# Running Into Errors?

Feel free to reach me out [here](https://www.harjotrana.com) or just mail me at [me@harjotrana.com](mailto:me@harjotrana.com)
