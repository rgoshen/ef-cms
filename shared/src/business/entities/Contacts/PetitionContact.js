const joi = require('joi-browser');

const {
  joiValidationDecorator,
} = require('../../../utilities/JoiValidationDecorator');

exports.COUNTRY_TYPES = {
  DOMESTIC: 'domestic',
  INTERNATIONAL: 'international',
};

const domesticErrorToMessageMap = {
  countryType: 'Country Type is a required field.',
  name: 'Name is a required field.',
  address1: 'Address is a required field.',
  city: 'City is a required field.',
  state: 'State is a required field.',
  postalCode: [
    {
      contains: 'match',
      message: 'Please enter a valid zip code.',
    },
    'Zip Code is a required field.',
  ],
  phone: 'Phone is a required field.',
};

const internationalErrorToMessageMap = {
  countryType: 'Country Type is a required field.',
  country: 'Country is a required field.',
  name: 'Name is a required field.',
  address1: 'Address is a required field.',
  city: 'City is a required field.',
  state: 'State/Province/Region is a required field.',
  postalCode: 'Postal Code is a required field.',
  phone: 'Phone is a required field.',
};

const domesticValidationObject = {
  countryType: joi
    .string()
    .valid(exports.COUNTRY_TYPES.DOMESTIC)
    .required(),
  name: joi.string().required(),
  address1: joi.string().required(),
  address2: joi.string().optional(),
  address3: joi.string().optional(),
  city: joi.string().required(),
  state: joi.string().required(),
  postalCode: joi
    .string()
    .regex(/^\d{5}(-\d{4})?$/)
    .required(),
  phone: joi.string().required(),
};

const internationalValidationObject = {
  countryType: joi
    .string()
    .valid(exports.COUNTRY_TYPES.INTERNATIONAL)
    .required(),
  country: joi.string().required(),
  name: joi.string().required(),
  address1: joi.string().required(),
  address2: joi.string().optional(),
  address3: joi.string().optional(),
  city: joi.string().required(),
  state: joi.string().optional(),
  postalCode: joi.string().required(),
  phone: joi.string().required(),
};

exports.PARTY_TYPES = {
  petitioner: 'Petitioner',
  transferee: 'Transferee',
  donor: 'Donor',
  petitionerDeceasedSpouse: 'Petitioner & Deceased Spouse',
  survivingSpouse: 'Surviving Spouse',
  petitionerSpouse: 'Petitioner & Spouse',
  corporation: 'Corporation',
  estateWithoutExecutor:
    'Estate without an Executor/Personal Representative/Fiduciary/etc.',
  partnershipAsTaxMattersPartner: 'Partnership (as the tax matters partner)',
  partnershipOtherThanTaxMatters:
    'Partnership (as a partner other than tax matters partner)',
  partnershipBBA:
    'Partnership (as a partnership representative under the BBA regime)',
  nextFriendForMinor:
    'Next Friend for a Minor (Without a Guardian, Conservator, or other like Fiduciary)',
  nextFriendForIncompetentPerson:
    'Next Friend for a Legally Incompetent Person (Without a Guardian, Conservator, or other like Fiduciary)',
  estate: 'Estate with an Executor/Personal Representative/Fiduciary/etc.',
  partnership: 'Partnership (BBA Regime)',
  trust: 'Trust',
  conservator: 'Conservator',
  guardian: 'Guardian',
  custodian: 'Custodian',
};

exports.BUSINESS_TYPES = {
  corporation: exports.PARTY_TYPES.corporation,
  partnershipAsTaxMattersPartner:
    exports.PARTY_TYPES.partnershipAsTaxMattersPartner,
  partnershipOtherThanTaxMatters:
    exports.PARTY_TYPES.partnershipOtherThanTaxMatters,
  partnershipBBA: exports.PARTY_TYPES.partnershipBBA,
};

exports.ESTATE_TYPES = {
  estate: exports.PARTY_TYPES.estate,
  estateWithoutExecutor: exports.PARTY_TYPES.estateWithoutExecutor,
  trust: exports.PARTY_TYPES.trust,
};

exports.OTHER_TYPES = {
  nextFriendForMinor: exports.PARTY_TYPES.nextFriendForMinor,
  nextFriendForIncompetentPerson:
    exports.PARTY_TYPES.nextFriendForIncompetentPerson,
  conservator: exports.PARTY_TYPES.conservator,
  guardian: exports.PARTY_TYPES.guardian,
  custodian: exports.PARTY_TYPES.custodian,
};

/**
 * used for getting the joi validation object used for the different country type contacts.
 *
 * @param {options} options the options object
 * @param {options} options.countryType the country type of the contact
 * @returns {Object} the joi validaiton object
 */
exports.getValidationObject = ({
  countryType = exports.COUNTRY_TYPES.DOMESTIC,
}) => {
  return countryType === exports.COUNTRY_TYPES.DOMESTIC
    ? domesticValidationObject
    : internationalValidationObject;
};

/**
 * used for getting the error message map object used for displaying errors
 *
 * @param {options} options the options object
 * @param {options} options.countryType the country type of the contact
 * @returns {Object} the error message map object which maps errors to custom messages
 */
exports.getErrorToMessageMap = ({
  countryType = exports.COUNTRY_TYPES.DOMESTIC,
}) => {
  return countryType === exports.COUNTRY_TYPES.DOMESTIC
    ? domesticErrorToMessageMap
    : internationalErrorToMessageMap;
};

/**
 * used for getting the contact constructor depending on the party type and contact type
 *
 * @param {Object} options the options object
 * @param {string} partyType see the PARTY_TYPES map for a list of all valid partyTypes
 * @param {string} countryType typically either 'domestic' or 'international'
 * @param {string} contactType typically either 'primary' or 'secondary'
 */
