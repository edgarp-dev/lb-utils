import { createClient } from "@supabase/supabase-js";
import { Routine, Exercise } from "../types/types";

export class SupabaseService {
	private SUPABASE_CONFIG = {
		url: process.env.SUPABASE_URL || "",
		key: process.env.SUPABASE_ANON_KEY || "",
		userId: 2,
	};

	private supabase;

	constructor() {
		this.supabase = createClient(this.SUPABASE_CONFIG.url, this.SUPABASE_CONFIG.key);
	}

	async getRoutines(pageSize: number = 50): Promise<Routine[]> {
		try {
			const allRoutines: Routine[] = [];
			let currentPage = 1;
			let hasMore = true;

			while (hasMore) {
				const { routines, hasMoreData } = await this.fetchRoutinePage(
					currentPage,
					pageSize
				);

				if (routines.length > 0) {
					const enrichedRoutines = await this.enrichRoutinesWithExercises(
						routines
					);
					allRoutines.push(...enrichedRoutines);
				}

				hasMore = hasMoreData;
				currentPage++;
			}

			return allRoutines;
		} catch (err) {
			console.error("Error fetching routines:", err);
			throw err;
		}
	}

	private async fetchRoutinePage(
		page: number,
		pageSize: number
	): Promise<{
		routines: Pick<Routine, "routine_id" | "description" | "date">[];
		hasMoreData: boolean;
	}> {
		const startRange = (page - 1) * pageSize;
		const endRange = startRange + pageSize - 1;

		const { data: routines, error } = await this.supabase
			.from("routines")
			.select("routine_id, description, date")
			.eq("user_id", this.SUPABASE_CONFIG.userId)
			.range(startRange, endRange);

		if (error) throw error;

		return {
			routines: routines || [],
			hasMoreData: routines?.length === pageSize,
		};
	}

	private async enrichRoutinesWithExercises(
		routines: Pick<Routine, "routine_id" | "description" | "date">[]
	): Promise<Routine[]> {
		const routineIds = routines.map((routine) => routine.routine_id);

		const { data: exercises, error } = await this.supabase
			.from("exercises")
			.select(
				"routine_id, name, muscle, routineexercises(repetitions, weight, weight_measure)"
			)
			.in("routine_id", routineIds);

		if (error) throw error;

		return routines.map((routine) => ({
			routine_id: routine.routine_id,
			date: routine.date,
			description: routine.description,
			exercises:
				(exercises
					?.filter((exercise) => exercise.routine_id === routine.routine_id)
					.map((exercise) => ({
						...exercise,
						routineexercises: exercise.routineexercises || [],
					})) as Exercise[]) || [],
		}));
	}
}
