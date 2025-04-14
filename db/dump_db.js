import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs-extra';

dotenv.config();

const config = {
    supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_ANON_KEY
    },
    output: {
        file: 'scripts/create_tables.sql',
        encoding: 'utf8'
    }
};

if (!config.supabase.url || !config.supabase.key) {
    console.error('Missing Supabase URL or Key in environment variables');
    process.exit(1);
}

const supabase = createClient(config.supabase.url, config.supabase.key);

/**
 * Generates the SQL schema header with standard configuration
 */
function generateSchemaHeader() {
    return `-- SQL Schema generated on ${new Date().toISOString()}
-- Tables and foreign key constraints for Supabase project
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;\n\n`;
}

/**
 * Retrieves CREATE TABLE definitions from the database
 * @returns {Promise<string|null>} SQL table definitions or null if error occurs
 */
async function getCreateTableStatements() {
    const { data, error } = await supabase.rpc('generate_table_ddl');

    if (error) {
        console.error('Error getting table definitions:', error);
        return null;
    }

    return data?.map(item => item.create_statement).join('\n\n') || '';
}

/**
 * Formats a foreign key constraint into SQL
 * @param {Object} fk - Foreign key information object
 * @returns {string} Formatted ALTER TABLE SQL statement
 */
function formatForeignKeyConstraint(fk) {
    const { table_name, constraint_name, column_name, foreign_table_name, foreign_column_name } = fk;
    return `ALTER TABLE ${table_name}
    ADD CONSTRAINT ${constraint_name}
    FOREIGN KEY (${column_name})
    REFERENCES ${foreign_table_name}(${foreign_column_name});`;
}

/**
 * Retrieves all foreign key constraints
 * @returns {Promise<string|null>} SQL constraints or null if error occurs
 */
async function getForeignKeyConstraints() {
    const { data, error } = await supabase.rpc('get_foreign_keys');

    if (error) {
        console.error('Error getting foreign key constraints:', error);
        return null;
    }

    return !data?.length ? '' : data.map(formatForeignKeyConstraint).join('\n\n');
}

/**
 * Writes content to the output file
 * @param {string} data - Content to write
 * @returns {Promise<boolean>} true if write operation was successful
 */
async function writeToFile(data) {
    if (!data) {
        console.error('No data provided to write to file');
        return false;
    }

    try {
        const dir = config.output.file.split('/')[0];
        await fs.ensureDir(dir);
        await fs.writeFile(config.output.file, data, config.output.encoding);
        console.log(`Schema successfully generated in ${config.output.file}`);
        return true;
    } catch (error) {
        console.error('Error writing schema to file:', error.message);
        return false;
    }
}

/**
 * Generates the complete SQL schema and saves it to a file
 * This function coordinates the schema generation process by:
 * 1. Getting table definitions
 * 2. Getting foreign key constraints
 * 3. Combining them with the header
 * 4. Writing the result to a file
 */
async function generateFullSchema() {
    try {
        const [tables, fkConstraints] = await Promise.all([
            getCreateTableStatements(),
            getForeignKeyConstraints()
        ]);

        if (!tables) throw new Error('Failed to generate table definitions');
        if (!fkConstraints) throw new Error('Failed to generate foreign key constraints');

        const fullSchema = [
            generateSchemaHeader(),
            tables,
            '\n-- Foreign Key Constraints\n\n',
            fkConstraints
        ].join('');

        const success = await writeToFile(fullSchema);
        if (!success) throw new Error('Failed to write schema to file');

    } catch (error) {
        console.error('Error generating schema:', error.message);
        process.exit(1);
    }
}

await generateFullSchema();
