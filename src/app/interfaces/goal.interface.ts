import { serverTimestamp, Timestamp } from 'firebase/firestore';


export type GoalType = 'unit' | 'habit' | 'yes_no';
export type StateGoalType = 'in_progress' | 'completed' | 'not_completed' | 'cancelled'

export interface GoalData {
    id: string,
    name: string,
    category: string,
    description?: string,
    goalType: GoalType,
    progressValueType?: string,
    customProgressType?: string,
    hasEndDate: boolean,
    endDate?: string,
    targetValue?: number,
    linkedHabit?: string,
    state: StateGoalType,
    progressValue?: number,
    createdAt?: Date | ReturnType<typeof serverTimestamp>,
    updatedAt?: Date | ReturnType<typeof serverTimestamp>,
    completedAt?: Date | ReturnType<typeof serverTimestamp> | null
}