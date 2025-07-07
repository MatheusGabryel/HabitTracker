import { UserService } from 'src/app/services/user.service';
import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, inject, SimpleChanges } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { HabitLog } from 'src/app/interfaces/habitlog.interface';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
// register()

@Component({
  selector: 'app-habit-days',
  templateUrl: './habit-days.component.html',
  styleUrls: ['./habit-days.component.scss'],
  imports: [
    CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HabitDaysComponent implements OnInit {
  @Output() daySelected = new EventEmitter<string>();
  public userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  @Input() logs: { [date: string]: HabitLog } = {};
  @Input() centerDate!: Date;
  @Input() daysBefore!: number;
  @Input() habitId!: string;
  @Input() habitRule!: string;
  @Input() habitDays: string[] = [];
  @Output() logsUpdated = new EventEmitter<{ [date: string]: HabitLog }>();

  days: {
    date: Date;
    iso: string;
    weekday: string;
    formattedDate: string;
    isHabitDay: boolean;
  }[] = [];


  selectDay(iso: string) {
    this.daySelected.emit(iso);
  }

  private generateDays(today: Date, before: number) {
    const days = [];

    for (let i = -before; i++;) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toLowerCase();
      const normalizedHabitDays = this.habitDays.map(day => day.toLowerCase());
      const isHabitDay = normalizedHabitDays.includes(weekday);

      days.push({
        date,
        iso: date.toISOString().split('T')[0],
        weekday,
        formattedDate: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
        isHabitDay,
      });
    }

    return days;
  }

  async loadLogsForHabit(habitId: string) {
    const uid = await this.userService.getUserId();
    if (!uid) return;

    const dates = this.days.map(day => day.iso);

    this.logs = await this.userService.getHabitLogsForDates(uid, habitId, dates);
    if (this.habitRule === 'at_most') {
      const todayIso = new Date().toISOString().split('T')[0];
      for (const [date, log] of Object.entries(this.logs)) {
        const dateObj = new Date(date);
        const isPast = dateObj < new Date(todayIso);
        if (isPast && log.state === 'in_progress') {
          await this.userService.logHabitCompletion(uid, habitId, date, 'completed');
          this.logs[date].state = 'completed';
        }
      }
    }
  }

  getVisualStateForDay(dateIso: string): string {
    if (this.logs[dateIso]) {
      return this.logs[dateIso].state;
    }
    const todayIso = new Date().toISOString().split('T')[0];
    if (dateIso === todayIso) {
      return 'in_progress';
    }
    return 'not_completed';
  }

  getDayStateClass(state?: string): string {
    switch (state) {
      case 'completed':
        return 'day-completed';
      case 'failed':
        return 'day-failed';
      case 'in_progress':
        return 'day-in-progress';
      default:
        return 'day-not-completed';
    }
  }


  async initDaysAndLogs(center: Date, before: number, habitId: string) {
    this.days = this.generateDays(center, before);
    await this.loadLogsForHabit(habitId);
    this.logsUpdated.emit(this.logs);
  }


  ngOnInit() {
    if (this.habitId && this.centerDate && this.daysBefore !== undefined) {
      this.initDaysAndLogs(this.centerDate, this.daysBefore, this.habitId);
    }
        console.log(this.logs)
  }


}