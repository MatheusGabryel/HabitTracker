import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule, RouterLink]
})
export class LoginPage implements OnInit {
  passwordFieldType: string = 'password';
  password: string = '';
  email = '';

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ eyeOffOutline, eyeOutline })
  }

  async onLogin() {
    try {
      Loading.circle()

      const userCredential = await this.authService.login(this.email, this.password);
      Swal.fire({
        title: 'Sucesso',
        text: 'Seja bem vindo de volta!',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      Loading.remove()
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Erro completo:', error);
      console.log('Código do erro:', error.code);
      if (error.code === 'auth/user-not-found') {
        Swal.fire({
          title: 'Error',
          text: 'Usuário não encontrado.',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
        Loading.remove()
      } else if (error.code === 'auth/wrong-password') {
        Swal.fire({
          title: 'Error',
          text: 'Senha incorreta.',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
        Loading.remove()
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Erro ao fazer login.',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
        Loading.remove()
      }
    }
  }


  ngOnInit() {

  }

}

