import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/budget', pathMatch: 'full' },
  {
    path: 'budget',
    loadChildren: () => import('./features/budget/budget.routes').then(m => m.budgetRoutes)
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.routes').then(m => m.projectsRoutes)
  },
  {
    path: 'meals',
    loadChildren: () => import('./features/meals/meals.routes').then(m => m.mealsRoutes)
  }
];
