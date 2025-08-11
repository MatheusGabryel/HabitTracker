import { serverTimestamp } from 'firebase/firestore';

export type ProgressHabitType = 'yes_no' | 'time' | 'times';
export type CompletionRulesHabiType = 'equal' | 'at_least' | 'at_most' | 'any';
export type StateHabitType = 'in_progress' | 'completed' | 'not_completed' | 'failed';

export interface HabitData {
  id: string,
  name: string,
  category: string,
  days: string[],
  description?: string,
  priority: string,
  progressType: ProgressHabitType,
  timesTarget?: {
    value: number;
    rule: CompletionRulesHabiType;
  },
  timeTarget?: {
    hours?: number;
    minutes?: number;
    seconds?: number;
    value?: number;
    rule?: CompletionRulesHabiType;
  },
  createdAt: Date | ReturnType<typeof serverTimestamp>;
  updatedAt: Date | ReturnType<typeof serverTimestamp>;
  logs: HabitLog[];
  historicalLogs?: HabitLog[];
}

export interface HabitLog {
  habitId: string;
  date: string;
  state: StateHabitType;
  updatedAt: any;
  progressValue: number;
}

export interface HabitList {
  id?: string;
  name: string;
  createdAt: any;
  updatedAt: any;
  categories: string[];
  isVisible?: boolean;
}

export interface HabitLogMap { [date: string]: HabitLog | null };