import { UserService } from './../user/user.service';
import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { HabitData, HabitList, HabitLog, HabitLogMap } from 'src/app/interfaces/habit.interface';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  public userService = inject(UserService)
  private firestore = inject(Firestore)
  private db = getFirestore();
  public logs: { [habitId: string]: HabitLogMap } = {};

  constructor() { }

  async updateHabit(newHabit: HabitData, habitId: string) {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const habitRef = doc(this.firestore, `users/${uid}/habits/${habitId}`)
    try {
      await updateDoc(habitRef, newHabit as Partial<HabitData>);
    } catch (error) {
      alert(`Erro desconhecido: ${error}`);
    }
  }

  async updateHabitList(newList: HabitList, listId: string) {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const listRef = doc(this.firestore, `users/${uid}/list/${listId}`)
    try {
      await updateDoc(listRef, newList as Partial<HabitList>);
    } catch (error) {
      alert(`Erro desconhecido: ${error}`);
    }
  }



  async loadLogsForHabit(habitId: string, dates: string[] | string, habit: HabitData): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const dateList = Array.isArray(dates) ? dates : [dates]
    const logs: HabitLogMap = {};
    const habitRule = habit.timesTarget?.rule ?? habit.timeTarget?.rule;
    const target = habit.timesTarget?.value ?? habit.timeTarget?.value ?? 0;

    const logPromises = dateList.map(async date => {
      const logRef = doc(this.firestore, `users/${uid}/habits/${habitId}/habitsLogs/${date}`);
      const logSnap = await getDoc(logRef);
      return { date, log: logSnap.exists() ? (logSnap.data() as HabitLog) : null };
    });

    const results = await Promise.all(logPromises);
    for (const { date, log } of results) {
      logs[date] = log;
    }
    if (habitRule === 'at_most' || habitRule === 'at_least' || habitRule === 'equal') {
      const todayIso = new Date().toISOString().split('T')[0];

      for (const [date, log] of Object.entries(logs)) {
        const dateObj = new Date(date);
        const isPast = dateObj < new Date(todayIso);
        if (!isPast || !log || log.state !== 'in_progress') continue;

        const progress = log.progressValue ?? 0;

        let newState: 'completed' | 'failed' | 'in_progress' | 'not_completed' = 'in_progress';

        if (habitRule === 'at_most') {
          newState = progress > target ? 'failed' : 'completed';
        } else if (habitRule === 'at_least') {
          newState = progress >= target ? 'completed' : 'failed';
        } else if (habitRule === 'equal') {
          newState = progress === target ? 'completed' : 'failed';
        }

        if (log.state !== newState) {
          await this.logHabitCompletion(uid, habitId, date, newState, progress);
          logs[date]!.state = newState;
        }
      }
    }

    this.logs[habitId] = logs;
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

  public async getUserHabits() {
    const uid = await this.userService.getUserId()
    const habitsRef = collection(this.firestore, `users/${uid}/habits`);
    const snapshot = await getDocs(habitsRef)
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

  public async getHabitLogs(habit: HabitData) {
    const uid = await this.userService.getUserId()
    const logsRef = collection(this.firestore, `users/${uid}/habits/${habit.id}/habitsLogs`)
    const logsSnap = await getDocs(logsRef)
    const logs = logsSnap.docs.map(d => d.data())
    return logs
  }

  async getUserHabitsWithLogs(): Promise<any[]> {
    const uid = await this.userService.getUserId();
    const habitsRef = collection(this.firestore, `users/${uid}/habits`);
    const snapshot = await getDocs(habitsRef);


    if (snapshot.empty) return [];

    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HabitData[];
    const habitsWithLogs: any[] = await Promise.all(
      habits.map(async habit => {
        const logsRef = collection(this.firestore, `users/${uid}/habits/${habit.id}/habitsLogs`);
        const logsSnap = await getDocs(logsRef);
        const logs = logsSnap.docs.map(d => d.data()) as HabitLog[];
        return {
          ...habit,
          logs
        };
      })
    );

    return habitsWithLogs;
  }

  public async getHabitById(habitId: string) {
    const uid = await this.userService.getUserId();
     if(!uid) return
    const habitsRef = doc(this.firestore, `users/${uid}/habits/${habitId}`);
    const snapshot = await getDoc(habitsRef);
    if (snapshot.exists()) {
      return snapshot.data() as HabitData;
    } else {
      return null;
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error("Usuário não autenticado");
    const habitRef = doc(this.firestore, `users/${uid}/habits/${habitId}`);
    const logsRef = collection(this.firestore, `users/${uid}/habits/${habitId}/habitlogs`);
    const logsSnapshot = await getDocs(logsRef);
    const deletions = logsSnapshot.docs.map(logDoc => deleteDoc(logDoc.ref));
    await Promise.all(deletions);
    await deleteDoc(habitRef);
  }
  async addNewEditHabit(oldHabit: HabitData) {
    const uid = await this.userService.getUserId();
    if (!uid) return;

    console.log('oldHabit.id:', oldHabit.id);

    const userDocRef = doc(this.firestore, 'users', uid);
    const habitsCollectionRef = collection(userDocRef, 'habits');
    const oldHabitRef = doc(this.firestore, `users/${uid}/habits/${oldHabit.id}`);
    const oldLogsRef = collection(this.firestore, `users/${uid}/habits/${oldHabit.id}/habitsLogs`);

    const oldLogs = await getDocs(oldLogsRef);
    console.log('oldLogs.size:', oldLogs.size);
    console.log('oldLogs docs:', oldLogs.docs.map(d => d.data()));

    if (oldLogs.empty) {
      console.warn('Nenhum log encontrado para o hábito antigo');
    }

    const logs = oldLogs.docs.map(d => d.data());
    console.log(logs)

    const { id, ...habitDataToAdd } = oldHabit;

    const newHabit = await addDoc(habitsCollectionRef, habitDataToAdd);

    await updateDoc(newHabit, { id: newHabit.id, historicalLogs: logs });

    await deleteDoc(oldHabitRef);

    return newHabit;
  }




  public async addHabit(habit: HabitData) {
    const uid = await this.userService.getUserId()
    if (!uid) return;
    const userDocRef = doc(this.db, 'users', uid);
    const habitsCollectionRef = collection(userDocRef, 'habits');
    const docRef = await addDoc(habitsCollectionRef, habit);
    await updateDoc(docRef, { id: docRef.id });

    return docRef;
  }

  async completeHabitById(habitId: string, dateIso: string) {
    const habit = await this.getHabitById(habitId);
    if (!habit) throw new Error('Hábito não encontrado');

    await this.completeHabit(habit, dateIso);
  }


  async presentTimesInputAlert(habit: HabitData): Promise<number | null> {
    const maxAllowed = habit.timesTarget!.value * 1000;
    const maxLimit = maxAllowed < 100000 ? maxAllowed : 100000;

    const { value: inputValue } = await Swal.fire({
      title: 'Registrar progresso',
      heightAuto: false,
      text: `Quantas vezes você realizou o hábito "${habit.name}"?`,
      input: 'number',
      inputAttributes: {
        min: '0',
        max: maxAllowed < 100000 ? String(maxAllowed) : '100000',
        placeholder: 'Ex: 3',
      },
      inputValidator: (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 0 || num > maxLimit) {
          return `Insira um valor válido entre 0 e ${maxLimit}.`;
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const input = document.querySelector('.swal2-input');
        if (input) input.classList.add('swal2-input-wide');
      }
    });


    if (inputValue === undefined) return null;
    return Number(inputValue);
  }


  async presentTimeInputAlert(habit: HabitData): Promise<number | null> {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar progresso',
      heightAuto: false,
      html: `
        <input type="number" id="swal-hours" class="swal2-input" placeholder="Horas" min="0" />
        <input type="number" id="swal-minutes" class="swal2-input" placeholder="Min" min="0" max="59" />
        <input type="number" id="swal-seconds" class="swal2-input" placeholder="Seg" min="0" max="59" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const hours = Number((document.getElementById('swal-hours') as HTMLInputElement).value) || 0;
        const minutes = Number((document.getElementById('swal-minutes') as HTMLInputElement).value) || 0;
        const seconds = Number((document.getElementById('swal-seconds') as HTMLInputElement).value) || 0;

        if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
          Swal.showValidationMessage('Insira valores válidos para horas, minutos (0-59) e segundos (0-59).');
          return null;
        }
        return { hours, minutes, seconds };
      }
    });

    if (!formValues) return null;

    const totalSeconds = formValues.hours * 3600 + formValues.minutes * 60 + formValues.seconds;
    if (totalSeconds < 0) return null;

    return totalSeconds;
  }




  private getNextStateYesNo(currentLogState?: string): string {
    const states = ['in_progress', 'completed', 'failed'];
    const currentState = currentLogState || 'in_progress';
    const nextIndex = (states.indexOf(currentState) + 1) % states.length;
    return states[nextIndex];
  }
  private calcNewStateTimes(habit: HabitData, inputValue: number) {
    const rule = habit.timesTarget?.rule;
    const target = habit.timesTarget?.value ?? 0;
    const progressValue = inputValue;

    let state = 'in_progress';

    switch (rule) {
      case 'equal':
        state = progressValue === target ? 'completed' : 'in_progress';
        break;
      case 'at_least':
        state = progressValue >= target ? 'completed' : 'in_progress';
        break;
      case 'at_most':
        state = progressValue > target ? 'failed' : 'in_progress';
        break;
      case 'any':
        state = 'completed';
        break;
    }

    return { state, progressValue };
  }

  private calcNewStateTime(habit: HabitData, inputValue: number) {
    const rule = habit.timeTarget?.rule;
    const targetSeconds = habit.timeTarget?.value ?? 0;


    const progressValue = inputValue;

    let state = 'in_progress';

    switch (rule) {
      case 'equal':
        state = progressValue === targetSeconds ? 'completed' : 'in_progress';
        break;
      case 'at_least':
        state = progressValue >= targetSeconds ? 'completed' : 'in_progress';
        break;
      case 'at_most':
        state = progressValue > targetSeconds ? 'failed' : 'in_progress';
        break;
      case 'any':
        state = 'completed';
        break;
    }

    return { state, progressValue };
  }

  async getHabitLogsForDates(
    uid: string,
    habitId: string,
    dates: string[]
  ): Promise<{ [date: string]: HabitLog }> {
    const logIds = dates.map(date => `${date}`);

    const promises = logIds.map(logId =>
      getDoc(doc(this.firestore, `users/${uid}/habits/${habitId}/habitsLogs/${logId}`))
    );

    const snapshots = await Promise.all(promises);

    const result: { [date: string]: HabitLog } = {};

    for (const snap of snapshots) {
      if (snap.exists()) {
        const data = snap.data() as HabitLog;
        result[data.date] = data;
      }
    }

    return result;
  }

  async getHabitLog(habitId: HabitData, date: string): Promise<HabitLog | null> {
    const uid = await this.userService.getUserId();
    const logRef = doc(this.firestore, `users/${uid}/habits/${habitId.id}/habitsLogs/${date}`);
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      return logSnap.data() as HabitLog;
    } else {
      return null;
    }
  }


  async completeHabit(habit: HabitData, dateIso: string) {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const habitLog: HabitLog | null = await this.getHabitLog(habit, dateIso);
    const currentState = habitLog?.state

    let state: any;
    let progressValue: number | undefined;

    switch (habit.progressType) {
      case 'yes_no':
        console.log(currentState)
        state = this.getNextStateYesNo(currentState);
        break;

      case 'times': {
        const inputValue = await this.presentTimesInputAlert(habit);
        if (inputValue == null) return;

        const result = this.calcNewStateTimes(habit, inputValue);
        state = result.state;
        progressValue = result.progressValue;
        break;
      }

      case 'time': {
        const inputValue = await this.presentTimeInputAlert(habit);
        if (inputValue == null) return;

        const result = this.calcNewStateTime(habit, inputValue);
        state = result.state;
        progressValue = result.progressValue;
        break;
      }
    }

    console.log('Novo estado:', state);

    const logDate = dateIso || new Date().toISOString().split('T')[0];

    await this.logHabitCompletion(uid, habit.id, logDate, state, progressValue);
  }


  async logHabitCompletion(
    uid: string,
    habitId: string,
    date: string,
    state: string,
    progressValue: number | undefined

  ): Promise<void> {
    const logId = `${date}`;
    const logRef = doc(this.firestore, `users/${uid}/habits/${habitId}/habitsLogs/${logId}`);

    await setDoc(logRef, {
      habitId,
      date,
      state,
      ...(progressValue !== undefined ? { progressValue } : {}),
      updateAt: serverTimestamp()
    }, { merge: true })
  }

  public async addHabitList(uid: string, habitlist: HabitList) {
    const userDocRef = doc(this.db, 'users', uid);
    const listCollectionRef = collection(userDocRef, 'list')
    const docRef = await addDoc(listCollectionRef, habitlist)
    await updateDoc(docRef, { id: docRef.id });

    return docRef;
  }

  public async getHabitLists(uid: string): Promise<HabitList[]> {
    const listRef = collection(this.firestore, `users/${uid}/list`);
    const snapshot = await getDocs(listRef);

    if (!snapshot.empty) {
      const lists: HabitList[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data } as HabitList;
      });
      return lists
    } else {
      return [];
    }
  }
  public async updateListVisibility(uid: string, listId: string, isVisible: boolean) {
    const listDocRef = doc(this.firestore, `users/${uid}/list/${listId}`);
    await updateDoc(listDocRef, { isVisible: isVisible });
  }

  public async deleteHabitList(habitListId: string): Promise<void> {
    const uid = await this.userService.getUserId()
    const listRef = doc(this.firestore, `users/${uid}/list/${habitListId}`);
    await deleteDoc(listRef);
  }
}