import { Button } from '../../ustc-ui/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StateDrivenFileInput } from '../FileDocument/StateDrivenFileInput';
import { SupportingDocumentInclusionsForm } from './SupportingDocumentInclusionsForm';
import { Text } from '../../ustc-ui/Text/Text';
import { connect } from '@cerebral/react';
import { props, sequences, state } from 'cerebral';
import React from 'react';
import classNames from 'classnames';

export const SupportingDocumentForm = connect(
  {
    constants: state.constants,
    fileDocumentHelper: state.fileDocumentHelper,
    form: state.form,
    index: props.index,
    removeSupportingDocumentSequence:
      sequences.removeSupportingDocumentSequence,
    updateFileDocumentWizardFormValueSequence:
      sequences.updateFileDocumentWizardFormValueSequence,
    validateExternalDocumentInformationSequence:
      sequences.validateExternalDocumentInformationSequence,
    validationErrors: state.validationErrors,
  },
  ({
    constants,
    fileDocumentHelper,
    form,
    index,
    removeSupportingDocumentSequence,
    updateFileDocumentWizardFormValueSequence,
    validateExternalDocumentInformationSequence,
    validationErrors,
  }) => {
    return (
      <>
        <h2 className="margin-top-4">
          <div className="display-flex">
            Supporting Document {index + 1}{' '}
            <Button
              link
              className="red-warning text-left padding-0 margin-left-1"
              icon="times-circle"
              onClick={() => {
                removeSupportingDocumentSequence({ index });
              }}
            >
              Remove
            </Button>
          </div>
        </h2>
        <div className="blue-container">
          <div
            className={classNames(
              'usa-form-group',
              validationErrors.supportingDocuments &&
                validationErrors.supportingDocuments[index] &&
                validationErrors.supportingDocuments[index]
                  .supportingDocument &&
                'usa-form-group--error',
              !form.supportingDocuments[index].supportingDocument &&
                'margin-bottom-0 ',
            )}
          >
            <label
              className="usa-label"
              htmlFor={`supporting-document-${index}`}
              id={`supporting-document-${index}-label`}
            >
              Select supporting document
            </label>
            <select
              aria-describedby={`supporting-document-${index}-label`}
              className={classNames(
                'usa-select',
                validationErrors.supportingDocuments &&
                  validationErrors.supportingDocuments[index] &&
                  validationErrors.supportingDocuments[index]
                    .supportingDocument &&
                  'usa-select--error',
              )}
              id={`supporting-document-${index}`}
              name={`supportingDocuments.${index}.supportingDocument`}
              value={form.supportingDocuments[index].supportingDocument || ''}
              onChange={e => {
                updateFileDocumentWizardFormValueSequence({
                  key: `supportingDocuments.${index}.category`,
                  value: 'Supporting Document',
                });
                updateFileDocumentWizardFormValueSequence({
                  key: `supportingDocuments.${index}.documentType`,
                  value: e.target.value,
                });
                updateFileDocumentWizardFormValueSequence({
                  key: `supportingDocuments.${index}.previousDocument`,
                  value: form.documentTitle,
                });
                updateFileDocumentWizardFormValueSequence({
                  key: e.target.name,
                  value: e.target.value,
                });
                validateExternalDocumentInformationSequence();
              }}
            >
              <option value="">- Select -</option>
              {fileDocumentHelper.supportingDocumentTypeList.map(entry => {
                return (
                  <option key={entry.documentType} value={entry.documentType}>
                    {entry.documentTypeDisplay}
                  </option>
                );
              })}
            </select>
            <Text
              bind={`validationErrors.supportingDocuments.${index}.supportingDocument`}
              className="usa-error-message"
            />
          </div>

          {fileDocumentHelper.supportingDocuments[index]
            .showSupportingDocumentFreeText && (
            <div
              className={classNames(
                'usa-form-group',
                validationErrors.supportingDocuments &&
                  validationErrors.supportingDocuments[index] &&
                  validationErrors.supportingDocuments[index]
                    .supportingDocumentFreeText &&
                  'usa-form-group--error',
              )}
            >
              <label
                className="usa-label"
                htmlFor={`supporting-document-free-text-${index}`}
                id={`supporting-document-free-text-${index}-label`}
              >
                Supporting document signed by
              </label>
              <input
                aria-describedby={`supporting-document-free-text-${index}-label`}
                autoCapitalize="none"
                className="usa-input"
                id={`supporting-document-free-text-${index}`}
                name={`supportingDocuments.${index}.supportingDocumentFreeText`}
                type="text"
                value={
                  form.supportingDocuments[index].supportingDocumentFreeText ||
                  ''
                }
                onBlur={() => {
                  validateExternalDocumentInformationSequence();
                }}
                onChange={e => {
                  updateFileDocumentWizardFormValueSequence({
                    key: `supportingDocuments.${index}.freeText`,
                    value: e.target.value,
                  });
                  updateFileDocumentWizardFormValueSequence({
                    key: e.target.name,
                    value: e.target.value,
                  });
                }}
              />
              <Text
                bind={`validationErrors.supportingDocuments.${index}.supportingDocumentFreeText`}
                className="usa-error-message"
              />
            </div>
          )}

          {fileDocumentHelper.supportingDocuments[index]
            .showSupportingDocumentUpload && (
            <>
              <div
                className={classNames(
                  'usa-form-group',
                  validationErrors.supportingDocuments &&
                    validationErrors.supportingDocuments[index] &&
                    validationErrors.supportingDocuments[index]
                      .supportingDocumentFile &&
                    'usa-form-group--error',
                )}
              >
                <label
                  className={classNames(
                    'usa-label ustc-upload with-hint',
                    fileDocumentHelper.supportingDocuments[index]
                      .showSupportingDocumentValid && 'validated',
                  )}
                  htmlFor={`supporting-document-file-${index}`}
                  id={`supporting-document-file-${index}-label`}
                >
                  Upload your supporting document{' '}
                  <span className="success-message">
                    <FontAwesomeIcon icon="check-circle" size="sm" />
                  </span>
                </label>
                <span className="usa-hint">
                  File must be in PDF format (.pdf). Max file size{' '}
                  {constants.MAX_FILE_SIZE_MB}MB.
                </span>
                <StateDrivenFileInput
                  aria-describedby={`supporting-document-file-${index}-label`}
                  id={`supporting-document-file-${index}`}
                  name={`supportingDocuments.${index}.supportingDocumentFile`}
                  updateFormValueSequence="updateFileDocumentWizardFormValueSequence"
                  validationSequence="validateExternalDocumentInformationSequence"
                />
                <Text
                  bind={`validationErrors.supportingDocuments.${index}.supportingDocumentFile`}
                  className="usa-error-message"
                />
              </div>

              <SupportingDocumentInclusionsForm
                bind={`form.supportingDocuments.${index}`}
                type={`supportingDocuments.${index}`}
                validationBind={`validationErrors.supportingDocuments.${index}`}
              />
            </>
          )}
        </div>
      </>
    );
  },
);
