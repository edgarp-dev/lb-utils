export interface RoutineExercise {
    repetitions: string;
    weight: string;
    weight_measure: string;
}

export interface Exercise {
    routine_id: number;
    name: string;
    muscle: string;
    routineexercises: RoutineExercise[];
}

export interface Routine {
    routine_id: number;
    date: string;
    description: string;
    exercises: Exercise[];
}

export interface RoutinesByYear {
    [year: string]: Routine[];
}