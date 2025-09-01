import { GoalService } from 'src/app/services/goal/goal.service';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';
import { registerLocaleData } from '@angular/common';
import { register } from 'swiper/element/bundle';
import localePt from '@angular/common/locales/pt';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { Category } from 'src/app/interfaces/category.interface';
import { HabitService } from 'src/app/services/habit/habit.service';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
registerLocaleData(localePt);
register()


@Component({
  selector: 'app-dashboard-day-swiper',
  templateUrl: './dashboard-day-swiper.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./dashboard-day-swiper.component.scss'],
  imports: [CommonModule],
})
export class DashboardDaySwiperComponent implements OnInit {
  public habits: any[] = [];
  public logs: any
  public userService = inject(UserService);
  public habitService = inject(HabitService)
  public goalService = inject(GoalService)
  public filteredHabits: any[] = [];
  public allweek: any[] = [];
  public currentWeekStart!: Date;
  public selectedDate: any = new Date();
  public isLoaded = false;
  public showFullHabits = false;
  public isClosing = false;
  public todayIso: any = new Date().toISOString().split('T')[0];
  public logsByDate: Record<string, Record<string, any>> = {};



  async ngOnInit() {
    this.generateWeek();
    await this.loadHabits();
    this.isLoaded = true;
    this.logs = await this.habitService.getLogsWithHabit()


    console.log(this.logs)
    this.getLogsForHabits()

  }

  generateWeek(baseDate: Date = new Date()) {
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



  getLogsForHabits() {
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

  getDayState(habitId: string, date: Date): string {
    const dateKey = date.toISOString().split('T')[0];
    const dayLog = this.logsByDate?.[dateKey]?.[habitId];
    return dayLog?.state || 'in_progress';
  }


  closeModal(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isClosing = true;

    setTimeout(() => {
      this.showFullHabits = false;
      this.isClosing = false;
    }, 300);
  }

  getCategory(categoryId: string): Category | undefined {
    return PREDEFINED_CATEGORIES.find(cat => cat.id === categoryId);
  }

  pagination(direction: 'next' | 'prev') {
    const daysInWeek = 7;
    const newBaseDate = new Date(this.currentWeekStart);
    if (direction === 'next') {
      newBaseDate.setDate(newBaseDate.getDate() + daysInWeek);
    } else if (direction === 'prev') {
      newBaseDate.setDate(newBaseDate.getDate() - daysInWeek);
    }
    this.generateWeek(newBaseDate);
  }



  async loadHabits() {
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error('Usuário não autenticado');
    this.habits = await this.habitService.getUserHabits();
  }

  onDateSelected(date: Date) {
    this.selectedDate = date;
  }

  getHabitsForWeekday(date: Date): any[] {
    const weekday = this.getWeekday(date);

    const habitsForDay = this.habits
      .filter(habit => habit.days.map((d: string) => d.toLowerCase()).includes(weekday) && normalizeFirestoreDate(habit.createdAt) < date)
      .map(habit => ({
        ...habit,
        categoryObj: this.getCategory(habit.category)
      }));
    return habitsForDay;
  }

  isPastOrToday(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0); 
    return compareDate <= today;
  }

  async markHabit(habit: HabitData, date: Date) {
    if (!this.isPastOrToday(date)) return;
    const dateKey = date.toISOString().split('T')[0];
    const newState = await this.habitService.completeHabit(habit, dateKey);
    this.logsByDate[dateKey][habit.id] = {
      ...this.logsByDate[dateKey][habit.id],
      state: newState,
    };
  }

  

  getWeekday(date: Date): string {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toLowerCase();
  }
}
