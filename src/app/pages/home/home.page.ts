import { MenuComponent } from '../../shared/components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { DashboardDaySwiperComponent } from "src/app/pages/home/components/dashboard-day-swiper/dashboard-day-swiper.component";
import { DailySummaryComponent } from "src/app/pages/home/components/daily-summary/daily-summary.component";
import { DashboardGoalsComponent } from "src/app/pages/home/components/dashboard-goals/dashboard-goals.component";
import { DashboardStatsComponent } from "src/app/pages/home/components/dashboard-stats/dashboard-stats.component";
import { GoalService } from 'src/app/services/goal/goal.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { GoalData } from 'src/app/interfaces/goal.interface';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, MenuComponent, CommonModule, HeaderComponent, DashboardDaySwiperComponent, DailySummaryComponent, DashboardGoalsComponent, DashboardStatsComponent],
})
export class HomePage {

  private authService = inject(AuthService)
  private goalService = inject(GoalService)
  private habitService = inject(HabitService)

  habits: HabitData[] = []
  goals: GoalData[] = []
  loading = false

  async ngOnInit() {
    this.loading = true
    this.habits = await this.habitService.getHabitsWithLogs();
    this.goals = await this.goalService.getUserGoals()
    this.loading = false
  }

async updateInfo() {
  const newHabits = await this.habitService.getHabitsWithLogs();
  const newGoals = await this.goalService.getUserGoals();
  this.habits = [...newHabits];
  this.goals = [...newGoals]
}
}