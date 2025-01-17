﻿import * as PlusIcon from 'material-design-icons/content/svg/production/ic_add_24px.svg';

// Libs
import * as React from 'react';

// Misc
import { Select, SelectValue } from '../select/Select';
import { Text } from '../text/Text';
import InputGroup from '../inputGroup/InputGroup';
import {
  BaseInputProps,
  BaseInputState,
  BaseInput,
  defaultBaseTranslations,
} from '../base/input/BaseInput';
import { Button } from '../button/Button';
import { withFormContext } from '../form/withFormContext';
import { withThemeContext } from '../themeProvider/withThemeContext';

export interface MoneyWithCurrency {
  value: number;
  currency: SelectValue;
}

export const defaultMoneyTranslations = {
  ...defaultBaseTranslations,
  cannotRemoveDefaultCurrency: 'Cannot remove default currency',
  removePrice: 'Remove price',
  addPrice: 'Add price',
  addNewCurrency: 'Add new currency',
};

export type MoneyTranslations = Partial<typeof defaultMoneyTranslations>;

export interface MoneyProps extends BaseInputProps<never, MoneyTranslations> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPricesChange: (prices: MoneyWithCurrency[]) => void;
  allowMultiple?: boolean;
  currencies: SelectValue[];
  prices: MoneyWithCurrency[];
  disableDelete?: boolean;
}

export interface MoneyState extends BaseInputState {}

export class MoneyRaw extends BaseInput<
  MoneyProps,
  MoneyState,
  never,
  MoneyTranslations
