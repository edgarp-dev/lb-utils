import { google, Auth } from "googleapis";
import { Routine } from "../types/types";

export class GoogleSheetsService {
	private GOOGLE_SHEETS_CONFIG = {
		credentials: {
			type: "service_account",
			project_id: "lifting-buddy-441414",
			private_key_id: process.env.PRIVATE_KEY_ID,
			private_key: process.env.PRIVATE_KEY?.split(String.raw`\n`).join("\n"),
			client_email: process.env.CLIENT_EMAIL,
			client_id: "102173928869637551987",
			auth_uri: "https://accounts.google.com/o/oauth2/auth",
			token_uri: "https://oauth2.googleapis.com/token",
			auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
			client_x509_cert_url:
				"https://www.googleapis.com/robot/v1/metadata/x509/script%40lifting-buddy-441414.iam.gserviceaccount.com",
			universe_domain: "googleapis.com",
		},
		spreadsheetId: process.env.SPREADSHEET_ID as string,
		scopes: ["https://www.googleapis.com/auth/spreadsheets"] as const,
	};

	private auth: Auth.GoogleAuth;

	constructor() {
		this.auth = new google.auth.GoogleAuth({
			credentials: this.GOOGLE_SHEETS_CONFIG.credentials,
			scopes: [...this.GOOGLE_SHEETS_CONFIG.scopes],
		});
	}

	async addSheetIfNotExists(sheetName: string): Promise<void> {
		const service = google.sheets({ version: "v4", auth: this.auth });
		const spreadsheet = await service.spreadsheets.get({
			spreadsheetId: this.GOOGLE_SHEETS_CONFIG.spreadsheetId,
		});

		const existingSheets =
			spreadsheet.data.sheets?.map((sheet) => sheet.properties?.title) || [];

		if (!existingSheets.includes(sheetName)) {
			await service.spreadsheets.batchUpdate({
				spreadsheetId: this.GOOGLE_SHEETS_CONFIG.spreadsheetId,
				requestBody: {
					requests: [
						{
							addSheet: {
								properties: { title: sheetName },
							},
						},
					],
				},
			});
			console.log(`Sheet '${sheetName}' created.`);
		}
	}

	async updateSheetValues(
		sheetName: string,
		routines: Routine[]
	): Promise<void> {
		const values = this.convertRoutinesToSheetValues(routines);
		const service = google.sheets({ version: "v4", auth: this.auth });
		const range = `${sheetName}!A1:G${values.length}`;

		try {
			const response = await service.spreadsheets.values.update({
				spreadsheetId: this.GOOGLE_SHEETS_CONFIG.spreadsheetId,
				range,
				valueInputOption: "RAW",
				requestBody: { values },
			});

			console.log(
				"%d cells updated in sheet '%s'.",
				response.data.updatedCells || 0,
				sheetName
			);
		} catch (error) {
			console.error("Error updating spreadsheet:", error);
			throw error;
		}
	}

	private convertRoutinesToSheetValues(routines: Routine[]): string[][] {
		const headers = [
			[
				"Date",
				"Routine Description",
				"Exercise Name",
				"Muscle",
				"Repetitions",
				"Weight",
				"Weight Measure",
			],
		];

		const rows = routines.flatMap((routine) =>
			routine.exercises.flatMap((exercise) =>
				exercise.routineexercises.map((routineExercise) => [
					routine.date,
					routine.description,
					exercise.name,
					exercise.muscle,
					routineExercise.repetitions,
					routineExercise.weight,
					routineExercise.weight_measure,
				])
			)
		);

		return [...headers, ...rows];
	}
}
