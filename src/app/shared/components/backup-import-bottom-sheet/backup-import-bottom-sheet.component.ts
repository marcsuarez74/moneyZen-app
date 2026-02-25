/**
 * Bottom Sheet d'import de sauvegarde pour mobile
 * Design fintech avec plein écran et swipe-to-dismiss
 */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetModule, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { BackupService, ImportResult, ImportSummary } from '../../../services/backup.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

interface BottomSheetData {
  isMobile: boolean;
}

type ImportStep = 'select' | 'analyzing' | 'preview' | 'confirm' | 'importing' | 'success' | 'error';

@Component({
  selector: 'app-backup-import-bottom-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule,
    MatProgressSpinner
  ],
  templateUrl: './backup-import-bottom-sheet.component.html',
  styleUrls: ['./backup-import-bottom-sheet.component.scss']
})
export class BackupImportBottomSheetComponent {
  isMobile: boolean;
  currentStep = signal<ImportStep>('select');
  isDragging = signal(false);
  confirmImport = false;

  importProgress = signal(0);
  importStage = signal('');
  importResult = signal<ImportResult | null>(null);
  importSummary = signal<ImportSummary | null>(null);

  private bottomSheetRef = inject(MatBottomSheetRef<BackupImportBottomSheetComponent>);
  private backupService = inject(BackupService);
  public data: BottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);

  constructor() {
    this.isMobile = this.data.isMobile;
  }

  // Drag & Drop
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

  closeBottomSheet(): void {
    if (this.currentStep() === 'success') {
      window.location.reload();
    } else {
      this.bottomSheetRef.dismiss();
    }
  }

  onSwipeDown(): void {
    if (this.currentStep() === 'select' || this.currentStep() === 'error') {
      this.bottomSheetRef.dismiss();
    }
  }
}
