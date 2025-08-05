import { Firestore } from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { UserData } from 'src/app/interfaces/user.interface';
import { doc, setDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth)
  private firestore = inject(Firestore)
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user: User | null) => {
      this.currentUser.next(user);
    });
  }

  private saveUserData(user: UserData): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);
    return setDoc(userRef, user, { merge: true });
  }

  async register(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(result.user, {
      displayName: name
    });

    const userData: UserData = {
      uid: result.user.uid,
      email: result.user.email!,
      displayName: name,
      photoURL: '',
      createdAt: new Date(),
    };

    await this.saveUserData(userData);
    return result;
  }

  public async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  public async logout() {
    return this.auth.signOut();
  }

}
