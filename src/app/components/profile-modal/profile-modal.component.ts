import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProfileModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  public user = {
    name: 'Seu Nome',
    email: 'usuario@habittracker.com',
    country: 'Brasil',
    username: 'meuhabit',
    joined: '2 Jan, 2025',
  };

  closeModal() {
    this.closed.emit();
  }

  saveChanges() {
    console.log('Salvando alterações...', this.user);
    this.closeModal();
  }
}