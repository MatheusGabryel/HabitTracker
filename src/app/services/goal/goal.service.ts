import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection, doc, getDocs, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore';
import { GoalData } from 'src/app/interfaces/goal.interface';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  private firestore = inject(Firestore)
  private db = getFirestore();

  constructor() { }

  public async addGoal(uid: string, goal: GoalData) {
    const userDocRef = doc(this.db, 'users', uid);
    const habitsCollectionRef = collection(userDocRef, 'goals');
    const docRef = await addDoc(habitsCollectionRef, goal);
    await updateDoc(docRef, { id: docRef.id });

    return docRef;
  }

  public async updateGoalProgress(
    goalId: string,
    data: { state: 'in_progress' | 'completed' | 'not_completed', progressValue: number },
    uid: string
  ): Promise<void> {
    const goalRef = doc(this.firestore, `users/${uid}/goals/${goalId}`);
    await updateDoc(goalRef, {
      state: data.state,
      progressValue: data.progressValue,
      updatedAt: serverTimestamp()
    });
  }


  public async getUserGoals(uid: string) {
    const goalsRef = collection(this.firestore, `users/${uid}/goals`);
    const snapshot = await getDocs(goalsRef);

    if (!snapshot.empty) {
      const goals = snapshot.docs.map(doc => {
        const goalsData = doc.data();
        return { id: doc.id, ...goalsData }
      });
      return goals;
    } else {
      return [];
    }
  }
}
