import { Routes } from '@angular/router';
import { ProjectsFeatureComponent } from './projects-feature.component';
import { ProjectsListComponent } from './components/projects-list/projects-list.component';

export const projectsRoutes: Routes = [
  {
    path: '',
    component: ProjectsFeatureComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: ProjectsListComponent }
    ]
  }
];
