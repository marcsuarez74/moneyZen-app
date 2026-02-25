/**
 * Dialog d'import de sauvegarde avec drag & drop (desktop) et sélection fichier (mobile)
 * Design fintech avec barre de progression animée
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { BackupService, ImportResult, ImportSummary } from '../../../services/backup.service';

interface DialogData {
  isMobile: boolean;
}

type ImportStep = 'select' | 'analyzing' | 'preview' | 'confirm' | 'importing' | 'success' | 'error';

@Component({
  selector: 'app-backup-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './backup-import-dialog.component.html',
  styleUrls: ['./backup-import-dialog.component.scss']
})
export class BackupImportDialogComponent {
  isMobile: boolean;
  currentStep = signal<ImportStep>('select');
  isDragging = signal(false);
  confirmImport = false;
  
  importProgress = signal(0);
  importStage = signal('');
  importResult = signal<ImportResult | null>(null);
  importSummary = signal<ImportSummary | null>(null);

  private dialogRef = inject(MatDialogRef<BackupImportDialogComponent>);
  private backupService = inject(BackupService);
  public data: DialogData = inject(MAT_DIALOG_DATA);

  constructor() {
    this.isMobile = this.data.isMobile;
  }

  // Drag & Drop (Desktop)
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  // File selection (Mobile & Desktop fallback)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  private async processFile(file: File): Promise<void> {
    this.currentStep.set('analyzing');

    const result = await this.backupService.importFromZip(
      file,
      (progress, stage) => {
        this.importProgress.set(progress);
        this.importStage.set(stage);
      }
    );

    this.importResult.set(result);

    if (result.success && result.summary) {
      this.importSummary.set(result.summary);
      this.currentStep.set('preview');
    } else {
      this.currentStep.set('error');
    }
  }

  goToConfirm(): void {
    this.currentStep.set('confirm');
  }

  goBackToPreview(): void {
    this.currentStep.set('preview');
  }

  async startImport(): Promise<void> {
    if (!this.importResult()?.data) return;

    this.currentStep.set('importing');

    const success = await this.backupService.restoreFromBackup(
      this.importResult()!.data!
    );

    if (success) {
      this.currentStep.set('success');
      // Recharger la page après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      this.currentStep.set('error');
    }
  }

  resetToSelect(): void {
    this.currentStep.set('select');
    this.importResult.set(null);
    this.importSummary.set(null);
    this.confirmImport = false;
    this.importProgress.set(0);
  }

  closeDialog(): void {
    if (this.currentStep() === 'success') {
      window.location.reload();
    } else {
      this.dialogRef.close();
    }
  }
}