> {
  public static defaultProps = Object.assign({}, BaseInput.defaultProps, {
    type: 'money',
    allowMultiple: false,
    onChange: undefined,
  });

  constructor(props: MoneyProps) {
    super(props, false);
    if (!props.currencies || !props.currencies.length) {
      throw Error('No currencies supplied to money input');
    }
    this.state = Object.assign(this.state, {
      isValid: props.required ? props.prices.length > 0 : true,
      errors:
        props.required && props.prices.length === 0
          ? [this.getTranslations(defaultMoneyTranslations).required]
          : [],
      handleValueChangeEnabled: false,
    });
    const forcedCurrencies = props.currencies.filter(c => c.forceSelected);
    const missingForced = forcedCurrencies.filter(
      c => !props.prices.find(p => p.currency.value === c.value)
    );
    if (missingForced.length > 0) {
      props.onPricesChange(
        props.prices.concat(
          missingForced.map(c => ({ currency: c, value: undefined }))
        )
      );
    }
    this.subscribeSelf(props);
  }

  public render() {
    let unusedCurrencies = this.props.currencies;
    const translations = this.getTranslations(defaultMoneyTranslations);
    return (
      <InputGroup
        title={this.props.title}
        tooltip={this.props.tooltip}
        className={this.props.inputGroupClassName}
      >
        <div
          {...(this.props.id && { id: this.props.id })}
          className={
            'input__base money-input ' +
            this.getValidationClass() +
            (this.props.className ? ' ' + this.props.className : '')
          }
          ref={this.containerRef}
        >
          {this.props.prices &&
            this.props.prices.map((item, index) => {
              let currentCurrencies = this.props.currencies.filter(
                c =>
                  this.props.prices.filter(
                    (priceCurrency, priceIndex) =>
                      priceIndex !== index &&
                      priceCurrency.currency.value === c.value
                  ).length === 0
              );
              const currency = this.props.currencies.find(
                c => c.value === item.currency.value
              );
              let retComponents = currentCurrencies.length ? (
                <div key={index}>
                  {currentCurrencies.length > 1 ? (
                    <Select
                      {...(this.props.id && {
                        id:
                          this.props.id +
                          '-currency-select-' +
                          index.toString(),
                      })}
                      onFocus={this.onFocus}
                      onBlur={this.onBlur}
                      className={'money-input__select m-0'}
                      values={currentCurrencies}
                      onChange={this.onCurrencyChanged(
                        index,
                        currentCurrencies
                      )}
                      value={item.currency.value.toString()}
                    />
                  ) : (
                    currentCurrencies?.[0]?.label
                  )}
                  <Text
                    {...(this.props.id && {
                      id: this.props.id + '-amount-input-' + index.toString(),
                    })}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onTheFlightValidate={this.onTheFlightValidate}
                    placeholder={'0.00'}
                    className={'money-input__text m-0'}
                    validators={['number']}
                    value={item.value ? item.value.toString() : ''}
                    onChange={this.onPriceChanged(index)}
                    type="number"
                  />
                  {!this.props.disableDelete && this.props.prices.length > 0 && (
                    <Button
                      {...(this.props.id && {
                        id:
                          this.props.id + '-remove-button-' + index.toString(),
                      })}
                      blank={true}
                      type="error"
                      onClick={this.removePriceClick(index)}
                      className="transform-rotate--45 line-height--0"
                      buttonProps={{
                        ...Button.defaultProps?.buttonProps,
                        title:
                          currency && currency.forceSelected
                            ? translations.cannotRemoveDefaultCurrency
                            : translations.removePrice,
                      }}
                      circular={true}
                      disabled={currency && currency.forceSelected}
                    >
                      <PlusIcon />
                    </Button>
                  )}
                </div>
              ) : null;
              unusedCurrencies = unusedCurrencies.filter(
                c => c.value !== item.currency.value
              );
              return retComponents;
            })}
          {(this.props.allowMultiple ||
            (this.props.prices && !this.props.prices.length)) &&
          unusedCurrencies.length ? (
            <Button
              blank={true}
              {...(this.props.id && {
                id: this.props.id + '-add-button',
              })}
              type="primary"
              className="line-height--0 align-self-start"
              onClick={this.addPriceClick(unusedCurrencies)}
              circular={true}
              buttonProps={{
                ...Button.defaultProps?.buttonProps,
                title:
                  this.props.prices && this.props.prices.length === 0
                    ? translations.addPrice
                    : translations.addNewCurrency,
              }}
            >
              <PlusIcon />
            </Button>
          ) : null}
          <span className="highlight" />
          <span className={'bar ' + (this.state.focused ? 'focused' : '')} />
          {this.renderDefaultValidation()}
          {this.props.label && (
            <label
              className={
                this.props.prices && this.props.prices ? 'label--focused' : ''
              }
            >
              {this.renderLabel()}
            </label>
          )}
        </div>
      </InputGroup>
    );
  }

  private onCurrencyChanged = (
    index: number,
    currentCurrencies: SelectValue[]
  ) => e => {
    let newPrices: MoneyWithCurrency[] = [].concat(this.props.prices);
    newPrices[index].currency = currentCurrencies.filter(
      cc => cc.value.toString() === e.target.value
    )[0];
    this.props.onPricesChange(newPrices);
  };

  private onTheFlightValidate = value => {
    let num = Number(value);
    const parts = value.split('.');
    if (parts && parts.length > 1 && parts[parts.length - 1].length > 2) {
      return false;
    }
    if (!isNaN(num)) {
      return true;
    }
    if (num) {
      return false;
    }
  };

  private onPriceChanged = (index: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let newPrices: MoneyWithCurrency[] = [].concat(this.props.prices);
    let str = e.target.value;
    let num = Number(str);
    if (!isNaN(num)) {
      newPrices[index].value = num;
    }
    this.props.onPricesChange(newPrices);
    if (!this.state.touched) {
      this.touch();
    }
  };

  private removePriceClick = (index: number) => () => {
    const newPrices = this.props.prices.filter(
      (price, itemIndex) => itemIndex !== index
    );
    this.props.onPricesChange(newPrices);
    if (newPrices.length === 0 && this.props.required) {
      this.setInvalid([
        this.getTranslations(defaultMoneyTranslations).required,
      ]);
    }
    if (!this.state.touched) {
      this.touch();
    }
  };

  private addPriceClick = (unusedCurrencies: SelectValue[]) => () => {
    this.props.onPricesChange(
      this.props.prices.concat([{ value: 0, currency: unusedCurrencies[0] }])
    );
    this.setValid();
    if (!this.state.touched) {
      this.touch();
    }
  };

  private onFocus = () => this.setState({ focused: true });

  private onBlur = () => this.setState({ focused: false });
}

export const Money = withThemeContext<
  MoneyProps,
  InstanceType<typeof MoneyRaw>
>(withFormContext<MoneyProps>(MoneyRaw), 'money');

export default Money;
