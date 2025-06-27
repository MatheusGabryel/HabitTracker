import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from 'src/app/interfaces/category.interface';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';

@Component({
  selector: 'app-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrls: ['./goal-card.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class GoalCardComponent implements OnInit {
  @Input() goal: any;

  constructor() { }

  ngOnInit() { }

  get category(): Category | undefined {
    return this.goal
      ? PREDEFINED_CATEGORIES.find(cat => cat.id === this.goal.category)
      : undefined;
  }

  get rgbaCatColor(): string | undefined {
  const color = this.category?.color;
  if (!color) return undefined;

  // Transforma: rgb(255, 0, 0) → rgba(255, 0, 0, 0.)
  return color.replace('rgb', 'rgba').replace(')', ', 0.7)');
}
}
