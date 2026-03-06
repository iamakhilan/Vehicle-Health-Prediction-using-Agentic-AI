import { render, screen } from '@testing-library/react';
import App from './App';

// Mock recharts to avoid rendering complex SVG elements in jest dom
jest.mock('recharts', () => {
  const OriginalRechartsModule = jest.requireActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }) => <div className="recharts-responsive-container">{children}</div>,
    LineChart: ({ children }) => <div className="recharts-line-chart">{children}</div>,
    Line: () => <div className="recharts-line" />,
    XAxis: () => <div className="recharts-x-axis" />,
    YAxis: () => <div className="recharts-y-axis" />,
  };
});

test('renders vehicle health dashboard main elements', () => {
  render(<App />);
  const titleElement = screen.getByText(/Vehicle Health System/i);
  expect(titleElement).toBeInTheDocument();

  const modelText = screen.getByText(/My Model S/i);
  expect(modelText).toBeInTheDocument();
});
