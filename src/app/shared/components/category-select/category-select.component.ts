import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../../../models/budget.model';

interface CategoryGroup {
  name: string;
  categories: typeof EXPENSE_CATEGORIES;
}

@Component({
  selector: 'app-category-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.scss'],
})
export class CategorySelectComponent {
  readonly formControl = input.required<FormControl>();
  readonly label = input<string>('Catégorie');
  readonly placeholder = input<string>('Sélectionnez une catégorie');
  readonly appearance = input<'outline' | 'fill'>('outline');
  readonly showIcon = input<boolean>(true);
  readonly sortAlphabetically = input<boolean>(true);

  readonly categoryChange = output<ExpenseCategory>();

  // Tri alphabétique des catégories
  readonly sortedCategories = computed(() => {
    const categories = [...EXPENSE_CATEGORIES];
    if (this.sortAlphabetically()) {
      return categories.sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    }
    return categories;
  });

  // Regroupement par groupes
  readonly groupedCategories = computed((): CategoryGroup[] => {
    const categories = this.sortedCategories();
    const groups = new Map<string, typeof EXPENSE_CATEGORIES>();

    categories.forEach(cat => {
      if (!groups.has(cat.group)) {
        groups.set(cat.group, []);
      }
      groups.get(cat.group)!.push(cat);
    });

    // Trier les groupes aussi par ordre alphabétique
    return Array.from(groups.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'fr'))
      .map(([name, categories]) => ({ name, categories }));
  });

  // Pour affichage simple sans groupement
  readonly flatCategories = computed(() => {
    if (this.sortAlphabetically()) {
      return [...EXPENSE_CATEGORIES].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
    }
    return EXPENSE_CATEGORIES;
  });

  onSelectionChange(value: ExpenseCategory): void {
    this.categoryChange.emit(value);
  }
}
