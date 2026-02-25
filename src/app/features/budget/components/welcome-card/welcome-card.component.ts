import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ResponsiveService } from '../../../../services/responsive.service';

@Component({
  selector: 'app-welcome-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './welcome-card.component.html',
  styleUrls: ['./welcome-card.component.scss']
})
export class WelcomeCardComponent {
  readonly configureBudget = output<void>();
  private responsiveService = inject(ResponsiveService);

  onConfigure(): void {
    this.configureBudget.emit();
  }

  openImportDialog(): void {
    this.responsiveService.openBackupImport();
  }
}
