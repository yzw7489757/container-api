import React from 'react';

interface UpdatableProps {
  when: boolean
}
export default class Updatable extends React.Component<UpdatableProps> {
  render = () => this.props.children;

  shouldComponentUpdate = (nextProps: UpdatableProps) => nextProps.when;
}
