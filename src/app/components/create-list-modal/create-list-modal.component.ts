import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Loading } from 'notiflix';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-list-modal',
  templateUrl: './create-list-modal.component.html',
  styleUrls: ['./create-list-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CreateListModalComponent implements OnInit {
  public userService = inject(UserService);
  constructor() { }
  public uid = this.userService.getUserId();

  public list: any = {
    userId: this.uid,
    name: '',
    createdAt: new Date(),
    updatedAt: '',
    habitIds: [],
  }

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
  ngOnInit() { }

  public async createList() {
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

      this.list.userId = uid;


      await this.userService.addList(uid, this.list);

      Swal.fire({
        title: 'Sucesso',
        text: 'Lista adicionado com sucesso',
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
