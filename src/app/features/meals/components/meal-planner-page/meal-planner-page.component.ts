import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MealStore } from '../../../../store/meal.store';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { MealPlanGeneratorService } from '../../services/meal-plan-generator.service';
import { MealPlan } from '../../../../models/meal.model';
import { MealPlanDisplayComponent } from '../meal-plan-display/meal-plan-display.component';
import { ShoppingListModalComponent } from '../../../../ui/components/shopping-list-modal/shopping-list-modal.component';

/**
 * SMART COMPONENT - Conteneur principal
 * Responsabilités :
 * - Gestion du state (budget, plan courant)
 * - Coordination entre services
 * - Actions utilisateur (générer, régénérer, supprimer)
 * - Ouverture des dialogs
 */
@Component({
  selector: 'app-meal-planner-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    CurrencyPipe,
    MealPlanDisplayComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1>Planification des Repas</h1>
        <p class="subtitle">Découvrez des recettes du monde entier avec TheMealDB</p>
      </div>

      <!-- Étape 1 : Configuration du budget -->
      @if (!currentPlan()) {
        <mat-card class="budget-card">
          <div class="card-hero-image">
            <img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop" 
                 alt="Planification repas">
          </div>
          
          <mat-card-header>
            <mat-card-title>Définissez votre budget</mat-card-title>
            <mat-card-subtitle>
              Nous générerons un plan équilibré qui respecte votre budget
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content [formGroup]="budgetForm">
            <div class="budget-form-content">
              <div class="budget-illustration">
                <mat-icon class="large-icon">restaurant_menu</mat-icon>
              </div>
              <mat-form-field appearance="outline" class="budget-input">
                <mat-label>Budget mensuel alimentation</mat-label>
                <input matInput type="number" formControlName="monthlyBudget" placeholder="400">
                <span matSuffix>€</span>
                <mat-hint>
                  ≈ {{ weeklyBudget() | currency:'EUR' }} par semaine
                </mat-hint>
              </mat-form-field>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-raised-button 
                    color="primary" 
                    (click)="generatePlan()" 
                    [disabled]="!budgetForm.valid || isLoading()"
                    class="generate-btn">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Chargement des recettes...</span>
              } @else {
                <mat-icon>auto_awesome</mat-icon>
                <span>Générer mon plan</span>
              }
            </button>
          </mat-card-actions>
        </mat-card>
      }

      <!-- Étape 2 : Affichage du plan généré -->
      @if (currentPlan()) {
        <app-meal-plan-display
          [plan]="currentPlan()!"
          [isLoading]="isLoading()"
          (regenerate)="onRegenerate()"
          (clear)="onClear()"
          (showShoppingList)="onShowShoppingList()">
        </app-meal-plan-display>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding-bottom: 32px;
    }
    
    .page-header {
      margin-bottom: 24px;
      text-align: center;
      
      h1 {
        margin: 0;
        font-size: 32px;
        font-weight: 300;
        background: linear-gradient(135deg, var(--primary-color) 0%, #ff4081 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      .subtitle {
        margin: 8px 0 0 0;
        color: var(--text-secondary);
      }
    }
    
    .budget-card {
      max-width: 600px;
      margin: 0 auto;
      overflow: hidden;
      
      .card-hero-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    
    .budget-form-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 24px 0;
    }
    
    .budget-illustration .large-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--primary-color);
      opacity: 0.7;
    }
    
    .budget-input {
      width: 100%;
      max-width: 300px;
    }
    
    .generate-btn {
      width: 100%;
      padding: 12px 24px;
      
      mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }
    }
  `]
})
export class MealPlannerPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private storageService = inject(LocalStorageService);
  private generatorService = inject(MealPlanGeneratorService);
  private dialog = inject(MatDialog);
  
  protected mealStore = inject(MealStore);
  
  // Form
  readonly budgetForm: FormGroup = this.fb.group({
    monthlyBudget: [400, [Validators.required, Validators.min(50)]]
  });
  
  // Signal réactif pour le budget mensuel (se met à jour à chaque changement)
  readonly monthlyBudgetSignal = toSignal(
    this.budgetForm.get('monthlyBudget')!.valueChanges,
    { initialValue: 400 }
  );
  
  // State
  readonly currentPlan = signal<MealPlan | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  
  // Computed - se met à jour automatiquement quand monthlyBudgetSignal change
  readonly weeklyBudget = computed(() => {
    const monthly = this.monthlyBudgetSignal() || 0;
    return monthly / 4;
  });
  
  ngOnInit(): void {
    this.loadSavedData();
  }
  
  /**
   * Charge les données sauvegardées
   */
  private loadSavedData(): void {
    const savedState = this.storageService.loadMealState();
    if (savedState && savedState.mealPlans && savedState.mealPlans.length > 0) {
      this.mealStore.setMealPlans(savedState.mealPlans);
      this.currentPlan.set(savedState.mealPlans[0]);
    }
  }
  
  /**
   * Génère un nouveau plan de repas
   */
  async generatePlan(): Promise<void> {
    if (this.budgetForm.invalid || this.isLoading()) return;
    
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const plan = await this.generatorService.generateMealPlan({
        weeklyBudget: this.weeklyBudget(),
        daysCount: 7,
        mealsPerDay: 3
      });
      
      this.currentPlan.set(plan);
      this.mealStore.setMealPlans([plan]);
      this.saveToStorage();
      
    } catch (err) {
      this.error.set('Erreur lors de la génération du plan. Veuillez réessayer.');
      console.error('Erreur génération plan:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Régénère un nouveau plan
   */
  async onRegenerate(): Promise<void> {
    if (this.isLoading()) return;
    await this.generatePlan();
  }
  
  /**
   * Supprime le plan actuel
   */
  onClear(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan de repas ?')) {
      this.currentPlan.set(null);
      this.saveToStorage();
    }
  }
  
  /**
   * Ouvre la modale de liste de courses
   */
  onShowShoppingList(): void {
    if (!this.currentPlan()) return;
    
    this.dialog.open(ShoppingListModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { plan: this.currentPlan()! }
    });
  }
  
  /**
   * Sauvegarde le state
   */
  private saveToStorage(): void {
    this.storageService.saveMealState({
      mealPlans: this.currentPlan() ? [this.currentPlan()!] : [],
      currentMealPlanId: this.currentPlan()?.id || null,
      shoppingLists: []
    });
  }
}