const getContactConstructor = ({ partyType, countryType, contactType }) => {
  const {
    getPetitionerTaxpayerContact,
  } = require('./PetitionerTaxpayerContact');
  const {
    getPetitionerConservatorContact,
  } = require('./PetitionerConservatorContact');
  const { getPetitionerPrimaryContact } = require('./PetitionerPrimaryContact');
  const {
    getPetitionerCorporationContact,
  } = require('./PetitionerCorporationContact');
  const {
    getPetitionerIntermediaryContact,
  } = require('./PetitionerIntermediaryContact');
  const {
    getPetitionerDeceasedSpouseContact,
  } = require('./PetitionerDeceasedSpouseContact');
  const { getPetitionerSpouseContact } = require('./PetitionerSpouseContact');
  const {
    getPetitionerEstateExecutorContact,
  } = require('./PetitionerEstateExecutorContact');
  const {
    getPetitionerEstateWithExecutorPrimaryContact,
  } = require('./PetitionerEstateWithExecutorPrimaryContact');
  const {
    getPetitionerGuardianContact,
  } = require('./PetitionerGuardianContact');
  const {
    getPetitionerCustodianContact,
  } = require('./PetitionerCustodianContact');
  const {
    getPetitionerPartnershipRepContact,
  } = require('./PetitionerPartnershipRepContact');
  const { getPetitionerTrustContact } = require('./PetitionerTrustContact');
  const { getPetitionerTrusteeContact } = require('./PetitionerTrusteeContact');
  return {
    [exports.PARTY_TYPES.petitioner]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: null,
    }[contactType],
    [exports.PARTY_TYPES.transferee]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: null,
    }[contactType],
    [exports.PARTY_TYPES.donor]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: null,
    }[contactType],
    [exports.PARTY_TYPES.petitionerDeceasedSpouse]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: getPetitionerDeceasedSpouseContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.survivingSpouse]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: getPetitionerDeceasedSpouseContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.petitionerSpouse]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: getPetitionerSpouseContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.corporation]: {
      primary: getPetitionerCorporationContact({ countryType }),
      secondary: null,
    }[contactType],
    [exports.PARTY_TYPES.estateWithoutExecutor]: {
      primary: getPetitionerIntermediaryContact({ countryType }),
      secondary: null,
    }[contactType],
    [exports.PARTY_TYPES.partnershipAsTaxMattersPartner]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: getPetitionerIntermediaryContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.partnershipOtherThanTaxMatters]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: getPetitionerIntermediaryContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.nextFriendForMinor]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: getPetitionerIntermediaryContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.nextFriendForIncompetentPerson]: {
      primary: getPetitionerPrimaryContact({ countryType }),
      secondary: getPetitionerIntermediaryContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.estate]: {
      primary: getPetitionerEstateWithExecutorPrimaryContact({ countryType }),
      secondary: getPetitionerEstateExecutorContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.partnership]: {
      primary: getPetitionerIntermediaryContact({ countryType }),
      secondary: getPetitionerPartnershipRepContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.trust]: {
      primary: getPetitionerTrustContact({ countryType }),
      secondary: getPetitionerTrusteeContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.conservator]: {
      primary: getPetitionerTaxpayerContact({ countryType }),
      secondary: getPetitionerConservatorContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.guardian]: {
      primary: getPetitionerGuardianContact({ countryType }),
      secondary: getPetitionerTaxpayerContact({ countryType }),
    }[contactType],
    [exports.PARTY_TYPES.custodian]: {
      primary: getPetitionerCustodianContact({ countryType }),
      secondary: getPetitionerTaxpayerContact({ countryType }),
    }[contactType],
  }[partyType];
};

/**
 * used for instantiating the primary and secondary contact objects which are later used in the Petition entity.
 *
 * @param {Object} options the options object
 * @param {string} partyType see the PARTY_TYPES map for a list of all valid partyTypes
 * @param {string} contactInfo object which should contain primary and secondary used for creating the contact entities
 * @returns {Object} contains the primary and secondary contacts constructed
 */
exports.instantiateContacts = ({ partyType, contactInfo }) => {
  const primaryConstructor = getContactConstructor({
    partyType,
    countryType: (contactInfo.primary || {}).countryType,
    contactType: 'primary',
  });
  const secondaryConstructor = getContactConstructor({
    partyType,
    countryType: (contactInfo.secondary || {}).countryType,
    contactType: 'secondary',
  });
  return {
    primary: primaryConstructor
      ? new primaryConstructor(contactInfo.primary || {})
      : {},
    secondary: secondaryConstructor
      ? new secondaryConstructor(contactInfo.secondary || {})
      : {},
  };
};

/**
 * creates a contact entities with additional error mappings and validation if needed.
 *
 * @param {Object} options the options object
 * @param {Object} options.additionalErrorMappings the error mappings object for any custom error messages or for overwriting existing ones
 * @param {Object} options.additionalValidation the joi validation object that defines additional validations on top of the generic country type ones
 * @returns {Function} the entity constructor function
 */
exports.createContactFactory = ({
  additionalErrorMappings,
  additionalValidation,
}) => {
  return ({ countryType }) => {
    function GenericContactConstructor(raw) {
      Object.assign(this, raw);
    }

    GenericContactConstructor.errorToMessageMap = {
      ...exports.getErrorToMessageMap({ countryType }),
      ...additionalErrorMappings,
    };

    joiValidationDecorator(
      GenericContactConstructor,
      joi.object().keys({
        ...exports.getValidationObject({ countryType }),
        ...additionalValidation,
      }),
      undefined,
      GenericContactConstructor.errorToMessageMap,
    );

    return GenericContactConstructor;
  };
};
