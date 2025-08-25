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
export class HabitDaysComponent implements OnInit {
  public userService = inject(UserService);
  public goalService = inject(GoalService)
  public habitService = inject(HabitService);
  public daysBefore = 7;


  @Input() habit!: HabitData;
  @Input() habitId!: string;
  @Input() habitRule!: string;
  @Input() days: {
    date: Date;
    iso: string;
    weekday: string;
    formattedDate: string;
    isHabitDay: boolean;
  }[] = [];
  @Output() logUpdated = new EventEmitter<void>();

  @Input() logs: { [date: string]: HabitLog | null } = {};

  async selectDay(iso: string) {
    await this.habitService.completeHabitById(this.habitId, iso);
        await this.goalService.checkGoalsForHabit(this.habitId)
    const dateList = this.days.map(d => d.iso);
    await this.habitService.loadLogsForHabit(this.habitId, dateList, this.habit);
  
    this.logUpdated.emit();
  }

  getVisualStateForDay(dateIso: string): string {
    return this.logs[dateIso]?.state || 'not_completed';
  }

  getDayStateClass(state?: string): string {
    switch (state) {
      case 'completed': return 'day-completed';
      case 'failed': return 'day-failed';
      case 'in_progress': return 'day-in-progress';
      default: return 'day-not-completed';
    }
  }

  async ngOnInit() {
  }
}