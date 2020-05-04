const joi = require('@hapi/joi');
const {
  joiValidationDecorator,
} = require('../../utilities/JoiValidationDecorator');
const {
  ROLES,
  userDecorator,
  userValidation,
  VALIDATION_ERROR_MESSAGES,
} = require('./User');
const { SERVICE_INDICATOR_TYPES } = require('./cases/CaseConstants');
const { User } = require('./User');

/**
 * constructor
 *
 * @param {object} rawUser the raw user data
 * @constructor
 */
function IrsPractitioner(rawUser) {
  userDecorator(this, rawUser);
  this.entityName = 'IrsPractitioner';
  this.role = User.ROLES.irsPractitioner;
  this.serviceIndicator =
    rawUser.serviceIndicator || SERVICE_INDICATOR_TYPES.SI_ELECTRONIC;
}

joiValidationDecorator(
  IrsPractitioner,
  joi.object().keys({
    ...userValidation,
    entityName: joi.string().valid('IrsPractitioner').required(),
    role: joi.string().valid(User.ROLES.irsPractitioner).required(),
    serviceIndicator: joi
      .string()
      .valid(...Object.values(SERVICE_INDICATOR_TYPES))
      .required(),
  }),
  VALIDATION_ERROR_MESSAGES,
);

IrsPractitioner.validationName = 'IrsPractitioner';

module.exports = {
  IrsPractitioner,
};
