# PostgreSQL Schema Types & Enums Generator

A CLI tool to automatically generate TypeScript types and enums from any PostgreSQL DB schema using Drizzle ORM.

## Installation

### Global Installation (Recommended)

```bash
npm install -g gen-types-enums-psql-schema
```

### Local Installation

```bash
npm install gen-types-enums-psql-schema
npx gen-types-enums-psql-schema --help
```

### Using with Bun

```bash
bun add gen-types-enums-psql-schema
bunx gen-types-enums-psql-schema --help
```

## Prerequisites

This tool requires:
- **Node.js 18+** or **Bun**
- A PostgreSQL database with the schema you want to generate types for

## Usage

```bash
# Full process - pull schema from database and generate types
gen-types-enums-psql-schema <schema_name>

# Only regenerate types from existing schema (without querying the database)
gen-types-enums-psql-schema <schema_name> --types-only

# Pull and generate types for all schemas
gen-types-enums-psql-schema --all

# Remove schema.ts after enum generation
gen-types-enums-psql-schema <schema_name> --remove-schema

# Skip ESLint step
gen-types-enums-psql-schema <schema_name> --disable-eslint

# Show help
gen-types-enums-psql-schema --help
```

### Examples

```bash
# Generate types for the public schema
gen-types-enums-psql-schema public

# Generate types for all schemas
gen-types-enums-psql-schema --all

# Remove schema.ts after generation
gen-types-enums-psql-schema public --remove-schema

# Skip ESLint step
gen-types-enums-psql-schema public --disable-eslint
```

## Shell Script Wrapper

A shell script wrapper is provided for easier usage. You can run:

```bash
./gen-types-enums.sh <schema_name> [flags]
```

This script will automatically call the CLI with the correct arguments and environment setup.

## Configuration

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required for schema pull)

Example:
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Database Config Files

The tool automatically creates schema-specific database configuration files named `db.config.<schema_name>.ts` using the template in `db.config.ts`. For example:
- `db.config.public.ts` for the public schema
- `db.config.user_management.ts` for the user_management schema

If a config file already exists, it will be skipped to avoid overwriting any custom configurations.

## What it does

### Full Mode (`gen-types-enums-psql-schema <schema_name>`)

1. Pulls the entire database schema with the provided schema-specific configuration
2. Processes the generated schema to create TypeScript enums and types
3. Moves the schema from the migrations directory to the schema root directory  
4. Creates `enums.ts`, `types.ts`, and `index.ts` files with monorepo-style imports
5. Cleans up the migrations directory after processing
6. Runs ESLint to fix any style issues

### Types-Only Mode (`gen-types-enums-psql-schema <schema_name> --types-only`)

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

## Contibute

The following features have been implemented:

- `--all` flag to pull all schemas
- `--remove-schema` flag to remove schema.ts after enum generation
- `--disable-eslint` flag to skip ESLint step
- Shell script wrapper for easier usage

Feel free to suggest more features or improvements!

## Running Into Errors?

Feel free to reach me out [here](https://www.harjotrana.com) or just mail me at [me@harjotrana.com](mailto:me@harjotrana.com).
Check the [GitHub Issues](https://github.com/harjjotsinghh/gen-types-enums-psql-schema/issues). If an issue does not exist, feel free to create a new one.

## License

MIT © [Harjot Singh Rana](https://harjotrana.com)
