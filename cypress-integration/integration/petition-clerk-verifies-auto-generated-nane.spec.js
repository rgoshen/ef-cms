const {
  getCreateACaseButton,
  navigateTo: navigateToDocumentQC,
} = require('../support/pages/document-qc');

const {
  fillInCreateCaseFromPaperForm,
} = require('../support/pages/create-paper-petition');

const verifyPdfViewerFunctionality = ({ docketTitle, editorBodyText }) => {
  describe('verify functionality of buttons in draft pdf viewer', () => {
    it('render a full screen pdf of a draft item', () => {
      cy.intercept('GET', '**/document-download-url').as('viewFullPdf');
      cy.get('button#view-full-pdf').click();
      cy.wait('@viewFullPdf').then(({ response }) => {
        const { url } = response.body;
        cy.request(url).its('status').should('eq', 200);
      });
    });

    // edit of pdf test
    it('edit an existing draft item', () => {
      // click on edit button
      cy.get('a#draft-edit-button-not-signed').click();
      cy.get('h1#page-title').contains(`Edit ${docketTitle}`);
      cy.get('div.ql-editor p').should('have.text', editorBodyText);
    });
  });
};
exports.verifyPdfViewerFunctionality = verifyPdfViewerFunctionality;

describe('Verify functionality of autogenerated NANE after serving a case', function () {
  before(() => {
    navigateToDocumentQC('petitionsclerk');

    getCreateACaseButton().click();
  });

  const submitAfterCaseReview = () =>
    cy.get('#submit-case').scrollIntoView().click();

  const confirmSubmissionOfCase = () => cy.get('#confirm').click();
  const visitCaseDetailPage = docketNumber =>
    cy.visit(`/case-detail/${docketNumber}`);
  const confirmViewingOfCaseReciept = () =>
    cy.get('#done-viewing-paper-petition-receipt-button').click();

  it('should create a case with a NANE', () => {
    fillInCreateCaseFromPaperForm();

    cy.intercept('POST', '**/paper').as('postPaperCase');
    cy.get('#submit-case').click();
    cy.wait('@postPaperCase').then(({ response }) => {
      console.log('response.body', response.body);
      const { docketNumber } = response.body;
      cy.get('#orders-notices-auto-created-in-draft').should('exist');
      submitAfterCaseReview();
      confirmSubmissionOfCase();
      confirmViewingOfCaseReciept();
      visitCaseDetailPage(docketNumber);
    });
  });

  it('should check that Draft Tab Icon exist with count of 1', () => {
    cy.get('#tab-drafts').click();
    cy.get('.icon-tab-unread-messages-count').should('have.text', '1');
  });

  it('should check that the first item in the draft tab is a NANE', () => {
    cy.get('.document-viewer--documents-list')
      .children()
      .should('have.length', 1);

    cy.get('#docket-entry-description-0').should(
      'have.text',
      'Notice of Attachments in the Nature of Evidence',
    );
  });

  verifyPdfViewerFunctionality({
    docketTitle: 'Notice of Attachments in the Nature of Evidence Edit Title',
    editorBodyText:
      'Certain documents attached to the Petition that you filed with this Court appear to be in the nature of evidence. Please be advised that these documents have not been received into evidence by the Court. You may offer evidentiary materials to the Court at the time of trial.',
  });
});
