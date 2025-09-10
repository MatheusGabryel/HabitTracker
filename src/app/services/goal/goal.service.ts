import { UserService } from 'src/app/services/user/user.service';
import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { addDoc, collection, deleteDoc, doc, DocumentData, FieldValue, getDocs, getFirestore, query, serverTimestamp, updateDoc, where, Query } from 'firebase/firestore';
import { GoalData, GoalType, StateGoalType } from 'src/app/interfaces/goal.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
import { BehaviorSubject, from, map, switchMap } from 'rxjs';
import { GoalFilters } from 'src/app/interfaces/goalFilters.interface';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  private firestore = inject(Firestore)
  private userService = inject(UserService)
  private db = getFirestore();

  public async addGoal(goal: GoalData) {
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error("Usuário não autenticado");
    const userDocRef = doc(this.db, 'users', uid);
    const goalsCollectionRef = collection(userDocRef, 'goals');
    try {
      const docRef = await addDoc(goalsCollectionRef, goal);
      await updateDoc(docRef, { id: docRef.id });
    } catch (error) {
      throw error
    }

  }

  public async deleteGoal(goalId: string): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error("Usuário não autenticado");
    const goalRef = doc(this.firestore, `users/${uid}/goals/${goalId}`);
    try {
      await deleteDoc(goalRef);
    } catch (error) {
      throw error
    }

  }

  public async updateGoal(goalId: string, data: Partial<GoalData>): Promise<void> {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const goalRef = doc(this.firestore, `users/${uid}/goals/${goalId}`)
    try {
      await updateDoc(goalRef, data);
    } catch (error) {
      throw error;
    }
  }

  public restoreGoal(goal: GoalData) {
    try {
      const updateData: Partial<GoalData> = {
        state: 'in_progress',
        progressValue: 0,
        completedAt: null,
      };
      if (goal.state === 'cancelled') {
        delete updateData.progressValue;
        delete updateData.completedAt;
      }
      this.updateGoal(goal.id, updateData);
      goal.state = updateData.state!;
      goal.progressValue = updateData.progressValue ?? goal.progressValue;
      goal.completedAt = updateData.completedAt ?? goal.completedAt;
    } catch (error) {
      throw error;
    }
  }

  public cancelGoal(goal: GoalData) {
    try {
      const state: GoalData['state'] = 'cancelled'
      this.updateGoal(goal.id, {
        state,
      });
      goal.state = state;
    } catch (error) {
      throw error
    }
  }

  public async completeGoal(goal: GoalData) {
    if (goal.goalType === 'unit') {
      try {
        const inputValue = await this.progressGoalInput(goal);
        if (inputValue == null) return;

        const target = goal.targetValue ?? 0;
        const progressValue = inputValue + (goal.progressValue ?? 0);
        const state: GoalData['state'] = progressValue >= target ? 'completed' : 'in_progress';

        const updateData: Partial<GoalData> = {
          state,
          progressValue
        };
        if (state === 'completed') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          updateData.completedAt = serverTimestamp();
          goal.completedAt = today;
        }
        await this.updateGoal(goal.id, updateData);

        goal.state = state;
        goal.progressValue = progressValue;
        if (goal.state === 'completed') {
          Swal.fire({
            title: 'Concluída',
            text: 'Parabéns, você completou esta meta!',
            icon: 'success',
            heightAuto: false,
            confirmButtonColor: '#E0004D'
          });
        }
      } catch (error) {
        throw error
      }
    }
    if (goal.goalType === 'yes_no') {
      try {
        Swal.fire({
          title: "Tem certeza?",
          text: "Você gostaria de concluir está meta?",
          icon: "warning",
          heightAuto: false,
          showCancelButton: true,
          confirmButtonColor: "#1976d2",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sim, desejo concluir."
        }).then((result) => {
          if (result.isConfirmed) {
            const state: GoalData['state'] = 'completed'
            const completedAt = serverTimestamp()
            const progressValue = 1;

            const updateData: Partial<GoalData> = {
              state,
              progressValue,
              completedAt
            };

            this.updateGoal(goal.id, updateData);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            goal.state = state;
            goal.progressValue = progressValue;
            goal.completedAt = today;

            Swal.fire({
              title: 'Concluída',
              text: 'Parabéns, você completou esta meta!',
              icon: 'success',
              heightAuto: false,
              confirmButtonColor: '#E0004D'
            });
          }
        });
      } catch (error) {
        throw error
      }
    }
  }

  public async getUserGoals() {
    const uid = await this.userService.getUserId();
    const goalsRef = collection(this.firestore, `users/${uid}/goals`);
    const snapshot = await getDocs(goalsRef);
    if (!snapshot.empty) {
      const goals = snapshot.docs.map(doc => {
        return { id: doc.id, ...(doc.data() as Omit<GoalData, "id">) };
      });
      return goals as GoalData[];
    } else {
      return [];
    }
  }

  public filterGoals(goals: GoalData[], filters: GoalFilters, searchText: string): GoalData[] {
    let filteredGoals = goals

    if (searchText && searchText.trim() !== '') {
      const search = searchText.toLowerCase();
      filteredGoals = filteredGoals.filter(goal =>
        goal.name.toLowerCase().includes(search)
      );
    }

    if (!(filters.categories.length === 1 && filters.categories[0] === 'all')) {
      filteredGoals = filteredGoals.filter(g => filters.categories.includes(g.category))
    }

    const selectedTypes = Object.keys(filters.goalTypes)
      .filter(key => filters.goalTypes[key as GoalType]) as GoalType[];

    if (selectedTypes.length > 0) {
      filteredGoals = filteredGoals.filter(goal => selectedTypes.includes(goal.goalType));
    }

    const selectedStatuses = Object.keys(filters.statuses)
      .filter(key => filters.statuses[key as StateGoalType]) as StateGoalType[];

    if (selectedStatuses.length > 0) {
      filteredGoals = filteredGoals.filter(goal => selectedStatuses.includes(goal.state));
    }

    if (filters.deadlines.hasDeadline) {
      filteredGoals = filteredGoals.filter(goal => !!goal.endDate);
    }

    if (filters.deadlines.overdue) {
      const now = new Date();
      filteredGoals = filteredGoals.filter(goal => goal.endDate && new Date(goal.endDate) < now);
    }
    if (filters.deadlines.dueThisWeek) {
      const now = new Date();
      const endOfWeek = new Date();
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      filteredGoals = filteredGoals.filter(goal =>
        goal.endDate && new Date(goal.endDate) <= endOfWeek
      );
    }

    switch (filters.sortBy) {
      case 'name':
        filteredGoals.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name-desc':
        filteredGoals.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'created-newest':
        filteredGoals.sort((a, b) => {

          const dateA = normalizeFirestoreDate(a.createdAt).getTime();
          const dateB = normalizeFirestoreDate(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;

      case 'created-oldest':
        filteredGoals.sort((a, b) => {
          const dateA = normalizeFirestoreDate(a.createdAt).getTime();
          const dateB = normalizeFirestoreDate(b.createdAt).getTime();

          return dateA - dateB;
        });
        break;

      case 'deadline-nearest':
        filteredGoals.sort((a, b) => {
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });
        break;

      case 'progress-highest':
        filteredGoals.sort((a, b) => {
          if (a.progressValue == null) return 1;
          if (b.progressValue == null) return -1;
          return b.progressValue - a.progressValue;
        });
        break;

      case 'progress-lowest':
        filteredGoals.sort((a, b) => {
          if (a.progressValue == null) return 1;
          if (b.progressValue == null) return -1;
          return a.progressValue - b.progressValue;
        });
        break;
    }

    return filteredGoals
  }

  async checkGoalsForHabit(habitId?: string) {
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error("Usuário não autenticado");

    let goalsQuery: Query<DocumentData> = collection(this.firestore, `users/${uid}/goals`);

    if (habitId) {
      goalsQuery = query(
        goalsQuery,
        where('linkedHabit', '==', habitId),
        where('state', '==', 'in_progress'),
        where('goalType', '==', 'habit')
      );
    } else {
      goalsQuery = query(
        goalsQuery,
        where('state', '==', 'in_progress'),
        where('goalType', '==', 'habit')
      );
    }

    const goalsSnapshot = await getDocs(goalsQuery);
    const goals = goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GoalData));
    let wasChanged = false;
    for (const goal of goals as any) {
      const startDate = (goal.updatedAt.toMillis() !== goal.createdAt.toMillis() ? normalizeFirestoreDate(goal.updatedAt) : normalizeFirestoreDate(goal.createdAt)).toISOString().slice(0, 10);
      const habitIdRef = goal.linkedHabit ?? habitId
      const logsRef = collection(this.firestore, `users/${uid}/habits/${habitIdRef}/habitsLogs`)
      const logsSnap = await getDocs(logsRef)
      const completedLogs = logsSnap.docs.map(d => d.data()).filter(l => l['state'] === 'completed' && l['date'] >= startDate).length
    
      const target = goal.targetValue ?? 0;
      let progressValue = completedLogs;
      const state: GoalData['state'] = progressValue >= target ? 'completed' : 'in_progress';

      const updateData: Partial<GoalData> = {
        state,
        progressValue
      };
      if (state === 'completed') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        updateData.completedAt = serverTimestamp();
        goal.completedAt = today;
      }

      await this.updateGoal(goal.id, updateData);
      if (goal.state !== state || goal.progressValue !== progressValue) {
        wasChanged = true
        goal.state = state;
        goal.progressValue = progressValue;
      }
    }
    return wasChanged
  }

  async progressGoalInput(goal: GoalData): Promise<number | null> {
    const maxAllowed = goal.targetValue! * 100;

    const { value: inputValue } = await Swal.fire({
      title: 'Registrar progresso',
      heightAuto: false,
      text: `Informe seu progresso na meta: "${goal.name}"`,
      input: 'number',
      inputAttributes: {
        min: '0',
        max: maxAllowed < 100000 ? String(maxAllowed) : '100000',
        placeholder: 'Ex: 3'
      },
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',

      inputValidator: (value) => {
        const num = Number(value);
        if (isNaN(num) || num <= 0 || num > maxAllowed) {
          return 'Insira um valor válido.';
        }
        return null;

      },
      didOpen: () => {
        const input = document.querySelector('.swal2-input');
        if (input) input.classList.add('swal2-input-wide');
      }
    });
    if (inputValue === undefined) return null;
    return Number(inputValue);
  }
}
