import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Vehicle Health System header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Vehicle Health System/i);
  expect(headerElement).toBeInTheDocument();
});
