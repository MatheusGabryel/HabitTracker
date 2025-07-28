import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-goals',
  templateUrl: './dashboard-goals.component.html',
  styleUrls: ['./dashboard-goals.component.scss'],
  imports: [CommonModule],
})
export class DashboardGoalsComponent  implements OnInit {

    title!: string;
  progress!: number;
  current!: number;
  target!: number;
  unit?: string;
  isCompleted?: boolean;

  constructor() { }

  ngOnInit() {}

    goals: any[] = [
    {
      id: '1',
      title: 'Perder 10kg',
      current: 10,
      target: 10,
      unit: 'kg',
      isCompleted: true,
    },
    {
      id: '2',
      title: 'Ler 5 livros',
      current: 2,
      target: 5,
      unit: 'livros',
      isCompleted: false,
    },
    {
      id: '3',
      title: 'Economizar R$1000',
      current: 600,
      target: 1000,
      unit: 'R$',
      isCompleted: false,
    },
  ];



  calculateProgress(goal: any): number {
    const ratio = goal.current / goal.target;
    return Math.min(100, Math.round(ratio * 100));
  }
}
