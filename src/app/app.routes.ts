import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then(m => m.SignupPage),
  },
  {
    path: 'habit',
    loadComponent: () => import('./pages/habit/habit.page').then(m => m.HabitPage),
    canActivate: [authGuard]
  },
  {
    path: 'help',
    loadComponent: () => import('./pages/help/help.page').then(m => m.HelpPage),
    canActivate: [authGuard]
  },
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals.page').then(m => m.GoalsPage),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [authGuard]
  },  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },

];
