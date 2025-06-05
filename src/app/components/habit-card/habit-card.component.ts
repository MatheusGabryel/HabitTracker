import { Category } from './../../interfaces/category.interface';
import { Loading } from 'notiflix';
import { UserService } from './../../services/user.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { UserData } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';

@Component({
  selector: 'app-habit-card',
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.scss'],
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]

})
export class HabitCardComponent implements OnInit {
  @Input() habit: any;
  @Output() delete = new EventEmitter<string>();
  @Output() mark = new EventEmitter<HabitData>();
  public userService = inject(UserService);

  emitDelete() {
    this.delete.emit(this.habit.id);
  }
  emitMarkHabit() {
    this.mark.emit(this.habit);
  }
  public habits: any[] = [];

  constructor() { }

  get category(): Category | undefined {
    return this.habit
      ? PREDEFINED_CATEGORIES.find(cat => cat.id === this.habit.category)
      : undefined;
  }

  ngOnInit() {
  }


}