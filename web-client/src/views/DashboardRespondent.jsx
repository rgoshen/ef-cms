import { connect } from '@cerebral/react';
import React from 'react';
import { state } from 'cerebral';

import SuccessNotification from './SuccessNotification';
import ErrorNotification from './ErrorNotification';

export default connect(
  { caseList: state.formattedCases },
  function DashboardRespondent({ caseList }) {
    return (
      <section className="usa-section usa-grid">
        <h1 tabIndex="-1">Respondent Dashboard</h1>
        <SuccessNotification />
        <ErrorNotification />
        <table className="responsive-table" id="workQueue">
          <thead>
            <tr>
              <th>Docket number</th>
              <th>Petitioner name</th>
              <th>Date filed</th>
            </tr>
          </thead>
          <tbody>
            {!caseList.length && (
              <tr>
                <td colSpan="4">(none)</td>
              </tr>
            )}
            {caseList.map(item => (
              <tr key={item.docketNumber}>
                <td className="responsive-title">
                  <span className="responsive-label">Docket number</span>
                  <a href={'/case-detail/' + item.docketNumber}>
                    {item.docketNumberWithSuffix}
                  </a>
                </td>
                <td>
                  <span className="responsive-label">Petitioner name</span>
                  {item.userId}
                </td>
                <td>
                  <span className="responsive-label">Date filed</span>
                  {item.createdAtFormatted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  },
);
