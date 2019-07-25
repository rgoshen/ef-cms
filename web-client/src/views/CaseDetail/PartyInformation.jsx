import { EditSecondaryContactModal } from '../EditSecondaryContactModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from '@cerebral/react';
import { sequences, state } from 'cerebral';
import React from 'react';

export const PartyInformation = connect(
  {
    caseDetail: state.formattedCaseDetail,
    caseHelper: state.caseDetailHelper,
    constants: state.constants,
    editSecondaryContact: sequences.openEditSecondaryContactModalSequence,
  },
  ({ caseDetail, caseHelper, constants, editSecondaryContact }) => {
    const mainPartyInformation = () => (
      <div className="grid-container padding-x-0">
        <div className="grid-row">
          <div className="tablet:grid-col-2 hide-print">
            <p className="label">Party Type</p>
            <p>{caseDetail.partyType || 'My Party Type'}</p>
          </div>

          <div className="tablet:grid-col-2">
            {caseDetail.contactPrimary && (
              <React.Fragment>
                <p className="label" id={'primary-label'}>
                  Primary Contact
                </p>
                <div>
                  <address aria-labelledby={'primary-label'}>
                    {addressDisplay(caseDetail.contactPrimary)}
                  </address>

                  {caseHelper.showEditContactButton && (
                    <a
                      href={`/case-detail/${caseDetail.docketNumber}/contacts/primary/edit`}
                    >
                      <FontAwesomeIcon icon="edit" size="sm" />
                      Edit
                    </a>
                  )}
                </div>
              </React.Fragment>
            )}{' '}
          </div>

          <div className="tablet:grid-col-2">
            {caseDetail.contactSecondary &&
              caseDetail.contactSecondary.name && (
                <React.Fragment>
                  <p className="label" id={'secondary-label'}>
                    Secondary Contact
                  </p>
                  <div>
                    <address aria-labelledby={'secondary-label'}>
                      {caseDetail.contactSecondary.name &&
                        addressDisplay(caseDetail.contactSecondary)}
                    </address>
                    {caseHelper.showEditContactButton && (
                      <button
                        className="usa-button usa-button--unstyled"
                        onClick={() => editSecondaryContact()}
                      >
                        <FontAwesomeIcon icon="question-circle" size="sm" />
                        Why can’t I edit this?
                      </button>
                    )}
                  </div>
                </React.Fragment>
              )}{' '}
          </div>

          {caseDetail.practitioners &&
            caseDetail.practitioners.map((practitioner, index) => (
              <div className="tablet:grid-col-2" key={index}>
                {index === 0 && (
                  <p className="label" id={'practitioner-label'}>
                    Petitioner Counsel
                  </p>
                )}
                <div>
                  <address aria-labelledby={'practitioner-label'}>
                    {practitioner.name &&
                      addressDisplay({
                        ...practitioner,
                        address1: practitioner.addressLine1,
                        address2: practitioner.addressLine2,
                        address3: practitioner.addressLine3,
                      })}
                  </address>
                </div>
              </div>
            ))}

          {caseDetail.respondents &&
            caseDetail.respondents.map((respondent, index) => (
              <div className="tablet:grid-col-2" key={index}>
                {index === 0 && (
                  <p className="label" id={'respondent-label'}>
                    Respondent Information
                  </p>
                )}
                <div>
                  <address aria-labelledby={'respondent-label'}>
                    {respondent.name &&
                      addressDisplay({
                        ...respondent,
                        address1: respondent.addressLine1,
                        address2: respondent.addressLine2,
                        address3: respondent.addressLine3,
                      })}
                  </address>
                </div>
              </div>
            ))}
        </div>
      </div>
    );

    const addressDisplay = contact => {
      return (
        <React.Fragment>
          <p className="margin-top-0">
            {contact.name}
            {contact.inCareOf && (
              <span>
                <br />
                c/o {contact.inCareOf}
              </span>
            )}
          </p>

          {contact.title && <p>{contact.title}</p>}
          <p>
            <span className="address-line">{contact.address1}</span>
            <span className="address-line">{contact.address2}</span>
            {contact.address3 && (
              <span className="address-line">{contact.address3}</span>
            )}
            <span className="address-line">
              {contact.city && `${contact.city}, `}
              {contact.state} {contact.postalCode}
            </span>
            <span className="address-line">
              {contact.countryType === constants.COUNTRY_TYPES.INTERNATIONAL &&
                contact.country}
            </span>
          </p>
          {contact.phone && <p>{contact.phone}</p>}
          {contact.email && <p>{contact.email}</p>}
        </React.Fragment>
      );
    };
    return (
      <div className="subsection party-information">
        <div className="only-large-screens">
          <div className="card">
            <div className="content-wrapper">
              <h3 className="underlined">Party Information</h3>
              {mainPartyInformation()}
            </div>
          </div>
        </div>
        <div className="only-small-screens">
          <h3>Party Information</h3>
          {mainPartyInformation()}
        </div>

        {caseHelper.showEditSecondaryContactModal && (
          <EditSecondaryContactModal />
        )}
      </div>
    );
  },
);
