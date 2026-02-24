/**
 * Service de sauvegarde et restauration des données
 * Exporte toutes les données localStorage dans un ZIP
 * Permet l'import avec validation, rollback et barre de progression
 */
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BudgetState } from '../store/budget.store';
import { ProjectState } from '../store/project.store';
import { PlanState } from '../store/plan.store';
import { ExpenseRecord } from '../models/expense-record.model';
// Version de l'app (sera injectée au build)
declare const __APP_VERSION__: string;
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.7.5';

export interface BackupMetadata {
  appVersion: string;
  exportDate: string;
  exportTimestamp: number;
  checksum: string;
  platform: string;
  userAgent: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  budget: BudgetState | null;
  expenses: ExpenseRecord[];
  plan: PlanState | null;
  projects: ProjectState | null;
  theme: boolean;
  lastProcessedPayday: string | null;
}

export interface ImportSummary {
  hasBudget: boolean;
  expenseCount: number;
  hasActivePlan: boolean;
  projectCount: number;
  theme: 'dark' | 'light' | 'unknown';
  backupDate: string;
  appVersion: string;
}

export interface ImportResult {
  success: boolean;
  data: BackupData | null;
  summary: ImportSummary | null;
  errors: string[];
  warnings: string[];
}

export interface RestorePoint {
  timestamp: number;
  data: BackupData;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly STORAGE_KEYS = {
    BUDGET: 'budget_data',
    PROJECTS: 'projects_data',
    THEME: 'theme_preference',
    PLAN: 'plan_data',
    EXPENSES: 'expense-records',
    LAST_PAYDAY: 'last_processed_payday',
    RESTORE_POINT: 'moneyzen_restore_point'
  };

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  /**
   * Exporte toutes les données dans un fichier ZIP
   */
  async exportToZip(): Promise<void> {
    try {
      const backupData = this.collectAllData();
      const zip = new JSZip();

      // Ajouter les fichiers JSON
      zip.file('01-budget.json', JSON.stringify(backupData.budget, null, 2));
      zip.file('02-expenses.json', JSON.stringify(backupData.expenses, null, 2));
      zip.file('03-plan.json', JSON.stringify(backupData.plan, null, 2));
      zip.file('04-projects.json', JSON.stringify(backupData.projects, null, 2));
      zip.file('05-theme.json', JSON.stringify(backupData.theme, null, 2));
      zip.file('06-metadata.json', JSON.stringify(backupData.metadata, null, 2));

      // Ajouter un README
      const readmeContent = this.generateReadme(backupData.metadata);
      zip.file('README.txt', readmeContent);

      // Générer le ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Créer le nom de fichier avec timestamp
      const date = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `moneyzen-backup-${date}-${time}.zip`;

      // Télécharger
      saveAs(blob, filename);

      this.snackBar.open('✅ Sauvegarde créée avec succès !', 'OK', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.snackBar.open('❌ Erreur lors de la création de la sauvegarde', 'OK', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      throw error;
    }
  }

  /**
   * Importe les données depuis un fichier ZIP
   * Avec barre de progression (callback)
   */
  async importFromZip(
    file: File,
    onProgress?: (progress: number, stage: string) => void
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      data: null,
      summary: null,
      errors: [],
      warnings: []
    };

    try {
      // Étape 1: Validation du fichier (10%)
      onProgress?.(10, 'Validation du fichier...');
      
      if (!file.name.endsWith('.zip')) {
        result.errors.push('Le fichier doit être au format .zip');
        return result;
      }

      // Étape 2: Lecture du ZIP (30%)
      onProgress?.(30, 'Lecture de l\'archive...');
      const zip = await JSZip.loadAsync(file);

      // Étape 3: Validation de la structure (50%)
      onProgress?.(50, 'Validation des données...');
      const metadataFile = zip.file('06-metadata.json');
      
      if (!metadataFile) {
        result.errors.push('Fichier de métadonnées manquant. Ce n\'est pas une sauvegarde MoneyZen valide.');
        return result;
      }

      // Étape 4: Extraction et parsing (70%)
      onProgress?.(70, 'Extraction des données...');
      const backupData = await this.extractDataFromZip(zip);
      
      if (!backupData.metadata) {
        result.errors.push('Impossible de lire les métadonnées');
        return result;
      }

      // Validation du checksum
      const calculatedChecksum = this.calculateChecksum(backupData);
      if (calculatedChecksum !== backupData.metadata.checksum) {
        result.warnings.push('⚠️ Les données ont été modifiées depuis la sauvegarde (checksum différent)');
      }

      // Vérification de la version
      const backupVersion = backupData.metadata.appVersion;
      const currentVersion = APP_VERSION;
      if (backupVersion !== currentVersion) {
        result.warnings.push(`⚠️ Version différente: sauvegarde v${backupVersion}, app v${currentVersion}`);
      }

      // Étape 5: Génération du résumé (90%)
      onProgress?.(90, 'Préparation de l\'import...');
      result.summary = this.generateImportSummary(backupData);
      result.data = backupData;
      result.success = true;

      onProgress?.(100, 'Prêt à importer !');
      return result;

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      result.errors.push(`Erreur technique: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Restaure les données depuis un BackupData
   * Crée d'abord un point de restauration
   */
  async restoreFromBackup(backupData: BackupData): Promise<boolean> {
    try {
      // Créer un point de restauration avant
      this.createRestorePoint();

      // Restaurer les données
      if (backupData.budget) {
        localStorage.setItem(this.STORAGE_KEYS.BUDGET, JSON.stringify(backupData.budget));
      }

      if (backupData.expenses.length > 0) {
        localStorage.setItem(this.STORAGE_KEYS.EXPENSES, JSON.stringify(backupData.expenses));
      }

      if (backupData.plan) {
        localStorage.setItem(this.STORAGE_KEYS.PLAN, JSON.stringify(backupData.plan));
      }

      if (backupData.projects) {
        localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(backupData.projects));
      }

      localStorage.setItem(this.STORAGE_KEYS.THEME, JSON.stringify(backupData.theme));

      if (backupData.lastProcessedPayday) {
        localStorage.setItem(this.STORAGE_KEYS.LAST_PAYDAY, backupData.lastProcessedPayday);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      // En cas d'erreur, tenter le rollback
      this.rollbackToRestorePoint();
      return false;
    }
  }

  /**
   * Crée un point de restauration (sauvegarde des données actuelles)
   */
  createRestorePoint(): void {
    try {
      const currentData = this.collectAllData();
      const restorePoint: RestorePoint = {
        timestamp: Date.now(),
        data: currentData
      };
      localStorage.setItem(
        this.STORAGE_KEYS.RESTORE_POINT,
        JSON.stringify(restorePoint)
      );
    } catch (error) {
      console.error('Erreur lors de la création du point de restauration:', error);
    }
  }

  /**
   * Rollback vers le dernier point de restauration
   */
  rollbackToRestorePoint(): boolean {
    try {
      const restorePointJson = localStorage.getItem(this.STORAGE_KEYS.RESTORE_POINT);
      if (!restorePointJson) {
        console.warn('Aucun point de restauration trouvé');
        return false;
      }

      const restorePoint: RestorePoint = JSON.parse(restorePointJson);
      this.restoreFromBackup(restorePoint.data);
      
      this.snackBar.open('🔄 Données restaurées à l\'état précédent', 'OK', {
        duration: 3000
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors du rollback:', error);
      return false;
    }
  }

  /**
   * Collecte toutes les données du localStorage
   */
  private collectAllData(): BackupData {
    const budget = this.loadFromStorage<BudgetState>(this.STORAGE_KEYS.BUDGET);
    const expenses = this.loadFromStorage<ExpenseRecord[]>(this.STORAGE_KEYS.EXPENSES) || [];
    const plan = this.loadFromStorage<PlanState>(this.STORAGE_KEYS.PLAN);
    const projects = this.loadFromStorage<ProjectState>(this.STORAGE_KEYS.PROJECTS);
    const theme = this.loadFromStorage<boolean>(this.STORAGE_KEYS.THEME) || false;
    const lastProcessedPayday = localStorage.getItem(this.STORAGE_KEYS.LAST_PAYDAY);

    const metadata: BackupMetadata = {
      appVersion: APP_VERSION,
      exportDate: new Date().toISOString(),
      exportTimestamp: Date.now(),
      checksum: '', // Sera calculé après
      platform: navigator.platform,
      userAgent: navigator.userAgent
    };

    const data: BackupData = {
      metadata,
      budget,
      expenses,
      plan,
      projects,
      theme,
      lastProcessedPayday
    };

    // Calculer le checksum
    data.metadata.checksum = this.calculateChecksum(data);

    return data;
  }

  /**
   * Extrait les données d'un ZIP
   */
  private async extractDataFromZip(zip: JSZip): Promise<BackupData> {
    const data: Partial<BackupData> = {};

    // Metadata
    const metadataFile = zip.file('06-metadata.json');
    if (metadataFile) {
      const content = await metadataFile.async('string');
      data.metadata = JSON.parse(content);
    }

    // Budget
    const budgetFile = zip.file('01-budget.json');
    if (budgetFile) {
      const content = await budgetFile.async('string');
      data.budget = JSON.parse(content);
    }

    // Expenses
    const expensesFile = zip.file('02-expenses.json');
    if (expensesFile) {
      const content = await expensesFile.async('string');
      data.expenses = JSON.parse(content) || [];
    }

    // Plan
    const planFile = zip.file('03-plan.json');
    if (planFile) {
      const content = await planFile.async('string');
      data.plan = JSON.parse(content);
    }

    // Projects
    const projectsFile = zip.file('04-projects.json');
    if (projectsFile) {
      const content = await projectsFile.async('string');
      data.projects = JSON.parse(content);
    }

    // Theme
    const themeFile = zip.file('05-theme.json');
    if (themeFile) {
      const content = await themeFile.async('string');
      data.theme = JSON.parse(content);
    }

    return data as BackupData;
  }

  /**
   * Génère un résumé pour l'import
   */
  private generateImportSummary(data: BackupData): ImportSummary {
    const date = new Date(data.metadata.exportDate);
    
    return {
      hasBudget: !!data.budget,
      expenseCount: data.expenses?.length || 0,
      hasActivePlan: !!data.plan,
      projectCount: data.projects?.projects?.length || 0,
      theme: data.theme ? 'dark' : 'light',
      backupDate: date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      appVersion: data.metadata.appVersion
    };
  }

  /**
   * Calcule un checksum simple (SHA-256-like)
   */
  private calculateChecksum(data: BackupData): string {
    const str = JSON.stringify({
      budget: data.budget,
      expenses: data.expenses,
      plan: data.plan,
      projects: data.projects,
      theme: data.theme,
      lastProcessedPayday: data.lastProcessedPayday
    });
    
    // Simple hash pour détecter les modifications
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Charge depuis le localStorage
   */
  private loadFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch {
      return null;
    }
  }

  /**
   * Génère le contenu du README
   */
  private generateReadme(metadata: BackupMetadata): string {
    return `Sauvegarde MoneyZen
==================

Date d'export: ${new Date(metadata.exportDate).toLocaleString('fr-FR')}
Version de l'application: ${metadata.appVersion}
Plateforme: ${metadata.platform}

Fichiers inclus:
- 01-budget.json : Configuration du budget (revenus, charges fixes)
- 02-expenses.json : Liste des dépenses ponctuelles enregistrées
- 03-plan.json : Plan de redressement du découvert (si actif)
- 04-projects.json : Projets d'épargne
- 05-theme.json : Préférences d'affichage (thème sombre/clair)
- 06-metadata.json : Métadonnées de la sauvegarde

Comment restaurer:
1. Ouvrez l'application MoneyZen
2. Cliquez sur "Restaurer une sauvegarde"
3. Sélectionnez ce fichier ZIP
4. Confirmez l'import

⚠️ Attention: La restauration remplacera toutes vos données actuelles.

Checksum: ${metadata.checksum}
`;
  }
}
