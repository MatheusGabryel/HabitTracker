import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-goal-modal',
  templateUrl: './create-goal-modal.component.html',
  styleUrls: ['./create-goal-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CreateGoalModalComponent {

  constructor() { }

  ngOnInit() { }

  @Output() fechar = new EventEmitter<void>();
  habitos = ['Caminhar', 'Estudar', 'Ler', 'Treinar'];
  tiposMarcacao = ['Unidade', 'Kg', 'Km', 'Minutos', 'Horas', 'Páginas', 'Repetições'];

  meta = {
    nome: '',
    vinculaHabito: false,
    habitoId: '',
    objetivo: '',
    tipoMarcacao: '',
    temDataFinal: false,
    dataFinal: ''
  };

  onFechar() {
    this.fechar.emit();
  }

  onSubmit() {
    console.log('Meta criada:', this.meta);
    this.onFechar();
  }
}