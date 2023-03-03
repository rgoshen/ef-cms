import {
  AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES,
  COURT_ISSUED_EVENT_CODES,
  DOCUMENT_NOTICE_EVENT_CODES,
  DOCUMENT_PROCESSING_STATUS_OPTIONS,
  EXTERNAL_DOCUMENT_TYPES,
  NOTICE_OF_CHANGE_CONTACT_INFORMATION_EVENT_CODES,
  PARTIES_CODES,
  PRACTITIONER_ASSOCIATION_DOCUMENT_TYPES,
  ROLES,
  TRACKED_DOCUMENT_TYPES_EVENT_CODES,
  UNSERVABLE_EVENT_CODES,
} from './EntityConstants';
import { DOCKET_ENTRY_VALIDATION_RULES } from './EntityValidationConstants';
import {
  IValidationEntity,
  joiValidationDecorator,
  validEntityDecorator,
} from './JoiValidationDecorator';
import { User } from './User';
import { WorkItem } from './WorkItem';
import {
  createISODateAtStartOfDayEST,
  createISODateString,
} from '../utilities/DateHandler';

export class DocketEntryClass {
  public entityName: string;
  public action?: string;
  public additionalInfo?: string;
  public additionalInfo2?: string;
  public addToCoversheet?: boolean;
  public archived?: boolean;
  public attachments?: string;
  public certificateOfService?: string;
  public certificateOfServiceDate?: string;
  public createdAt: string;
  public date?: string;
  public docketEntryId: string;
  public docketNumber: string;
  public docketNumbers?: string;
  public documentContentsId?: string;
  public documentIdBeforeSignature?: string;
  public documentTitle: string;
  public documentType: string;
  public eventCode: string;
  public filedBy?: string;
  public filingDate: string;
  public freeText?: string;
  public freeText2?: string;
  public hasOtherFilingParty?: boolean;
  public hasSupportingDocuments?: boolean;
  public index?: number;
  public isAutoGenerated?: boolean;
  public isFileAttached?: boolean;
  public isLegacy?: boolean;
  public editState?: string;
  public isLegacySealed?: boolean;
  public isLegacyServed?: boolean;
  public isMinuteEntry: boolean;
  public isOnDocketRecord: boolean;
  public isPaper?: boolean;
  public isPendingService?: boolean;
  public isSealed?: boolean;
  public isStricken?: boolean;
  public lodged?: string;
  public mailingDate?: string;
  public numberOfPages?: number;
  public objections?: string;
  public sealedTo?: string;
  public filers: string[];
  public ordinalValue?: string;
  public otherFilingParty?: string;
  public amicusCuriae?: string;
  public partyIrsPractitioner?: string;
  public processingStatus: string;
  public receivedAt: string;
  public relationship?: string;
  public scenario?: string;
  public secondaryDocument?: string;
  public servedAt?: string;
  public servedPartiesCode?: string;
  public serviceDate?: string;
  public serviceStamp?: string;
  public strickenAt?: string;
  public trialLocation?: string;
  public supportingDocument?: string;
  public userId: string;
  public privatePractitioners?: any[];
  public servedParties?: any[];
  public signedAt?: string;
  public draftOrderState: object;
  public stampData: object;
  public isDraft?: boolean;
  public judge?: string;
  public judgeUserId?: string;
  public pending: boolean;
  public previousDocument?: {
    docketEntryId: string;
    documentTitle: string;
    documentType: string;
  };
  public qcAt?: string;
  public qcByUserId?: string;
  public signedByUserId?: string;
  public signedJudgeName?: string;
  public signedJudgeUserId?: string;
  public strickenBy?: string;
  public strickenByUserId?: string;
  public workItem?: any;

