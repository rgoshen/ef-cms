import { Button } from '../../ustc-ui/Button/Button';
import { DollarsInput } from '../../ustc-ui/DollarsInput/DollarsInput';
import { ModalDialog } from '../ModalDialog';
import { connect } from '@cerebral/react';
import { sequences, state } from 'cerebral';
import React from 'react';

export const CalculatePenaltiesModal = connect(
  {
    addPenaltyInputSequence: sequences.addPenaltyInputSequence,
    cancelSequence: sequences.dismissModalSequence,
    confirmSequence: sequences.calculatePenaltiesSequence,
    errors: state.modal.error,
    penalties: state.modal.penalties,
    showAddAnotherPenaltyButton:
      state.statisticsFormHelper.showAddAnotherPenaltyButton,
    title: state.modal.title,
    updateModalValueSequence: sequences.updateModalValueSequence,
  },
  // TODO: add logic for determining whether to display (IRS) or (USTC)
  function CalculatePenaltiesModal({
    addPenaltyInputSequence,
    cancelSequence,
    confirmSequence,
    errors,
    penalties,
    showAddAnotherPenaltyButton,
    title,
    updateModalValueSequence,
  }) {
    return (
      <ModalDialog
        cancelLabel="Cancel"
        cancelSequence={cancelSequence}
        confirmLabel="Calculate and Save"
        confirmSequence={confirmSequence}
        title={title}
      >
        {errors &&
          Object.keys(errors).map(key => {
            return (
              <div key={errors[key]}>
                <span className="usa-error-message">{errors[key]}</span>
              </div>
            );
          })}
        {penalties &&
          penalties.map((penalty, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="margin-top-3" key={index}>
              <label className="usa-label" htmlFor={`penalty_${index}`}>
                Penalty {index + 1} (IRS)
              </label>
              <DollarsInput
                className="usa-input"
                id={`penalty_${index}`}
                name={`penalties.${index}`}
                value={penalties[index].penaltyAmount}
                onValueChange={values => {
                  updateModalValueSequence({
                    key: `penalties.${index}.penaltyAmount`,
                    value: values.value,
                  });
                  updateModalValueSequence({
                    key: `penalties.${index}.inProgress`,
                    value: true,
                  });
                }}
              />
            </div>
          ))}
        {showAddAnotherPenaltyButton && (
          <Button
            link
            className="margin-top-2 modal-button-link"
            icon="plus-circle"
            onClick={() => addPenaltyInputSequence()}
          >
            Add another penalty
          </Button>
        )}
      </ModalDialog>
    );
  },
);

CalculatePenaltiesModal.displayName = 'CalculatePenaltiesModal';
