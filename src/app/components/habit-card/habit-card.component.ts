import { HabitLog } from 'src/app/interfaces/habit.interface';
import { Category } from './../../interfaces/category.interface';
import { UserService } from './../../services/user/user.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { register } from 'swiper/element/bundle';
import { HabitDaysComponent } from '../habit-days/habit-days.component';
import { HabitService } from 'src/app/services/habit/habit.service';
import { generateDays } from 'src/app/shared/utils/date.utils';
register()

@Component({
  selector: 'app-habit-card',
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.scss'],
  imports: [CommonModule, FormsModule, HabitDaysComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.98)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
      })),
      state('expanded', style({
        height: '*',
        opacity: 1,
        overflow: 'visible',
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease')
      ]),
    ])
  ]

})
export class HabitCardComponent implements OnInit {
  @Input() habit: any;
  public habitService = inject(HabitService)
  @Output() delete = new EventEmitter<string>();
  @Output() mark = new EventEmitter<{ habit: HabitData, date: string }>();
  public logs: { [date: string]: HabitLog | null } = {};
  private dateRange: string[] = [];
  public days: {
    date: Date;
    iso: string;
    weekday: string;
    formattedDate: string;
    isHabitDay: boolean;
  }[] = [];
  public userService = inject(UserService);
  public showDetails: boolean = false;

  public emitDelete() {
    this.delete.emit(this.habit.id);
  }

  public toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  constructor() { }

  get category(): Category | undefined {
    return this.habit
      ? PREDEFINED_CATEGORIES.find(cat => cat.id === this.habit.category)
      : undefined;
  }

  public getTodayState(): string {
    const todayIso = new Date().toISOString().split('T')[0];
    const todayLog = this.logs?.[todayIso];

    return todayLog?.state || 'in_progress';
  }

  async markHabit() {
    await this.habitService.completeHabit(this.habit, new Date().toISOString().split('T')[0]);
    await this.habitService.loadLogsForHabit(this.habit.id, this.dateRange, this.habit).then(() => {
      this.logs = this.habitService.logs[this.habit.id] || {};
      console.log('novo log', this.logs)
    });

  }
  async ngOnInit() {
    const today = new Date();
    this.days = generateDays(today, 7, this.habit.days)
    this.dateRange = generateDays(today, 7, this.habit.days).map(d => d.iso);
    this.habitService.loadLogsForHabit(this.habit.id, this.dateRange, this.habit).then(() => {
      this.logs = this.habitService.logs[this.habit.id] || {};
    });
    console.log(this.logs)
  }

async reloadLogs() {
  await this.habitService.loadLogsForHabit(this.habit.id, this.dateRange, this.habit);
  this.logs = this.habitService.logs[this.habit.id] || {};
}

}