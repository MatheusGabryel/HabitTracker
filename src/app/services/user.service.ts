import { HabitData } from 'src/app/interfaces/habit.interface';
import { collectionData, docData, Firestore } from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { UserData } from '../interfaces/user.interface';
import { HabitList } from '../interfaces/habitlist.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private firestore = inject(Firestore)
  private auth = inject(Auth);
  private collectionRef = collection(this.firestore, 'users')
  private db = getFirestore();

  constructor() {
  }


  public async addHabit(uid: string, habit: any) {
    const userDocRef = doc(this.db, 'users', uid);
    const habitsCollectionRef = collection(userDocRef, 'habits');
    const docRef = await addDoc(habitsCollectionRef, habit);
    await updateDoc(docRef, { id: docRef.id });

    return docRef;
  }

  public async addList(uid: string, habitlist: any) {
    const userDocRef = doc(this.db, 'users', uid);
    const listCollectionRef = collection(userDocRef, 'list')
    const docRef = await addDoc(listCollectionRef, habitlist)

    return docRef;
  }

  async deleteHabit(uid: string, habitId: string): Promise<void> {
    const habitRef = doc(this.firestore, `users/${uid}/habits/${habitId}`);
    await deleteDoc(habitRef);
  }

  public getHabit(id: any) {
    const docRef = doc(this.collectionRef, id)
    return getDoc(docRef)
  }

  public getUserId(): Promise<string | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user?.uid ?? null);
      });
    });
  }

  public async getUserHabits(uid: string) {
    const habitsRef = collection(this.firestore, `users/${uid}/habits`);
    const snapshot = await getDocs(habitsRef);

    if (!snapshot.empty) {
      const habits = snapshot.docs.map(doc => {
        const habitData = doc.data();
        return { id: doc.id, ...habitData }
      });
      return habits;
    } else {
      return [];
    }
  }

  public async getUserLists(uid: string) {
    const listRef = collection(this.firestore, `users/${uid}/list`);
    const snapshot = await getDocs(listRef);

    if (!snapshot.empty) {
      const lists = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
      return lists;
    } else {
      return [];
    }
  }


  public async getUserDoc(uid: string): Promise<UserData | null> {
    const docRef = doc(this.collectionRef, uid);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() as UserData : null;
  }

  async updateHabitState(habitId: string, newState: 'in_progress' | 'completed' | 'not_completed', uid: string): Promise<void> {
    const habitRef = doc(this.firestore, `users/${uid}/habits/${habitId}`);
    await updateDoc(habitRef, { state: newState })
  }

  async updateHabitProgress(habitId: string, data: { state: 'in_progress' | 'completed' | 'not_completed', progressValue: number }, uid: string): Promise<void> {
    const habitRef = doc(this.firestore, `users/${uid}/habits/${habitId}`);
    await updateDoc(habitRef, {
      state: data.state,
      progressValue: data.progressValue
    });
  }

async updateUserList(uid: string, list: HabitList) {
  if (!list.id) throw new Error('ID da lista não encontrado');
  const listRef = doc(this.firestore, `users/${uid}/list/${list.id}`);
  await setDoc(listRef, list, { merge: true });
}

  async getHabitsByCategories(uid: string, categories: string[]): Promise<HabitData[]> {
    const habitsRef = collection(this.firestore, `users/${uid}/habits`);
    if (!categories || categories.length === 0) return [];
    const q = query(habitsRef, where('category', 'in', categories));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<HabitData, 'id'>;
      return {
        id: doc.id,
        ...data
      };
    });
  }
}

