import * as ArrowIcon from 'material-design-icons/hardware/svg/production/ic_keyboard_arrow_down_24px.svg';

// Libs
import * as React from 'react';

// Misc
import InputGroup from '../inputGroup/InputGroup';
import {
  BaseInputProps,
  BaseInputState,
  BaseInput,
} from '../base/input/BaseInput';
import { withFormContext } from '../form/withFormContext';
import TimeUtil from '../utils/TimeUtil';
import { Duration, duration } from 'moment';
import { withThemeContext } from '../themeProvider/withThemeContext';
import classNames from 'classnames';

export interface TimeProps extends BaseInputProps<HTMLInputElement> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  timeChange: (time: Duration) => void;
  time: Duration;
  min?: Duration;
  max?: Duration;
  showDateDiff?: boolean;
}

export interface TimeState extends BaseInputState {
  hoursText?: string;
  minutesText?: string;
}

export class TimeRaw extends BaseInput<TimeProps, TimeState, HTMLInputElement> {
  public static defaultProps = (Object.assign({}, BaseInput.defaultProps, {
    type: 'time',
    placeholder: '',
  }) as unknown) as TimeProps;

  constructor(props: TimeProps) {
    super(props);
    this.handleHoursChange = this.handleHoursChange.bind(this);
    this.handleMinutesChange = this.handleMinutesChange.bind(this);
  }

  public render() {
    let hours = this.props.time?.hours?.() ?? 0;
    let minutes = this.props.time?.minutes?.() ?? 0;
    if (minutes < 0) {
      hours--;
    }
    minutes = (minutes + 60) % 60;
    hours = (hours + 24) % 24;
    var mid = 'AM';
    if (hours % 24 >= 12) {
      hours = hours % 12;
      mid = 'PM';
    }
    if (hours % 12 === 0) {
      // At 00 hours we need to show 12 am
      hours = 12;
    }
    if (this.props.showDateDiff && this.props.min) {
      const diffDays = TimeUtil.dayDiff(this.props.min, this.props.time);
      if (diffDays > 0) {
        mid += ' +' + diffDays.toString();
      }
    }
    return (
      <InputGroup
        title={this.props.title}
        tooltip={this.props.tooltip}
        className={this.props.inputGroupClassName}
      >
        <div
          {...(this.props.id && {
            id: this.props.id,
          })}
          className={classNames(
            'input__base time-input',
            this.getValidationClass(),
            this.props.className
          )}
          ref={this.containerRef}
        >
          <div className="">
            <div className="time-input__arrows__container">
              <button
                className="plus"
                onClick={this.addHourClick}
                {...(this.props.id && {
                  id: this.props.id + '-add-hours-button',
                })}
                tabIndex={0}
              >
                <ArrowIcon />
              </button>
              <div className="input-padding">
                <input
                  {...(this.props.id && {
                    id: this.props.id + '-hours-input',
                  })}
                  disabled={this.getDisabled()}
                  required={this.props.required}
                  className={
                    'time-input__time ' + (this.state.value ? 'filled' : '')
                  }
                  onChange={this.onHoursChanged}
                  value={
                    this.state.hoursText !== undefined
                      ? this.state.hoursText
                      : hours
                  }
                  onBlur={this.onBlur}
                  onFocus={this.handleFocus}
                  type="number"
                />
                <span className="highlight" />
              </div>
              <button
                className="minus"
                onClick={this.removeHourClick}
                {...(this.props.id && {
                  id: this.props.id + '-subtract-hours-button',
                })}
                tabIndex={0}
              >
                <ArrowIcon />
              </button>
            </div>
          </div>
          <span className="">:</span>
          <div className="">
            <div className="time-input__arrows__container">
              <button
                className="plus"
                onClick={this.addMinuteClick}
                {...(this.props.id && {
                  id: this.props.id + '-add-minutes-button',
                })}
                tabIndex={0}
              >
                <ArrowIcon />
              </button>
              <div className="input-padding">
                <input
                  {...(this.props.id && {
                    id: this.props.id + '-minutes-input',
                  })}
                  disabled={this.getDisabled()}
                  required={this.props.required}
                  className={
                    'time-input__time ' + (this.state.value ? 'filled' : '')
                  }
                  onChange={this.onMinutesChanged}
                  value={
                    this.state.minutesText !== undefined
                      ? this.state.minutesText
                      : minutes < 10
                      ? '0' + minutes.toString()
                      : minutes.toString()
                  }
                  onBlur={this.onBlur}
                  onFocus={this.handleFocus}
                  type="number"
                />
                <span className="highlight" />
              </div>
              <button
                className="minus"
                onClick={this.removeMinuteClick}
                {...(this.props.id && {
                  id: this.props.id + '-subtract-minutes-button',
                })}
                tabIndex={0}
              >
                <ArrowIcon />
              </button>
            </div>
          </div>
          {this.renderDefaultValidation()}
          <span className="time-input__am-pm">{mid}</span>
          <span className="highlight" />
          <span className={'bar ' + (this.state.focused ? 'focused' : '')} />
          {this.props.label && (
            <label className={classNames('time-input__label label--focused')}>
              {this.renderLabel()}
            </label>
          )}
        </div>
      </InputGroup>
    );
  }

