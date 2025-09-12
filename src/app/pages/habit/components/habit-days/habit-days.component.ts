import { formatLocalDate, parseLocalDate } from 'src/app/shared/utils/date.utils';
import { UserService } from 'src/app/services/user/user.service';
import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, inject, SimpleChanges } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { HabitData, HabitLog } from 'src/app/interfaces/habit.interface';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { HabitService } from 'src/app/services/habit/habit.service';
import { Subscription } from 'rxjs';
import { GoalService } from 'src/app/services/goal/goal.service';
// register()

@Component({
  selector: 'app-habit-days',
  templateUrl: './habit-days.component.html',
  styleUrls: ['./habit-days.component.scss'],
  imports: [
    CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HabitDaysComponent {
  public userService = inject(UserService);
  public goalService = inject(GoalService)
  public habitService = inject(HabitService);

  @Input() habit!: HabitData;
  @Input() days: {
    date: Date;
    iso: string;
    weekday: string;
    formattedDate: string;
    isHabitDay: boolean;
  }[] = [];
  @Input() logs: { [date: string]: HabitLog | null } = {};
  @Output() logUpdated = new EventEmitter<{ state: string; date: string }>();

  async selectDay(iso: string) {
    await this.habitService.completeHabitById(this.habit.id, iso);
    await this.goalService.checkGoalsForHabit(this.habit.id);
    this.logUpdated.emit();
  }

  public getVisualStateForDay(dateIso: string): string {
    return this.logs[dateIso]?.state || 'not_completed';
  }

  public getDayStateClass(state?: string): string {
    switch (state) {
      case 'completed': return 'day-completed';
      case 'failed': return 'day-failed';
      case 'in_progress': return 'day-in-progress';
      default: return 'day-not-completed';
    }
  }
}