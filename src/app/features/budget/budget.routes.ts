import { Routes } from '@angular/router';
import { BudgetFeatureComponent } from './budget-feature.component';
import { BudgetDashboardPageComponent } from './components/budget-dashboard-page/budget-dashboard-page.component';
import { BudgetSetupContainerComponent } from './containers/budget-setup-container/budget-setup-container.component';

export const budgetRoutes: Routes = [
  {
    path: '',
    component: BudgetFeatureComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BudgetDashboardPageComponent },
      { path: 'setup', component: BudgetSetupContainerComponent }
    ]
  }
];
