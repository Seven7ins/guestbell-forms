import classNames from 'classnames';
import * as React from 'react';
import { BookingCalendarDateRange, BookingCalendarItemT } from '../common';
import { duration, Duration, Moment } from 'moment';
import { BookingCalendarControlsClasses } from './classes';
import { bookingCalendarControlsDefaultClasses } from '.';
import { Button } from '../../button/Button';
import * as LeftArrowLongIcon from 'material-design-icons/navigation/svg/production/ic_arrow_back_24px.svg';
import * as LeftArrowIcon from 'material-design-icons/hardware/svg/production/ic_keyboard_arrow_left_24px.svg';
import * as RightArrowLongIcon from 'material-design-icons/navigation/svg/production/ic_arrow_forward_24px.svg';
import * as RightArrowIcon from 'material-design-icons/hardware/svg/production/ic_keyboard_arrow_right_24px.svg';
import * as UnfoldLessIcon from 'material-design-icons/navigation/svg/production/ic_unfold_less_24px.svg';
import moment from 'moment';

export interface BookingCalendarControlsProps<T extends BookingCalendarItemT>
  extends BookingCalendarControlsClasses {
  items: T[];
  step: Duration;
  from: Moment;
  till: Moment;
  onRangeChange?: (range: BookingCalendarDateRange) => void;
}

export function BookingCalendarControls<T extends BookingCalendarItemT>(
  props: BookingCalendarControlsProps<T>
) {
  const {
    className,
    monthLabelClassName,
    buttonsContainerClassName,
    zoomBookingsButtonClassName,
    step,
    from,
    till,
    onRangeChange,
    items,
  } = props;
  if (!step || !from || !till) {
    return null;
  }
  const onStepFactory = React.useCallback(
    (_step: Duration) => () =>
      onRangeChange({
        from: from.clone().add(_step),
        till: till.clone().add(_step),
      }),
    [from, till, onRangeChange]
  );
  const onBigStepLeftClick = React.useCallback(
    onStepFactory(duration(-1 * till.diff(from))),
    [onStepFactory, till, from]
  );
  const onSmallStepLeftClick = React.useCallback(
    onStepFactory(duration(step.asMilliseconds() * -1)),
    [onStepFactory, step]
  );
  const onBigStepRightClick = React.useCallback(
    onStepFactory(duration(till.diff(from))),
    [onStepFactory, till, from]
  );
  const onSmallStepRightClick = React.useCallback(onStepFactory(step), [
    onStepFactory,
    step,
  ]);
  const onZoomBookingsClick = React.useCallback(() => {
    const minFrom = moment(
      Math.min(...items?.map(a => a.from.valueOf())) ?? from?.valueOf()
    );
    const maxTill = moment(
      Math.max(...items?.map(a => a.till.valueOf())) ?? till?.valueOf()
    );
    onRangeChange({
      from: minFrom,
      till: maxTill,
    });
  }, [from, till, items]);
  return (
    <div
      className={classNames(
        bookingCalendarControlsDefaultClasses.className,
        className
      )}
    >
      <div
        className={classNames(
          bookingCalendarControlsDefaultClasses.monthLabelClassName,
          monthLabelClassName
        )}
      >
        {from.format('MMMM')}, {from.format('YYYY')}
      </div>
      <div></div>
      <div
        className={classNames(
          bookingCalendarControlsDefaultClasses.buttonsContainerClassName,
          buttonsContainerClassName
        )}
      >
        <Button noShadow={true} onClick={onBigStepLeftClick}>
          <LeftArrowLongIcon />
        </Button>
        <Button noShadow={true} onClick={onSmallStepLeftClick}>
          <LeftArrowIcon />
        </Button>
        <Button noShadow={true} onClick={onSmallStepRightClick}>
          <RightArrowIcon />
        </Button>
        <Button noShadow={true} onClick={onBigStepRightClick}>
          <RightArrowLongIcon />
        </Button>
        <Button
          className={classNames(
            bookingCalendarControlsDefaultClasses.zoomBookingsButtonClassName,
            zoomBookingsButtonClassName
          )}
          noShadow={true}
          disabled={!items?.length}
          onClick={onZoomBookingsClick}
        >
          <UnfoldLessIcon />
        </Button>
      </div>
    </div>
  );
}