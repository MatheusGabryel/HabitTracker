import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, logoGoogle } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule, RouterLink]
})
export class SignupPage implements OnInit {
  email = '';
  password= '';

  constructor(private authService: AuthService) {
    addIcons({arrowBackOutline, logoGoogle});
   }

   async onRegister() {
    console.log('Tentando registrar com:', this.email, this.password);
    if (!this.email || !this.password) {
      alert('Preencha os campos corretamente.');
      return;
    }
    
    try {
      const result = await this.authService.register(this.email, this.password);
      console.log('Registro feito com sucesso!', result);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Este e-mail já está sendo usado.');
      } else if (error.code === 'auth/weak-password') {
        alert('A senha deve ter pelo menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        alert('E-mail inválido.');
      } else {
        alert('Erro ao registrar. Tente novamente.');
      }
    }
  }

  ngOnInit() {
  }

}
