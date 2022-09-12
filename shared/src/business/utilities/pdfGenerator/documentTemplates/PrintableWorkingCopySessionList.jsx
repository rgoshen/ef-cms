import { CaseLink } from '../../../../../../web-client/src/ustc-ui/CaseLink/CaseLink.jsx';
import { ConsolidatedCaseIcon } from '../../../../../../web-client/src/ustc-ui/Icon/ConsolidatedCaseIcon.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const React = require('react');

export const PrintableWorkingCopySessionList = ({
  formattedCases,
  formattedTrialSession,
  nameToDisplay,
}) => {
  return (
    <>
      {/*TrialSessionDetailHeader*/}
      <div className="big-blue-header">
        <div className="grid-container">
          <div className="margin-bottom-1">
            <h1 tabIndex="-1">{formattedTrialSession.trialLocation}</h1>
            <span className="usa-tag">
              <span aria-hidden="true">
                {formattedTrialSession.formattedTerm}:{' '}
                {formattedTrialSession.computedStatus}
              </span>
            </span>
          </div>
          <p className="margin-y-0" id="case-title">
            <span>
              {formattedTrialSession.formattedStartDate}
              {formattedTrialSession.formattedEstimatedEndDate &&
                ` - ${formattedTrialSession.formattedEstimatedEndDate}`}
            </span>
          </p>
        </div>
      </div>
      {/*TrialSessionWorkingCopy*/}
      <section className="usa-section grid-container">
        <div className="grid-row">
          <div className="grid-col-9">
            <h2 className="heading-1">{nameToDisplay} - Session Copy</h2>
            <h2>Number of formatted cases: {formattedCases.length}</h2>
          </div>
        </div>
        {/*SessionNotes*/}
        <div className="case-notes">
          <div className="grid-container padding-x-0">
            <div className="grid-row grid-gap">
              <div className="tablet:grid-col-6">
                <div className="card">
                  <div className="content-wrapper">
                    <h3 className="display-inline">Session Notes</h3>
                    {/*TODO: Add session notes*/}
                    {/*<If bind="trialSessionWorkingCopy.sessionNotes">*/}
                    {/*  <div className="margin-top-1  margin-bottom-4">*/}
                    {/*    <TextView bind="trialSessionWorkingCopy.sessionNotes" />*/}
                    {/*  </div>*/}
                    {/*</If>*/}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*WorkingCopySessionList*/}
        <table>
          <thead>
            <tr>
              <th>
                <span className="display-none">
                  Consolidated Case Indicator
                </span>
              </th>
              <th
                aria-label="Docket Number"
                className="padding-left-2px no-wrap"
              >
                Docket No.
              </th>
              <th aria-label="manually added indicator"></th>
              <th>Case Title</th>
              <th>Petitioner Counsel</th>
              <th>Respondent Counsel</th>
              <th>PTM</th>
              <th colSpan="2">Trial Status</th>
            </tr>
          </thead>
          <tbody>
            {formattedCases.map(formattedCase => {
              // fix me for member cases of consolidated groups
              const indentMemberCase = false;
              return (
                <React.Fragment key={formattedCase.docketNumber}>
                  <tr className="vertical-align-middle-row">
                    <td className="consolidated-case-column">
                      <div className={indentMemberCase ? 'margin-left-2' : ''}>
                        <ConsolidatedCaseIcon caseItem={formattedCase} />
                      </div>
                    </td>
                    <td>
                      <div className={indentMemberCase ? 'margin-left-2' : ''}>
                        <CaseLink formattedCase={formattedCase} />
                      </div>
                    </td>
                    <td>
                      {formattedCase.isManuallyAdded && (
                        <span aria-label="manually added indicator">
                          <FontAwesomeIcon
                            className="mini-success"
                            icon="calendar-plus"
                          />
                        </span>
                      )}
                    </td>
                    <td className="minw-80">{formattedCase.caseTitle}</td>
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
                    <td className="minw-10">
                      {formattedCase.filingPartiesCode}
                    </td>
                    <td className="minw-30">{formattedCase.trialStatus}</td>
                    <td className="no-wrap">Add Note</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
};
// export const printableTrialSessionWorkingCopyHelper = ({ trialSession }) => {
//   const compareCasesByPractitioner = (a, b) => {
//     const aCount =
//       (a.privatePractitioners && a.privatePractitioners.length && 1) || 0;
//     const bCount =
//       (b.privatePractitioners && b.privatePractitioners.length && 1) || 0;

//     return aCount - bCount;
//   };

//   const { STATUS_TYPES, TRIAL_STATUS_TYPES } =
//     applicationContext.getConstants();

//   const { caseMetadata, filters, sort, sortOrder, userNotes } = get(
//     state.trialSessionWorkingCopy,
//   );

//   //get an array of strings of the trial statuses that are set to true
//   const trueFilters = Object.keys(pickBy(filters));

//   let formattedCases = (trialSession.calendaredCases || [])
//     .slice()
//     .filter(
//       calendaredCase =>
//         calendaredCase.status !== STATUS_TYPES.closed &&
//         calendaredCase.removedFromTrial !== true,
//     )
//     .filter(
//       calendaredCase =>
//         (trueFilters.includes('statusUnassigned') &&
//           (!caseMetadata[calendaredCase.docketNumber] ||
//             !caseMetadata[calendaredCase.docketNumber].trialStatus)) ||
//         (caseMetadata[calendaredCase.docketNumber] &&
//           trueFilters.includes(
//             caseMetadata[calendaredCase.docketNumber].trialStatus,
//           )),
//     )
//     .map(caseItem =>
//       applicationContext
//         .getUtilities()
//         .formatCaseForTrialSession({ applicationContext, caseItem }),
//     )
//     .sort(applicationContext.getUtilities().compareCasesByDocketNumber);

//   Object.keys(userNotes || {}).forEach(docketNumber => {
//     const caseToUpdate = formattedCases.find(
//       aCase => aCase.docketNumber === docketNumber,
//     );
//     if (caseToUpdate) {
//       caseToUpdate.userNotes = userNotes[docketNumber].notes;
//     }
//   });

//   trialSession.caseOrder.forEach(aCase => {
//     if (aCase.calendarNotes) {
//       const caseToUpdate = formattedCases.find(
//         theCase => theCase.docketNumber === aCase.docketNumber,
//       );
//       if (caseToUpdate) {
//         caseToUpdate.calendarNotes = aCase.calendarNotes;
//       }
//     }
//   });

//   const [leadAndUnconsolidatedCases, memberConsolidatedCases] = partition(
//     formattedCases,
//     calendaredCase => {
//       return (
//         !calendaredCase.leadDocketNumber ||
//         calendaredCase.docketNumber === calendaredCase.leadDocketNumber
//       );
//     },
//   );

//   leadAndUnconsolidatedCases.forEach(caseToUpdate => {
//     if (caseToUpdate.leadCase) {
//       caseToUpdate.consolidatedCases = memberConsolidatedCases.filter(
//         memberCase => {
//           return memberCase.leadDocketNumber === caseToUpdate.leadDocketNumber;
//         },
//       );

//       caseToUpdate.consolidatedCases.sort(
//         applicationContext.getUtilities().compareCasesByDocketNumber,
//       );
//     }
//   });

//   if (sort === 'practitioner') {
//     leadAndUnconsolidatedCases.sort(compareCasesByPractitioner);
//   }

//   if (sortOrder === 'desc') {
//     leadAndUnconsolidatedCases.reverse();
//   }

//   const trialStatusOptions = TRIAL_STATUS_TYPES.map(value => ({
//     key: camelCase(value),
//     value,
//   }));
//   const formattedCasesFromHelper = leadAndUnconsolidatedCases;
//   return formattedCasesFromHelper;
// };
