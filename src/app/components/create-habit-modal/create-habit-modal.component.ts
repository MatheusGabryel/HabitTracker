import { UserService } from './../../services/user.service';
import { Component, OnInit, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitData } from 'src/app/interfaces/habit.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { AuthService } from 'src/app/services/auth.service';
import { of, switchMap, firstValueFrom } from 'rxjs';
import { UserData } from 'src/app/interfaces/user.interface';



@Component({
  selector: 'app-create-habit-modal',
  templateUrl: './create-habit-modal.component.html',
  styleUrls: ['./create-habit-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})

export class CreateHabitModalComponent implements OnInit {

  public userDataService = inject(AuthService);
  public userService = inject(UserService);
  @Output() close = new EventEmitter<void>();


  public habit: HabitData = {
    id: '',
    nome: '',
    categoria: '',
    duracao: '',
    horaInicio: '',
    horaFim: '',
    vezesPorDia: '',
    dias: [] as string[],
    descricao: '',
    prioridade: '',
  }

  constructor() { }

  ngOnInit() {

  }




  public closeModal() {
    this.close.emit();
  }

  public formaProgresso: string = 'sim_nao'; // valor padrão


  public diasDaSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  public toggleDia(dia: string) {
    if (this.habit.dias.includes(dia)) {
      this.habit.dias = this.habit.dias.filter(d => d !== dia); // Mais eficiente
    } else {
      this.habit.dias.push(dia);
    }
  }


  public async createHabit() {
    try {
      Loading.standard('Adicionando hábito...');
      const uid = await this.userService.getUserId();
      if (!uid) {
        Swal.fire({
          title: 'Erro',
          text: 'Usuário não autenticado',
          icon: 'error',
          confirmButtonColor: '#E0004D'
        });
        throw new Error('Usuário não autenticado');
      }

      await this.userService.addHabit(uid, this.habit);
  
      Swal.fire({
        title: 'Sucesso',
        text: 'Hábito adicionado com sucesso',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      Loading.remove()
      this.closeModal();
    } catch (err: unknown) {
      Loading.remove()
      if (err instanceof Error) {
        console.error(err);
        Swal.fire({
          title: 'Erro',
          text: err.message,
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      } else {
        console.error('Erro desconhecido', err);
        Swal.fire({
          title: 'Erro',
          text: 'Ocorreu um erro desconhecido',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
    }
  }


}


