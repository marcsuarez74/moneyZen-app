import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgClass],
  template: `
    <button 
      mat-icon-button 
      [attr.aria-label]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
      (click)="themeToggled.emit()"
      [class.dark-mode]="isDarkMode()">
      <mat-icon>{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    button {
      transition: all 0.3s ease;
    }
    
    button.dark-mode {
      color: #ffd54f;
    }
    
    mat-icon {
      font-size: 24px;
    }
  `]
})
export class ThemeToggleComponent {
  readonly isDarkMode = input.required<boolean>();
  readonly themeToggled = output<void>();
}
