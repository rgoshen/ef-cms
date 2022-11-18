const React = require('react');
import { PrimaryHeader } from '../components/PrimaryHeader';
import { ReportsHeader } from '../components/ReportsHeader';
import { SelectedFiltersSection } from '../components/SelectedFiltersSection';
import { SessionAssignments } from '../../../../../../web-client/src/views/TrialSessionWorkingCopy/SessionAssignments';
import { SessionNotesSection } from '../components/SessionNotesSection';
import {
  generateCaseStatus,
  generateSelectedFilterList,
  isMemberCase,
} from '../../generateSelectedFilterList';
import classNames from 'classnames';

export const PrintableWorkingCopySessionList = ({
  filters,
  formattedCases,
  formattedTrialSession,
  sessionNotes,
  showCaseNotes,
  sort,
  userHeading,
}) => {
  const trialSessionDateRange =
    formattedTrialSession.formattedEstimatedEndDateFull
      ? `${formattedTrialSession.formattedStartDateFull} - ${formattedTrialSession.formattedEstimatedEndDateFull}`
      : `${formattedTrialSession.formattedStartDateFull}`;
  const selectedFilters = generateSelectedFilterList(filters);

  return (
    <div className="printable-working-copy-list">
      <PrimaryHeader />
      <ReportsHeader
        subtitle={trialSessionDateRange}
        title={formattedTrialSession.trialLocation}
      />
      <section className="usa-section grid-container">
        <div className="grid-row">
          <div className="grid-col-9">
            <h2 className="heading-1">{userHeading}</h2>
          </div>
        </div>
        {/* assignments begins */}
        <div className="card trial-session-card">
          <div className="content-wrapper">
            <h3 className="underlined">Assignments</h3>
            <div className="grid-container padding-x-0">
              <div className="grid-row grid-gap">
                <div className="grid-col-6">
                  <p className="label">Judge</p>
                  <p className="margin-bottom-0">
                    {formattedTrialSession.formattedJudge}
                  </p>
                  <p>{formattedTrialSession.formattedChambersPhoneNumber}</p>
                </div>
                <div className="grid-col-6">
                  <p className="label">Trial clerk</p>
                  <p>{formattedTrialSession.formattedTrialClerk}</p>
                </div>
              </div>

              <div className="grid-col-6">
                <p className="label">Court reporter</p>
                <p className="margin-bottom-0">
                  {formattedTrialSession.formattedCourtReporter}
                </p>
              </div>
              <div className="grid-col-6">
                <p className="label">IRS calendar administrator</p>
                <p className="margin-bottom-0">
                  {formattedTrialSession.formattedIrsCalendarAdministrator}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* assignments ends */}
        <SessionNotesSection sessionNotes={sessionNotes} />
        <SelectedFiltersSection
          count={formattedCases.length}
          selectedFilters={selectedFilters}
        />
        <table>
          <thead>
            <tr>
              <th
                aria-label="Docket Number"
                className="padding-left-2px no-wrap"
              >
                <span className={classNames(sort === 'docket' && 'sortActive')}>
                  Docket No.
                </span>
              </th>
              <th>Case Title</th>
              <th>
                <span
                  className={classNames(
                    sort === 'practitioner' && 'sortActive',
                  )}
                >
                  Petitioner Counsel
                </span>
              </th>
              <th>Respondent Counsel</th>
              <th>PTM</th>
              <th colSpan="2">Trial Status</th>
            </tr>
          </thead>
          <tbody>
            {formattedCases.map(formattedCase => {
              const memberCase = isMemberCase(formattedCase);
              return (
                <React.Fragment key={formattedCase.docketNumber}>
                  <tr className="vertical-align-middle-row padding-bottom-2 content-row">
                    <td
                      className={`${
                        memberCase ? 'margin-left-2' : ''
                      } docket-number-with-icon`}
                    >
                      <div
                        className={classNames(
                          `${
                            formattedCase.leadCase && 'lead-consolidated-icon'
                          } ${memberCase && 'consolidated-icon'}`,
                        )}
                        style={{ marginRight: '0.3rem' }}
                      />
                      <div>{formattedCase.docketNumberWithSuffix}</div>
                    </td>
                    <td style={{ wordBreak: 'break-word' }}>
                      {formattedCase.caseTitle}
                    </td>
                    <td>
                      {formattedCase.privatePractitioners.map(practitioner => (
                        <div key={practitioner.userId}>{practitioner.name}</div>
                      ))}
                    </td>
                    <td>
                      {formattedCase.irsPractitioners.map(respondent => (
                        <div key={respondent.userId}>{respondent.name}</div>
                      ))}
                    </td>
                    <td>{formattedCase.filingPartiesCode}</td>
                    <td>{generateCaseStatus(formattedCase.trialStatus)}</td>
                  </tr>
                  <tr className="border-bottom-0 border-top-0">
                    <td colSpan="1"></td>
                    <td colSpan="5">
                      {formattedCase.calendarNotes && (
                        <span>
                          <span className="text-bold margin-right-1">
                            Calendar Notes:
                          </span>
                          {formattedCase.calendarNotes}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-bottom-0 border-top-0">
                    <td colSpan="1"></td>
                    <td colSpan="5">
                      {showCaseNotes && formattedCase.userNotes && (
                        <span>
                          <span className="text-bold margin-right-1">
                            Notes:
                          </span>
                          {formattedCase.userNotes}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="blank-note-row">
                    <td colSpan="7"></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};
