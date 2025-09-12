import { HabitLog, HabitLogMap, StateHabitType } from 'src/app/interfaces/habit.interface';
import { Category } from '../../../../interfaces/category.interface';
import { UserService } from '../../../../services/user/user.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { register } from 'swiper/element/bundle';
import { HabitDaysComponent } from '../habit-days/habit-days.component';
import { HabitService } from 'src/app/services/habit/habit.service';
import { formatLocalDate, generateDays, parseLocalDate } from 'src/app/shared/utils/date.utils';
import { Timestamp } from 'firebase/firestore';
import { addDays, format, startOfWeek } from 'date-fns';
import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
import { GoalService } from 'src/app/services/goal/goal.service';
import Swal from 'sweetalert2';
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

  public habitService = inject(HabitService)
  public statisticsService = inject(StatisticsService)
  public userService = inject(UserService);
  public goalService = inject(GoalService)

  @Input() habit!: HabitData;
  @Output() delete = new EventEmitter<string>();
  @Output() open = new EventEmitter<HabitData>();

  public logs: HabitLogMap = {};
  public createdAtUI!: Date;
  private dateRange: string[] = [];
  public days: {
    date: Date;
    iso: string;
    weekday: string;
    formattedDate: string;
    isHabitDay: boolean;
  }[] = [];

  public dates: {
    date: Date;
    iso: string;
    weekday: string;
    formattedDate: string;
    isHabitDay: boolean;
  }[] = [];

  public today = new Date().toISOString().split('T')[0];

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

  public unitsValue: { totalValue: number; weekValue: number; almostValue: number } = {
    totalValue: 0,
    weekValue: 0,
    almostValue: 0
  };

  public timeValue: { totalValue: number; weekValue: number; almostValue: number } = {
    totalValue: 0,
    weekValue: 0,
    almostValue: 0
  };

  public async ngOnInit() {
    this.habit.createdAt = normalizeFirestoreDate(this.habit.createdAt);
    this.habit.updatedAt = normalizeFirestoreDate(this.habit.updatedAt);
    this.createdAtUI = normalizeFirestoreDate(this.habit.createdAt)

    const todayDate = parseLocalDate(this.today)
    this.days = generateDays(new Date(), 6, this.habit.days);
    this.dates = generateDays(todayDate, 6, this.habit.days);
    this.dateRange = this.dates.map(d => d.iso);
    this.loadLogsAndStatistics()
  }

  public emitDelete(event: MouseEvent) {
    event.stopPropagation();
    this.delete.emit(this.habit.id);
  }

  public emitEdit(event: MouseEvent) {
    event.stopPropagation();
    this.open.emit(this.habit);
  }
  public toggleDetails(event: MouseEvent) {
    event.stopPropagation();
    this.showDetails = !this.showDetails;
  }

  async markHabit(event: MouseEvent) {
    event.stopPropagation();
    try {

      await this.habitService.completeHabit(this.habit, this.today)
      await this.goalService.checkGoalsForHabit(this.habit.id)
      this.loadLogsAndStatistics()
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({ title: 'Erro', text: 'Não foi possivel concluir a meta', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      } else {
        Swal.fire({ title: 'Erro', text: 'Ocorreu um erro desconhecido', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      }
    }
  }

  public updateHabitStatistics(habitWithLogs: HabitData, weekRange: string[]) {
    this.totalExecutionsInTheWeek = this.habit.days.length

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

  async reloadLogs() {
    this.loadLogsAndStatistics()
  }

  async loadLogsAndStatistics() {
    this.logs = await this.habitService.getLogsForDate(
      this.habit.id,
      this.dateRange,
      this.habit)

    const totalLogs = await this.habitService.getHabitLogs(this.habit)
    const habitWithLogs = {
      ...this.habit,
      logs: totalLogs
    };
    this.updateHabitStatistics(habitWithLogs, this.dateRange);
  }

  public getPieGradient() {
    const successDeg = this.percentSuccess * 3.6;
    const pendingDeg = this.percentPending * 3.6;
    const failedDeg = this.percentFailed * 3.6;

    return `conic-gradient(
    #4caf50 0deg ${successDeg}deg,
    #ff9800 ${successDeg}deg ${successDeg + pendingDeg}deg,
    #f44336 ${successDeg + pendingDeg}deg 360deg
  )`;
  }

  public getTodayState(): string {
    const todayIso = formatLocalDate(new Date());
    const todayLog = this.logs?.[todayIso];

    return todayLog?.state || 'in_progress';
  }

  get category(): Category | undefined {
    return this.habit
      ? PREDEFINED_CATEGORIES.find(cat => cat.id === this.habit.category)
      : undefined;
  }

  public formatTimeValue(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}