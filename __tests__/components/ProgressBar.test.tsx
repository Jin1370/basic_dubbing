import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressBar from '../../components/ProgressBar';

describe('ProgressBar', () => {
  it('renders with given percent', () => {
    const { getByLabelText } = render(<ProgressBar percent={50} />);
    const bar = getByLabelText('진행률 50%');
    expect(bar).toBeTruthy();
    expect(bar.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 50,
    });
  });

  it('clamps percent below 0 to 0', () => {
    const { getByLabelText } = render(<ProgressBar percent={-10} />);
    const bar = getByLabelText('진행률 0%');
    expect(bar.props.accessibilityValue.now).toBe(0);
  });

  it('clamps percent above 100 to 100', () => {
    const { getByLabelText } = render(<ProgressBar percent={150} />);
    const bar = getByLabelText('진행률 100%');
    expect(bar.props.accessibilityValue.now).toBe(100);
  });
});
