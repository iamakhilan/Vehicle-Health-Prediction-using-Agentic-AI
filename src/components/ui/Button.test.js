import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click Me</Button>);
  const buttonElement = screen.getByText(/Click Me/i);
  expect(buttonElement).toBeInTheDocument();
});

test('renders disabled state when disabled prop is true', () => {
  render(<Button disabled>Click Me</Button>);
  const buttonElement = screen.getByRole('button', { name: /Click Me/i });
  expect(buttonElement).toBeDisabled();
  expect(buttonElement).toHaveClass('opacity-70');
});

test('renders loading state correctly', () => {
  render(<Button isLoading>Click Me</Button>);
  const buttonElement = screen.getByRole('button');
  expect(buttonElement).toBeDisabled(); // Should be disabled when loading
  // Check for spinner - Loader2 renders an SVG.
  // We can check if the button contains an SVG.
  const svg = buttonElement.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('animate-spin');
});
