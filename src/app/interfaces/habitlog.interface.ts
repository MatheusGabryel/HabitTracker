export interface HabitLog {
  habitId: string;
  date: string;
  state: 'completed' | 'failed' | 'in_progress' | 'not_completed';
  updatedAt: any;
}