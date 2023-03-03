/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvalidEntityError } from '../../errors/errors';
import { isEmpty } from 'lodash';
import joi from 'joi';

const setIsValidated = obj => {
  Object.defineProperty(obj, 'isValidated', {
    enumerable: false,
    value: true,
    writable: false,
  });
};
/**
 *
 */
function toRawObject(entity) {
  const keys = Object.keys(entity);
  const obj = {};
  for (let key of keys) {
    const value = entity[key];
    if (Array.isArray(value)) {
      obj[key] = value.map(v => {
        if (typeof v === 'string' || v instanceof String) {
          return v;
        } else {
          return toRawObject(v);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      obj[key] = toRawObject(value);
    } else {
      obj[key] = value;
    }
  }
  if (entity.isValidated) {
    setIsValidated(obj);
  }
  return obj;
}

/**
 *
 */
function getFormattedValidationErrorsHelper(entity) {
  const errors = entity.getValidationErrors();
  if (!errors) return null;
  for (let key of Object.keys(errors)) {
    const errorMap = entity.getErrorToMessageMap()[key];
    if (Array.isArray(errorMap)) {
      for (let errorObject of errorMap) {
        if (
          typeof errorObject === 'object' &&
          errors[key].includes(errorObject.contains)
        ) {
          errors[key] = errorObject.message;
          break;
        } else if (typeof errorObject !== 'object') {
          errors[key] = errorObject;
          break;
        }
      }
    } else if (errorMap) {
      errors[key] = errorMap;
    }
  }
  return errors;
}

/**
 *
 */
function getFormattedValidationErrors(entity) {
  const keys = Object.keys(entity);
  const obj = {};
  let errors = null;
  if (entity.getFormattedValidationErrors) {
    errors = getFormattedValidationErrorsHelper(entity);
  }
  if (errors) {
    for (const key of Object.keys(errors)) {
      if (
        // remove unhelpful error messages from contact validations
        typeof errors[key] == 'string' &&
        errors[key].endsWith('does not match any of the allowed types')
      ) {
        delete errors[key];
      }
    }
    Object.assign(obj, errors);
  }
  for (let key of keys) {
    const value = entity[key];
    if (errors && errors[key]) {
      continue;
    } else if (Array.isArray(value)) {
      obj[key] = value
        .map((v, index) => {
          const e = getFormattedValidationErrors(v);
          return e ? { ...e, index } : null;
        })
        .filter(v => v);
      if (obj[key].length === 0) {
        delete obj[key];
      }
    } else if (
      typeof value === 'object' &&
      value &&
      value.getFormattedValidationErrors
    ) {
      obj[key] = getFormattedValidationErrors(value);
      if (!obj[key]) delete obj[key];
    }
  }
  return Object.keys(obj).length === 0 ? null : obj;
}

export abstract class JoiValidationEntity {
  public entityName: string;
  private schema: any;

  constructor(entityName: string) {
    this.entityName = entityName;
    const rules = this.getValidationRules();
    this.schema = joi.object().keys(rules);
  }

  abstract getValidationRules(): any;
  abstract getErrorToMessageMap(): any;

  getValidationErrors() {
    const { error } = this.schema.validate(this, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (!error) return null;
    const errors = {};
    error.details.forEach(detail => {
      if (!Number.isInteger(detail.context.key)) {
        errors[detail.context.key || detail.type] = detail.message;
      } else {
        errors[detail.context.label] = detail.message;
      }
    });
    return errors;
  }

  isValid() {
    const validationErrors = this.getFormattedValidationErrors();
    return isEmpty(validationErrors);
  }

  validate(options?: {
    applicationContext: IApplicationContext;
    logErrors: boolean;
  }) {
    const applicationContext = options?.applicationContext;
    const logErrors = options?.logErrors;

    if (!this.isValid()) {
      const stringifyTransform = obj => {
        if (!obj) return obj;
        const transformed = {};
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'string') {
            transformed[key] = obj[key].replace(/"/g, "'");
          } else {
            transformed[key] = obj[key];
          }
        });
        return transformed;
      };
      if (logErrors) {
        applicationContext.logger.error('*** Entity with error: ***', this);
      }
      const validationErrors = this.getValidationErrors();
      throw new InvalidEntityError(
        this.entityName,
        JSON.stringify(stringifyTransform(validationErrors)),
        validationErrors,
      );
    }
    setIsValidated(this);
    return this;
  }

  getFormattedValidationErrors() {
    return getFormattedValidationErrors(this);
  }

  toRawObject() {
    return toRawObject(this) as ExcludeMethods<this>;
  }

  toRawObjectFromJoi() {
    return toRawObject(this) as ExcludeMethods<this>;
  }

  validateForMigration() {
    let { error } = this.schema.validate(this, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      console.log('Error, entity is invalid: ', this);
      throw new InvalidEntityError(
        this.entityName,
        JSON.stringify(
          error.details.map(detail => {
            return detail.message.replace(/"/g, "'");
          }),
        ),
      );
    }
    setIsValidated(this);
    return this;
  }

  static validateRawCollection(collection: any, args: any) {
    throw new Error('not implemented!');
  }
}
