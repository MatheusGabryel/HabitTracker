// login-success.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'firebase/auth';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html',
  styleUrls: ['./login-success.component.html'],
  imports: [IonIcon, CommonModule, RouterLink],
  
})
export class LoginSuccessComponent {
  user: User | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.getUser().subscribe(user => this.user = user);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
