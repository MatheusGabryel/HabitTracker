import { GoalService } from 'src/app/services/goal/goal.service';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { registerLocaleData } from '@angular/common';
import { register } from 'swiper/element/bundle';
import localePt from '@angular/common/locales/pt';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { Category } from 'src/app/interfaces/category.interface';
import { HabitService } from 'src/app/services/habit/habit.service';
import { HabitData, HabitDataWithCategoryObj, HabitWithLogs } from 'src/app/interfaces/habit.interface';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
import { formatLocalDate, parseLocalDate } from 'src/app/shared/utils/date.utils';
registerLocaleData(localePt);
register()


@Component({
  selector: 'app-dashboard-day-swiper',
  templateUrl: './dashboard-day-swiper.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./dashboard-day-swiper.component.scss'],
  imports: [CommonModule],
})

export class DashboardDaySwiperComponent {
  public userService = inject(UserService);
  public habitService = inject(HabitService)
  public goalService = inject(GoalService)

  @Input() habits!: HabitData[];
  @Output() update = new EventEmitter<void>();

  public logs!: HabitWithLogs[];
  public filteredHabits: HabitData[] = [];

  public allweek: Date[] = [];
  public currentWeekStart!: Date;
  public selectedDate: Date = new Date();
  public todayIso: string = new Date().toISOString().split('T')[0];

  public showFullHabits: boolean = false;
  public isClosing: boolean = false;

  public logsByDate: Record<string, Record<string, any>> = {};

  async ngOnChanges() {
    this.generateWeek();
    this.logs = await this.habitService.getLogsWithHabit()
    this.getLogsForHabits()

  }

  public async markHabit(habit: HabitData, date: Date) {
    if (!this.isPastOrToday(date)) return;
    const dateKey = formatLocalDate(date);
    const newState = await this.habitService.completeHabit(habit, dateKey);
  this.logsByDate = {
    ...this.logsByDate,
    [dateKey]: {
      ...this.logsByDate[dateKey],
      [habit.id]: {
        ...(this.logsByDate[dateKey]?.[habit.id] ?? {}),
        state: newState
      }
    }
  };
    this.update.emit()
  }



  public closeModal(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isClosing = true;

    setTimeout(() => {
      this.showFullHabits = false;
      this.isClosing = false;
    }, 300);
  }


  public generateWeek(baseDate: Date = new Date()) {
    const dayOfWeek = baseDate.getDay();
    this.currentWeekStart = new Date(baseDate);
    this.currentWeekStart.setDate(baseDate.getDate() - dayOfWeek);
    this.allweek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      this.allweek.push(date);
    }
  }

  public getLogsForHabits() {
    const habitsLogs = this.logs
    this.logsByDate = {};

    for (const habit of habitsLogs) {
      for (const log of habit.logs) {
        if (!this.logsByDate[log.date]) {
          this.logsByDate[log.date] = {};
        }
        this.logsByDate[log.date][habit.id] = log;
      }
    }

  }

  public getDayState(habitId: string, date: Date): string {
    const dateKey = formatLocalDate(date);
    const dayLog = this.logsByDate?.[dateKey]?.[habitId];
    return dayLog?.state || 'in_progress';
  }

  public getCategory(categoryId: string): Category | undefined {
    return PREDEFINED_CATEGORIES.find(cat => cat.id === categoryId);
  }
  public getHabitsForWeekday(date: Date): HabitDataWithCategoryObj[] {
    const weekday = this.getWeekday(date);

    const habitsForDay = this.habits
      .filter(habit => habit.days.map((d: string) => d.toLowerCase()).includes(weekday) && normalizeFirestoreDate(habit.createdAt) < date)
      .map(habit => ({
        ...habit,
        categoryObj: this.getCategory(habit.category)
      }));
    return habitsForDay;
  }

  public pagination(direction: 'next' | 'prev') {
    const daysInWeek = 7;
    const newBaseDate = new Date(this.currentWeekStart);
    if (direction === 'next') {
      newBaseDate.setDate(newBaseDate.getDate() + daysInWeek);
    } else if (direction === 'prev') {
      newBaseDate.setDate(newBaseDate.getDate() - daysInWeek);
    }
    this.generateWeek(newBaseDate);
  }

  public onDateSelected(date: Date) {
    this.selectedDate = date;
  }

  public isPastOrToday(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate <= today;
  }

  public getWeekday(date: Date): string {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toLowerCase();
  }
}
