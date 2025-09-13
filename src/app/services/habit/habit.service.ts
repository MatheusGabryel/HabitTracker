import { UserService } from './../user/user.service';
import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { from, map, of, switchMap } from 'rxjs';
import { HabitData, HabitList, HabitLog, HabitLogMap, HabitWithLogs } from 'src/app/interfaces/habit.interface';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  public userService = inject(UserService)
  private firestore = inject(Firestore)
  private db = getFirestore();

  // ====================
  // ADD HABITS / LISTS / LOGS
  // ====================

  public async addHabit(habit: HabitData): Promise<void> {
    const uid = await this.userService.getUserId()
    if (!uid) return;
    const userDocRef = doc(this.db, 'users', uid);
    const habitsCollectionRef = collection(userDocRef, 'habits');
    const docRef = await addDoc(habitsCollectionRef, habit);
    await updateDoc(docRef, { id: docRef.id });
  }

  public async addNewEditHabit(oldHabit: HabitData): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) return;


    const userDocRef = doc(this.firestore, 'users', uid);
    const habitsCollectionRef = collection(userDocRef, 'habits');
    const oldLogsRef = collection(this.firestore, `users/${uid}/habits/${oldHabit.id}/habitsLogs`);

    const snaplogs = await getDocs(oldLogsRef);

    const oldLogs = snaplogs.docs.map(d => d.data());
    const { id, ...habitDataToAdd } = oldHabit;

    const newHabit = await addDoc(habitsCollectionRef, habitDataToAdd);

    await updateDoc(newHabit, { id: newHabit.id, historicalLogs: oldLogs});

    await this.deleteHabit(oldHabit.id);
  }

  public async addHabitList(habitlist: HabitList): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const userDocRef = doc(this.db, 'users', uid);
    const listCollectionRef = collection(userDocRef, 'list')
    const docRef = await addDoc(listCollectionRef, habitlist)
    await updateDoc(docRef, { id: docRef.id });
  }

  public async addHabitLog(
    habitId: string,
    date: string,
    state: string,
    progressValue: number | undefined

  ): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) return;
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

  // ====================
  // UPDATE HABITS / LISTS / LOGS
  // ====================

  public async updateHabit(newHabit: HabitData, habitId: string): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const habitRef = doc(this.firestore, `users/${uid}/habits/${habitId}`)
    try {
      await updateDoc(habitRef, newHabit as Partial<HabitData>);
    } catch (error) {
      throw error;
    }
  }

  public async updateHabitList(newList: HabitList, listId: string): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const listRef = doc(this.firestore, `users/${uid}/list/${listId}`)
    try {
      await updateDoc(listRef, newList as Partial<HabitList>);
    } catch (error) {
      throw error
    }
  }

  public async updateListVisibility(uid: string, listId: string, isVisible: boolean): Promise<void> {
    const listDocRef = doc(this.firestore, `users/${uid}/list/${listId}`);
    await updateDoc(listDocRef, { isVisible: isVisible });
  }

  public updateLogState(log: HabitLog, habit: HabitData): HabitLog {
    if (!log) return log;

    const habitRule = habit.timesTarget?.rule ?? habit.timeTarget?.rule;
    const target = habit.timesTarget?.value ?? habit.timeTarget?.value ?? 0;

    if (!habitRule || log.state !== 'in_progress') return log;

    const progress = log.progressValue ?? 0;
    let newState: HabitLog['state'] = 'in_progress';

    switch (habitRule) {
      case 'at_most':
        newState = progress <= target ? 'completed' : 'failed';
        break;
      case 'at_least':
        newState = progress >= target ? 'completed' : 'failed';
        break;
      case 'equal':
        newState = progress === target ? 'completed' : 'failed';
        break;
    }

    return { ...log, state: newState };
  }

  // ====================
  // DELETE HABITS / LISTS
  // ====================

  public async deleteHabit(habitId: string): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error("Usuário não autenticado");
    const habitRef = doc(this.firestore, `users/${uid}/habits/${habitId}`);
    const logsRef = collection(this.firestore, `users/${uid}/habits/${habitId}/habitsLogs`);
    const logsSnapshot = await getDocs(logsRef);
    try {
      const deletions = logsSnapshot.docs.map(logDoc => deleteDoc(logDoc.ref));
      await Promise.all(deletions.map(p => p.catch(e => console.error(e))));
      await deleteDoc(habitRef);
    } catch(error) {
      throw error
    }
  }

  public async deleteHabitList(habitListId: string): Promise<void> {
    const uid = await this.userService.getUserId()
    const listRef = doc(this.firestore, `users/${uid}/list/${habitListId}`);
    await deleteDoc(listRef);
  }

  // ====================
  // GET HABITS / LISTS / LOGS
  // ====================

  public async getUserHabits(): Promise<HabitData[]> {
    const uid = await this.userService.getUserId()
    const habitsRef = collection(this.firestore, `users/${uid}/habits`);
    const snapshot = await getDocs(habitsRef)
    if (!snapshot.empty) {
      const habits = snapshot.docs.map(doc => {
        return { id: doc.id, ...(doc.data() as Omit<HabitData, "id">) }
      });
      return habits as HabitData[];
    } else {
      return [];
    }
  }

  public async getHabitById(habitId: string): Promise<HabitData | null> {
    const uid = await this.userService.getUserId();
    if (!uid) return null
    const habitsRef = doc(this.firestore, `users/${uid}/habits/${habitId}`);
    const snapshot = await getDoc(habitsRef);
    if (snapshot.exists()) {
      return snapshot.data() as HabitData;
    } else {
      return null;
    }
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

  public async getHabitsWithLogs(): Promise<HabitData[]> {
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

  public async getHabitLogs(habit: HabitData): Promise<HabitLog[]> {
    const uid = await this.userService.getUserId()
    const logsRef = collection(this.firestore, `users/${uid}/habits/${habit.id}/habitsLogs`)
    const logsSnap = await getDocs(logsRef)
    const logs = logsSnap.docs.map(d => d.data() as HabitLog)
    return logs
  }

  public async getHabitLog(habit: HabitData, date: string): Promise<HabitLog | null> {
    const uid = await this.userService.getUserId();
    const logRef = doc(this.firestore, `users/${uid}/habits/${habit.id}/habitsLogs/${date}`);
    const logSnap = await getDoc(logRef);
    if (logSnap.exists()) {
      return logSnap.data() as HabitLog;
    } else {
      return null;
    }
  }

  public async getLogsForDate(habitId: string, dates: string[] | string, habit: HabitData): Promise<HabitLogMap> {
    const uid = await this.userService.getUserId();
    if (!uid) return {} as HabitLogMap;

    const dateList = Array.isArray(dates) ? dates : [dates];
    const today = new Date().toISOString().split('T')[0];

    const logsRef = collection(this.firestore, `users/${uid}/habits/${habitId}/habitsLogs`);
    const q = query(
      logsRef,
      where("date", ">=", dateList[0]),
      where("date", "<=", dateList[dateList.length - 1])
    );
    const logsSnap = await getDocs(q);

    const result = logsSnap.docs.map(l => ({ ...(l.data() as HabitLog) }));
    const resultMap: { [date: string]: HabitLog } = {};
    result.forEach(r => resultMap[r.date] = r as HabitLog);
    const logs: HabitLogMap = dateList.reduce((acc, date) => {
      acc[date] = resultMap[date] ?? null;
      return acc;
    }, {} as HabitLogMap);

    for (const date of dateList) {
      const log = logs[date];
      if (!log) continue;

      const isPast = date < today;
      if (!isPast) continue;

      const updatedLog = this.updateLogState(log, habit);

      if (log.state !== updatedLog.state) {
        await this.addHabitLog(habitId, date, updatedLog.state, updatedLog.progressValue ?? 0);
      }

      logs[date] = updatedLog;
    }

    return logs;
  }

  public async getLogsWithHabit(): Promise<HabitWithLogs[]> {
    const uid = await this.userService.getUserId();
    const habitsRef = collection(this.firestore, `users/${uid}/habits`);
    const snapshot = await getDocs(habitsRef);

    if (snapshot.empty) return [];

    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HabitData[];
    const habitsLogs: any[] = await Promise.all(
      habits.map(async habit => {
        const logsRef = collection(this.firestore, `users/${uid}/habits/${habit.id}/habitsLogs`);
        const logsSnap = await getDocs(logsRef);
        const logs = logsSnap.docs.map(d => {
          const log = d.data() as HabitLog;
          return log;
        });

        const id = habit.id
        return {
          id,
          logs
        };
      })
    );

    return habitsLogs;
  }

  // ====================
  // COMPLETE HABIT (YES_NO / TIMES / TIME)
  // ====================

  public async completeHabit(habit: HabitData, dateIso: string) {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const habitLog: HabitLog | null = await this.getHabitLog(habit, dateIso);
    const currentState = habitLog?.state

    let state: any;
    let progressValue: number | undefined;

    switch (habit.progressType) {
      case 'yes_no':
        state = this.getNextStateYesNo(currentState);
        break;

      case 'times': {
        const inputValue = await this.presentTimesInputAlert(habit);
        if (inputValue == null) return currentState;

        const result = this.calcNewStateTimes(habit, inputValue);
        state = result.state;
        progressValue = result.progressValue;
        break;
      }

      case 'time': {
        const inputValue = await this.presentTimeInputAlert();
        if (inputValue == null) return currentState;

        const result = this.calcNewStateTime(habit, inputValue);
        state = result.state;
        progressValue = result.progressValue;
        break;
      }
    }

    const logDate = dateIso || new Date().toISOString().split('T')[0];

    await this.addHabitLog(habit.id, logDate, state, progressValue);

    return state
  }

  public async completeHabitById(habitId: string, dateIso: string) {
    const habit = await this.getHabitById(habitId);
    if (!habit) throw new Error('Hábito não encontrado');

    const state = await this.completeHabit(habit, dateIso);
    return state
  }

  private async presentTimesInputAlert(habit: HabitData): Promise<number | null> {
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
      inputValidator: (value: any) => {
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

  private async presentTimeInputAlert(): Promise<number | null> {
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
}