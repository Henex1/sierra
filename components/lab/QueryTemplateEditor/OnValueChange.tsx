import * as React from "react";
import { Field } from "react-final-form";

type Props = {
  name: string;
  children: (value: any, previous: any) => void;
  value: any;
};

type OnChangeStateProps = {
  children: (value: any, previous: any) => void;
  value: any;
};

type State = {
  previous: any;
};

class OnChangeState extends React.Component<OnChangeStateProps, State> {
  state: State;

  constructor(props: OnChangeStateProps) {
    super(props);
    this.state = {
      previous: props.value,
    };
  }

  componentDidUpdate() {
    const { children, value } = this.props;
    const { previous } = this.state;
    if (value !== previous) {
      this.setState({ previous: value });
      children(value, previous);
    }
  }

  render() {
    return null;
  }
}

export default function OnValueChange({ name, children, value }: Props) {
  return (
    <Field
      allowNull
      name={name}
      render={() => React.createElement(OnChangeState, { value, children })}
    />
  );
}
