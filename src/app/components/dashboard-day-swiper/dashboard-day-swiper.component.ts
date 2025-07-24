import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit, Output } from '@angular/core';
import { HabitLog } from 'src/app/interfaces/habitlog.interface';
import { UserService } from 'src/app/services/user.service';
import { registerLocaleData } from '@angular/common';
import { register } from 'swiper/element/bundle';
import localePt from '@angular/common/locales/pt';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { Category } from 'src/app/interfaces/category.interface';
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
  public filteredHabits: any[] = [];
  public allweek: any[] = [];
  public currentWeekStart!: Date;
  public selectedDate: any = new Date();
  public isLoaded = false;
  public showFullHabits = false;
  public isClosing = false;
  public todayIso: any = new Date().toISOString().split('T')[0];



  async ngOnInit() {
    this.generateWeek();
    await this.loadHabits();
    this.updateFilteredHabits();
    this.isLoaded = true;
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

  async loadLogsForHabitToday(habitId: string) {
    const uid = await this.userService.getUserId();
    if (!uid) return;

    const dates = await this.selectedDate

    this.logs = await this.userService.getHabitLogsForDates(uid, habitId, dates);
    console.log(this.logs)
  }

    getTodayState(): string {
    const todayLog = this.logs?.[this.selectedDate];
    return todayLog?.state || 'in_progress';
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
    this.habits = await this.userService.getUserHabits(uid);
  }

  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.updateFilteredHabits();
  }


  updateFilteredHabits() {

    const weekday = this.getWeekday(this.selectedDate);
    this.filteredHabits = this.habits
      .filter(habit =>
        habit.days.map((day: string) => day.toLowerCase()).includes(weekday)
      )
      .map(habit => ({
        ...habit,
        categoryObj: this.getCategory(habit.category)
      }));
  }


  getWeekday(date: Date): string {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toLowerCase();
  }
}
