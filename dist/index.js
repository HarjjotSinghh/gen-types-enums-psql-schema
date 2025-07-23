#!/usr/bin/env node
"use strict";
/**
 * CLI tool to fetch any schema from the database and generate TypeScript types and enums.
 *
 * Usage:
 *   gen-types-enums-psql-schema <schema_name>                    # Full process - pull schema + generate types
 *   gen-types-enums-psql-schema <schema_name> --types-only       # Only generate types from existing schema
 *
 * Arguments:
 *   schema_name       Name of the schema to process (required)
 *
 * Options:
 *   --types-only      Skip schema pull, only generate types from existing schema
 *   --help, -h        Show this help message
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ansi_colors_1 = __importDefault(require("ansi-colors"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const ora_1 = __importDefault(require("ora"));
const path_1 = require("path");
const util_1 = require("util");
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required. Please read the README.md file for instructions on how to set it up.');
}
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Parse command line arguments
const args = process.argv.slice(2);
const schemaNameArg = args.find(arg => !arg.startsWith('--'));
const typesOnly = args.includes('--types-only');
const showHelp = args.includes('--help') || args.includes('-h');
// Show help if requested or if no schema name provided
if (showHelp || !schemaNameArg) {
    console.log(`
${ansi_colors_1.default.bold.cyan('gen-types-enums-psql-schema')} - PostgreSQL Schema Types & Enums Generator

${ansi_colors_1.default.bold('Usage:')}
  gen-types-enums-psql-schema <schema_name>                    # Full process - pull schema + generate types
  gen-types-enums-psql-schema <schema_name> --types-only       # Only generate types from existing schema

${ansi_colors_1.default.bold('Arguments:')}
  ${ansi_colors_1.default.cyan('schema_name')}       Name of the schema to process (required)

${ansi_colors_1.default.bold('Options:')}
  ${ansi_colors_1.default.cyan('--types-only')}      Skip schema pull, only generate types from existing schema
  ${ansi_colors_1.default.cyan('--help, -h')}        Show this help message

${ansi_colors_1.default.bold('Examples:')}
  gen-types-enums-psql-schema public
  gen-types-enums-psql-schema user_management --types-only
  gen-types-enums-psql-schema analytics

${ansi_colors_1.default.bold('Environment Variables:')}
  ${ansi_colors_1.default.cyan('DATABASE_URL')}      PostgreSQL connection string (required for schema pull)
`);
    process.exit(showHelp ? 0 : 1);
}
// At this point, schemaName is guaranteed to exist
const schemaName = schemaNameArg;
// Path constants - now dynamic based on schema name
const CONFIG_FILE = `./db.config.${schemaName}.ts`;
const TEMPLATE_CONFIG_FILE = './db.config.ts';
const MIGRATIONS_DIR = `./schemas/${schemaName}/migrations`;
const SCHEMA_FILE = (0, path_1.join)(MIGRATIONS_DIR, 'schema.ts');
const FINAL_SCHEMA_FILE = `./schemas/${schemaName}/schema.ts`;
const META_DIR = (0, path_1.join)(MIGRATIONS_DIR, 'meta');
const TYPES_FILE = `./schemas/${schemaName}/types.ts`;
const INDEX_FILE = `./schemas/${schemaName}/index.ts`;
const ENUMS_FILE = `./schemas/${schemaName}/enums.ts`;
// Schema variable name mappings
const SCHEMA_VAR_NAME = `${schemaName}Schema`;
const SCHEMA_SUFFIX = schemaName.charAt(0).toUpperCase() + schemaName.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) + 'S';
/**
 * Creates a schema-specific database config file from the template
 */
