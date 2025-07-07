import { HabitLog } from 'src/app/interfaces/habitlog.interface';
import { Category } from './../../interfaces/category.interface';
import { Loading } from 'notiflix';
import { UserService } from './../../services/user.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { UserData } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { register } from 'swiper/element/bundle';
import { HabitDaysComponent } from '../habit-days/habit-days.component';
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
  @Output() delete = new EventEmitter<string>();
  @Output() mark = new EventEmitter<{ habit: HabitData, date: string }>();
  @Output() daySelected = new EventEmitter<string>();
  @Output() logsUpdated = new EventEmitter<{ [date: string]: HabitLog }>();
  @Input() logs: { [date: string]: HabitLog } = {};

  public userService = inject(UserService);
  today = new Date();

  emitDelete() {
    this.delete.emit(this.habit.id);
  }
  emitMarkHabit() {
    this.mark.emit({ habit: this.habit, date: new Date().toISOString().split('T')[0] });
  }

  public showDetails: boolean = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  constructor() { }

  get category(): Category | undefined {
    return this.habit
      ? PREDEFINED_CATEGORIES.find(cat => cat.id === this.habit.category)
      : undefined;
  }

  getTodayState(): string {
    const todayIso = new Date().toISOString().split('T')[0];
    const todayLog = this.logs?.[todayIso];
    return todayLog?.state || 'in_progress';
  }

  onLogsUpdated(newLogs: { [date: string]: HabitLog }) {
    this.logsUpdated.emit(newLogs);
  }


  ngOnInit() {
  }

  onDaySelected(dateIso: string) {
    this.mark.emit({ habit: this.habit, date: dateIso });
  }

}