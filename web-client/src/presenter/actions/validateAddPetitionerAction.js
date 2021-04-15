import { combineContactErrors } from './validateAddPractitionerAction';
import { state } from 'cerebral';

/**
 * validates the add petitioner user form
 *
 * @param {object} providers the providers object
 * @param {object} providers.applicationContext the application context
 * @param {Function} providers.get the cerebral get function
 * @returns {object} providers.path the next path based on if validation was successful or error
 * @param {object} providers.props the props passed in to the action
 */
export const validateAddPetitionerAction = ({
  applicationContext,
  get,
  path,
}) => {
  const { contact } = get(state.form);
  console.log('formg', get(state.form));
  const { partyType, status } = get(state.caseDetail);

  const errors = applicationContext
    .getUseCases()
    .validateAddPetitionerInteractor({
      applicationContext,
      contact,
      partyType,
      status,
    });

  console.log('errors', errors);

  combineContactErrors({ errors });

  if (!errors) {
    return path.success();
  } else {
    return path.error({
      alertError: {
        title: 'Errors were found. Please correct your form and resubmit.',
      },
      errors,
    });
  }
};
