import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
  constructor(private auth: Auth) {}
  
    async register(email: string, password: string) {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    }
  }
  