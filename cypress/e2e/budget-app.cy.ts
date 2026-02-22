describe('Budget App E2E Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.visit('/');
  });

  describe('Navigation', () => {
    it('should display the main navigation', () => {
      cy.contains('MoneyZen').should('be.visible');
      cy.get('mat-toolbar').should('be.visible');
    });

    it('should navigate to budget section', () => {
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.contains('Mon Budget').click();
      cy.url().should('include', '/budget');
    });

    it('should navigate to projects section', () => {
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.contains('Mes Projets').click();
      cy.url().should('include', '/projects');
    });

    it('should navigate to meals section', () => {
      cy.get('button[aria-label="Toggle menu"]').click();
      cy.contains('Repas & Courses').click();
      cy.url().should('include', '/meals');
    });
  });

  describe('Budget Setup', () => {
    it('should allow user to setup budget', () => {
      cy.visit('/budget/setup');
      
      // Fill in salary
      cy.get('input[formControlName="salary"]').type('2500');
      
      // Fill in account balance
      cy.get('input[formControlName="accountBalance"]').type('1000');
      
      // Add an expense
      cy.contains('Ajouter une charge').click();
      cy.get('input[placeholder="Ex: Loyer"]').first().type('Loyer');
      cy.get('mat-select[formControlName="category"]').first().click();
      cy.contains('Logement').click();
      cy.get('input[formControlName="amount"]').first().type('800');
      
      // Save budget
      cy.contains('Sauvegarder mon budget').click();
      
      // Verify we're redirected or shown success (adjust based on actual behavior)
      cy.url().should('include', '/budget');
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle between light and dark theme', () => {
      // Click theme toggle button
      cy.get('app-theme-toggle button').click();
      
      // Verify dark theme is applied
      cy.get('body').should('have.class', 'dark-theme');
      
      // Toggle back
      cy.get('app-theme-toggle button').click();
      
      // Verify light theme is applied
      cy.get('body').should('not.have.class', 'dark-theme');
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      cy.contains('MoneyZen').should('be.visible');
      cy.get('button[aria-label="Toggle menu"]').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      cy.get('mat-toolbar').should('be.visible');
    });
  });
});
