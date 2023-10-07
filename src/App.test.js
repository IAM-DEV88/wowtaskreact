import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import CharList from './CharList';

test('Must display title', () => {
  render(<CharList />);
  const title = screen.getByText(/v1/i);
  expect(title).toBeInTheDocument();
});
