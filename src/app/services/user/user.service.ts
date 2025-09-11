import { Firestore } from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserData } from 'src/app/interfaces/user.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private firestore = inject(Firestore)
  private auth = inject(Auth);
  private router = inject(Router)

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

  public async updateUserData(data: Partial<UserData>) {
    const uid = await this.getUserId();
    if (!uid) return;
    const docRef = doc(this.collectionRef, uid)
    try {
      await updateDoc(docRef, data);
    } catch (error) {
      throw error;
    }
  }

  private async deleteSubcollectionDocs(colPath: string) {
    const colRef = collection(this.firestore, colPath);
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(colRef, docSnap.id))
    );

    await Promise.all(deletePromises);
  }


  public async deleteUser() {
    const uid = await this.getUserId();
    if (!uid) return;
    const habitsColPath = `users/${uid}/habits`;
    const habitsSnapshot = await getDocs(collection(this.firestore, habitsColPath));

    // Para cada hábito, cria uma promessa para deletar logs e o próprio doc
    const habitsDeletePromises = habitsSnapshot.docs.map(async habitDoc => {
      const habitId = habitDoc.id;

      // Deleta logs
      await this.deleteSubcollectionDocs(`users/${uid}/habits/${habitId}/habitsLogs`);

      // Deleta o hábito
      await deleteDoc(doc(this.firestore, habitsColPath, habitId));
    });

    await Promise.all(habitsDeletePromises);

    // Deleta outras subcoleções do usuário em paralelo
    await Promise.all([
      this.deleteSubcollectionDocs(`users/${uid}/goals`),
      this.deleteSubcollectionDocs(`users/${uid}/list`)
    ]);

    // Deleta documento principal e Auth
    const userDocRef = doc(this.firestore, 'users', uid);
    await deleteDoc(userDocRef);
    await this.auth.currentUser?.delete();

    this.router.navigate(['/home']);
  }



}

