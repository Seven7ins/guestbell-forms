import './inputHeader.scss';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { ButtonProps } from '../../../buttons/Button';
export declare type ActionParam = {
    expand: () => void;
    collapse: () => void;
    toggle: () => void;
};
export declare type InputHeaderProps = {
    className?: string;
    title?: string | JSX.Element;
    icon?: string | JSX.Element;
    subTitle?: string | JSX.Element;
    mainButton?: JSX.Element | ((param: ActionParam) => JSX.Element);
    extraButtons?: JSX.Element[] | ((param: ActionParam) => JSX.Element[]);
    collapsable?: boolean;
    collapsed?: boolean;
    collapsedDefault?: boolean;
    ignoreContext?: boolean;
    showExpandAll?: boolean;
    type?: 'hero' | 'standard' | 'small';
    noBg?: boolean;
    headerClassName?: string;
    contentClassName?: string;
    extraButtonsButtonProps?: ButtonProps;
};
export interface InputHeaderState {
    collapsed: boolean;
    inputHeaders: {
        [name: string]: InputHeader;
    };
    smoothCollapseDone: boolean;
}
export declare const InputHeaderContextType: {
    registerInputHeader: PropTypes.Requireable<(...args: any[]) => any>;
    unregisterInputHeader: PropTypes.Requireable<(...args: any[]) => any>;
    stateChanged: PropTypes.Requireable<(...args: any[]) => any>;
};
export interface InputHeaderContext {
    registerInputHeader: (component: InputHeader) => void;
    unregisterInputHeader: (component: InputHeader) => void;
    stateChanged: () => void;
}
export declare class InputHeader extends React.Component<InputHeaderProps, InputHeaderState> {
    static defaultProps: InputHeaderProps;
    id: string;
    context: InputHeaderContext;
    static contextTypes: {
        registerInputHeader: PropTypes.Requireable<(...args: any[]) => any>;
        unregisterInputHeader: PropTypes.Requireable<(...args: any[]) => any>;
        stateChanged: PropTypes.Requireable<(...args: any[]) => any>;
    };
    static childContextTypes: {
        registerInputHeader: PropTypes.Requireable<(...args: any[]) => any>;
        unregisterInputHeader: PropTypes.Requireable<(...args: any[]) => any>;
        stateChanged: PropTypes.Requireable<(...args: any[]) => any>;
    };
    constructor(props: InputHeaderProps);
    private registerInputHeader;
    private unregisterInputHeader;
    getChildContext(): InputHeaderContext;
    componentWillUnmount(): void;
    componentDidMount(): void;
    expand(): void;
    collapse(): void;
    toggle(): void;
    render(): JSX.Element;
    private getTypeClass;
    private renderMainButton;
    private renderExtraButtons;
    private renderCollapseExpandAll;
}
export default InputHeader;