  // Keeping this constructor setup like this so we get the typescript safety, but the
  // joi validation proxy invokes init on behalf of the constructor, so we keep these unused arguments.
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rawDocketEntry: any,
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      applicationContext,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      petitioners,
    }: { applicationContext: IApplicationContext; petitioners?: any[] },
  ) {
    this.entityName = 'DocketEntry';
  }

  init(
    rawDocketEntry,
    {
      applicationContext,
      petitioners = [],
      filtered = false,
    }: {
      applicationContext: IApplicationContext;
      petitioners: any[];
      filtered?: boolean;
    },
  ) {
    if (!applicationContext) {
      throw new TypeError('applicationContext must be defined');
    }
    if (
      !filtered ||
      User.isInternalUser(applicationContext.getCurrentUser().role)
    ) {
      this.initForUnfilteredForInternalUsers(rawDocketEntry, {
        applicationContext,
      });
    }

    this.action = rawDocketEntry.action;
    this.additionalInfo = rawDocketEntry.additionalInfo;
    this.additionalInfo2 = rawDocketEntry.additionalInfo2;
    this.addToCoversheet = rawDocketEntry.addToCoversheet || false;
    this.archived = rawDocketEntry.archived;
    this.attachments = rawDocketEntry.attachments;
    this.certificateOfService = rawDocketEntry.certificateOfService;
    this.certificateOfServiceDate = rawDocketEntry.certificateOfServiceDate;
    this.createdAt = rawDocketEntry.createdAt || createISODateString();
    this.date = rawDocketEntry.date;
    this.docketEntryId =
      rawDocketEntry.docketEntryId || applicationContext.getUniqueId();
    this.docketNumber = rawDocketEntry.docketNumber;
    this.docketNumbers = rawDocketEntry.docketNumbers;
    this.documentContentsId = rawDocketEntry.documentContentsId;
    this.documentIdBeforeSignature = rawDocketEntry.documentIdBeforeSignature;
    this.documentTitle = rawDocketEntry.documentTitle;
    this.documentType = rawDocketEntry.documentType;
    this.eventCode = rawDocketEntry.eventCode;
    this.filedBy = rawDocketEntry.filedBy;
    this.filingDate = rawDocketEntry.filingDate || createISODateString();
    this.freeText = rawDocketEntry.freeText;
    this.freeText2 = rawDocketEntry.freeText2;
    this.hasOtherFilingParty = rawDocketEntry.hasOtherFilingParty;
    this.hasSupportingDocuments = rawDocketEntry.hasSupportingDocuments;
    this.index = rawDocketEntry.index;
    this.isAutoGenerated = rawDocketEntry.isAutoGenerated;
    this.isFileAttached = rawDocketEntry.isFileAttached;
    this.isLegacy = rawDocketEntry.isLegacy;
    this.isLegacySealed = rawDocketEntry.isLegacySealed;
    this.isLegacyServed = rawDocketEntry.isLegacyServed;
    this.isMinuteEntry = rawDocketEntry.isMinuteEntry || false;
    this.isOnDocketRecord = rawDocketEntry.isOnDocketRecord || false;
    this.isPaper = rawDocketEntry.isPaper;
    this.isPendingService = rawDocketEntry.isPendingService;
    this.isSealed = rawDocketEntry.isSealed;
    this.isStricken = rawDocketEntry.isStricken || false;
    this.lodged = rawDocketEntry.lodged;
    this.mailingDate = rawDocketEntry.mailingDate;
    this.numberOfPages = rawDocketEntry.numberOfPages;
    this.objections = rawDocketEntry.objections;
    this.sealedTo = rawDocketEntry.sealedTo;
    this.filers = rawDocketEntry.filers || [];
    this.ordinalValue = rawDocketEntry.ordinalValue;
    this.otherFilingParty = rawDocketEntry.otherFilingParty;
    this.amicusCuriae = rawDocketEntry.amicusCuriae;
    this.partyIrsPractitioner = rawDocketEntry.partyIrsPractitioner;
    this.processingStatus = rawDocketEntry.processingStatus || 'pending';
    this.receivedAt = createISODateAtStartOfDayEST(rawDocketEntry.receivedAt);
    this.relationship = rawDocketEntry.relationship;
    this.scenario = rawDocketEntry.scenario;
    if (rawDocketEntry.scenario === 'Nonstandard H') {
      this.secondaryDocument = rawDocketEntry.secondaryDocument;
    }
    this.servedAt = rawDocketEntry.servedAt;
    this.servedPartiesCode = rawDocketEntry.servedPartiesCode;
    this.serviceDate = rawDocketEntry.serviceDate;
    this.serviceStamp = rawDocketEntry.serviceStamp;
    this.strickenAt = rawDocketEntry.strickenAt;
    this.supportingDocument = rawDocketEntry.supportingDocument;
    this.trialLocation = rawDocketEntry.trialLocation;

    // only share the userId with an external user if it is the logged in user
    if (applicationContext.getCurrentUser().userId === rawDocketEntry.userId) {
      this.userId = rawDocketEntry.userId;
    }

    // only use the privatePractitioner name
    if (Array.isArray(rawDocketEntry.privatePractitioners)) {
      this.privatePractitioners = rawDocketEntry.privatePractitioners.map(
        item => {
          return {
            name: item.name,
            partyPrivatePractitioner: item.partyPrivatePractitioner,
          };
        },
      );
    }

    if (Array.isArray(rawDocketEntry.servedParties)) {
      this.servedParties = rawDocketEntry.servedParties.map(item => {
        return {
          email: item.email,
          name: item.name,
          role: item.role,
        };
      });
    } else {
      this.servedParties = rawDocketEntry.servedParties;
    }

    if (DOCUMENT_NOTICE_EVENT_CODES.includes(rawDocketEntry.eventCode)) {
      this.signedAt = rawDocketEntry.signedAt || createISODateString();
    }

    this.generateFiledBy(petitioners);
  }

  initForUnfilteredForInternalUsers(rawDocketEntry, { applicationContext }) {
    this.editState = rawDocketEntry.editState;
    this.draftOrderState = rawDocketEntry.draftOrderState;
    this.stampData = rawDocketEntry.stampData || {};
    this.isDraft = rawDocketEntry.isDraft || false;
    this.judge = rawDocketEntry.judge;
    this.judgeUserId = rawDocketEntry.judgeUserId;
    this.pending =
      rawDocketEntry.pending === undefined
        ? DocketEntry.isPendingOnCreation(rawDocketEntry)
        : rawDocketEntry.pending;
    if (rawDocketEntry.previousDocument) {
      this.previousDocument = {
        docketEntryId: rawDocketEntry.previousDocument.docketEntryId,
        documentTitle: rawDocketEntry.previousDocument.documentTitle,
        documentType: rawDocketEntry.previousDocument.documentType,
      };
    }
    this.qcAt = rawDocketEntry.qcAt;
    this.qcByUserId = rawDocketEntry.qcByUserId;
    this.signedAt = rawDocketEntry.signedAt;
    this.signedByUserId = rawDocketEntry.signedByUserId;
    this.signedJudgeName = rawDocketEntry.signedJudgeName;
    this.signedJudgeUserId = rawDocketEntry.signedJudgeUserId;
    this.strickenBy = rawDocketEntry.strickenBy;
    this.strickenByUserId = rawDocketEntry.strickenByUserId;
    this.userId = rawDocketEntry.userId;
    this.workItem = rawDocketEntry.workItem
      ? new WorkItem(rawDocketEntry.workItem, { applicationContext })
      : undefined;
  }

  /**
   *
   * @param {WorkItem} workItem the work item to add to the document
   */
  setWorkItem(workItem) {
    this.workItem = workItem;
  }

  /**
   * sets the document as archived (used to hide from the ui)
   *
   */
  archive() {
    this.archived = true;
  }

  /**
   * Mark a docket entry as served
   *
   * @param {Array} servedParties the list of parties to serve the docket entry on
   * @returns {DocketEntry} the docket entry that was marked as served
   */
  setAsServed(servedParties = null) {
    this.servedAt = createISODateString();
    this.draftOrderState = null;

    if (servedParties) {
      this.servedParties = servedParties;
      this.servedPartiesCode = getServedPartiesCode(servedParties);
    }
    return this;
  }

  /**
   * Determines if the deadline should be auto-generated for the docket entry
   *
   * @returns {Boolean} true or false if the deadline should be auto-generated
   */
  shouldAutoGenerateDeadline() {
    return AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES.some(
      item => item.eventCode === this.eventCode,
    );
  }

  /**
   * Gets the auto-generated deadline description for the docket entry
   *
   * @returns {String} the deadline description
   */
  getAutoGeneratedDeadlineDescription() {
    return AUTO_GENERATED_DEADLINE_DOCUMENT_TYPES.find(
      item => item.eventCode === this.eventCode,
    ).deadlineDescription;
  }

  /**
   * generates the filedBy string from parties selected for the document
and contact info from the raw docket entry
   *
   * @param {Array} petitioners the petitioners on the case the docket entry belongs
   * to
   */
  generateFiledBy(petitioners) {
    const isNoticeOfContactChange =
      NOTICE_OF_CHANGE_CONTACT_INFORMATION_EVENT_CODES.includes(this.eventCode);

    const shouldGenerateFiledBy =
      !(isNoticeOfContactChange && this.isAutoGenerated) && !isServed(this);

    if (shouldGenerateFiledBy) {
      let partiesArray = [];
      const privatePractitionerIsFiling = this.privatePractitioners?.some(
        practitioner => practitioner.partyPrivatePractitioner,
      );

      if (this.amicusCuriae) {
        this.filedBy = this.amicusCuriae;
        return;
      }

      if (privatePractitionerIsFiling) {
        Array.isArray(this.privatePractitioners) &&
          this.privatePractitioners.forEach(practitioner => {
            practitioner.partyPrivatePractitioner &&
              partiesArray.push(practitioner.name);
          });
      } else {
        this.partyIrsPractitioner && partiesArray.push('Resp.');

        const petitionersArray = [];
        this.filers.forEach(contactId =>
          petitioners.forEach(p => {
            if (p.contactId === contactId) {
              petitionersArray.push(p.name);
            }
          }),
        );

        if (petitionersArray.length === 1) {
          partiesArray.push(`Petr. ${petitionersArray[0]}`);
        } else if (petitionersArray.length > 1) {
          partiesArray.push(`Petrs. ${petitionersArray.join(' & ')}`);
        }
      }

      const filedByArray = [];
      if (partiesArray.length) {
        filedByArray.push(partiesArray.join(' & '));
      }
      if (this.otherFilingParty) {
        filedByArray.push(this.otherFilingParty);
      }

      const filedByString = filedByArray.join(', ');
      if (filedByString) {
        this.filedBy = filedByString;
      }
    }
  }

  /**
   * attaches a signedAt date to the document
   *
   * @param {string} signByUserId the user id of the user who signed the document
   * @param {string} signedJudgeName the judge's signature for the document
   */
  setSigned(signByUserId, signedJudgeName) {
    this.signedByUserId = signByUserId;
    this.signedJudgeName = signedJudgeName;
    this.signedAt = createISODateString();
  }

  /**
   * attaches a qc date and a user to the document
   *
   * @param {object} user the user completing QC process
   */
  setQCed(user) {
    this.qcByUserId = user.userId;
    this.qcAt = createISODateString();
  }

  /**
   * Unsets signature related fields on the docket entry
   */
  unsignDocument() {
    this.signedAt = null;
    this.signedJudgeName = null;
    this.signedJudgeUserId = null;
    this.signedByUserId = null;
  }

  /**
   * Sets the docket entry's processing status as complete
   */
  setAsProcessingStatusAsCompleted() {
    this.processingStatus = DOCUMENT_PROCESSING_STATUS_OPTIONS.COMPLETE;
  }

  /**
   * Determines whether or not the docket entry is of a document
   * type that is automatically served
   *
   * @returns {boolean} true if the docket entry should be automatically served,
   *  otherwise false
   */
  isAutoServed() {
    const isExternalDocumentType = EXTERNAL_DOCUMENT_TYPES.includes(
      this.documentType,
    );

    const isPractitionerAssociationDocumentType =
      PRACTITIONER_ASSOCIATION_DOCUMENT_TYPES.includes(this.documentType);

    // if fully concatenated document title includes the word Simultaneous, do not auto-serve
    const isSimultaneous = (this.documentTitle || this.documentType).includes(
      'Simultaneous',
    );

    return (
      (isExternalDocumentType || isPractitionerAssociationDocumentType) &&
      !isSimultaneous
    );
  }

  /**
   * Determines if the docket entry is a court issued document
   *
   * @returns {Boolean} true if the docket entry is a court issued document, false otherwise
   */
  isCourtIssued() {
    return DocketEntryClass.isCourtIssued(this.eventCode);
  }

  static isCourtIssued(eventCode: string): boolean {
    return COURT_ISSUED_EVENT_CODES.map(
      ({ eventCode: courtIssuedEventCode }) => courtIssuedEventCode,
    ).includes(eventCode);
  }

  /**
   * sets the number of pages for the docket entry
   *
   * @param {Number} numberOfPages the number of pages
   */
  setNumberOfPages(numberOfPages) {
    this.numberOfPages = numberOfPages;
  }

  /**
   * strikes this docket entry
   *
   * @param {object} obj param
   * @param {string} obj.name user name
   * @param {string} obj.userId user id
   */
  strikeEntry({ name: strickenByName, userId }) {
    if (this.isOnDocketRecord) {
      this.isStricken = true;
      this.strickenBy = strickenByName;
      this.strickenByUserId = userId;
      this.strickenAt = createISODateString();
    } else {
      throw new Error(
        'Cannot strike a document that is not on the docket record.',
      );
    }
  }

  /**
   * Seal this docket entry
   *
   * @param {object} obj param
   * @param {string} obj.sealedTo the type of user to seal this docket entry from
   */
  sealEntry({ sealedTo }) {
    this.sealedTo = sealedTo;
    this.isSealed = true;
  }

  /**
   * Unseal this docket entry
   *
   */
  unsealEntry() {
    delete this.sealedTo;
    this.isSealed = false;
    this.isLegacySealed = false;
  }

  static isPendingOnCreation(rawDocketEntry) {
    return TRACKED_DOCUMENT_TYPES_EVENT_CODES.includes(
      rawDocketEntry.eventCode,
    );
  }

  /**
   * The pending boolean on the DocketEntry just represents if the user checked the
   * add to pending report checkbox.  This is a computed that uses that along with
   * eventCodes and servedAt to determine if the docket entry is pending.
   *
   * @param {DocketEntryClass} docketEntry the docket entry to check pending state
   * @returns {boolean} is the docket entry is pending or not
   */
  static isPending(docketEntry) {
    return (
      docketEntry.pending &&
      (isServed(docketEntry) ||
        UNSERVABLE_EVENT_CODES.find(
          unservedCode => unservedCode === docketEntry.eventCode,
        ))
    );
  }
}

