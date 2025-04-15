export function formatTodayDate(): string {
    const today = new Date();
    return formatDate(today);
}

export function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export function getYearFromDate(dateString: string): string {
    return new Date(dateString).getUTCFullYear().toString();
}

export function groupRoutinesByYear<T extends { date: string }>(routines: T[]): { [year: string]: T[] } {
    return routines.reduce((acc: { [year: string]: T[] }, routine) => {
        const year = getYearFromDate(routine.date);
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(routine);
        return acc;
    }, {});
}