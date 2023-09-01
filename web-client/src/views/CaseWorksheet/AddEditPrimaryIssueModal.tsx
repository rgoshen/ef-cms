import { BindedTextarea } from '../../ustc-ui/BindedTextarea/BindedTextarea';
import { ConfirmModal } from '../../ustc-ui/Modal/ConfirmModal';
import { FormGroup } from '../../ustc-ui/FormGroup/FormGroup';
import { connect } from '@cerebral/react';
import { state } from '@web-client/presenter/app.cerebral';
import React from 'react';

export const AddEditPrimaryIssueModal = connect(
  {
    modal: state.modal,
    validationErrors: state.validationErrors,
  },
  function AddEditPrimaryIssueModal({ modal, validationErrors }) {
    return (
      <ConfirmModal
        cancelLabel="Cancel"
        className="add-edit-note-modal"
        confirmLabel="Save"
        preventCancelOnBlur={true}
        title="Add/Edit Primary Issue"
        onCancelSequence="clearModalFormSequence"
        onConfirmSequence="updatePrimaryIssueSequence"
      >
        <h5 className="margin-bottom-4">{modal.heading}</h5>

        <FormGroup
          className="margin-bottom-2"
          errorText={validationErrors.primaryIssue}
        >
          <label className="usa-label" htmlFor="primary-issue">
            {modal.notesLabel}
          </label>
          <BindedTextarea
            aria-label="notes"
            bind="modal.primaryIssue"
            id="primary-issue"
          />
        </FormGroup>
      </ConfirmModal>
    );
  },
);

AddEditPrimaryIssueModal.displayName = 'AddEditPrimaryIssueModal';
