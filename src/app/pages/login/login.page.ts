import { Component, inject } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { EyeToogleComponent } from "src/app/shared/ui/eye-toogle/eye-toogle.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule, RouterLink, EyeToogleComponent]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  public password: string = '';
  public email: string = '';

  public passwordFieldType: 'password' | 'text' = 'password';
  public isVisible: boolean = false;

  public async ionViewWillEnter() {
    this.email = '';
    this.password = '';
    this.passwordFieldType = 'password'
    this.isVisible = false;
  }
  
  public togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    this.isVisible = !this.isVisible;
  };

  public async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
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
      await this.authService.login(this.email, this.password);
      Swal.fire({
        title: 'Sucesso',
        text: 'Seja bem vindo de volta!',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      this.router.navigate(['/home']);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        Swal.fire({
          title: 'Error',
          text: 'Usuário ou senha incorretos.',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      } else if (error.code === 'auth/invalid-email') {
        Swal.fire({
          title: 'Error',
          text: 'Digite um e-mail válido.',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Erro ao fazer login.',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        })
      }
    } finally {
      Loading.remove()
    }
  };

  public async onGoogleRegister(): Promise<void> {
  try {
    Loading.circle();
    await this.authService.signInWithGoogle();
    Swal.fire({
      title: 'Sucesso',
      text: 'Login com Google realizado com sucesso!',
      icon: 'success',
      heightAuto: false,
      confirmButtonColor: '#E0004D'
    });
    this.router.navigate(['/home']);
  } catch (error: any) {
    Swal.fire({
      title: 'Erro',
      text: 'Não foi possível fazer login com Google.',
      icon: 'error',
      heightAuto: false,
      confirmButtonColor: '#E0004D'
    });
  } finally {
    Loading.remove();
  }
}
}

