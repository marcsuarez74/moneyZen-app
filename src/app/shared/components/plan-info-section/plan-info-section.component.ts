import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface InfoCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-plan-info-section',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './plan-info-section.component.html',
  styleUrls: ['./plan-info-section.component.scss'],
})
export class PlanInfoSectionComponent {
  readonly title = input<string>('Comment fonctionne ce plan ?');
  readonly infoCards = input<InfoCard[]>([]);
  readonly showAlert = input<boolean>(false);
  readonly alertTitle = input<string>('');
  readonly alertMessage = input<string>('');
  readonly alertIcon = input<string>('info');
}
