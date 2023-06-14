import { CaseAssociationRequestDocument } from './CaseAssociationRequestDocument';
import { CaseAssociationRequestDocumentTypeA } from './CaseAssociationRequestDocumentTypeA';
import { CaseAssociationRequestDocumentTypeB } from './CaseAssociationRequestDocumentTypeB';
import { CaseAssociationRequestDocumentTypeC } from './CaseAssociationRequestDocumentTypeC';
import { CaseAssociationRequestDocumentTypeD } from './CaseAssociationRequestDocumentTypeD';

export function CaseAssociationRequestFactory(
  rawProps,
): CaseAssociationRequestDocument {
  switch (rawProps.documentType) {
    // documentWithAttachments
    case 'Notice of Intervention':
    case 'Notice of Election to Participate':
    case 'Notice of Election to Intervene':
      return new CaseAssociationRequestDocumentTypeA(rawProps);
    // documentWithObjections
    // documentWithConcatentatedPetitionerNames
    case 'Substitution of Counsel':
      return new CaseAssociationRequestDocumentTypeB(rawProps);
    // documentWithAttachments
    // documentWithObjections
    // documentWithSupportingDocuments
    case 'Motion to Substitute Parties and Change Caption':
      return new CaseAssociationRequestDocumentTypeC(rawProps);
    // documentWithConcatentatedPetitionerNames
    case 'Entry of Appearance':
    case 'Limited Entry of Appearance':
      return new CaseAssociationRequestDocumentTypeD(rawProps);
    default:
      // TODO
      return new CaseAssociationRequestDocumentTypeA(rawProps);
  }
}