async function createConfigFile() {
    const spinner = (0, ora_1.default)(ansi_colors_1.default.cyan(`Creating database config file for ${schemaName}...`)).start();
    try {
        // Check if config file already exists
        try {
            await fs_1.promises.access(CONFIG_FILE);
            spinner.info(ansi_colors_1.default.blue(`Config file ${CONFIG_FILE} already exists, skipping creation`));
            return;
        }
        catch {
            // File doesn't exist, proceed with creation
        }
        // Read the template config file
        const templateContent = await fs_1.promises.readFile(TEMPLATE_CONFIG_FILE, 'utf8');
        // Replace {schemaName} placeholders with actual schema name
        const configContent = templateContent.replace(/random_schema_name/g, schemaName);
        // Write the schema-specific config file
        await fs_1.promises.writeFile(CONFIG_FILE, configContent, 'utf8');
        spinner.succeed(ansi_colors_1.default.green(`Config file created at ${CONFIG_FILE}`));
    }
    catch (error) {
        if (error.code === 'ENOENT' && error.path?.includes('db.config.ts')) {
            spinner.fail(ansi_colors_1.default.red('Template config file (db.config.ts) not found'));
            throw new Error('Template config file (db.config.ts) not found. Please ensure it exists in the project root.');
        }
        else {
            spinner.fail(ansi_colors_1.default.red('Failed to create config file'));
            throw error;
        }
    }
}
/**
 * Generates an enums.ts file based on the schema
 *
 * @param {string} schemaContent - Content of the schema file
 * @returns {Promise<boolean>} - Returns true if enums were found and file was generated, false otherwise
 */
async function generateEnumsFile(schemaContent) {
    const spinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Generating TypeScript enums file...')).start();
    try {
        // Extract all enum definitions from the schema
        const lines = schemaContent.split('\n');
        const enumDefinitions = [];
        // Process each line to find complete enum definitions
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line)
                continue;
            // Find enum declarations - try custom schema pattern first, then fallback to pgEnum
            const customEnumStartRegex = new RegExp(`export const (\\w+)${SCHEMA_SUFFIX} = ${SCHEMA_VAR_NAME}\\.enum\\(['"](\\w+)['"],\\s*\\[`, 'u');
            const customMatch = customEnumStartRegex.exec(line);
            // Fallback to standard pgEnum pattern
            const pgEnumStartRegex = /export const (\w+) = pgEnum\(['"](\w+)['"],\s*\[/u;
            const pgMatch = pgEnumStartRegex.exec(line);
            const match = customMatch || pgMatch;
            if (match && match[1] && match[2]) {
                const variableName = match[1];
                const enumName = match[2];
                const values = [];
                // Check if the enum values are on a single line or span multiple lines
                const singleLineBracketRegex = /\[(.*?)\]/u;
                const singleLineMatch = singleLineBracketRegex.exec(line);
                if (singleLineMatch && singleLineMatch[1]) {
                    // Single line enum definition
                    const valueRegex = /['"]([^'"]+)['"]/gu;
                    let valueMatch;
                    while ((valueMatch = valueRegex.exec(singleLineMatch[1])) !== null) {
                        if (valueMatch[1] && !values.includes(valueMatch[1])) {
                            values.push(valueMatch[1]);
                        }
                    }
                }
                else {
                    // Multi-line enum definition
                    let bracketBalance = 1;
                    let j = i;
                    while (j < lines.length && bracketBalance > 0) {
                        j++;
                        const currentLine = lines[j];
                        if (!currentLine)
                            continue;
                        for (let charIndex = 0; charIndex < currentLine.length; charIndex++) {
                            const char = currentLine[charIndex];
                            if (char === '[')
                                bracketBalance++;
                            if (char === ']')
                                bracketBalance--;
                        }
                        if (bracketBalance >= 0) {
                            const valueRegex = /['"]([^'"]+)['"]/gu;
                            let valueMatch;
                            while ((valueMatch = valueRegex.exec(currentLine)) !== null) {
                                if (valueMatch[1] && !values.includes(valueMatch[1])) {
                                    values.push(valueMatch[1]);
                                }
                            }
                        }
                    }
                }
                if (values.length > 0) {
                    enumDefinitions.push({
                        variableName,
                        enumName,
                        values
                    });
                }
            }
        }
        if (enumDefinitions.length === 0) {
            spinner.info(ansi_colors_1.default.cyan('No enums found in the schema'));
            return false;
        }
        // Generate the enums.ts file content
        let enumsContent = `/**
 * Auto-generated TypeScript enums for the ${schemaName} schema.
 * Generated at: ${new Date().toISOString()}
 * Mode: ${typesOnly ? 'Types only (manual regeneration)' : 'Full schema pull + type generation'}
 */

import { getArrayFromEnum } from '../../utils';

`;
        // Process each enum to create proper TypeScript enums
        for (const enumDef of enumDefinitions) {
            // Convert to PascalCase for TypeScript enum name
            const typescriptEnumName = enumDef.enumName
                .split(/[_-]/gu)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join('') + SCHEMA_SUFFIX;
            enumsContent += `
/**
 * Defines the \`${enumDef.variableName}\` enum type for entities in the \`${schemaName}\`.
 */\n`;
            // Create the TypeScript enum
            enumsContent += `export enum ${typescriptEnumName} {\n`;
            enumDef.values.forEach((value) => {
                enumsContent += `  "${value}" = "${value}",\n`;
            });
            enumsContent += `}\n\n`;
            // Add the enum arrays for convenience
            enumsContent += `export const ${typescriptEnumName}Enums = [\n`;
            enumDef.values.forEach((value) => {
                enumsContent += `  "${value}",\n`;
            });
            enumsContent += `] as const;\n\n`;
            // Add the TypeScript type
            enumsContent += `export type ${typescriptEnumName}Type = (typeof ${typescriptEnumName}Enums)[number];\n\n\n`;
        }
        // Write the enums file
        await fs_1.promises.writeFile(ENUMS_FILE, enumsContent, 'utf8');
        spinner.succeed(ansi_colors_1.default.green(`TypeScript enums generated at ${ENUMS_FILE} (${enumDefinitions.length} enums)`));
        return true;
    }
    catch (error) {
        spinner.fail(ansi_colors_1.default.red('Failed to generate enums file'));
        throw error;
    }
}
/**
 * Processes the schema file to rename all schema-specific identifiers
 * for better readability and shorter identifiers.
 *
 * @param {string} schemaFilePath - Path to the schema file
 */
