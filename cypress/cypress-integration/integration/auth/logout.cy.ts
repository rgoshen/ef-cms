describe('Given a user is logged in to DAWSON on their desktop', () => {
  describe('When the user clicks logout', () => {
    it('Then they should be taken to the login page', () => {
      const email = 'docketclerk1@example.com';
      const password = 'Testing1234$';
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="password-input"]').type(password, {
        log: false,
      });
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="messages-banner"]');
      cy.get('[data-testid="account-menu-button"]').click();
      cy.get('[data-testid="logout-button-desktop"]').click();
      cy.get('[data-testid="login-header"]');
      cy.reload();
      cy.get('[data-testid="login-header"]');
    });

    describe('And they try to access a case directly as a URL', () => {
      it('Then they should be taken to the login page', () => {
        cy.visit('/trial-sessions');
        cy.get('[data-testid="login-header"]');
      });
    });
  });
});

describe('Given a user is logged in to DAWSON on their mobile', () => {
  beforeEach(() => {
    cy.viewport('iphone-6');
  });
  describe('When the user clicks logout', () => {
    it('Then they should be taken to the login page', () => {
      const email = 'docketclerk1@example.com';
      const password = 'Testing1234$';
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(email);
      cy.get('[data-testid="password-input"]').type(password, {
        log: false,
      });
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="messages-banner"]');
      cy.get('[data-testid="account-menu-button-mobile"]').click();
      cy.get('[data-testid="logout-button-mobile"]').click();
      cy.get('[data-testid="login-header"]');
      cy.reload();
      cy.get('[data-testid="login-header"]');
    });
  });
});
