import "dotenv/config";
import { CronJob } from "cron";
import { SupabaseService } from "./services/supabase";
import { GoogleSheetsService } from "./services/googleSheets";
import { groupRoutinesByYear } from "./utils/dateUtils";

class RoutineSyncService {
	private supabaseService: SupabaseService;
	private sheetsService: GoogleSheetsService;

	constructor() {
		this.supabaseService = new SupabaseService();
		this.sheetsService = new GoogleSheetsService();
	}

	async syncRoutinesToSheets(): Promise<void> {
		try {
			console.log("Starting routine sync process...");

			const routines = await this.supabaseService.getRoutines();
			console.log(`Retrieved ${routines.length} routines from database`);

			const routinesByYear = groupRoutinesByYear(routines);

			for (const [year, yearRoutines] of Object.entries(routinesByYear)) {
				await this.sheetsService.addSheetIfNotExists(year);
				await this.sheetsService.updateSheetValues(year, yearRoutines);
			}

			console.log("Routine sync completed successfully");
		} catch (error) {
			console.error("Error during routine sync:", error);
			throw error;
		}
	}
}

const routineSyncService = new RoutineSyncService();

if (process.env.ENV === "dev") {
	routineSyncService.syncRoutinesToSheets().catch(console.error);
} else {
	const CRON_CONFIG = {
		schedule: "0 0 * * *",
		timezone: "America/Mexico_City",
	};

	new CronJob(
		CRON_CONFIG.schedule,
		() => routineSyncService.syncRoutinesToSheets(),
		null,
		true,
		CRON_CONFIG.timezone
	);
}
