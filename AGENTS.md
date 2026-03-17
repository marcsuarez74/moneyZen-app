# Agent Guidelines for MoneyZen Budget App

This is an Angular 19+ PWA budget management application using signals, standalone components, and Material Design. Code is in French (user-facing) but English for internals.

## Build/Test Commands

```bash
# Development server
npm start  # or: npm run config && ng serve

# Build
npm run build        # Development build
npm run build:prod   # Production build with service worker

# Testing
npm test             # Run Karma tests (watch mode)
npm run test:ci      # Run tests once, headless (for CI)
ng test --include='**/name.component.spec.ts'  # Single test file

# E2E testing
npm run e2e          # Open Cypress UI
npm run e2e:ci       # Run Cypress headless

# Linting & Formatting
npm run lint         # Run ESLint
npm run lint:fix     # Fix auto-fixable ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting without writing
```

## Code Style Guidelines

### TypeScript/Angular

- **Use standalone components** - No NgModules, always `standalone: true`
- **Use dependency injection with `inject()`** instead of constructor parameters
- **Use signal-based store (@ngrx/signals)** for state management
- **Angular primitives**: `computed()`, `effect()`, `signal()` from @angular/core
- **Strict TypeScript**: Full strict mode enabled

```typescript
// Good - use inject()
private storageService = inject(LocalStorageService);

// Bad - constructor injection
constructor(private storage: LocalStorageService) {}
```

### Naming Conventions

- **Components**: PascalCase with `Component` suffix (e.g., `BudgetDashboardPageComponent`)
- **Selectors**: `app-` prefix, kebab-case (e.g., `app-budget-dashboard`)
- **Services**: PascalCase with `Service` suffix (e.g., `BudgetOptimizationService`)
- **Interfaces**: PascalCase without prefix (e.g., `BudgetState`, `Expense`)
- **Types**: PascalCase (e.g., `ExpenseCategory`, `DeviceType`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Files**: kebab-case for all files (e.g., `local-storage.service.ts`)

### Imports

```typescript
// Order: Angular core -> Angular modules/libs -> RxJS -> Internal (longest to shortest path)
import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorSubject } from 'rxjs';
import { BudgetStore } from '../store/budget.store';
import { Expense } from '../models/budget.model';
```

### Formatting (Prettier)

- **Print width**: 100 chars (TypeScript), 120 chars (HTML)
- **Quotes**: Single quotes for TS/JS, double for SCSS
- **Indent**: 2 spaces, no tabs
- **Trailing commas**: ES5 style (always where valid)
- **Always** run `npm run format` before committing

### ESLint Critical Rules

- **NO unused imports** - enforced via `unused-imports/no-unused-imports: 'error'`
- **NO unused variables** - prefix with `_` to ignore (e.g., `_unused`)
- **Angular selectors**: Elements must use `app-` prefix in kebab-case
- **Directives**: Use attribute style with `app` prefix in camelCase

### Error Handling

```typescript
// Console errors for critical issues
console.error('Error saving to localStorage:', error);

// Use try/catch for storage operations
private saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage [${key}]:`, error);
  }
}
```

### Project Structure

```
src/
  app/
    features/         # Feature modules (budget, projects, settings)
    core/            # Singleton services (update, push notifications)
    shared/          # Reusable components, pipes
    services/        # Business logic services
    store/           # Signal stores (budget.store.ts, plan.store.ts)
    models/          # TypeScript interfaces and types
    ui/              # Presentational components
```

### Git Hooks

The project uses `husky` + `lint-staged`. All commits trigger:

1. ESLint auto-fix
2. Prettier formatting
3. Unit test validation (CI only)

**Always ensure code passes pre-commit checks.**

### Key Technologies

- Angular 19 (standalone, signals, new control flow)
- Angular Material + CDK
- NgRx Signals for state management
- RxJS for async operations
- Karma + Jasmine for unit tests
- Cypress for E2E testing
- Firebase (hosting, functions, messaging)
- Service Worker for PWA features

### Testing Patterns

```typescript
// Mock service workers
class MockSwUpdate {
  isEnabled = false;
  versionUpdates = of();
}

// TestBed setup
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [ComponentUnderTest],
    providers: [{ provide: SwUpdate, useClass: MockSwUpdate }],
  }).compileComponents();
});
```

### Accessibility (A11y)

- Always include alt text for images
- Keyboard navigation support
- ARIA attributes for custom components
- ESLint enforces: `click-events-have-key-events`, `no-positive-tabindex`, etc.
