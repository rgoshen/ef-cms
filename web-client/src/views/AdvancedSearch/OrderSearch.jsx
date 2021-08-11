import { Button } from '../../ustc-ui/Button/Button';
import { FormGroup } from '../../ustc-ui/FormGroup/FormGroup';
import { NonMobile } from '../../ustc-ui/Responsive/Responsive';
import { connect } from '@cerebral/react';
import { sequences, state } from 'cerebral';
import React from 'react';

export const OrderSearch = connect(
  {
    advancedSearchForm: state.advancedSearchForm,
    clearAdvancedSearchFormSequence: sequences.clearAdvancedSearchFormSequence,
    judges: state.legacyAndCurrentJudges,
    updateAdvancedOrderSearchFormValueSequence:
      sequences.updateAdvancedOrderSearchFormValueSequence,
    validateOrderSearchSequence: sequences.validateOrderSearchSequence,
    validationErrors: state.validationErrors,
  },
  function OrderSearch({
    advancedSearchForm,
    clearAdvancedSearchFormSequence,
    judges,
    submitAdvancedSearchSequence,
    updateAdvancedOrderSearchFormValueSequence,
    validateOrderSearchSequence,
    validationErrors,
  }) {
    return (
      <>
        <form
          onSubmit={e => {
            e.preventDefault();
            submitAdvancedSearchSequence();
          }}
        >
          <div className="blue-container order-search-container">
            <div className="grid-row grid-gap-6">
              <div className="grid-col-7 right-gray-border">
                <p className="margin-top-0">
                  <span className="text-semibold">
                    Search by keyword and phrase
                  </span>
                </p>
                <input
                  aria-describedby="search-orders-header search-description"
                  className="usa-input maxw-tablet-lg"
                  id="order-search"
                  name="keyword"
                  type="text"
                  value={advancedSearchForm.orderSearch.keyword || ''}
                  onBlur={() => validateOrderSearchSequence()}
                  onChange={e => {
                    updateAdvancedOrderSearchFormValueSequence({
                      key: e.target.name,
                      value: e.target.value,
                    });
                  }}
                />
              </div>

              <div className="grid-col-5">
                <FormGroup
                  className="advanced-search-panel full-width"
                  errorText={validationErrors.chooseOneValue}
                >
                  <div className="margin-bottom-3 desktop:margin-bottom-0">
                    <label className="usa-label" htmlFor="docket-number">
                      Docket number
                    </label>
                    <input
                      className="usa-input"
                      id="docket-number"
                      name="docketNumber"
                      type="text"
                      value={advancedSearchForm.orderSearch.docketNumber || ''}
                      onBlur={() => validateOrderSearchSequence()}
                      onChange={e => {
                        updateAdvancedOrderSearchFormValueSequence({
                          key: e.target.name,
                          value: e.target.value.toUpperCase(),
                        });
                      }}
                    />
                  </div>

                  <div className="desktop:text-center desktop:padding-top-6 width-full desktop:width-auto desktop:margin-bottom-2 padding-left-2 padding-right-2">
                    or
                  </div>
                  <div className="margin-bottom-6 desktop:margin-bottom-0">
                    <label className="usa-label" htmlFor="title-or-name">
                      Case title / Petitioner’s name
                    </label>
                    <input
                      className="usa-input"
                      id="title-or-name"
                      name="caseTitleOrPetitioner"
                      type="text"
                      value={
                        advancedSearchForm.orderSearch.caseTitleOrPetitioner ||
                        ''
                      }
                      onBlur={() => validateOrderSearchSequence()}
                      onChange={e => {
                        updateAdvancedOrderSearchFormValueSequence({
                          key: e.target.name,
                          value: e.target.value,
                        });
                      }}
                    />
                  </div>
                </FormGroup>
              </div>
            </div>
          </div>

          <div className="margin-top-4" id="order-basic">
            <NonMobile>
              <div>
                <Button
                  className="margin-bottom-0"
                  id="advanced-search-button"
                  type="submit"
                >
                  Search
                </Button>
                <Button
                  link
                  className="padding-0 ustc-button--mobile-inline"
                  onClick={e => {
                    e.preventDefault();
                    clearAdvancedSearchFormSequence({
                      formType: 'orderSearch',
                    });
                  }}
                >
                  Clear Search
                </Button>
              </div>
            </NonMobile>
          </div>
        </form>
      </>
    );
  },
);
