import { serverTimestamp } from 'firebase/firestore';

export interface GoalData {
    id: string,
    name: string,
    category: string,
    description?: string,
    progressValueType: string,
    customProgressType?: string,
    hasEndDate: boolean,
    endDate?: string,
    targetValue: number,
    state: 'in_progress' | 'completed' | 'not_completed',
    progressValue: number,
    createdAt?: Date | ReturnType<typeof serverTimestamp>,
    updatedAt?: Date | ReturnType<typeof serverTimestamp>,
}