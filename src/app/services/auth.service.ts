import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User, updateProfile, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.next(user);
    });
  }

  async register(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(result.user, {
      displayName: name
    });

    // await this.saveUserData({
    //   uid: result.user.uid,
    //   email: result.user.email,
    //   displayName: name,
    //   photoURL: ''
    // });

    return result;
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  getUser() {
    return this.currentUser.asObservable();
  }

  async logout() {
    return this.auth.signOut();
  }

  // saveUserData(user: any): Promise<void> {
  //   const userRef = doc(this.firestore, 'users', user.uid);
  //   const userData = {
  //     uid: user.uid,
  //     email: user.email,
  //     displayName: user.displayName || '',
  //     photoURL: user.photoURL || '',
  //     createdAt: new Date()
  //   };
  //   return setDoc(userRef, userData, { merge: true });
  // }
  
}
