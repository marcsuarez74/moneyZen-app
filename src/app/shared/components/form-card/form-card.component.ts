import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss']
})
export class FormCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('edit');
  readonly showNextButton = input<boolean>(true);
  readonly showBackButton = input<boolean>(false);
  readonly nextButtonLabel = input<string>('Continuer');
  readonly nextButtonDisabled = input<boolean>(false);
  readonly nextButtonIcon = input<string>('arrow_forward');
  
  readonly backClick = output<void>();
  readonly nextClick = output<void>();
}
