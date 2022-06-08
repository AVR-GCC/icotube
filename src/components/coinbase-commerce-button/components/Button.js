// @flow
import { Button as MuiButton } from '@mui/material';
import * as React from 'react';
import './button.css';

type Props = {
  styled?: boolean,
  children?: React.Node,
  className?: string
};

export default class Button extends React.PureComponent<Props> {
  render(){
    const {styled, children, ...props} = this.props;
    return (
      <MuiButton variant='outlined' {...props}>{children || 'Buy With Crypto'}</MuiButton>
    );
  }
}
