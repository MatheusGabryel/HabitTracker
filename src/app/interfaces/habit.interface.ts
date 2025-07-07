import { serverTimestamp } from 'firebase/firestore';

export interface HabitData {
    id: string,
    name: string,
    category: string,
    days: string[],
    description?: string,
    priority: string,
    progressType: 'yes_no' | 'time' | 'times',

    timesTarget?: {
        value: number;
        rule: 'equal' | 'at_least' | 'at_most' | 'any';
    },
    timeTarget?: {
        hours?: number;
        minutes?: number;
        seconds?: number;
        rule?: 'equal' | 'at_least' | 'at_most' | 'any';
    },
    state: 'in_progress' | 'completed' | 'not_completed' | 'failed';
    currentTimes?: number;
    inputValue?: number;
    progressValue: number;
    createdAt: Date | ReturnType<typeof serverTimestamp>;
    updatedAt: Date | ReturnType<typeof serverTimestamp>
}