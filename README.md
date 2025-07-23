<a name="top"></a>
<!-- TODO: Project Banner -->
<!-- [![gen-types-enums-psql-schema](https://raw.githubusercontent.com/harjjotsinghh/gen-types-enums-psql-schema/master/.github/banner.png)](https://github.com/harjjotsinghh/gen-types-enums-psql-schema) -->

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org/)
[![language](https://img.shields.io/badge/language-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![OS](https://img.shields.io/badge/OS-linux%2C%20windows%2C%20macOS-0078D4)](#)
[![npm version](https://img.shields.io/npm/v/gen-types-enums-psql-schema)](https://www.npmjs.com/package/gen-types-enums-psql-schema)
[![GitHub last commit](https://img.shields.io/github/last-commit/harjjotsinghh/gen-types-enums-psql-schema)](https://github.com/harjjotsinghh/gen-types-enums-psql-schema/commits/master)
[![License](https://img.shields.io/github/license/harjjotsinghh/gen-types-enums-psql-schema)](./LICENSE)
[![Free](https://img.shields.io/badge/free_for_non_commercial_use-brightgreen)](#-license)

⭐ Star us on GitHub — let's reach 10 stars together! 😊

🔥 Why use this tool? — [Read the docs](#-about) 📑

## Table of Contents
- [About](#-about)
- [Features](#-features)
- [Installation](#-installation)
- [How to Build](#-how-to-build)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Generated Files](#-generated-files)
- [Documentation](#-documentation)
- [Feedback and Contributions](#-feedback-and-contributions)
- [License](#-license)
- [Contacts](#%EF%B8%8F-contacts)

## 🚀 About

**gen-types-enums-psql-schema** is a CLI tool to automatically generate TypeScript types and enums from any PostgreSQL DB schema using Drizzle ORM. It streamlines the process of keeping your TypeScript types in sync with your database schema, improving type safety and developer productivity.

- **Modular**: Works with any PostgreSQL schema.
- **TypeScript-first**: Generates enums and types with proper naming conventions.
- **Flexible**: Supports full and types-only generation modes.
- **Automated**: Cleans up, lints, and organizes output for you.

## ✨ Features

- **Configurable**: Works with any PostgreSQL schema, not just a specific one.
- **TypeScript Enums**: Generates properly formatted TypeScript enums for each database enum.
- **Type Safety**: Creates TypeScript types for all tables with proper naming conventions.
- **Flexible Modes**: Provides both full and types-only modes for different workflows.
- **Code Quality**: Automatically fixes code style issues with ESLint.
- **Clean Output**: Streamlines development workflow by automating types generation.

## 📦 Installation

### Global

```bash
npm install -g gen-types-enums-psql-schema
```

### Local

```bash
npm install gen-types-enums-psql-schema
npx gen-types-enums-psql-schema --help
```

### With Bun (Recommended)

#### Global

```bash
bun install -g gen-types-enums-psql-schema
```

#### Local

```bash
bun add gen-types-enums-psql-schema
bunx gen-types-enums-psql-schema --help
```

## 🚦 Usage

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

### Shell Script Wrapper

A shell script wrapper is provided for easier usage:

```bash
./gen-types-enums.sh <schema_name> [flags]
```

## ⚙️ Configuration

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required for schema pull)

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Database Config Files

The tool creates schema-specific config files like `db.config.public.ts` for the `public` schema, based on the template in `db.config.ts`. Existing config files are not overwritten.

## 📂 Generated Files

For a schema named `public`, the following files will be generated:

```
./schemas/
├── public/
│ ├── schema.ts
│ ├── types.ts
│ ├── enums.ts
│ └── index.ts
```


## 📚 Documentation

- [Getting Started Guide](https://github.com/harjjotsinghh/gen-types-enums-psql-schema#readme)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🤝 Feedback and Contributions

We welcome feedback, feature requests, and contributions!  
- [Submit an issue](https://github.com/harjjotsinghh/gen-types-enums-psql-schema/issues)
- [Start a discussion](https://github.com/harjjotsinghh/gen-types-enums-psql-schema/discussions)

Your input helps us improve and grow the project!

## 🗨️ Runing Into Errors?

Feel free to reach me out [here](https://www.harjotrana.com) or just mail me at [me@harjotrana.com](mailto:me@harjotrana.com).
Check the [GitHub Issues](https://github.com/harjjotsinghh/gen-types-enums-psql-schema/issues). If an issue does not exist, feel free to create a new one.

- **Email**: [me@harjotrana.com](mailto:me@harjotrana.com)
- **Website**: [harjotrana.com](https://www.harjotrana.com)
- **GitHub**: [gen-types-enums-psql-schema](https://github.com/harjjotsinghh/gen-types-enums-psql-schema)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/HarjjotSinghh)
[![Twitter Follow](https://img.shields.io/twitter/follow/HarjjotSinghh?style=social)](https://x.com/HarjjotSinghh)

## 📃 License

MIT © [Harjot Singh Rana](https://harjotrana.com)  
Free for non-commercial use.

[Back to top](#top)
