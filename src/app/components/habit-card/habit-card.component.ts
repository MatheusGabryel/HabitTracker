import { Loading } from 'notiflix';
import { UserService } from './../../services/user.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { UserData } from 'src/app/interfaces/user.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-habit-card',
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.scss'],
})
export class HabitCardComponent implements OnInit {
  @Input() habit: any;
  public userService = inject(UserService);

  public habits: any[] = [];

  constructor() { }

  ngOnInit() {
    this.getHabits()
  }

  public async getHabits() {
    // Loading.circle()
    try {
      const uid = await this.userService.getUserId();
      if (!uid) throw new Error('Usuário não autenticado');
  
      this.habits = await this.userService.getUserHabits(uid);
      
      // Loading.remove()
    } catch (err: any) {
      // Loading.remove();
      console.error(err);
      throw new Error(err.message)
    }
  }

  
}
