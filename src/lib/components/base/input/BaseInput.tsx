﻿// Libs
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    Tooltip,
} from 'react-tippy';

// Misc
import * as Validators from '../../../validators';
import guid from '../../utils/Guid';
import { FormContextProps } from '../../form/FormContext';
import { shallowEqual } from '../../utils/ShallowEqual';

export interface ComponentApi {
    focus: () => void;
    touch: () => void;
    unTouch: () => void;
    enableComponent: () => void;
    disableComponent: () => void;
    scrollTo: () => void;
}

export type ValidationError = string | JSX.Element;

export type AllowedHtmlElements = (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);

export type BaseInputProps<HTMLType extends AllowedHtmlElements> = {
    disabled?: boolean;
    className?: string;
    label?: string | JSX.Element;
    helpText?: string | JSX.Element;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLType>, isValid: boolean) => void;
    required?: boolean;
    customValidators?: Validators.IBaseValidator[];
    validators?: Validators.ValidatorTypes[];
    noValidate?: boolean;
    validationName?: string;
    touchOn?: 'focus' | 'blur';
    ignoreContext?: boolean;
    onTheFlightValidate?: (value: string) => boolean;
    onFocus?: (e: React.SyntheticEvent<{}>) => void;
    onBlur?: () => void;
    title?: string | JSX.Element;
    onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
    errors?: ValidationError[];
    onErrorsChanged?: (errors: ValidationError[]) => void;
    showValidation?: boolean;
    reRendersWhenContextChanges?: boolean;
} & FormContextProps;

export interface BaseInputState {
    isValid: boolean;
    value: string;
    errors: ValidationError[];
    validator: undefined;
    touched: boolean;
    disabled: boolean;
    focused: boolean;
    handleValueChangeEnabled: boolean;
}

