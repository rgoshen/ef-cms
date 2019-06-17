import { connect } from '@cerebral/react';
import { state } from 'cerebral';
import React from 'react';

export const OpenCases = connect(
  {
    formattedOpenCases:
      state.formattedTrialSessionDetails.formattedEligibleCases,
  },
  ({ formattedOpenCases }) => {
    if(formattedCases) {
      return "Foo";
    } else {
      return "Bar";
    }
    }
    /*
    return (
      <React.Fragment>
        <table
          className="usa-table ustc-table trial-sessions subsection"
          id="open-sessions"
        >
          <thead>
            <tr>
              <th>Docket</th>
              <th>Case Caption</th>
              <th>Petitioner Counsel</th>
              <th>Respondent Counsel</th>
            </tr>
          </thead>
          {formattedOpenCases.map((item, idx) => (
            <tbody key={idx}>
              <tr className="eligible-cases-row">
                <td>
                  <a href={`/case-detail/${item.docketNumber}`}>
                    {item.docketNumberWithSuffix}
                  </a>
                </td>
                <td>{item.caseCaption}</td>
                <td aria-hidden="true">
                  {item.practitioners.map((practitioner, idx) => (
                    <div key={idx}>{practitioner.name}</div>
                  ))}
                </td>
                <td aria-hidden="true">{item.respondent}</td>
              </tr>
            </tbody>
          ))}
        </table>
      </React.Fragment>
    );
    */
  },
);
