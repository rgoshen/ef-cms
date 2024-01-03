import { Button } from '@web-client/ustc-ui/Button/Button';
import { MessageAlert } from '@web-client/views/Public/MessageAlert/MessageAlert';
import { SuccessNotification } from '@web-client/views/SuccessNotification';
import { connect } from '@web-client/presenter/shared.cerebral';
import { sequences, state } from '@web-client/presenter/app.cerebral';
import React from 'react';

export const Login = connect(
  {
    alertError: state.alertError,
    form: state.form,
    loginHelper: state.loginHelper,
    showPassword: state.showPassword,
    submitLoginSequence: sequences.submitLoginSequence,
    toggleShowPasswordSequence: sequences.toggleShowPasswordSequence,
    updateFormValueSequence: sequences.updateFormValueSequence,
  },
  ({
    alertError,
    form,
    loginHelper,
    showPassword,
    submitLoginSequence,
    toggleShowPasswordSequence,
    updateFormValueSequence,
  }) => {
    return (
      <>
        <section className="grid-container usa-section margin-top-4">
          <div className="grid-row flex-justify-center">
            <div className="grid-col-12 desktop:grid-col-4 tablet:grid-col-7">
              <SuccessNotification isDismissable={false} />
              {alertError && (
                <MessageAlert
                  alertType={alertError.alertType}
                  message={alertError.message}
                  title={alertError.title}
                ></MessageAlert>
              )}
              <div className="grid-container bg-white padding-y-3 border border-base-lighter">
                <div className="display-flex flex-column">
                  <div className="flex-align-self-center">
                    <h1 className="margin-bottom-1">Log in to DAWSON</h1>

                    <span>Email address and password are case sensitive.</span>

                    <form className="usa-form margin-top-4">
                      <label className="usa-label" htmlFor="email">
                        Email address
                      </label>
                      <input
                        required
                        autoCapitalize="off"
                        autoCorrect="off"
                        className="usa-input"
                        data-testid="email-input"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={e => {
                          updateFormValueSequence({
                            key: e.target.name,
                            value: e.target.value,
                          });
                        }}
                      />
                      <label className="usa-label" htmlFor="password">
                        Password
                      </label>
                      <input
                        required
                        className="usa-input"
                        data-testid="password-input"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => {
                          updateFormValueSequence({
                            key: e.target.name,
                            value: e.target.value,
                          });
                        }}
                      />
                      <button
                        className="usa-show-password"
                        data-hide-text="Hide password"
                        data-show-text="Show password"
                        type="button"
                        onClick={() =>
                          toggleShowPasswordSequence({
                            passwordType: 'showPassword',
                          })
                        }
                      >
                        {showPassword ? 'Hide Password' : 'Show password'}
                      </button>
                      <Button
                        className="usa-button margin-top-3"
                        data-testid="login-button"
                        disabled={loginHelper.disableLoginButton}
                        onClick={e => {
                          e.preventDefault();
                          submitLoginSequence();
                        }}
                      >
                        Log in
                      </Button>
                    </form>
                    <div>
                      <Button
                        className="margin-top-1"
                        link={true}
                        type="button"
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div>
                      <span>Don&apos;t have an account?</span>{' '}
                      <Button
                        className="padding-top-0"
                        link={true}
                        type="button"
                      >
                        Create your account now.
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
);
