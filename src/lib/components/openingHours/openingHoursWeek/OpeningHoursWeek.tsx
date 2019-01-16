// Libs
import * as React from 'react';

// Misc
import OpeningHoursUtil from '../utils/OpeningHoursUtil';
import {
  OpeningHoursDayObj,
  OpeningHoursDay
} from '../openingHoursDay/OpeningHoursDay';
import {
  BaseInputProps,
  BaseInputState,
  BaseInput
} from '../../base/input/BaseInput';
import { Checkbox } from '../../checkbox/Checkbox';
import { OmitFormContext } from '../../form/FormContext';
import { withFormContext } from '../../form/withFormContext';
import { InnerRefProps } from './../../../types/InnerRefProps';

export interface OpeningHoursWeekDayObj extends OpeningHoursDayObj {
  isStandardDay?: boolean;
  dayLabel?: string;
}

export interface OpeningHoursWeekRawProps extends BaseInputProps<never> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  days: OpeningHoursWeekDayObj[];
  onDaysChange: (days: OpeningHoursWeekDayObj[]) => void;
  standardDay?: OpeningHoursWeekDayObj;
  onStandardDayChange?: (day: OpeningHoursWeekDayObj) => void;
}

export type OpeningHoursWeekProps = OmitFormContext<OpeningHoursWeekRawProps> &
  InnerRefProps<OpeningHoursWeekRawProps>;

export interface OpeningHoursWeekState extends BaseInputState {}

export class OpeningHoursWeekRaw extends BaseInput<
  OpeningHoursWeekRawProps,
  OpeningHoursWeekState,
  never
> {
  public static defaultProps = Object.assign({}, BaseInput.defaultProps, {
    type: 'openingHoursWeek',
    placeholder: '',
    collapsable: false
  });

  constructor(props: OpeningHoursWeekRawProps) {
    super(props);
    this.state = { ...this.state };
  }

  public componentWillMount() {
    if (!this.props.days || !this.props.days.length) {
      this.props.onDaysChange([
        { dayLabel: 'Monday', times: [] },
        { dayLabel: 'Tuesday', times: [] },
        { dayLabel: 'Wednesday', times: [] },
        { dayLabel: 'Thursday', times: [] },
        { dayLabel: 'Friday', times: [] },
        { dayLabel: 'Saturday', times: [] },
        { dayLabel: 'Sunday', times: [] }
      ]);
    }
  }

  public componentWillReceiveProps(newProps: OpeningHoursWeekProps) {
    if (!newProps.days || !newProps.days.length) {
      newProps.onDaysChange([
        { dayLabel: 'Monday', times: [] },
        { dayLabel: 'Tuesday', times: [] },
        { dayLabel: 'Wednesday', times: [] },
        { dayLabel: 'Thursday', times: [] },
        { dayLabel: 'Friday', times: [] },
        { dayLabel: 'Saturday', times: [] },
        { dayLabel: 'Sunday', times: [] }
      ]);
    }
  }

  public render() {
    return (
      <div
        className={
          'openingHoursWeek-input ' +
          this.getValidationClass() +
          ' ' +
          (this.props.className ? this.props.className : '')
        }
        ref={this.containerRef}
      >
        {this.renderContent()}
      </div>
    );
  }

  private renderContent() {
    return (
      <div className={``}>
        {this.props.standardDay && (
          <OpeningHoursDay
            className="openingHoursWeek__standard-day"
            label={
              <span>
                {OpeningHoursUtil.getLabelSuffix(this.props.standardDay)}
              </span>
            }
            openingHours={{
              times: this.props.standardDay.times
            }}
            onOpeningHoursChange={this.standardDayChanged}
            title={'Standard day'}
            tooltip={
              <p>
                We recommend to use <b>Standard day</b> if multiple days share
                the same opening hours. Check "Standard day?" checkbox for each
                of these days to make them share standard opening hours.
              </p>
            }
          />
        )}
        {this.props.days.map((day, index) => (
          <OpeningHoursDay
            className={''}
            key={index}
            label={
              this.props.standardDay ? (
                <span>
                  {OpeningHoursUtil.getLabelSuffix(
                    this.props.standardDay && day.isStandardDay
                      ? this.props.standardDay
                      : day
                  )}
                  <span className="float-right openingHoursWeek__is-standard-day">
                    Standard day?
                    <Checkbox
                      className="label__checkbox"
                      checked={day.isStandardDay}
                      onChecked={this.isStandardDayChecked(index, day)}
                    />
                  </span>
                </span>
              ) : (
                day.dayLabel
              )
            }
            openingHours={{
              times:
                this.props.standardDay && day.isStandardDay
                  ? this.props.standardDay.times
                  : day.times
            }}
            onOpeningHoursChange={this.onOpeningHoursChange(index, day)}
            title={day.dayLabel}
          />
        ))}
        <span className="bar" />
        {this.renderDefaultValidation()}
      </div>
    );
  }

  private onOpeningHoursChange = (index: number, day: OpeningHoursDayObj) => (
    openingHours: OpeningHoursWeekDayObj
  ) => {
    let days = this.props.days.slice(0);
    days[index] = { ...day, ...openingHours, isStandardDay: false };
    this.props.onDaysChange(days);
  }

  private isStandardDayChecked = (
    index: number,
    day: OpeningHoursWeekDayObj
  ) => checked => {
    let days = this.props.days.slice(0);
    days[index] = { ...day, isStandardDay: checked.target.checked };
    this.props.onDaysChange(days);
  }

  private standardDayChanged = (openingHours: OpeningHoursDayObj) => {
    this.props.onStandardDayChange(openingHours);
  }
}

export const OpeningHoursWeek = withFormContext<
  OpeningHoursWeekRawProps,
  OpeningHoursWeekProps
>(OpeningHoursWeekRaw);

export default OpeningHoursWeek;
