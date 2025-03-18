import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  
  passwordFieldType: string = 'password';
  password: string = '';

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  constructor() { 
    addIcons({ eyeOffOutline, eyeOutline})
  }

  ngOnInit() {
    
  }

}
