import { FORMATS } from '@shared/business/utilities/DateHandler';
import {
  ROLE_PERMISSIONS,
  isAuthorized,
} from '@shared/authorization/authorizationClientService';
import { UnauthorizedError } from '@web-api/errors/errors';
import { generateCsv, mkConfig } from 'export-to-csv';
import { pick } from 'lodash';
import { stringify } from 'csv-stringify/sync';

const getCsv = (data, headers) => {
  const formattedData = data.map(item => {
    return pick(item, [
      'docketNumberWithSuffix',
      'formattedFiledDate',
      'caseTitle',
      'formattedName',
      'formattedStatus',
      'associatedJudgeFormatted',
    ]);
  });
  const lines = [headers.join(';')];
  for (let item of formattedData) {
    const line = Object.values(item).map(x => escapeCsvValue(x));
    lines.push(line.join(';'));
  }
  return lines.join('\n');
};

const escapeCsvValue = value => {
  if (!value || value.indexOf(';') === -1) return value;

  return '"' + value.replace('"', '""') + '"';
};

export const exportPendingReportInteractor = async (
  applicationContext: IApplicationContext,
  { judge, method }: { judge?: string; method?: string },
): Promise<string> => {
  const authorizedUser = applicationContext.getCurrentUser();

  if (!isAuthorized(authorizedUser, ROLE_PERMISSIONS.PENDING_ITEMS)) {
    throw new UnauthorizedError('Unauthorized');
  }

  const { foundDocuments: pendingDocuments } = await applicationContext
    .getPersistenceGateway()
    .fetchPendingItems({
      applicationContext,
      judge,
    });

  const formattedPendingItems = pendingDocuments.map(pendingItem =>
    applicationContext
      .getUtilities()
      .formatPendingItem(pendingItem, { applicationContext }),
  );

  const headers = [
    'Docket No.',
    'Date Filed',
    'Case Title',
    'Filings and Proceedings',
    'Case Status',
    'Judge',
  ];

  const today = applicationContext
    .getUtilities()
    .formatNow(FORMATS.MMDDYYYY_UNDERSCORED);

  const fileName = getFileName(judge, today);

  let csvString;
  switch (method) {
    case 'e2csv':
      csvString = getE2CSVCsv(formattedPendingItems, fileName);
      break;
    case 'csvs':
      csvString = getStringifyCsv(formattedPendingItems);
      break;
    default:
      csvString = getCsv(formattedPendingItems, headers);
  }

  return csvString;
};

const getStringifyCsv = data => {
  return stringify(data, {
    bom: true,
    columns: [
      { header: 'Docket No.', key: 'docketNumberWithSuffix' },
      { header: 'Date Filed', key: 'formattedFiledDate' },
      { header: 'Case Title', key: 'caseTitle' },
      { header: 'Filings and Proceedings', key: 'formattedName' },
      { header: 'Case Status', key: 'formattedStatus' },
      { header: 'Judge', key: 'associatedJudgeFormatted' },
    ],
    header: true,
  });
};

const getE2CSVCsv = (data, fileName) => {
  const csvConfig = mkConfig({
    columnHeaders: [
      { displayLabel: 'Docket No.', key: 'docketNumberWithSuffix' },
      { displayLabel: 'Date Filed', key: 'formattedFiledDate' },
      { displayLabel: 'Case Title', key: 'caseTitle' },
      { displayLabel: 'Filings and Proceedings', key: 'formattedName' },
      { displayLabel: 'Case Status', key: 'formattedStatus' },
      { displayLabel: 'Judge', key: 'associatedJudgeFormatted' },
    ],
    filename: fileName,
  });

  return generateCsv(csvConfig)(data);
};

const getFileName = (judgeName, date) => {
  return 'Pending Report - ' + judgeName + ' ' + date;
};
