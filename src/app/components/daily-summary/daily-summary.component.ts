import { Component, OnInit } from '@angular/core';
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexLegend, NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.component.html',
  styleUrls: ['./daily-summary.component.scss'],
  imports: [NgApexchartsModule],
})
export class DailySummaryComponent implements OnInit {
  chartOptions: ChartOptions = {
    series: [4, 3],  
    chart: {
      width: 380,
      type: 'pie',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ],
    legend: {
      position: 'right',
      offsetY: 0,
      height: 230,
    },
  };

  public todayDate: string;
  ngOnInit() { }

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