  private onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (this.state.hoursText) {
      this.handleHoursChange(this.state.hoursText);
    }
    if (this.state.minutesText) {
      this.handleMinutesChange(this.state.minutesText);
    }
    this.setState({ minutesText: undefined, hoursText: undefined }, () =>
      this.handleBlur(e)
    );
  };

  private onMinutesChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    // this.handleMinutesChange(e.target.value);
    this.setState({ minutesText: e.target.value });
  };

  private removeMinuteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.handleMinutesChange(
      ((this.props.time?.minutes?.() ?? 0) - 1).toString()
    );
  };

  private addMinuteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.handleMinutesChange(
      ((this.props.time?.minutes?.() ?? 0) + 1).toString()
    );
  };

  private removeHourClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.handleHoursChange(((this.props.time?.hours?.() ?? 0) - 1).toString());
  };

  private onHoursChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    // this.handleHoursChange(e.target.value);
    this.setState({ hoursText: e.target.value });
  };

  private addHourClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.handleHoursChange(((this.props.time?.hours?.() ?? 0) + 1).toString());
  };

  private handleLimits(time: Duration) {
    if (this.props.min) {
      if (
        (time?.asMilliseconds?.() ?? 0) - this.props.min.asMilliseconds() <=
        0
      ) {
        this.props.timeChange(this.props.min.clone());
        return;
      }
    }
    if (this.props.max) {
      if (
        this.props.max.asMilliseconds() - (time?.asMilliseconds?.() ?? 0) <=
        0
      ) {
        this.props.timeChange(this.props.max.clone());
        return;
      }
    }
    this.props.timeChange(time);
  }

  private handleHoursChange(hoursString: string) {
    let num = Number(hoursString);
    if (hoursString === '') {
      num = 0;
    }
    if (!isNaN(num)) {
      let newTime: Duration = duration(
        this.props.time?.asMilliseconds?.() ?? 0,
        'milliseconds'
      )
        .subtract(this.props.time?.hours?.() ?? 0, 'hours')
        .add(num, 'hours');
      this.handleLimits(newTime);
    }
  }

  private handleMinutesChange(minutesString: string) {
    let num = Number(minutesString);
    if (minutesString === '') {
      num = 0;
    }
    if (!isNaN(num)) {
      let newTime: Duration = duration(
        this.props.time?.asMilliseconds?.() ?? 0,
        'milliseconds'
      )
        .subtract(this.props.time?.minutes?.() ?? 0, 'minutes')
        .add(num, 'minutes');
      this.handleLimits(newTime);
    }
  }
}

export const Time = withThemeContext<TimeProps, InstanceType<typeof TimeRaw>>(
  withFormContext<TimeProps>(TimeRaw),
  'time'
);

export default Time;
