import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CityAutocomplete from './CityAutocomplete';

// Mock framer-motion to skip animations
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion') as any;
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
  };
});

describe('CityAutocomplete', () => {
  it('renders input with given value and placeholder', () => {
    const handleChange = vi.fn();
    render(
      <CityAutocomplete
        value="Colombo"
        onChange={handleChange}
        placeholder="Enter city..."
      />
    );

    const input = screen.getByPlaceholderText('Enter city...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Colombo');
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(
      <CityAutocomplete
        value=""
        onChange={handleChange}
        placeholder="Enter city..."
      />
    );

    const input = screen.getByPlaceholderText('Enter city...');
    fireEvent.change(input, { target: { value: 'Kan' } });
    expect(handleChange).toHaveBeenCalledWith('Kan');
  });

  it('does not show dropdown when input is empty on focus', () => {
    const handleChange = vi.fn();
    render(
      <CityAutocomplete
        value=""
        onChange={handleChange}
        placeholder="Enter city..."
      />
    );

    const input = screen.getByPlaceholderText('Enter city...');
    fireEvent.focus(input);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('selects a suggestion on click when typing', () => {
    const handleChange = vi.fn();
    const handleSelect = vi.fn();
    render(
      <CityAutocomplete
        value="Colo"
        onChange={handleChange}
        onSelectCity={handleSelect}
        placeholder="Enter city..."
      />
    );

    const input = screen.getByPlaceholderText('Enter city...');
    fireEvent.focus(input);

    // List items should appear from sl-address
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);

    // Click the first suggestion
    fireEvent.click(listItems[0]);
    expect(handleChange).toHaveBeenCalled();
    expect(handleSelect).toHaveBeenCalled();
  });
});
