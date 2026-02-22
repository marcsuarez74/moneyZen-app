import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MealPlan, ShoppingList, ShoppingItem, Ingredient } from '../../../models/meal.model';
import { OpenPricesService } from '../../../services/open-prices.service';

@Component({
  selector: 'app-shopping-list-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    CurrencyPipe
  ],
  template: `
    <div class="modal-header">
      <div class="header-title">
        <mat-icon class="title-icon">shopping_cart</mat-icon>
        <div>
          <h2 mat-dialog-title>Liste de courses</h2>
          <p class="subtitle" *ngIf="!isLoading() && shoppingList()">
            Total: {{ shoppingList()?.totalEstimatedCost | currency:'EUR' }}
            <span class="price-source">{{ apiPricesUsed() ? '(prix Open Prices)' : '(estimations)' }}</span>
          </p>
        </div>
      </div>
      <button mat-icon-button (click)="close()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <mat-divider></mat-divider>
    
    <mat-dialog-content class="dialog-content">
      @if (isLoading()) {
        <div class="skeleton-container">
          <div class="skeleton-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-count"></div>
          </div>
          
          @for (i of [1,2,3]; track i) {
            <div class="skeleton-category">
              <div class="skeleton-category-header">
                <div class="skeleton-icon"></div>
                <div class="skeleton-text"></div>
              </div>
              <div class="skeleton-items">
                @for (j of [1,2,3,4]; track j) {
                  <div class="skeleton-item">
                    <div class="skeleton-checkbox"></div>
                    <div class="skeleton-line"></div>
                  </div>
                }
              </div>
            </div>
          }
          
          <div class="loading-text">
            <mat-spinner diameter="30"></mat-spinner>
            <p>Récupération des prix en cours...</p>
            <span class="hint">Nous cherchons les meilleurs prix pour vous</span>
          </div>
        </div>
      } @else {
        <div class="categories-grid">
          @for (category of getCategories(); track category) {
            <div class="category-card">
              <div class="category-header">
                <div class="category-image-wrapper">
                  <img [src]="getCategoryImage(category)" class="category-image" [alt]="getCategoryLabel(category)">
                </div>
                <h3>{{ getCategoryLabel(category) }}</h3>
                <span class="item-count">{{ getItemsByCategory(category).length }}</span>
              </div>
              
              <mat-divider></mat-divider>
              
              <div class="items-list">
                @for (item of getItemsByCategory(category); track item.ingredient.name) {
                  <div class="shopping-item" [class.checked]="item.isChecked">
                    <mat-checkbox [(ngModel)]="item.isChecked" color="primary">
                      <div class="item-details">
                        <span class="item-name">{{ item.ingredient.name }}</span>
                        <span class="item-quantity">{{ item.quantity }} {{ item.ingredient.unit }}</span>
                        <span class="item-price">{{ calculateItemPrice(item) | currency:'EUR' }}</span>
                      </div>
                    </mat-checkbox>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </mat-dialog-content>
    
    <mat-divider class="footer-divider"></mat-divider>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Fermer</button>
      <button mat-raised-button color="primary" (click)="print()">
        <mat-icon>print</mat-icon>
        Imprimer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 600px;
      max-width: 900px;
      
      @media (max-width: 768px) {
        min-width: 100%;
      }
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 24px 16px;
      
      .header-title {
        display: flex;
        gap: 16px;
        align-items: center;
        
        .title-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: var(--primary-color);
        }
        
        h2 {
          margin: 0;
          font-size: 24px;
        }
        
        .subtitle {
          margin: 4px 0 0 0;
          color: var(--text-secondary);
          font-size: 14px;
          
          .price-source {
            font-size: 12px;
            font-style: italic;
            opacity: 0.8;
          }
        }
      }
      
      .close-btn {
        margin: -8px -8px 0 0;
      }
    }
    
    .dialog-content {
      min-height: 300px;
      max-height: 60vh;
      overflow-y: auto;
      padding-top: 16px;
    }
    
    .footer-divider {
      margin: 0;
    }
    
    // Skeleton Loading
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .skeleton-header {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .skeleton-title {
      height: 24px;
      width: 200px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    .skeleton-count {
      height: 24px;
      width: 60px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    .skeleton-category {
      background: var(--surface-variant);
      border-radius: 12px;
      padding: 16px;
    }
    
    .skeleton-category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    
    .skeleton-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    .skeleton-text {
      flex: 1;
      height: 20px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    .skeleton-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .skeleton-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .skeleton-checkbox {
      width: 18px;
      height: 18px;
      border-radius: 3px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    
    .skeleton-line {
      flex: 1;
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }
    
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .loading-text {
      text-align: center;
      padding: 32px;
      
      p {
        margin: 16px 0 8px;
        font-size: 16px;
        color: var(--text-primary);
      }
      
      .hint {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }
    
    // Content
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding-bottom: 24px; // Espace en bas avant le bouton
    }
    
    .category-card {
      background: var(--surface-variant);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      
      .category-image-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .category-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      h3 {
        margin: 0;
        flex: 1;
        font-size: 16px;
        font-weight: 600;
      }
      
      .item-count {
        background: var(--primary-color);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
    }
    
    .items-list {
      padding: 8px 16px 16px;
    }
    
    .shopping-item {
      padding: 8px 0;
      transition: opacity 0.2s;
      
      &.checked {
        opacity: 0.6;
        
        .item-name {
          text-decoration: line-through;
        }
      }
      
      ::ng-deep .mat-checkbox-label {
        width: 100%;
      }
      
      .item-details {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .item-name {
        font-weight: 500;
      }
      
      .item-quantity {
        color: var(--text-secondary);
        font-size: 13px;
      }
      
      .item-price {
        color: #4caf50;
        font-weight: 600;
        font-size: 13px;
        margin-left: auto;
      }
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      gap: 8px;
    }
  `]
})
export class ShoppingListModalComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ShoppingListModalComponent>);
  private openPricesService = inject(OpenPricesService);
  
  readonly data = inject<{ plan: MealPlan }>(MAT_DIALOG_DATA);
  
  readonly shoppingList = signal<ShoppingList | null>(null);
  readonly isLoading = signal(true);
  readonly apiPricesUsed = signal(false);
  
  ngOnInit(): void {
    this.buildShoppingList();
  }
  
  async buildShoppingList(): Promise<void> {
    this.isLoading.set(true);
    this.apiPricesUsed.set(false);
    
    // Collecter tous les ingrédients de tous les repas
    const ingredients = new Map<string, ShoppingItem>();
    
    this.data.plan.days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ing => {
          const key = ing.name.toLowerCase().trim();
          if (key === '') return;
          
          if (ingredients.has(key)) {
            ingredients.get(key)!.quantity += ing.quantity;
          } else {
            ingredients.set(key, {
              ingredient: { ...ing },
              quantity: ing.quantity,
              isChecked: false
            });
          }
        });
      });
    });
    
    const items = Array.from(ingredients.values());
    let totalCost = 0;
    let apiPricesCount = 0;
    
    // Essayer de récupérer les prix en parallèle avec timeout
    const pricePromises = items.map(async item => {
      try {
        const price = await Promise.race([
          this.openPricesService.getAveragePriceForProduct(item.ingredient.name).toPromise(),
          new Promise<null>(resolve => setTimeout(() => resolve(null), 1500))
        ]);
        
        if (price) {
          apiPricesCount++;
          return { item, price, fromApi: true };
        }
      } catch {
        // Silencieux
      }
      
      // Fallback sur prix estimé
      const unitPrice = item.ingredient.estimatedPrice / Math.max(item.ingredient.quantity, 1);
      const estimatedTotal = unitPrice * item.quantity;
      return { item, price: estimatedTotal, fromApi: false };
    });
    
    const results = await Promise.all(pricePromises);
    
    results.forEach(result => {
      totalCost += result.price;
    });
    
    this.shoppingList.set({
      items,
      totalEstimatedCost: Math.round(totalCost * 100) / 100,
      generatedAt: new Date()
    });
    
    this.apiPricesUsed.set(apiPricesCount > 0);
    this.isLoading.set(false);
  }
  
  getCategories(): string[] {
    if (!this.shoppingList()) return [];
    const categories = new Set(this.shoppingList()!.items.map(item => item.ingredient.category));
    return Array.from(categories).sort();
  }
  
  getItemsByCategory(category: string): ShoppingItem[] {
    if (!this.shoppingList()) return [];
    return this.shoppingList()!.items.filter(item => item.ingredient.category === category);
  }
  
  calculateItemPrice(item: ShoppingItem): number {
    const unitPrice = item.ingredient.estimatedPrice / Math.max(item.ingredient.quantity, 1);
    return Math.round(unitPrice * item.quantity * 100) / 100;
  }
  
  getCategoryImage(category: string): string {
    // Images qui correspondent VRAIMENT aux catégories
    const images: Record<string, string> = {
      // Fruits & Légumes - bel arrangement de légumes colorés
      produce: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100&h=100&fit=crop',
      
      // Viande - steak cru/frisé sur une planche
      meat: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=100&h=100&fit=crop',
      
      // Volaille - poulet entier cuit ou cru
      poultry: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=100&h=100&fit=crop',
      
      // Poisson - saumon frais/pavé de poisson
      fish: 'https://images.unsplash.com/photo-1615141982880-1313d06a7c15?w=100&h=100&fit=crop',
      
      // Produits laitiers - fromage, lait, oeufs
      dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=100&h=100&fit=crop',
      
      // Épicerie - bocaux, conserves, épices
      pantry: 'https://images.unsplash.com/photo-1584483766114-1cea3fac41fe?w=100&h=100&fit=crop',
      
      // Surgelés - aliments congelés/glaçons
      frozen: 'https://images.unsplash.com/photo-1626849675625-147a11fd9dad?w=100&h=100&fit=crop',
      
      // Boulangerie - pain frais artisanal
      bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop',
      
      // Boissons - bouteilles/jus variés
      beverages: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=100&h=100&fit=crop'
    };
    
    return images[category] || images['produce'];
  }
  
  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      produce: 'Fruits & Légumes',
      meat: 'Viande',
      poultry: 'Volaille',
      fish: 'Poisson',
      dairy: 'Produits laitiers',
      pantry: 'Épicerie',
      frozen: 'Surgelés',
      bakery: 'Boulangerie',
      beverages: 'Boissons'
    };
    return labels[category] || category;
  }
  
  close(): void {
    this.dialogRef.close();
  }
  
  print(): void {
    window.print();
  }
}
