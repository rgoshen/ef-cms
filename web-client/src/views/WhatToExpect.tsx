import { Button } from '../ustc-ui/Button/Button';
import { Focus } from '@web-client/ustc-ui/Focus/Focus';
import React from 'react';

const CaselessNotification = () => {
  return (
    <div
      aria-live="polite"
      className="usa-alert usa-alert--error"
      data-testid="error-alert"
      role="alert"
    >
      <div className="usa-alert__body">
        <Focus>
          <h2 className="usa-alert__text">
            Have you already filed a petition by mail or want electronic access
            to your existing case?
          </h2>
        </Focus>
        <p className="usa-alert__text">
          Do not start a new case. Email{' '}
          <a
            href={
              'mailto:dawson.support@ustaxcourt.gov?subject=eAccess to existing case'
            }
          >
            dawson.support@ustaxcourt.gov
          </a>{' '}
          with your case&apos;s docket number (e.g. 12345-67) to get access to
          your existing case.
        </p>
      </div>
    </div>
  );
};

export const WhatToExpect = () => (
  <>
    <CaselessNotification />
    <h2>What to Expect When Filing a Case Online</h2>
    <p>
      To file a case with the Tax Court, you’ll need to submit the following
      items. After the case has been processed, you&apos;ll be able to log in at
      any time to view the status and take action on the case.
    </p>
    <div className="icon-list">
      <span className="description-wrapper">
        <p className="label">1. Petition form</p>
        <p>
          This is the document where that explains why you disagree with the
          Internal Revenue Service (IRS). There are two methods to add the
          Petition:
          <ul>
            <li>
              Complete and upload the Court&apos;s standard Petition Form.{' '}
              <Button
                link
                className="usa-link--external text-left mobile-text-wrap"
                href="https://www.ustaxcourt.gov/resources/forms/Petition_Simplified_Form_2.pdf"
                icon="file-pdf"
                iconColor="blue"
                overrideMargin="margin-right-1"
                rel="noopener noreferrer"
                target="_blank"
              >
                Petition form (T.C. Form 2)
              </Button>
            </li>
            <li>
              Upload your own Petition that complies with the requirements of
              the{' '}
              <Button
                link
                className="usa-link--external text-left mobile-text-wrap"
                href="https://www.ustaxcourt.gov/resources/forms/Petition_Simplified_Form_2.pdf" // get correct link
                icon="file-pdf"
                iconColor="blue"
                overrideMargin="margin-right-1"
                rel="noopener noreferrer"
                target="_blank"
              >
                Tax Court Rules of Practice and Procedure.
              </Button>
            </li>
          </ul>
        </p>
        <p className="label">2. PDF of your IRS Notice(s)</p>
        <p>
          If you recieved a Notice(s) from the IRS:
          <ol type="a">
            <li>
              Include a copy of the Notices you received with the Petition.{' '}
            </li>
            <li>
              Remove or block out (redact) your Social Security Number (SSN),
              Tax Identification Number (TIN) , or Employer Identification
              Number (EIN) on a COPY of the IRS Notice(s) or in a manner that
              does not permanently alter the original IRS Notice(s).
            </li>
            <li>The Notice(s) will be part of the case record.</li>
          </ol>
        </p>
        <p className="label">
          3. Statement of Taxpayer Identification Number (STIN)
        </p>
        <p>
          This is used to help the IRS identify who you are. This is the only
          document that should contain your SSN, TIN, OR EIN. The STIN will{' '}
          <span className="text-bold">not</span> be visible as part of the case
          record.
          <br />
          <Button
            link
            className="usa-link--external text-left mobile-text-wrap"
            href="https://www.ustaxcourt.gov/resources/forms/Form_4_Statement_of_Taxpayer_Identification_Number.pdf"
            icon="file-pdf"
            iconColor="blue"
            overrideMargin="margin-right-1"
            rel="noopener noreferrer"
            target="_blank"
          >
            Statement of Taxpayer Identification Number (T.C. Form 4)
          </Button>
        </p>

        <p className="label">
          4. (If filing for a business) Corporate Disclosure Statement (CDS)
        </p>
        <p>
          If you’re filing on behalf of a business (this includes a corporation,
          partnership, and LLC), you’ll need to complete this to provide the
          court additional information about corporate interests in the
          business.
          <br />
          <Button
            link
            className="usa-link--external text-left mobile-text-wrap"
            href="https://www.ustaxcourt.gov/resources/forms/Corporate_Disclosure_Statement_Form.pdf"
            icon="file-pdf"
            iconColor="blue"
            overrideMargin="margin-right-1"
            rel="noopener noreferrer"
            target="_blank"
          >
            Corporate Disclosure Statement (T.C. Form 6)
          </Button>
        </p>
        <p className="label">5. $60 filing fee</p>
        <p>
          After you submit your case, you&apos;ll be asked to pay a $60 filing
          fee.
        </p>
      </span>
      <span className="placeholder" />
    </div>
    <div className="margin-bottom-30px">
      <h3>Deadline to File</h3>
      <p>
        You may have received a notice in the mail from the IRS. The IRS notice
        may show the last date to file or the number of days you have to file a
        petition.{' '}
        <span className="text-bold">
          In most cases, the Court must receive your electronically filed
          Petition no later than 11:59 pm Eastern on the last day to file.{' '}
        </span>
        Petitions received after this date may be untimely and your case may be
        dismissed for lack of jurisdiction.
      </p>
    </div>
    <Button
      className="margin-right-0"
      data-testid="file-a-petition"
      href="/before-filing-a-petition"
      icon="file"
      id="file-a-petition"
    >
      Start a Case
    </Button>
  </>
);

WhatToExpect.displayName = 'WhatToExpect';
