import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'config',
    loadComponent: () => import('./pages/config/config.page').then( m => m.ConfigPage)
  },
  {
    path: 'category',
    loadComponent: () => import('./pages/category/category.page').then( m => m.CategoryPage)
  },
  {
    path: 'habit',
    loadComponent: () => import('./pages/habit/habit.page').then( m => m.HabitPage)
  },
  {
    path: 'help',
    loadComponent: () => import('./pages/help/help.page').then( m => m.HelpPage)
  },
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals.page').then( m => m.GoalsPage)
  },
];
