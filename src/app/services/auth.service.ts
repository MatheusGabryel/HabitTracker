import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User, updateProfile, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Firestore, doc, setDoc, getDoc, docData } from '@angular/fire/firestore';
import { UserData } from '../interfaces/user.interface';


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

    const userData: UserData = {
      uid: result.user.uid,
      email: result.user.email!,
      displayName: name,
      photoURL: '',
      createdAt: new Date(),
      bio: '',
      phoneNumber: '',
      birthday: '',
      gender: '',
      location: ''
    };

    await this.saveUserData(userData);
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
  saveUserData(user: UserData): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);
    return setDoc(userRef, user, { merge: true });
  }

  getUserDataFromFirestore$(uid: string): Observable<UserData> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return docData(userRef) as Observable<UserData>;
  }

}
