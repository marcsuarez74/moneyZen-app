import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

export interface BankGuide {
  id: string;
  name: string;
  icon: string;
  color: string;
  steps: string[];
  tips: string[];
}

@Component({
  selector: 'app-export-guide-step',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatChipsModule
  ],
  templateUrl: './export-guide-step.component.html',
  styleUrls: ['./export-guide-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportGuideStepComponent {
  @Input() selectedBank: BankGuide | null = null;
}
