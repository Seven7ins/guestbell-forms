import * as PlusIcon from 'material-design-icons/content/svg/production/ic_add_circle_outline_24px.svg';

// Libs
import * as React from 'react';

// Misc
import { Time } from '../../time/Time';
import OpeningHoursUtil from '../utils/OpeningHoursUtil';
import InputGroup from '../../inputGroup/InputGroup';
import { BaseInputProps, BaseInputState, BaseInput } from '../../base/input/BaseInput';
import { Button } from '../../button/Button';
import { withFormContext } from '../../form/withFormContext';
import { OmitFormContext } from '../../form/FormContext';

export interface OpeningHoursDayObj {
    times: Date[];
}

interface OpeningHoursDayRawProps extends BaseInputProps<never> {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onOpeningHoursChange: (openingHours: OpeningHoursDayObj) => void;
    openingHours: OpeningHoursDayObj;
    label?: JSX.Element | string;
    maxOpenCloseTimes?: number;
}

export type OpeningHoursDayProps = OmitFormContext<OpeningHoursDayRawProps>;

export interface OpeningHoursState extends BaseInputState {
}

class OpeningHoursDayRaw extends BaseInput<OpeningHoursDayRawProps, OpeningHoursState, never>  {
    public static defaultProps = Object.assign({}, BaseInput.defaultProps, { type: 'openingHours', allowMultiple: false, maxOpenCloseTimes: 10 });
    private fullDayMilliseconds: number = 24 * 60 * 60 * 1000;

    constructor(props: OpeningHoursDayRawProps) {
        super(props);
    }

    public render() {
        return (
            <InputGroup
                title={this.props.title}
                className={'input__group__openingHoursDay ' + (this.props.className ? ' ' + this.props.className : '')}
                helpText={this.props.helpText}
            >
                <div className={'input__base openingHoursDay-input ' + this.getValidationClass()} ref={this.containerRef}>
                    <div className="openingHoursDay-input__container">
                        {this.props.openingHours && this.props.openingHours.times && this.props.openingHours.times.map((item, index) => {
                            const previousTime = index > 0 ? new Date(this.props.openingHours.times[index - 1]) : this.getTime(0, 0);
                            const nextTime = this.props.openingHours.times.length - 1 > index ?
                                new Date(this.props.openingHours.times[index + 1])
                                :
                                this.getTime(23, 59);
                            return <div className="openingHoursDay-input__time__container" key={index}>
                                <span className="openingHoursDay-input__label">{index % 2 === 0 ? 'Opens' : 'Closes'}</span>
                                <Time
                                    className={'openingHoursDay-input__time'}
                                    timeChange={this.timeChanged(index)}
                                    time={item}
                                    min={previousTime}
                                    max={nextTime}
                                />
                                <Button
                                    onClick={this.removeTimeClick(index)}
                                    className="openingHoursDay-input__button--remove mr-5 line-height--0"
                                    circular={true}
                                    blank={true}
                                    type="error"
                                >
                                    <PlusIcon />
                                </Button>
                            </div>;
                        })}
                        {this.props.maxOpenCloseTimes > this.props.openingHours.times.length &&
                            <Button
                                className="openingHoursDay-input__button-open-close"
                                onClick={this.addTimeClick}
                                type={'primary'}
                                hero={true}
                            >
                                {this.props.openingHours && this.props.openingHours.times && this.props.openingHours.times.length % 2 === 0 ? 'Open' : 'Close'}
                            </Button>
                        }
                    </div>
                    {this.renderDefaultValidation()}
                    {this.props.openingHours && this.props.label && <span
                        className={'label-classname ' + (this.props.openingHours && this.props.openingHours.times
                            && this.props.openingHours.times.length ? 'label--focused' : 'label--focused label--closed')}
                    >{this.renderLabel(true)}
                    </span>}
                </div>
                {this.getBottomBorder()}
            </InputGroup>
        );
    }

    private addTimeClick = () => {
        let newTime = new Date((this.props.openingHours && this.props.openingHours.times && this.props.openingHours.times.length ?
            this.props.openingHours.times[this.props.openingHours.times.length - 1] : this.getTime(8, 0)));
        if (newTime.getHours() < 23) {
            newTime.setHours(newTime.getHours() + 1);
        }
        this.props.onOpeningHoursChange({
            ...this.props.openingHours,
            times: this.props.openingHours.times.concat([newTime])
        });
    }

    private removeTimeClick = (index: number) => () => this.props.onOpeningHoursChange({
        ...this.props.openingHours,
        times: this.props.openingHours.times.filter((time, itemIndex) => itemIndex !== index)
    })

    private timeChanged = (index: number) => (time: Date) => {
        let newOpeningHours: OpeningHoursDayObj = { ...this.props.openingHours, times: this.props.openingHours.times.slice(0) };
        newOpeningHours.times[index] = time;
        this.props.onOpeningHoursChange(newOpeningHours);
    }

    private getBottomBorder() {
        let parts = [];
        if (this.props.openingHours && this.props.openingHours.times && !this.props.openingHours.times.length) {
            parts = parts.concat([1]);
        } else {
            parts = parts.concat([OpeningHoursUtil.getTimeFromMidnight(this.props.openingHours.times[0]) / this.fullDayMilliseconds]);
            for (var index = 0; index < this.props.openingHours.times.length - 1; index++) {
                let start = OpeningHoursUtil.getTimeFromMidnight(this.props.openingHours.times[index]);
                let end = OpeningHoursUtil.getTimeFromMidnight(this.props.openingHours.times[index + 1]);
                let diff = (end - start) / this.fullDayMilliseconds;
                parts = parts.concat([diff]);
            }
            parts = parts.concat([(this.fullDayMilliseconds - OpeningHoursUtil.getTimeFromMidnight(this.props.openingHours.
                times[this.props.openingHours.times.length - 1])) / this.fullDayMilliseconds]);
        }
        return (
            <div className="openingHoursDay-input__bottom-border__container">
                {parts.map((part, i) => (
                    <div
                        key={i}
                        className={'openingHoursDay-input__bottom-border ' + (i % 2 === 0 ?
                            'openingHoursDay-input__bottom-border--closed'
                            :
                            'openingHoursDay-input__bottom-border--open')}
                        style={{ width: (part ? ((part * 100).toFixed(2) + '%') : '0') }}
                    />
                ))}
            </div>
        );
    }

    private getTime(hours: number, minutes: number) {
        let time = new Date();
        time.setHours(hours);
        time.setMinutes(minutes);
        time.setSeconds(0);
        return time;
    }
}

export const OpeningHoursDay = withFormContext(OpeningHoursDayRaw);

export default OpeningHoursDay;