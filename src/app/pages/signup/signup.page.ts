import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, logoGoogle } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule, RouterLink]
})
export class SignupPage implements OnInit {
  email = '';
  name = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ arrowBackOutline, logoGoogle });
  }

  async onRegister() {
    if (!this.email || !this.password || !this.name) {
          Swal.fire({
          title: 'Erro',
          text: 'Preencha os campos corretamente.',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      return;
    }

    try {
      Loading.circle()
      const result = await this.authService.register(this.email, this.password, this.name);
      Swal.fire({
        title: 'Sucesso',
        text: 'Login adicionado com sucesso',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      Loading.remove()
      this.router.navigate(['/home'])
    } catch (error: any) {
      Loading.remove()
      if (error.code === 'auth/email-already-in-use') {
        Swal.fire({
          title: 'Erro',
          text: 'Este email já esta sendo usado',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
      if (error.code === 'auth/weak-password') {
        Swal.fire({
          title: 'Erro',
          text: 'A senha deve ter pelo menos 6 caracteres',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
      if (error.code === 'auth/invalid-email') {
        Swal.fire({
          title: 'Erro',
          text: 'Email inválido',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      } else {
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao tentar cadastrar, tente novamente',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
    }
  }

  ngOnInit() {
  }

}
