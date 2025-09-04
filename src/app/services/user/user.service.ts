import { Firestore } from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { UserData } from 'src/app/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private firestore = inject(Firestore)
  private auth = inject(Auth);

  private collectionRef = collection(this.firestore, 'users')

  public getUserId(): Promise<string | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user?.uid ?? null);
      });
    });
  }

  public async getUserDoc(uid: string): Promise<UserData | null> {
    const docRef = doc(this.collectionRef, uid);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as UserData : null;
  }
}

