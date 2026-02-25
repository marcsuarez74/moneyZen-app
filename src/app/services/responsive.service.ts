/**
 * Service de détection responsive et gestion des dialogs/bottom sheets
 * Fournit des signaux pour adapter l'UI selon le device
 */
import { Injectable, signal, effect, inject } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatBottomSheet, MatBottomSheetConfig } from '@angular/material/bottom-sheet';
import { ComponentType } from '@angular/cdk/portal';
import { BackupImportDialogComponent } from '../shared/components/backup-import-dialog/backup-import-dialog.component';
import { BackupImportBottomSheetComponent } from '../shared/components/backup-import-bottom-sheet/backup-import-bottom-sheet.component';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveDialogConfig {
  component: ComponentType<unknown>;
  data?: unknown;
  dialogConfig?: MatDialogConfig;
  bottomSheetConfig?: MatBottomSheetConfig;
  fullScreenOnMobile?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  // Services injectés
  private breakpointObserver = inject(BreakpointObserver);
  private dialog = inject(MatDialog);
  private bottomSheet = inject(MatBottomSheet);

  // Signaux de breakpoint
  readonly isMobile = signal(false);
  readonly isTablet = signal(false);
  readonly isDesktop = signal(false);
  readonly deviceType = signal<DeviceType>('desktop');
  
  // Signal pour la hauteur de la fenêtre (utile pour les bottom sheets)
  readonly viewportHeight = signal(window.innerHeight);
  readonly viewportWidth = signal(window.innerWidth);

  constructor() {
    this.initBreakpointObserver();
    this.initResizeListener();
    
    // Log pour debug
    effect(() => {
      console.log(`[Responsive] Device: ${this.deviceType()}`, {
        mobile: this.isMobile(),
        tablet: this.isTablet(),
        desktop: this.isDesktop(),
        width: this.viewportWidth(),
        height: this.viewportHeight()
      });
    });
  }

  private initBreakpointObserver(): void {
    // Mobile: < 768px
    this.breakpointObserver.observe(['(max-width: 767px)']).subscribe((result: BreakpointState) => {
      this.isMobile.set(result.matches);
      this.updateDeviceType();
    });

    // Tablet: 768px - 1023px
    this.breakpointObserver.observe(['(min-width: 768px) and (max-width: 1023px)']).subscribe((result: BreakpointState) => {
      this.isTablet.set(result.matches);
      this.updateDeviceType();
    });

    // Desktop: >= 1024px
    this.breakpointObserver.observe(['(min-width: 1024px)']).subscribe((result: BreakpointState) => {
      this.isDesktop.set(result.matches);
      this.updateDeviceType();
    });
  }

  private initResizeListener(): void {
    window.addEventListener('resize', () => {
      this.viewportWidth.set(window.innerWidth);
      this.viewportHeight.set(window.innerHeight);
    });
  }

  private updateDeviceType(): void {
    if (this.isMobile()) {
      this.deviceType.set('mobile');
    } else if (this.isTablet()) {
      this.deviceType.set('tablet');
    } else {
      this.deviceType.set('desktop');
    }
  }

  /**
   * Ouvre un dialog ou bottom sheet selon le device
   * Mobile: BottomSheet (full screen optionnel)
   * Tablet/Desktop: Dialog standard
   */
  openResponsiveDialog(config: ResponsiveDialogConfig): void {
    if (this.isMobile()) {
      // Mobile: Utiliser BottomSheet
      const bsConfig: MatBottomSheetConfig = {
        data: config.data,
        panelClass: config.fullScreenOnMobile !== false ? 'fullscreen-bottom-sheet' : 'responsive-bottom-sheet',
        ...config.bottomSheetConfig
      };
      
      this.bottomSheet.open(config.component, bsConfig);
    } else {
      // Tablet/Desktop: Utiliser Dialog
      const dialogConfig: MatDialogConfig = {
        data: config.data,
        width: this.isTablet() ? '90vw' : '600px',
        maxWidth: '90vw',
        ...config.dialogConfig
      };
      
      this.dialog.open(config.component, dialogConfig);
    }
  }

  /**
   * Retourne la hauteur optimale pour un bottom sheet
   */
  getOptimalBottomSheetHeight(): string {
    const height = this.viewportHeight();
    // 90% de la hauteur pour avoir un peu de backdrop visible
    return `${Math.min(height * 0.9, 800)}px`;
  }

  /**
   * Vérifie si on doit utiliser une vue compacte
   */
  shouldUseCompactView(): boolean {
    return this.isMobile() || this.viewportWidth() < 400;
  }

  /**
   * Ouvre l'import de sauvegarde (Dialog sur desktop, Bottom Sheet sur mobile)
   */
  openBackupImport(): void {
    if (this.isMobile()) {
      this.bottomSheet.open(BackupImportBottomSheetComponent, {
        data: { isMobile: true },
        panelClass: 'fullscreen-bottom-sheet',
        hasBackdrop: true
      });
    } else {
      this.dialog.open(BackupImportDialogComponent, {
        width: this.isTablet() ? '90vw' : '500px',
        maxWidth: '500px',
        data: { isMobile: false }
      });
    }
  }
}
