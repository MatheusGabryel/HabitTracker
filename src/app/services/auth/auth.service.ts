import { Firestore } from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, updateProfile, User, UserCredential } from 'firebase/auth';
import { UserData } from 'src/app/interfaces/user.interface';
import { doc, setDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
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

  public async register(email: string, password: string, name: string): Promise<UserCredential> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(result.user, {
      displayName: name
    });

    const userData: UserData = {
      uid: result.user.uid,
      email: result.user.email!,
      displayName: name,
      createdAt: new Date(),
      avatar: `https://avatar.iran.liara.run/username?username=${name.split(/\s+/).join('+')}`
    };

    await this.saveUserData(userData);
    return result;
  }

  public async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  public async logout() {
    return this.auth.signOut();
  }

}
