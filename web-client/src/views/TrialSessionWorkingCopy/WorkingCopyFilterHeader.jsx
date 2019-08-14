import { connect } from '@cerebral/react';
import { sequences, state } from 'cerebral';
import React from 'react';

export const WorkingCopyFilterHeader = connect(
  {
    autoSaveTrialSessionWorkingCopySequence:
      sequences.autoSaveTrialSessionWorkingCopySequence,
    trialSessionWorkingCopy: state.trialSessionWorkingCopy,
  },
  ({ autoSaveTrialSessionWorkingCopySequence, trialSessionWorkingCopy }) => {
    return (
      <div className="working-copy-filters">
        <div className="working-copy-filter--header">
          <div className="grid-row">
            <div className="grid-col-6">
              <h3>Show Cases by Trial Status</h3>
            </div>
            <div className="grid-col-6 text-right">
              <span>Total Shown: 333</span>
            </div>
          </div>
        </div>
        <div className="filter-area">
          <div className="usa-checkbox">
            <input
              checked={trialSessionWorkingCopy.filters.showAll || false}
              className="usa-checkbox__input"
              id="filters.showAll"
              name="filters.showAll"
              type="checkbox"
              onChange={e => {
                autoSaveTrialSessionWorkingCopySequence({
                  key: e.target.name,
                  value: e.target.checked,
                });
              }}
            />
            <label
              className="usa-checkbox__label show-all-label"
              htmlFor="filters.showAll"
            >
              Show All
            </label>
          </div>
        </div>
      </div>
    );
  },
);
