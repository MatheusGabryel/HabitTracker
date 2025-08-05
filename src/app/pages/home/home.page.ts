import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../../components/header/header.component";
import { DashboardDaySwiperComponent } from "src/app/components/dashboard-day-swiper/dashboard-day-swiper.component";
import { DailySummaryComponent } from "src/app/components/daily-summary/daily-summary.component";
import { DashboardGoalsComponent } from "src/app/components/dashboard-goals/dashboard-goals.component";
import { DashboardStatsComponent } from "src/app/components/dashboard-stats/dashboard-stats.component";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, MenuComponent, CommonModule, HeaderComponent, DashboardDaySwiperComponent, DailySummaryComponent, DashboardGoalsComponent, DashboardStatsComponent],
})
export class HomePage {

  private authService = inject(AuthService)

  constructor() {
  }
  ngOnInit() {
  }
}