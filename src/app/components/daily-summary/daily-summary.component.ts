import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.component.html',
  styleUrls: ['./daily-summary.component.scss'],
})
export class DailySummaryComponent  implements OnInit {

  public todayDate: string;
  ngOnInit() {}

    constructor() {
    const now = new Date();
    const weekDay = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dayMonth = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    this.todayDate = `Hoje - ${this.capitalizeFirst(weekDay)}, ${dayMonth}`;
  }

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
