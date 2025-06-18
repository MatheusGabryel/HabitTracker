import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

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
      const userCredential = await this.authService.login(this.email, this.password);
      console.log('Login bem-sucedido!', userCredential);
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Erro completo:', error);
      console.log('Código do erro:', error.code);
      if (error.code === 'auth/user-not-found') {
        alert('Usuário não encontrado.');
      } else if (error.code === 'auth/wrong-password') {
        alert('Senha incorreta.');
      } else {
        alert('Erro ao fazer login.');
      }
    }
  }


  ngOnInit() {

  }

}

