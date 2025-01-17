import * as React from 'react';

export type BookingCalendarSelectionCoordinates = [number, number];
export interface BookingCalendarSelectionData {
  origin: BookingCalendarSelectionCoordinates;
  target: BookingCalendarSelectionCoordinates;
}
export interface BookingCalendarSelectionProps {
  disabled?: boolean;
  onSelecting?: (data: {
    origin: BookingCalendarSelectionCoordinates;
    target: BookingCalendarSelectionCoordinates;
  }) => void;
  onSelected?: (data: {
    origin: BookingCalendarSelectionCoordinates;
    target: BookingCalendarSelectionCoordinates;
  }) => void;
  dataRowsCount: number;
  minSelectionSize: number;
}

export interface BookingCalendarSelectionState {
  selectionBoxOrigin: BookingCalendarSelectionCoordinates;
  selectionBoxTarget: BookingCalendarSelectionCoordinates;
  hold: boolean;
  animation: string;
  selectionBox: boolean;
}

export default class BookingCalendarSelection extends React.Component<
  BookingCalendarSelectionProps,
  BookingCalendarSelectionState
> {
  private animationInProgress: number;
  private containerRef: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.animationInProgress = null;
    this.containerRef = React.createRef();
    this.state = {
      hold: false,
      selectionBox: false,
      selectionBoxOrigin: [0, 0],
      selectionBoxTarget: [0, 0],
      animation: '',
    };
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleTransformBox() {
    const { selectionBoxOrigin, selectionBoxTarget } = this.state;
    if (
      selectionBoxOrigin[1] > selectionBoxTarget[1] &&
      selectionBoxOrigin[0] > selectionBoxTarget[0]
    ) {
      return 'scaleY(-1) scaleX(-1)';
    }

    if (selectionBoxOrigin[1] > selectionBoxTarget[1]) {
      return 'scaleY(-1)';
    }
    if (selectionBoxOrigin[0] > selectionBoxTarget[0]) {
      return 'scaleX(-1)';
    }
    return null;
  }

  handleMouseLeave(evt: React.MouseEvent<HTMLElement>) {
    /*if (this.state.hold) {
      this.setState({
        hold: false,
        animation: 'bookingCalendar__selection--fadeout',
      });
      this.animationInProgress = (setTimeout(() => {
        this.setState({
          selectionBox: false,
          animation: '',
          selectionBoxOrigin: [0, 0],
          selectionBoxTarget: [0, 0],
        });
        this.animationInProgress = null;
      }, 300) as unknown) as number;
    }*/
  }

  handleMouseUp(evt: React.MouseEvent<HTMLElement>) {
    if (this.state.hold) {
      const distance = Math.sqrt(
        Math.pow(
          this.state.selectionBoxTarget[1] - this.state.selectionBoxOrigin[1],
          2
        ) +
          Math.pow(
            this.state.selectionBoxTarget[0] - this.state.selectionBoxOrigin[0],
            2
          )
      );
      this.setState({
        hold: false,
        animation: 'bookingCalendar__selection--fadeout',
      });
      this.animationInProgress = (setTimeout(() => {
        this.setState({
          selectionBox: false,
          animation: '',
          selectionBoxOrigin: [0, 0],
          selectionBoxTarget: [0, 0],
        });
        this.animationInProgress = null;
      }, 300) as unknown) as number;
      if (distance < this.props.minSelectionSize) {
        return;
      }
      this.props.onSelected?.({
        origin: this.state.selectionBoxOrigin,
        target: this.state.selectionBoxTarget,
      });
    }
  }

  handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (this.props.disabled || e.nativeEvent.button !== 0) {
      return;
    }
    clearTimeout(this.animationInProgress);
    this.animationInProgress = null;
    this.setState({ selectionBox: false, animation: '' });

    const bb = this.containerRef.current?.getBoundingClientRect();
    this.setState({
      hold: true,
      selectionBoxOrigin: [
        e.nativeEvent.pageX - bb.x,
        e.nativeEvent.pageY - bb.y,
      ],
      selectionBoxTarget: [
        e.nativeEvent.pageX - bb.x,
        e.nativeEvent.pageY - bb.y,
      ],
    });
  }

  private handleMouseMove(evt: React.MouseEvent<HTMLDivElement>) {
    if (this.state.hold && !this.state.selectionBox) {
      this.setState({ selectionBox: true });
    }
    if (this.state.selectionBox && !this.animationInProgress) {
      const bb = this.containerRef.current?.getBoundingClientRect();
      this.setState({
        selectionBoxTarget: [
          evt.nativeEvent.pageX - bb?.x,
          evt.nativeEvent.pageY - bb?.y,
        ],
      });

      this.props.onSelecting?.({
        origin: this.state.selectionBoxOrigin,
        target: this.state.selectionBoxTarget,
      });
    }
  }

  render() {
    const baseStyle: React.CSSProperties = {
      zIndex: 10,
      left: this.state.selectionBoxOrigin[0],
      top: this.state.selectionBoxOrigin[1],
      height: Math.abs(
        this.state.selectionBoxTarget[1] - this.state.selectionBoxOrigin[1] - 1
      ),
      width: Math.abs(
        this.state.selectionBoxTarget[0] - this.state.selectionBoxOrigin[0] - 1
      ),
      userSelect: 'none',
      transformOrigin: 'top left',
      transform: this.handleTransformBox(),
    };
    const boxVisible =
      Math.sqrt(
        Math.pow(
          this.state.selectionBoxTarget[1] - this.state.selectionBoxOrigin[1],
          2
        ) +
          Math.pow(
            this.state.selectionBoxTarget[0] - this.state.selectionBoxOrigin[0],
            2
          )
      ) > this.props.minSelectionSize;
    return (
      <div
        ref={this.containerRef}
        className="bookingCalendar__selection__container"
        style={{
          zIndex: this.state.selectionBox ? 99999 : undefined,
          gridRowEnd: `span ${this.props.dataRowsCount}`,
        }}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
      >
        {boxVisible && this.state.selectionBox && (
          <div
            className={`bookingCalendar__selection ${this.state.animation}`}
            style={baseStyle}
          />
        )}
        {this.props.children}
      </div>
    );
  }
}
