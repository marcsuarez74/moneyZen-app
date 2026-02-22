import { Routes } from '@angular/router';
import { MealsFeatureComponent } from './meals-feature.component';
import { MealPlannerPageComponent } from './components/meal-planner-page/meal-planner-page.component';

export const mealsRoutes: Routes = [
  {
    path: '',
    component: MealsFeatureComponent,
    children: [
      { path: '', redirectTo: 'planner', pathMatch: 'full' },
      { path: 'planner', component: MealPlannerPageComponent }
    ]
  }
];
