import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { arrowBackOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { EyeToogleComponent } from "src/app/shared/ui/eye-toogle/eye-toogle.component";
import { confirmPasswordReset, getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Loading } from 'notiflix';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonRow, IonGrid, IonCol, IonIcon, IonContent, CommonModule, FormsModule, RouterLink]
})
export class ResetPasswordPage implements OnInit {
  private route = inject(ActivatedRoute)

  public email: string = '';
  public password: string = '';
  public confirmPassword: string = '';

  public auth = getAuth();
  public oobCode: string | null = null;

  public passwordFieldType: 'password' | 'text' = 'password';
  public step: 'email' | 'reset' | 'done' = 'email';

  public actionCodeSettings = {
    url: 'http://localhost:4200/reset-password',
    handleCodeInApp: true
  };

  ngOnInit() {
    this.step = 'email';
    this.oobCode = null;
    this.email = '';
    this.password = '';
    this.confirmPassword = '';

    this.route.queryParams.subscribe(params => {
      if (params['oobCode']) {
        this.oobCode = params['oobCode'];
        this.step = 'reset';
      }
    });
  }

  public sendEmail() {
    if (this.email.trim() === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Por favor, digite seu e-mail.',
        icon: 'error',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      return
    }

    sendPasswordResetEmail(this.auth, this.email, this.actionCodeSettings)
      .then(() => {
        Swal.fire({
          title: 'Sucesso',
          text: 'Se esse e-mail estiver cadastrado, enviamos um link para redefinir sua senha!',
          icon: 'success',
          confirmButtonColor: '#00A86B',
          heightAuto: false
        });
      })
      .catch((err) => {
        Swal.fire({
          title: 'Erro',
          text: 'Ocorreu um problema ao enviar o e-mail. Tente novamente.',
          icon: 'error',
          confirmButtonColor: '#E0004D',
          heightAuto: false
        });
      });

  }

  public async resetPassword() {
    if (!this.oobCode) return;

    if (this.password !== this.confirmPassword) {
      Swal.fire({
        title: 'Erro',
        text: 'Confirmação de senha não corresponde à senha informada.',
        icon: 'error',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      return;
    }
    if (this.password.length < 8) {
      Swal.fire({
        title: 'Erro',
        text: 'A senha deve ter pelo menos 6 caracteres.',
        icon: 'error',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      return;
    }
    try {
      Loading.circle();
      await confirmPasswordReset(this.auth, this.oobCode, this.password);
      this.step = 'done';
      Loading.remove();
    } catch (error: any) {
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao redefinir senha! Tente novamente mais tarde.',
        icon: 'error',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      Loading.remove();
    }
  }

}
