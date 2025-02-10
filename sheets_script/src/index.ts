import 'dotenv/config';
import process from "process";
import {google, Auth} from "googleapis";
import { createClient } from '@supabase/supabase-js';
import { CronJob } from 'cron';

interface RoutineExercise {
    repetitions: string;
    weight: string;
    weight_measure: string;
}

interface Exercise {
    name: string;
    muscle: string;
    routineexercises: RoutineExercise[];
}

interface Routine {
    date: string;
    description: string;
    exercises: Exercise[];
}

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function authorizeWithServiceAccount() {
    const credentials = {
        "type": "service_account",
        "project_id": "lifting-buddy-441414",
        "private_key_id": process.env.PRIVATE_KEY_ID,
        "private_key": process.env.PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
        "client_email": process.env.CLIENT_EMAIL,
        "client_id": "102173928869637551987",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/script%40lifting-buddy-441414.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    }

    return new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
}

async function updateValuesWithServiceAccount(
    spreadsheetId: string,
    sheetName: string,
    values: any[][],
    auth: Auth.GoogleAuth
) {
    try {
        const service = google.sheets({ version: "v4", auth });
        const range = `${sheetName}!A1:G${values.length}`;
        const valueInputOption = "RAW";

        const resource = { values };
        const response = await service.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption,
            requestBody: resource,
        });

        console.log("%d cells updated in sheet '%s'.", response.data.updatedCells || 0, sheetName);
        return response.data;
    } catch (error) {
        console.error("Error updating spreadsheet:", error);
        throw error;
    }
}

async function addSheetIfNotExists(spreadsheetId: string, sheetName: string, auth: Auth.GoogleAuth): Promise<void> {
    const service = google.sheets({ version: "v4", auth });

    const spreadsheet = await service.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];

    if (!existingSheets.includes(sheetName)) {
        await service.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    addSheet: {
                        properties: { title: sheetName }
                    }
                }]
            }
        });
        console.log(`Sheet '${sheetName}' created.`);
    } else {
        console.log(`Sheet '${sheetName}' already exists.`);
    }
}

async function getRoutinesData(userId: number, pageSize: number = 50) {
    try {
        let currentPage = 1;
        let hasMore = true;
        const allRoutines: any[] = [];

        while (hasMore) {
            const startRange = (currentPage - 1) * pageSize;
            const endRange = startRange + pageSize - 1;

            const { data: routines, error: routineError } = await supabase
                .from('routines')
                .select(`routine_id, description, date`)
                .eq('user_id', userId)
                .range(startRange, endRange);

            if (routineError) {
                console.error('Error fetching routines:', routineError);
                return null;
            }

            if (!routines || routines.length === 0) {
                hasMore = false;
            } else {
                const routineIds = routines.map(routine => routine.routine_id);
                const { data: exercises, error: exerciseError } = await supabase
                    .from('exercises')
                    .select(`routine_id, name, muscle, routineexercises(repetitions, weight, weight_measure)`)
                    .in('routine_id', routineIds);

                if (exerciseError) {
                    console.error('Error fetching exercises:', exerciseError);
                    return null;
                }

                const combined = routines.map(routine => ({
                    ...routine,
                    exercises: exercises?.filter(exercise => exercise.routine_id === routine.routine_id) || [],
                }));

                allRoutines.push(...combined);
                currentPage++;
            }
        }

        return allRoutines;
    } catch (err) {
        console.error('Error executing query:', err);
        return null;
    }
}

const main = async () => {
    try {
        console.log('Retrieving routines data');

        const routinesData = await getRoutinesData(1);
        if (!routinesData || routinesData.length === 0) {
            console.error('No data available for routines');
            return;
        }

        console.log('Grouping routines by year');

        const routinesByYear: { [year: string]: Routine[] } = {};
        routinesData.forEach(routine => {
            const year = new Date(routine.date).getUTCFullYear();

            if (!routinesByYear[year]) {
                routinesByYear[year] = [];
            }

            routinesByYear[year].push(routine);
        });

        console.log('Authenticating with service account');

        const spreadsheetId = <string>process.env.SPREADSHEET_ID;
        const auth = await authorizeWithServiceAccount();

        for (const [year, routines] of Object.entries(routinesByYear)) {
            const sheetName = year.toString();

            await addSheetIfNotExists(spreadsheetId, sheetName, auth);

            const values = [
                ["Date", "Routine Description", "Exercise Name", "Muscle", "Repetitions", "Weight", "Weight Measure"]
            ];

            routines.forEach((routine) => {
                routine.exercises.forEach((exercise) => {
                    exercise.routineexercises.forEach((routineExercise) => {
                        values.push([
                            routine.date,
                            routine.description,
                            exercise.name,
                            exercise.muscle,
                            routineExercise.repetitions,
                            routineExercise.weight,
                            routineExercise.weight_measure
                        ]);
                    });
                });
            });

            await updateValuesWithServiceAccount(spreadsheetId, sheetName, values, auth);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

if (process.env.ENV === 'dev') {
    (async () => await main())();
} else {
    new CronJob('0 0 * * *', async function () {
        console.log('Starting cron job');

        await main();

        console.log('Finished cron job');
    }, null, true, 'America/Mexico_City');
}

