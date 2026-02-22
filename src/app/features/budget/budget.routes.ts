import { Routes } from '@angular/router';
import { BudgetFeatureComponent } from './budget-feature.component';
import { BudgetDashboardPageComponent } from './components/budget-dashboard-page/budget-dashboard-page.component';
import { BudgetSetupComponent } from './components/budget-setup/budget-setup.component';

export const budgetRoutes: Routes = [
  {
    path: '',
    component: BudgetFeatureComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BudgetDashboardPageComponent },
      { path: 'setup', component: BudgetSetupComponent }
    ]
  }
];