export class BaseInput<P extends BaseInputProps<HTMLType>, S extends BaseInputState, HTMLType extends
    AllowedHtmlElements> extends React.Component<P, S> implements ComponentApi {
    public static defaultProps: BaseInputProps<never> = {
        className: undefined,
        required: false,
        label: undefined,
        disabled: false,
        touchOn: 'focus',
        ignoreContext: false,
        showValidation: true,
        formContext: undefined,
        reRendersWhenContextChanges: false
    };

    public componentId = guid();

    public inputRef: React.Ref<HTMLType> | React.RefObject<HTMLType>;
    
    protected containerRef: React.Ref<HTMLDivElement> | React.RefObject<HTMLDivElement>;

    private lastValidation: JSX.Element[];

    constructor(props: P, subscribe: boolean = true) {
        super(props);
        const res = this.handleValueChange(this.props.value, true, [], props, true);
        this.state = {
            isValid: res.isValid,
            errors: res.errors,
            value: props.value ? props.value : '',
            touched: false,
            disabled: false,
            focused: false,
            handleValueChangeEnabled: true
        } as S;
        this.containerRef = React.createRef<HTMLDivElement>();
        this.inputRef = React.createRef<HTMLType>();
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.setValid = this.setValid.bind(this);
        this.focus = this.focus.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
        this.setInvalid = this.setInvalid.bind(this);
        if (subscribe) {
            this.subscribeSelf(props);
        }
    }

    protected getValidationClass(extraErrors?: ValidationError[]) {
        if (!this.props.showValidation || !this.state.touched) {
            return 'validation__success';
        }
        return (this.state.isValid
            &&
            (!this.props.errors || this.props.errors.length === 0)
            &&
            (!this.state.errors || this.state.errors.length === 0)
            &&
            (!extraErrors || extraErrors.length === 0)) ? 'validation__success' : 'validation__error';
    }

    protected renderDefaultValidation(extraErrors?: ValidationError[]) {
        if (!this.props.showValidation) {
            return null;
        }
        let finalErrors: ValidationError[] = this.state.errors;
        if (!finalErrors) {
            finalErrors = [];
        }
        if (extraErrors) {
            finalErrors = finalErrors.concat(extraErrors);
        }
        if (this.props.errors) {
            finalErrors = finalErrors.concat(this.props.errors);
        }
        finalErrors = finalErrors.filter(i => i);
        if (finalErrors.length > 0) {
            this.lastValidation = finalErrors.map((item, index) => <li key={index} className="validation__item">{item}</li>);
        }
        return (
            <div className="validation__container">
                <ul className="validation__ul">
                    {this.lastValidation}
                </ul>
            </div>
        );
    }

    public componentWillUnmount() {
        if (!this.props.ignoreContext) {
            this.props.formContext && this.props.formContext.unSubscribe(this.componentId);
        }
    }

    public componentWillReceiveProps(nextProps: P) {
        if (nextProps.value !== this.props.value
            ||
            nextProps.validators !== this.props.validators
            ||
            nextProps.customValidators !== this.props.customValidators
            ||
            nextProps.required !== this.props.required
        ) {
            this.handleValueChange(nextProps.value, true, [], nextProps);
        }
    }

    public scrollTo() {
        const domNode: HTMLDivElement = ReactDOM.findDOMNode((this.containerRef as React.RefObject<HTMLDivElement>).current) as HTMLDivElement;
        domNode && domNode.scrollIntoView({ behavior: 'smooth' });
    }

    public touch() {
        this.setState({ touched: true });
        this.handleValueChange(this.state.value || '');
    }

    public unTouch() {
        this.setState({ touched: false });
    }

    public disableComponent() {
        this.setState({ disabled: true });
    }

    public enableComponent() {
        this.setState({ disabled: false });
    }

    public focus() {
        if (this.inputRef) {
            const domNode: HTMLElement = ReactDOM.findDOMNode((this.inputRef as React.RefObject<HTMLElement>).current) as HTMLElement;
            domNode && domNode.focus();
        }
    }

    protected handleChange(event: React.ChangeEvent<HTMLType>, isValid?: boolean, errors: ValidationError[] = []) {
        let value = event.target.value;
        if (!this.props.onTheFlightValidate || (this.props.onTheFlightValidate && this.props.onTheFlightValidate(value))) {
            const res = this.handleValueChange(value, isValid, errors);
            if (this.props.onChange) {
                this.props.onChange(event, res.isValid);
            }
        }
    }

    protected subscribeSelf(props: P) {
        if (!props.ignoreContext && props.formContext) {
            props.formContext.subscribe(this.componentId, {
                componentId: this.componentId,
                componentApi: {
                    disableComponent: this.disableComponent,
                    enableComponent: this.enableComponent,
                    touch: this.touch,
                    unTouch: this.unTouch,
                    scrollTo: this.scrollTo,
                    focus: this.focus
                },
                validation: {
                    isValid: this.state.isValid,
                    errors: this.state.errors,
                    name: this.props.validationName ? this.props.validationName : this.props.title ? this.props.title : this.props.label
                }
            });
        }
    }

    protected handleBlur(e: React.FocusEvent<HTMLType>) {
        this.props.onBlur && this.props.onBlur();
        let state = { focused: false };
        if (this.props.touchOn === 'blur') {
            state = Object.assign(state, { touched: true });
            this.handleValueChange(this.state.value);
        }
        this.setState(state);
    }

    protected handleFocus(e: React.FocusEvent<HTMLType>) {
        this.props.onFocus && this.props.onFocus(e);
        let state = { focused: true };
        if (!this.state.touched && this.props.touchOn === 'focus') {
            state = Object.assign(state, { touched: true });
            this.handleValueChange(this.state.value);
        }
        this.setState(state);
    }

    protected getDisabled() {
        return this.state.disabled ? this.state.disabled : this.props.disabled;
    }

    protected setValid() {
        this.setState(() => ({ isValid: true, errors: [] }), () => {
            if (!this.props.ignoreContext) {
                this.props.formContext && this.props.formContext.updateCallback(this.componentId, {
                    validation: {
                        isValid: true,
                        errors: [],
                    }
                });
            }
        });
    }

    protected setInvalid(errors: ValidationError[] = []) {
        this.setState(() => ({ isValid: false, errors }), () => {
            if (!this.props.ignoreContext) {
                this.props.formContext && this.props.formContext.updateCallback(this.componentId, {
                    validation: {
                        isValid: false,
                        errors: errors,
                    }
                });
            }
        });
    }

    protected renderLabel(touchable: boolean = false) {
        if ((!this.props.helpText) || (this.props.helpText && this.props.title)) {
            return (
                <span className={(touchable ? '' : 'label--no-touch')}>
                    {this.props.label}
                </span>
            );
        }
        return (
            <React.Fragment>
                <span className={(touchable ? '' : 'label--no-touch')}>
                    {this.props.label}
                </span>
                {this.renderTooltip()}
            </React.Fragment>
        );
    }

    protected renderTitle() {
        if (!this.props.helpText) {
            return this.props.title;
        }
        return (
            <React.Fragment>
                {this.props.title}
                {this.renderTooltip()}
            </React.Fragment>
        );
    }

    public shouldComponentUpdate(nextProps: P, nextState: S) {
        let shouldUpdate = !shallowEqual(this.props, nextProps, !this.props.reRendersWhenContextChanges ? 'formContext' : undefined)
            || !shallowEqual(this.state, nextState);
        return shouldUpdate;
    }

    protected handleValueChange(value: string, isValid: boolean = true, errors: ValidationError[] = [], props: P = this.props, initializing: boolean = false): {
        isValid: boolean;
        errors: ValidationError[];
    } {
        if (!initializing && !this.state.handleValueChangeEnabled) {
            return { isValid, errors: [] };
        }
        if (props.required && !value) {
            errors.push('Required');
            isValid = false;
        } else {
            if (!props.required && !value) {
                isValid = true;
            } else {
                if (props.validators) {
                    isValid = true;
                    props.validators.forEach(validator => {
                        let validInner = false;
                        switch (validator) {
                            case 'email':
                                validInner = new Validators.EmailValidator().Validate(value, props.required, (error) => errors.push(error));
                                break;
                            case 'number':
                                validInner = new Validators.NumberValidator().Validate(value, props.required, (error) => errors.push(error));
                                break;
                            case 'latitude':
                                validInner = new Validators.LatitudeValidator().Validate(value, props.required, (error) => errors.push(error));
                                break;
                            case 'longitude':
                                validInner = new Validators.LongitudeValidator().Validate(value, props.required, (error) => errors.push(error));
                                break;
                            case 'url':
                                validInner = new Validators.UrlValidator().Validate(value, props.required, (error) => errors.push(error));
                                break;
                            default:
                                throw new Error(`Validator ${validator} not implemented`);
                        }
                        if (isValid && !validInner) {
                            isValid = validInner;
                        }
                    });
                }
                if (props.customValidators) {
                    props.customValidators.forEach(customValidator => {
                        let validInner = false;
                        validInner = customValidator.Validate(value, props.required, (error) => errors.push(error));
                        if (isValid && !validInner) {
                            isValid = validInner;
                        }
                    });
                }
            }
        }
        if (!initializing) {
            props.onErrorsChanged && props.onErrorsChanged(errors);
            this.setState({ value, isValid, errors });
            if (!props.ignoreContext) {
                props.formContext && props.formContext.updateCallback(this.componentId, {
                    validation: {
                        isValid: isValid,
                        errors: errors,
                    }
                });
            }
        }
        return { isValid, errors };
    }

    private renderTooltip() {
        return (
            <Tooltip
                html={this.props.helpText}
                position="bottom"
                trigger="mouseenter"
                interactive={true}
                className="label--help-icon__container"
            >
                <span className="label--help-icon">?</span>
            </Tooltip>
        );
    }
}
export default BaseInput;
