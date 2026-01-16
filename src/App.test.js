import { render, screen } from '@testing-library/react';
import App from './App';

test('renders vehicle health app', () => {
  render(<App />);
  const monitorElement = screen.getByText(/01. Monitor/i);
  expect(monitorElement).toBeInTheDocument();
});
