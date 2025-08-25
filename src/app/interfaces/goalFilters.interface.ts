type GoalType = 'unit' | 'habit' | 'yes_no';
type StateGoalType = 'in_progress' | 'completed' | 'not_completed' | 'cancelled';

interface GoalTypeFilters {
  unit: boolean;
  habit: boolean;
  yes_no: boolean;
}

interface StatusFilters {
  in_progress: boolean;
  completed: boolean;
  not_completed: boolean;
  cancelled: boolean;
}

interface DeadlineFilters {
  hasDeadline: boolean;
  overdue: boolean;
  dueThisWeek: boolean;
}

type SortBy =
  | 'name'
  | 'name-desc'
  | 'created-newest'
  | 'created-oldest'
  | 'deadline-nearest'
  | 'progress-highest'
  | 'progress-lowest';

export interface GoalFilters {
  categories: string[];
  goalTypes: GoalTypeFilters;
  statuses: StatusFilters;
  deadlines: DeadlineFilters;
  sortBy: SortBy;
}
