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
import { Timestamp } from 'firebase/firestore';
import { addDays, format, startOfWeek } from 'date-fns';
import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
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
  public statisticsService = inject(StatisticsService)
  public userService = inject(UserService);
  @Output() delete = new EventEmitter<string>();
  @Output() mark = new EventEmitter<{ habit: HabitData, date: string }>();
  @Output() open = new EventEmitter<HabitData>();
  public logs: { [date: string]: HabitLog | null } = {};
  private dateRange: string[] = [];
  public days: {
    date: Date;
    iso: string;
    weekday: string;
    formattedDate: string;
    isHabitDay: boolean;
  }[] = [];

  public showDetails: boolean = false;

  public daysCompleted: number = 0;
  public totalExecutionsInTheWeek: number = 0;
  public weekCompletionRate: number = 0;

  public currentStreak: number = 0;
  public bestStreak: number = 0;

  public completionForWeek: number = 0;
  public completionForMonth: number = 0;
  public completionForYear: number = 0;
  public totalCompletion: number = 0;

  public totalCount: number = 0;
  public successCount: number = 0;
  public pendingCount: number = 0;
  public failCount: number = 0
  public percentSuccess: number = 0
  public percentPending: number = 0
  public percentFailed: number = 0

  public unitsValue: any = [];
  timeValue: any = []


  public emitDelete() {
    this.delete.emit(this.habit.id);
  }

  public emitEdit() {
    this.open.emit(this.habit);
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

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  public getTodayState(): string {
    const todayIso = new Date().toISOString().split('T')[0];
    const todayLog = this.logs?.[todayIso];

    return todayLog?.state || 'in_progress';
  }

  async markHabit() {
    await this.habitService.completeHabit(this.habit, new Date().toISOString().split('T')[0]);
    await this.habitService.loadLogsForHabit(
      this.habit.id,
      this.dateRange,
      this.habit
    );

    this.logs = this.habitService.logs[this.habit.id] || {};

        const totalLogs = await this.habitService.getHabitLogs(this.habit)

    const habitWithLogs = {
      ...this.habit,
      logs: totalLogs
    }
this.updateHabitStatistics(habitWithLogs, this.dateRange);
  }

  getPieGradient() {
  const successDeg = this.percentSuccess * 3.6;
  const pendingDeg = this.percentPending * 3.6;
  const failedDeg = this.percentFailed * 3.6;

  return `conic-gradient(
    #4caf50 0deg ${successDeg}deg,
    #ff9800 ${successDeg}deg ${successDeg + pendingDeg}deg,
    #f44336 ${successDeg + pendingDeg}deg 360deg
  )`;
  }

  updateHabitStatistics(habitWithLogs: HabitData, weekRange: string[]) {
  const habitStats = this.statisticsService.getIndivualHabitCompletionRate(habitWithLogs, weekRange);
  this.weekCompletionRate = habitStats.rate;
  this.daysCompleted = habitStats.completed;

  this.currentStreak = this.statisticsService.calculateHabitCurrentStreak(habitWithLogs);
  this.bestStreak = this.statisticsService.calculateHabitBestStreak(habitWithLogs);

  const habitCompletion = this.statisticsService.getHabitCompletion(habitWithLogs);
  this.completionForWeek = habitCompletion.week;
  this.completionForMonth = habitCompletion.month;
  this.completionForYear = habitCompletion.year;
  this.totalCompletion = habitCompletion.total;

  const perfomance = this.statisticsService.getPerfomanceHabit(habitWithLogs);
  this.totalCount = perfomance.total;
  this.successCount = perfomance.success;
  this.pendingCount = perfomance.pending;
  this.failCount = perfomance.failed;
  this.percentSuccess = perfomance.percentSuccess;
  this.percentPending = perfomance.percentPending;
  this.percentFailed = perfomance.percentFailed;

  const progress = this.statisticsService.getProgressValueHabit(habitWithLogs);
  this.unitsValue = progress;
  this.timeValue = progress;
}

  async ngOnInit() {
    const today = new Date();

    for (const h of [this.habit]) {
      h.createdAt = normalizeFirestoreDate(h.createdAt);
      h.updatedAt = normalizeFirestoreDate(h.updatedAt);
    }

    this.days = generateDays(today, 6, this.habit.days);
    this.dateRange = generateDays(today, 6, this.habit.days).map(d => d.iso);


    await this.habitService.loadLogsForHabit(
      this.habit.id,
      this.dateRange,
      this.habit
    );

    this.logs = this.habitService.logs[this.habit.id] || {};

    this.totalExecutionsInTheWeek = this.habit.days.length;
    const totalLogs = await this.habitService.getHabitLogs(this.habit)

    const habitWithLogs = {
      ...this.habit,
      logs: totalLogs
    }
this.updateHabitStatistics(habitWithLogs, this.dateRange);
  }


  async reloadLogs() {
    await this.habitService.loadLogsForHabit(
      this.habit.id,
      this.dateRange,
      this.habit
    );

    this.logs = this.habitService.logs[this.habit.id] || {};

    const totalLogs = await this.habitService.getHabitLogs(this.habit)

    const habitWithLogs = {
      ...this.habit,
      logs: totalLogs
    };
this.updateHabitStatistics(habitWithLogs, this.dateRange);
  }

  getCurrentWeekRange(): string[] {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'yyyy-MM-dd')
    );
  }
}