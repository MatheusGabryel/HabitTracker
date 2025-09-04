import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { EyeToogleComponent } from "src/app/shared/ui/eye-toogle/eye-toogle.component";


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule, RouterLink, EyeToogleComponent]
})
export class SignupPage {

  private authService = inject(AuthService);
  private router = inject(Router);

  public name: string = '';
  public email: string = '';
  public password: string = '';

  public passwordFieldType: 'password' | 'text' = 'password';
  public isVisible: boolean = false;

  public togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.isVisible = !this.isVisible
  }
  
  public async onRegister(): Promise<void> {
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
      await this.authService.register(this.email, this.password, this.name);
      Swal.fire({
        title: 'Sucesso',
        text: 'Login adicionado com sucesso',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      this.router.navigate(['/home'])
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Swal.fire({
          title: 'Erro',
          text: 'Este email já esta sendo usado',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
      else if (error.code === 'auth/weak-password') {
        Swal.fire({
          title: 'Erro',
          text: 'A senha deve ter pelo menos 6 caracteres',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
      else if (error.code === 'auth/invalid-email') {
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
    } finally {
      Loading.remove()
    }
  }
}
