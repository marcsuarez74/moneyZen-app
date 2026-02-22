import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjectStore } from '../../../../store/project.store';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { Project, PROJECT_CATEGORIES, PROJECT_TEMPLATES } from '../../../../models/project.model';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    CurrencyPipe
  ],
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private storageService = inject(LocalStorageService);
  
  protected projectStore = inject(ProjectStore);
  showForm = false;
  
  projectForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    category: ['other', Validators.required],
    targetAmount: [0, [Validators.required, Validators.min(1)]],
    currentAmount: [0, Validators.min(0)],
    priority: ['medium', Validators.required],
    monthlyContribution: [0, Validators.min(0)]
  });
  
  projectCategories = PROJECT_CATEGORIES;
  projectTemplates = PROJECT_TEMPLATES;
  
  ngOnInit(): void {
    this.loadSavedData();
  }
  
  private loadSavedData(): void {
    const savedState = this.storageService.loadProjectState();
    if (savedState?.projects) {
      this.projectStore.setProjects(savedState.projects);
    }
  }
  
  addProject(): void {
    if (this.projectForm.valid) {
      const project: Project = {
        id: 'proj_' + Date.now(),
        ...this.projectForm.value,
        status: 'planning',
        deadline: undefined,
        steps: []
      };
      
      this.projectStore.addProject(project);
      this.saveToStorage();
      this.projectForm.reset({ category: 'other', priority: 'medium' });
      this.showForm = false;
    }
  }
  
  applyTemplate(template: Partial<Project>): void {
    this.showForm = true;
    this.projectForm.patchValue({
      name: template.name,
      description: template.description,
      category: template.category,
      priority: template.priority
    });
  }
  
  deleteProject(projectId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.projectStore.removeProject(projectId);
      this.saveToStorage();
    }
  }
  
  getCategoryIcon(category?: string): string {
    const icons: Record<string, string> = {
      'emergency-fund': 'savings',
      travel: 'flight',
      home: 'home',
      vehicle: 'directions_car',
      education: 'school',
      retirement: 'elderly',
      investment: 'trending_up',
      other: 'category'
    };
    return icons[category || 'other'] || 'category';
  }
  
  getTemplateImage(category?: string): string {
    const images: Record<string, string> = {
      'emergency-fund': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&auto=format&fit=crop',
      travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&auto=format&fit=crop',
      home: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&auto=format&fit=crop',
      vehicle: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&auto=format&fit=crop',
      education: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&auto=format&fit=crop',
      retirement: 'https://images.unsplash.com/photo-1516307073036-4d420087247d?w=300&auto=format&fit=crop',
      investment: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&auto=format&fit=crop',
      other: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&auto=format&fit=crop'
    };
    return images[category || 'other'] || images['other'];
  }
  
  getProgress(project: Project): number {
    if (!project.targetAmount) return 0;
    return Math.round((project.currentAmount / project.targetAmount) * 100);
  }
  
  private saveToStorage(): void {
    this.storageService.saveProjectState({
      projects: this.projectStore.projects(),
      selectedProjectId: this.projectStore.selectedProjectId()
    });
  }
}
