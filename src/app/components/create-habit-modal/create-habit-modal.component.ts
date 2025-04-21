import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-create-habit-modal',
  templateUrl: './create-habit-modal.component.html',
  styleUrls: ['./create-habit-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})

export class CreateHabitModalComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  formaProgresso: string = 'sim_nao'; // valor padrão

  habit = {
    nome: '',
    categoria: '',
    duracao: '',
    horaInicio: '',
    horaFim: '',
    vezesPorDia: 1,
    dias: [] as string[],
    descricao: '',
    prioridade: '',
  };

  diasDaSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  toggleDia(dia: string) {
    const index = this.habit.dias.indexOf(dia);
    if (index >= 0) {
      this.habit.dias.splice(index, 1);
    } else {
      this.habit.dias.push(dia);
    }
  }

  criarHabito() {
    console.log('Hábito criado:', this.habit);
    // lógica de envio pro backend ou storage local
  }
}
