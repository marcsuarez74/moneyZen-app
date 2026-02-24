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
  template: `
    <div class="backup-import-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <mat-icon class="header-icon">restore</mat-icon>
        <h2 mat-dialog-title>Restaurer une sauvegarde</h2>
      </div>

      <mat-dialog-content>
        <!-- Étape 1: Sélection du fichier -->
        @if (currentStep() === 'select') {
          <div class="step-select">
            @if (!isMobile) {
              <!-- Desktop: Drag & Drop -->
              <div 
                class="drop-zone"
                [class.drag-over]="isDragging()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave()"
                (drop)="onDrop($event)">
                <mat-icon class="drop-icon">cloud_upload</mat-icon>
                <p class="drop-text">
                  <strong>Glissez votre fichier ZIP ici</strong><br>
                  ou cliquez pour parcourir
                </p>
                <input 
                  type="file" 
                  #fileInput
                  accept=".zip"
                  (change)="onFileSelected($event)"
                  class="file-input">
              </div>
            } @else {
              <!-- Mobile: Bouton de sélection -->
              <div class="mobile-select">
                <mat-icon class="mobile-icon">upload_file</mat-icon>
                <p>Sélectionnez votre fichier de sauvegarde MoneyZen (.zip)</p>
                <button 
                  mat-stroked-button 
                  color="primary"
                  (click)="fileInput.click()">
                  <mat-icon>folder_open</mat-icon>
                  Choisir un fichier
                </button>
                <input 
                  type="file" 
                  #fileInput
                  accept=".zip"
                  (change)="onFileSelected($event)"
                  class="file-input">
              </div>
            }
            
            <p class="info-text">
              <mat-icon>info</mat-icon>
              Le fichier doit être au format .zip généré par MoneyZen
            </p>
          </div>
        }

        <!-- Étape 2: Analyse en cours -->
        @if (currentStep() === 'analyzing') {
          <div class="step-analyzing">
            <mat-icon class="analyzing-icon">hourglass_empty</mat-icon>
            <h3>Analyse de la sauvegarde...</h3>
            <mat-progress-bar 
              mode="indeterminate" 
              color="primary">
            </mat-progress-bar>
          </div>
        }

        <!-- Étape 3: Prévisualisation -->
        @if (currentStep() === 'preview' && importSummary()) {
          <div class="step-preview">
            <h3>
              <mat-icon>preview</mat-icon>
              Contenu de la sauvegarde
            </h3>
            
            <div class="summary-card">
              <div class="summary-header">
                <span class="backup-date">{{ importSummary()!.backupDate }}</span>
                <span class="app-version">v{{ importSummary()!.appVersion }}</span>
              </div>
              
              <div class="summary-items">
                <div class="summary-item" [class.active]="importSummary()!.hasBudget">
                  <mat-icon>{{ importSummary()!.hasBudget ? 'check_circle' : 'cancel' }}</mat-icon>
                  <div class="item-info">
                    <span class="item-label">Budget configuré</span>
                    <span class="item-value">{{ importSummary()!.hasBudget ? 'Oui' : 'Non' }}</span>
                  </div>
                </div>
                
                <div class="summary-item" [class.active]="importSummary()!.expenseCount > 0">
                  <mat-icon>{{ importSummary()!.expenseCount > 0 ? 'receipt_long' : 'receipt' }}</mat-icon>
                  <div class="item-info">
                    <span class="item-label">Dépenses enregistrées</span>
                    <span class="item-value">{{ importSummary()!.expenseCount }}</span>
                  </div>
                </div>
                
                <div class="summary-item" [class.active]="importSummary()!.hasActivePlan">
                  <mat-icon>{{ importSummary()!.hasActivePlan ? 'trending_up' : 'show_chart' }}</mat-icon>
                  <div class="item-info">
                    <span class="item-label">Plan de redressement</span>
                    <span class="item-value">{{ importSummary()!.hasActivePlan ? 'Actif' : 'Aucun' }}</span>
                  </div>
                </div>
                
                <div class="summary-item" [class.active]="importSummary()!.projectCount > 0">
                  <mat-icon>{{ importSummary()!.projectCount > 0 ? 'savings' : 'account_balance' }}</mat-icon>
                  <div class="item-info">
                    <span class="item-label">Projets d'épargne</span>
                    <span class="item-value">{{ importSummary()!.projectCount }}</span>
                  </div>
                </div>
                
                <div class="summary-item">
                  <mat-icon>palette</mat-icon>
                  <div class="item-info">
                    <span class="item-label">Thème</span>
                    <span class="item-value">{{ importSummary()!.theme === 'dark' ? 'Sombre' : 'Clair' }}</span>
                  </div>
                </div>
              </div>
            </div>

            @if (importResult()?.warnings?.length) {
              <div class="warnings-box">
                <mat-icon>warning</mat-icon>
                <ul>
                  @for (warning of importResult()?.warnings; track warning) {
                    <li>{{ warning }}</li>
                  }
                </ul>
              </div>
            }

            <button 
              mat-raised-button 
              color="primary"
              class="continue-btn"
              (click)="goToConfirm()">
              Continuer
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        }

        <!-- Étape 4: Confirmation -->
        @if (currentStep() === 'confirm') {
          <div class="step-confirm">
            <div class="warning-box">
              <mat-icon color="warn">warning</mat-icon>
              <p>
                <strong>Attention !</strong><br>
                Cette action remplacera <strong>toutes vos données actuelles</strong> par celles de la sauvegarde.
                Cette opération ne peut pas être annulée.
              </p>
            </div>

            <mat-checkbox 
              [(ngModel)]="confirmImport"
              color="primary"
              class="confirm-checkbox">
              Je comprends que cela remplacera mes données actuelles
            </mat-checkbox>

            <div class="confirm-actions">
              <button mat-button (click)="goBackToPreview()">
                <mat-icon>arrow_back</mat-icon>
                Retour
              </button>
              <button 
                mat-raised-button 
                color="primary"
                [disabled]="!confirmImport"
                (click)="startImport()">
                Confirmer l'import
                <mat-icon>download_done</mat-icon>
              </button>
            </div>
          </div>
        }

        <!-- Étape 5: Import en cours -->
        @if (currentStep() === 'importing') {
          <div class="step-importing">
            <h3>Restauration en cours...</h3>
            <div class="progress-info">
              <mat-icon>sync</mat-icon>
              <span>{{ importStage() }}</span>
            </div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="importProgress()"
              color="primary">
            </mat-progress-bar>
            <span class="progress-percent">{{ importProgress() }}%</span>
          </div>
        }

        <!-- Étape 6: Succès -->
        @if (currentStep() === 'success') {
          <div class="step-success">
            <mat-icon class="success-icon">check_circle</mat-icon>
            <h3>Import réussi !</h3>
            <p>Vos données ont été restaurées avec succès.</p>
            <p class="hint">L'application va se recharger pour appliquer les changements.</p>
          </div>
        }

        <!-- Étape 7: Erreur -->
        @if (currentStep() === 'error') {
          <div class="step-error">
            <mat-icon class="error-icon">error</mat-icon>
            <h3>Import échoué</h3>
            @if (importResult()?.errors?.length) {
              <ul class="error-list">
                @for (error of importResult()?.errors; track error) {
                  <li>{{ error }}</li>
                }
              </ul>
            }
            <p class="rollback-info">
              <mat-icon>info</mat-icon>
              Vos données précédentes ont été automatiquement restaurées.
            </p>
            <button 
              mat-stroked-button 
              color="primary"
              (click)="resetToSelect()">
              <mat-icon>refresh</mat-icon>
              Réessayer
            </button>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        @if (currentStep() === 'select' || currentStep() === 'error') {
          <button mat-button (click)="closeDialog()">
            Annuler
          </button>
        }
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .backup-import-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--fintech-border, #e0e0e0);

      .header-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--fintech-primary, #667eea);
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--fintech-text-primary, #212121);
      }
    }

    // Étape Sélection
    .step-select {
      .drop-zone {
        border: 2px dashed var(--fintech-border, #e0e0e0);
        border-radius: 16px;
        padding: 48px 32px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: var(--fintech-surface-variant, #f5f5f5);

        &:hover, &.drag-over {
          border-color: var(--fintech-primary, #667eea);
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          transform: scale(1.02);
        }

        .drop-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: var(--fintech-primary, #667eea);
          margin-bottom: 16px;
        }

        .drop-text {
          color: var(--fintech-text-secondary, #666666);
          margin: 0;
          line-height: 1.6;
        }
      }

      .file-input {
        display: none;
      }

      .mobile-select {
        text-align: center;
        padding: 32px;

        .mobile-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: var(--fintech-primary, #667eea);
          margin-bottom: 16px;
        }

        p {
          color: var(--fintech-text-secondary, #666666);
          margin-bottom: 20px;
        }

        button {
          border-radius: 12px;
          padding: 12px 24px;
        }
      }

      .info-text {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 12px;
        background: var(--fintech-surface-variant, #f5f5f5);
        border-radius: 8px;
        font-size: 0.875rem;
        color: var(--fintech-text-secondary, #666666);

        mat-icon {
          font-size: 18px;
          color: var(--fintech-primary, #667eea);
        }
      }
    }

    // Étape Analyse
    .step-analyzing {
      text-align: center;
      padding: 40px 0;

      .analyzing-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--fintech-primary, #667eea);
        animation: pulse 1.5s ease-in-out infinite;
      }

      h3 {
        margin: 20px 0;
        color: var(--fintech-text-primary, #212121);
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    // Étape Preview
    .step-preview {
      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        color: var(--fintech-text-primary, #212121);

        mat-icon {
          color: var(--fintech-primary, #667eea);
        }
      }

      .summary-card {
        background: var(--fintech-surface-variant, #f5f5f5);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--fintech-border, #e0e0e0);

        .backup-date {
          font-weight: 600;
          color: var(--fintech-text-primary, #212121);
        }

        .app-version {
          font-size: 0.875rem;
          color: var(--fintech-text-tertiary, #9e9e9e);
          background: rgba(102, 126, 234, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
        }
      }

      .summary-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .summary-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.5);
        transition: all 0.2s ease;

        &.active {
          background: rgba(102, 126, 234, 0.1);
        }

        mat-icon {
          font-size: 20px;
          color: var(--fintech-text-tertiary, #9e9e9e);
        }

        &.active mat-icon {
          color: var(--fintech-success, #2e7d32);
        }

        .item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .item-label {
          font-size: 0.875rem;
          color: var(--fintech-text-secondary, #666666);
        }

        .item-value {
          font-weight: 600;
          color: var(--fintech-text-primary, #212121);
        }
      }

      .warnings-box {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 152, 0, 0.1);
        border-radius: 8px;
        margin-bottom: 20px;

        mat-icon {
          color: #ff9800;
          flex-shrink: 0;
        }

        ul {
          margin: 0;
          padding-left: 16px;
          font-size: 0.875rem;
          color: var(--fintech-text-secondary, #666666);
        }
      }

      .continue-btn {
        width: 100%;
        border-radius: 12px;
        padding: 12px;
        font-weight: 600;
      }
    }

    // Étape Confirmation
    .step-confirm {
      .warning-box {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: rgba(211, 47, 47, 0.1);
        border-radius: 12px;
        margin-bottom: 20px;

        mat-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        p {
          margin: 0;
          line-height: 1.5;
        }
      }

      .confirm-checkbox {
        margin-bottom: 24px;
      }

      .confirm-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;

        button {
          border-radius: 12px;
          padding: 10px 20px;
        }
      }
    }

    // Étape Importing
    .step-importing {
      text-align: center;
      padding: 40px 0;

      h3 {
        margin-bottom: 20px;
        color: var(--fintech-text-primary, #212121);
      }

      .progress-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 16px;
        color: var(--fintech-text-secondary, #666666);

        mat-icon {
          animation: spin 1s linear infinite;
        }
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      mat-progress-bar {
        margin-bottom: 8px;
      }

      .progress-percent {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--fintech-primary, #667eea);
      }
    }

    // Étape Succès
    .step-success {
      text-align: center;
      padding: 40px 0;

      .success-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: var(--fintech-success, #2e7d32);
        margin-bottom: 20px;
      }

      h3 {
        margin-bottom: 12px;
        color: var(--fintech-text-primary, #212121);
      }

      .hint {
        color: var(--fintech-text-secondary, #666666);
        font-size: 0.875rem;
        margin-top: 16px;
        padding: 12px;
        background: var(--fintech-surface-variant, #f5f5f5);
        border-radius: 8px;
      }
    }

    // Étape Erreur
    .step-error {
      text-align: center;
      padding: 32px 0;

      .error-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--fintech-error, #d32f2f);
        margin-bottom: 16px;
      }

      h3 {
        margin-bottom: 16px;
        color: var(--fintech-text-primary, #212121);
      }

      .error-list {
        text-align: left;
        background: rgba(211, 47, 47, 0.1);
        padding: 16px 16px 16px 32px;
        border-radius: 8px;
        margin-bottom: 20px;

        li {
          color: var(--fintech-error, #d32f2f);
          margin-bottom: 8px;
        }
      }

      .rollback-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: rgba(46, 125, 50, 0.1);
        border-radius: 8px;
        margin-bottom: 20px;
        color: var(--fintech-success, #2e7d32);
        font-size: 0.875rem;

        mat-icon {
          font-size: 18px;
        }
      }

      button {
        border-radius: 12px;
      }
    }

    // Dark Theme
    :host-context(.dark-theme) {
      .dialog-header {
        border-color: rgba(255, 255, 255, 0.1);

        h2 {
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .step-select {
        .drop-zone {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);

          &:hover, &.drag-over {
            border-color: #667eea;
            background: rgba(102, 126, 234, 0.15);
          }

          .drop-text {
            color: rgba(255, 255, 255, 0.7);
          }
        }

        .info-text {
          background: rgba(255, 255, 255, 0.05);
        }
      }

      .step-preview {
        .summary-card {
          background: rgba(255, 255, 255, 0.05);
        }

        .summary-header {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .item-label {
          color: rgba(255, 255, 255, 0.6);
        }

        .item-value {
          color: rgba(255, 255, 255, 0.9);
        }

        .summary-item {
          background: rgba(0, 0, 0, 0.2);
        }
      }
    }
  `]
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
