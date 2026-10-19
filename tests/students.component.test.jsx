import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { DataProvider } from '../src/services/DataContext.jsx';
import { StudentsPage } from '../src/pages/Students.jsx';

it('renders the seeded roster and filters it by the entered search text', () => {
  render(<MemoryRouter><DataProvider><StudentsPage /></DataProvider></MemoryRouter>);

  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getByText('Aarav Mehta')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search students' }), { target: { value: 'Ishita' } });
  expect(screen.getByText('Ishita Nair')).toBeInTheDocument();
  expect(screen.queryByText('Aarav Mehta')).not.toBeInTheDocument();
});