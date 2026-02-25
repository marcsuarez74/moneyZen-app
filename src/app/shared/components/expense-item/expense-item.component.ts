import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Expense } from '../../../models/budget.model';

@Component({
  selector: 'app-expense-item',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './expense-item.component.html',
  styleUrls: ['./expense-item.component.scss'],
})
export class ExpenseItemComponent {
  readonly expense = input.required<Expense>();
  readonly editable = input<boolean>(true);
  readonly removable = input<boolean>(true);

  readonly edit = output<Expense>();
  readonly remove = output<Expense>();

  getCategoryIcon(category: string | undefined): string {
    const icons: Record<string, string> = {
      // Logement
      housing: 'home',
      mortgage: 'house',
      propertyTax: 'account_balance',
      condoFees: 'apartment',
      housingServices: 'cleaning_services',

      // Transport
      transport: 'directions_car',
      carLoan: 'directions_car',
      carInsurance: 'local_car_wash',
      fuel: 'local_gas_station',
      carMaintenance: 'build',
      publicTransport: 'train',

      // Alimentation
      food: 'restaurant',
      restaurants: 'restaurant_menu',

      // Services
      utilities: 'bolt',
      internet: 'wifi',
      phone: 'phone_android',
      tvStreaming: 'tv',
      energy: 'electric_bolt',
      water: 'water_drop',

      // Assurances
      insurance: 'shield',
      homeInsurance: 'shield',
      healthInsurance: 'health_and_safety',
      lifeInsurance: 'favorite',

      // Santé
      health: 'favorite',
      medicalExpenses: 'medical_services',
      pharmacy: 'local_pharmacy',

      // Éducation
      education: 'school',
      tuition: 'school',
      schoolSupplies: 'menu_book',

      // Loisirs
      leisure: 'sports_esports',
      sport: 'fitness_center',
      gym: 'fitness_center',
      streaming: 'play_circle',
      hobbies: 'interests',
      culture: 'museum',
      travel: 'flight',

      // Services personnels
      personalServices: 'person',
      beauty: 'spa',
      clothing: 'checkroom',

      // Dettes
      consumerLoan: 'credit_card',
      debtRepayment: 'money_off',

      // Épargne
      savings: 'savings',
      investments: 'trending_up',
      retirement: 'account_balance',

      // Autres
      pets: 'pets',
      gifts: 'card_giftcard',
      donations: 'volunteer_activism',
      taxes: 'receipt_long',
      other: 'more_horiz',
    };
    return icons[category || ''] || 'receipt';
  }

  getCategoryColor(category: string | undefined): string {
    const colors: Record<string, string> = {
      // Logement
      housing: '#ff7043',
      mortgage: '#ff8a65',
      propertyTax: '#ffab91',
      condoFees: '#ffccbc',
      housingServices: '#fbe9e7',

      // Transport
      transport: '#42a5f5',
      carLoan: '#64b5f6',
      carInsurance: '#90caf9',
      fuel: '#bbdefb',
      carMaintenance: '#e3f2fd',
      publicTransport: '#0277bd',

      // Alimentation
      food: '#66bb6a',
      restaurants: '#81c784',

      // Services
      utilities: '#ffa726',
      internet: '#ffb74d',
      phone: '#ffcc80',
      tvStreaming: '#ffe0b2',
      energy: '#f57c00',
      water: '#29b6f6',

      // Assurances
      insurance: '#ab47bc',
      homeInsurance: '#ba68c8',
      healthInsurance: '#ce93d8',
      lifeInsurance: '#e1bee7',

      // Santé
      health: '#ef5350',
      medicalExpenses: '#e57373',
      pharmacy: '#ef9a9a',

      // Éducation
      education: '#5c6bc0',
      tuition: '#7986cb',
      schoolSupplies: '#9fa8da',

      // Loisirs
      leisure: '#26c6da',
      sport: '#4dd0e1',
      gym: '#80deea',
      streaming: '#b2ebf2',
      hobbies: '#00bcd4',
      culture: '#00acc1',
      travel: '#0097a7',

      // Services personnels
      personalServices: '#8d6e63',
      beauty: '#a1887f',
      clothing: '#bcaaa4',

      // Dettes
      consumerLoan: '#d32f2f',
      debtRepayment: '#f44336',

      // Épargne
      savings: '#26a69a',
      investments: '#4db6ac',
      retirement: '#80cbc4',

      // Autres
      pets: '#8bc34a',
      gifts: '#ff4081',
      donations: '#e91e63',
      taxes: '#607d8b',
      other: '#9e9e9e',
    };
    return colors[category || ''] || '#78909c';
  }
}