/**
 * Determines if the docket entry has been served
 *
 * @param {object} rawDocketEntry Docket entry object
 * @returns {Boolean} true if the docket entry has been served, false otherwise
 */
export const isServed = function (rawDocketEntry) {
  return !!rawDocketEntry.servedAt || !!rawDocketEntry.isLegacyServed;
};

/**
 * Determines the servedPartiesCode based on the given servedParties
 *
 * @param {Array} servedParties List of parties that have been served
 * @returns {String} served parties code
 */
export const getServedPartiesCode = servedParties => {
  let servedPartiesCode = undefined;
  if (servedParties && servedParties.length > 0) {
    if (
      servedParties.length === 1 &&
      servedParties[0].role === ROLES.irsSuperuser
    ) {
      servedPartiesCode = PARTIES_CODES.RESPONDENT;
    } else {
      servedPartiesCode = PARTIES_CODES.BOTH;
    }
  }
  return servedPartiesCode;
};

joiValidationDecorator(DocketEntryClass, DOCKET_ENTRY_VALIDATION_RULES, {
  filedBy: [
    {
      contains: 'must be less than or equal to',
      message: 'Limit is 500 characters. Enter 500 or fewer characters.',
    },
    'Enter a filed by',
  ],
});

export const DocketEntry: typeof DocketEntryClass =
  validEntityDecorator(DocketEntryClass);

declare global {
  type RawDocketEntry = ExcludeMethods<DocketEntryClass>;
}
// eslint-disable-next-line no-redeclare
export interface DocketEntryClass extends IValidationEntity<DocketEntryClass> {}
