import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs-extra';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const outputFile = 'scripts/create_tables.sql';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCreateStatements() {
    const { data, error } = await supabase.rpc('generate_table_ddl');

    if (error) {
        console.error('Error:', error)
        return;
    };

    const createStatements = data.map(item => item.create_statement).join('\n\n');

    return createStatements;
}

async function writeToFile(data) {
    try {
        await fs.writeFile(outputFile, data);
        console.log(`Script successfully generated in ${outputFile}`);
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}

const createStatements = await getCreateStatements();
await writeToFile(createStatements);
