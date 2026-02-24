import { Component, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BackupImportDialogComponent } from '../../../../shared/components/backup-import-dialog/backup-import-dialog.component';

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
  private dialog = inject(MatDialog);

  onConfigure(): void {
    this.configureBudget.emit();
  }

  openImportDialog(): void {
    const isMobile = window.innerWidth < 1024;
    this.dialog.open(BackupImportDialogComponent, {
      width: isMobile ? '90vw' : '500px',
      maxWidth: '500px',
      data: { isMobile }
    });
  }
}