async function processSchemaFile(schemaFilePath) {
    const spinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Processing schema file to improve readability...')).start();
    try {
        // Read the schema file
        const schemaContent = await fs_1.promises.readFile(schemaFilePath, 'utf8');
        // Replace schema-specific patterns
        const searchPattern = `In${schemaName.charAt(0).toUpperCase()}${schemaName.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}Schema`;
        let updatedContent = '';
        const lines = schemaContent.split('\n');
        for (const line of lines) {
            if (!line) {
                updatedContent += '\n';
                continue;
            }
            let updatedLine = '';
            let index = 0;
            while (index < line.length) {
                const matchIndex = line.indexOf(searchPattern, index);
                if (matchIndex === -1) {
                    updatedLine += line.substring(index);
                    break;
                }
                let startOfIdentifier = matchIndex;
                while (startOfIdentifier > 0 &&
                    /[a-zA-Z0-9_]/u.test(line[startOfIdentifier - 1] ?? '')) {
                    startOfIdentifier--;
                }
                const identifierPart = line.substring(startOfIdentifier, matchIndex);
                if (identifierPart.length > 0 &&
                    /^[a-zA-Z_][a-zA-Z0-9_]*$/u.test(identifierPart)) {
                    updatedLine += line.substring(index, startOfIdentifier);
                    updatedLine += identifierPart + SCHEMA_SUFFIX;
                    index = matchIndex + searchPattern.length;
                }
                else {
                    updatedLine += line.substring(index, matchIndex + 1);
                    index = matchIndex + 1;
                }
            }
            updatedContent += updatedLine + '\n';
        }
        // Write the updated content back to the file
        await fs_1.promises.writeFile(schemaFilePath, updatedContent, 'utf8');
        spinner.succeed(ansi_colors_1.default.green('Schema file processed successfully'));
        return updatedContent;
    }
    catch (error) {
        spinner.fail(ansi_colors_1.default.red('Failed to process schema file'));
        throw error;
    }
}
async function main() {
    const databaseURL = process.env.DATABASE_URL;
    if (!databaseURL && !typesOnly) {
        console.error(ansi_colors_1.default.red('DATABASE_URL environment variable is required to pull the schema from the database.'));
        process.exit(1);
    }
    try {
        console.log(ansi_colors_1.default.bold.cyan(`Processing schema: ${schemaName}`));
        console.log(ansi_colors_1.default.dim(`Mode: ${typesOnly ? 'Types only' : 'Full pull + type generation'}`));
        console.log();
        // Create the config file if it doesn't exist
        await createConfigFile();
        // Only run the schema pull if not in types-only mode
        if (!typesOnly) {
            const pullSpinner = (0, ora_1.default)(ansi_colors_1.default.cyan(`Fetching ${schemaName} schema from database...`)).start();
            try {
                const { stderr } = await execAsync(`drizzle-kit pull --config=${CONFIG_FILE}`);
                if (stderr && !stderr.includes('[i] No SQL generated')) {
                    pullSpinner.warn(ansi_colors_1.default.yellow('Schema pulled with warnings'));
                }
                else {
                    pullSpinner.succeed(ansi_colors_1.default.green('Schema pulled successfully'));
                }
                // Process the schema file to rename identifiers
                await processSchemaFile(SCHEMA_FILE);
            }
            catch (error) {
                pullSpinner.fail(ansi_colors_1.default.red('Failed to pull schema'));
                throw error;
            }
        }
        // Check if the schema file exists - in types-only mode, check the final location first
        const schemaAccessSpinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Verifying schema file...')).start();
        let schemaContent;
        let schemaFilePath;
        try {
            // In types-only mode, try to read from the final location first
            if (typesOnly) {
                try {
                    await fs_1.promises.access(FINAL_SCHEMA_FILE);
                    schemaContent = await fs_1.promises.readFile(FINAL_SCHEMA_FILE, 'utf8');
                    schemaFilePath = FINAL_SCHEMA_FILE;
                    schemaAccessSpinner.succeed(ansi_colors_1.default.green(`Found schema file at ${FINAL_SCHEMA_FILE}`));
                }
                catch {
                    // If not found in final location, try the migrations directory
                    await fs_1.promises.access(SCHEMA_FILE);
                    schemaContent = await fs_1.promises.readFile(SCHEMA_FILE, 'utf8');
                    schemaFilePath = SCHEMA_FILE;
                    schemaAccessSpinner.succeed(ansi_colors_1.default.green(`Found schema file at ${SCHEMA_FILE}`));
                }
            }
            else {
                // In full mode, the file is expected to be in the migrations directory
                await fs_1.promises.access(SCHEMA_FILE);
                schemaContent = await fs_1.promises.readFile(SCHEMA_FILE, 'utf8');
                schemaFilePath = SCHEMA_FILE;
                schemaAccessSpinner.succeed(ansi_colors_1.default.green(`Found schema file at ${SCHEMA_FILE}`));
            }
        }
        catch {
            schemaAccessSpinner.fail(ansi_colors_1.default.red(`Schema file not found in either location`));
            throw new Error(`Schema file not found. Run without --types-only to generate it first.`);
        }
        // In types-only mode, process the schema file if needed
        const searchPattern = `In${schemaName.charAt(0).toUpperCase()}${schemaName.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}Schema`;
        if (typesOnly && schemaContent.includes(searchPattern)) {
            schemaContent = await processSchemaFile(schemaFilePath);
        }
        // Generate the enums.ts file
        const enumsGenerated = await generateEnumsFile(schemaContent);
        // Find the snapshot file
        let snapshotFile;
        const metaSpinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Looking for metadata...')).start();
        try {
            const metaFiles = await fs_1.promises.readdir(META_DIR);
            snapshotFile = metaFiles.find((file) => file.endsWith('_snapshot.json'));
            if (snapshotFile) {
                metaSpinner.succeed(ansi_colors_1.default.green(`Found metadata snapshot at ${(0, path_1.join)(META_DIR, snapshotFile)}`));
            }
            else {
                metaSpinner.info(ansi_colors_1.default.blue('No metadata snapshot found, will use schema.ts directly'));
            }
        }
        catch {
            metaSpinner.info(ansi_colors_1.default.blue('No metadata directory found, will use schema.ts directly'));
        }
        // Process the generated schema to create types
        const typesSpinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Generating TypeScript types from schema...')).start();
        // Extract table and enum names more safely
        const tableMatches = [];
        const enumMatches = [];
        // Process the schema line by line
        const schemaLines = schemaContent.split('\n');
        for (const line of schemaLines) {
            if (!line)
                continue;
            // Find table declarations - try custom schema pattern first, then fallback to pgTable
            const customTableRegex = new RegExp(`export const (\\w+)${SCHEMA_SUFFIX} = ${SCHEMA_VAR_NAME}\\.table\\(`, 'u');
            const customTableMatch = customTableRegex.exec(line);
            if (customTableMatch && customTableMatch[1]) {
                tableMatches.push(customTableMatch[1]);
            }
            else {
                // Fallback to standard pgTable pattern
                const pgTableRegex = /export const (\w+) = pgTable\(/u;
                const pgTableMatch = pgTableRegex.exec(line);
                if (pgTableMatch && pgTableMatch[1]) {
                    tableMatches.push(pgTableMatch[1]);
                }
            }
            // Find enum declarations - try custom schema pattern first, then fallback to pgEnum
            const customEnumRegex = new RegExp(`export const (\\w+)${SCHEMA_SUFFIX} = ${SCHEMA_VAR_NAME}\\.enum\\(`, 'u');
            const customEnumMatch = customEnumRegex.exec(line);
            if (customEnumMatch && customEnumMatch[1]) {
                enumMatches.push(customEnumMatch[1]);
            }
            else {
                // Fallback to standard pgEnum pattern
                const pgEnumRegex = /export const (\w+) = pgEnum\(/u;
                const pgEnumMatch = pgEnumRegex.exec(line);
                if (pgEnumMatch && pgEnumMatch[1]) {
                    enumMatches.push(pgEnumMatch[1]);
                }
            }
        }
        if (tableMatches.length === 0 && enumMatches.length === 0) {
            typesSpinner.fail(ansi_colors_1.default.red('No tables or enums found in the schema'));
            throw new Error('Could not find any tables or enums in the schema. The schema file may be invalid.');
        }
        typesSpinner.text = ansi_colors_1.default.cyan(`Found ${ansi_colors_1.default.bold(tableMatches.length.toString())} tables and ${ansi_colors_1.default.bold(enumMatches.length.toString())} enums in the schema`);
        // Create the TypeScript types content
        let typesContent = `/**
 * This file is auto-generated from the database schema using gen-types-enums-psql-schema.
 * Do not modify this file directly - instead, run the script again.
 * 
 * Generated at: ${new Date().toISOString()}
 * Schema: ${schemaName}
 * Mode: ${typesOnly ? 'Types only (manual regeneration)' : 'Full schema pull + type generation'}
 */

import { type TableInsert, type TableSelect } from '../../utils';
import type * as schema from './schema';

// Export generated schema
export * from './schema';
${enumsGenerated ? '\nexport * from \'./enums\';' : ''}

// Generate TypeScript types for all tables
`;
        // Add table types
        for (const tableName of tableMatches) {
            const pascalName = tableName
                .split('_')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
            // Check if this table uses the custom schema pattern or standard pgTable
            const usesCustomSchema = schemaContent.includes(`${tableName}${SCHEMA_SUFFIX} = ${SCHEMA_VAR_NAME}.table(`);
            const tableReference = usesCustomSchema ? `${tableName}${SCHEMA_SUFFIX}` : tableName;
            typesContent += `
/**
 * Defines the \`${pascalName}\` type for entities in the \`${schemaName}\`.
 */
export type ${pascalName} = TableSelect<typeof schema.${tableReference}>;
export type ${pascalName}Insert = TableInsert<typeof schema.${tableReference}>;
`;
        }
        // Add enum types
        typesContent += `
// Generate TypeScript types for all enums
`;
        for (const enumName of enumMatches) {
            const pascalName = enumName
                .split('_')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
            // Check if this enum uses the custom schema pattern or standard pgEnum
            const usesCustomSchema = schemaContent.includes(`${enumName}${SCHEMA_SUFFIX} = ${SCHEMA_VAR_NAME}.enum(`);
            const enumReference = usesCustomSchema ? `${enumName}${SCHEMA_SUFFIX}` : enumName;
            typesContent += `
/**
 * Defines the \`${pascalName}\` enum type for entities in the \`${schemaName}\`.
 */
export type ${pascalName}Type = typeof schema.${enumReference}.enumValues[number];
`;
        }
        // Write the types file
        await fs_1.promises.writeFile(TYPES_FILE, typesContent, 'utf8');
        typesSpinner.succeed(ansi_colors_1.default.green(`TypeScript types generated at ${TYPES_FILE}`));
        // Create an index.ts file to export everything
        const indexSpinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Creating index file...')).start();
        const indexContent = `/**
 * This file exports all types and schema components for the ${schemaName} schema.
 * 
 * Generated at: ${new Date().toISOString()}
 */

export * from './types';
export * from './schema';${enumsGenerated ? '\nexport * from \'./enums\';' : ''}
`;
        await fs_1.promises.writeFile(INDEX_FILE, indexContent, 'utf8');
        indexSpinner.succeed(ansi_colors_1.default.green(`Index file generated at ${INDEX_FILE}`));
        // Move schema file and cleanup migrations directory only in full mode
        if (!typesOnly) {
            const moveSpinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Moving schema file and cleaning up...')).start();
            try {
                // Copy schema.ts to the final location
                await fs_1.promises.copyFile(SCHEMA_FILE, FINAL_SCHEMA_FILE);
                moveSpinner.text = ansi_colors_1.default.cyan('Schema file copied, removing migrations directory...');
                // Delete the migrations directory
                const removeDirRecursive = async (path) => {
                    try {
                        const entries = await fs_1.promises.readdir(path, { withFileTypes: true });
                        for (const entry of entries) {
                            const fullPath = (0, path_1.join)(path, entry.name);
                            if (entry.isDirectory()) {
                                await removeDirRecursive(fullPath);
                            }
                            else {
                                await fs_1.promises.unlink(fullPath);
                            }
                        }
                        await fs_1.promises.rmdir(path);
                    }
                    catch (error) {
                        // Ignore errors if directory doesn't exist
                        if (error.code !== 'ENOENT') {
                            throw error;
                        }
                    }
                };
                await removeDirRecursive(MIGRATIONS_DIR);
                moveSpinner.succeed(ansi_colors_1.default.green('Schema file moved and migrations directory removed'));
            }
            catch (error) {
                moveSpinner.fail(ansi_colors_1.default.red('Failed to move schema file or clean up migrations directory'));
                console.error(ansi_colors_1.default.red(String(error)));
            }
        }
        // Run eslint --fix on the generated files
        const lintSpinner = (0, ora_1.default)(ansi_colors_1.default.cyan('Running ESLint to fix any style issues...')).start();
        try {
            const { stderr } = await execAsync(`npx eslint ./schemas/${schemaName} --fix`);
            if (stderr && stderr.trim() !== '') {
                lintSpinner.warn(ansi_colors_1.default.yellow('ESLint completed with warnings'));
                console.warn(ansi_colors_1.default.yellow.dim('⚠️ ESLint warnings:'), ansi_colors_1.default.dim(stderr));
            }
            else {
                lintSpinner.succeed(ansi_colors_1.default.green('ESLint fixes applied successfully'));
            }
        }
        catch (error) {
            lintSpinner.warn(ansi_colors_1.default.yellow('ESLint encountered issues but processing will continue'));
            console.warn(ansi_colors_1.default.yellow.dim('⚠️ ESLint errors:'), ansi_colors_1.default.dim(error instanceof Error ? error.message : String(error)));
        }
        console.log();
        console.log(ansi_colors_1.default.green.bold(`✅ ${schemaName} schema processing completed successfully`));
        console.log(ansi_colors_1.default.dim(`${tableMatches.length} tables and ${enumMatches.length} enums processed`));
    }
    catch (error) {
        console.error(ansi_colors_1.default.red.bold('❌ Error:'), error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error(ansi_colors_1.default.dim(error.stack));
        }
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map