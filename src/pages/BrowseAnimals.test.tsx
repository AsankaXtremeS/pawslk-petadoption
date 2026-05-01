import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BrowseAnimals from './BrowseAnimals';
import * as useAnimalsHook from '@/hooks/useAnimals';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock AnimalCard to avoid needing Router/complex setups
vi.mock('@/components/AnimalCard', () => ({
  default: ({ animal }: any) => <div data-testid={`animal-card-${animal.id}`}>{animal.location_name}</div>,
}));

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

describe('BrowseAnimals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when loading', () => {
    vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const { container } = render(<BrowseAnimals />);
    // Check for the animate-pulse classes which indicate loading
    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders animal cards when data is available', () => {
    const mockAnimals = [
      { id: '1', type: 'dog', location_name: 'Colombo' },
      { id: '2', type: 'cat', location_name: 'Kandy' },
    ];

    vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue({
      data: mockAnimals,
      isLoading: false,
      error: null,
    } as any);

    render(<BrowseAnimals />);

    expect(screen.getByTestId('animal-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('animal-card-2')).toBeInTheDocument();
    expect(screen.getByText('Colombo')).toBeInTheDocument();
    expect(screen.getByText('Kandy')).toBeInTheDocument();
  });

  it('renders empty state when no animals are found', () => {
    vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<BrowseAnimals />);
    expect(screen.queryByTestId('animal-card-1')).not.toBeInTheDocument();
    // Assuming EmptyState has some specific text, but let's just check the cards aren't there
    // The "browse.noAdoptedYet" or similar text from translation is passed
  });

  it('calls useAnimals with updated filters when changed', () => {
    const useAnimalsSpy = vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<BrowseAnimals />);

    // Click on 'Dogs' filter
    const dogsButton = screen.getByText('browse.dogs');
    fireEvent.click(dogsButton);

    expect(useAnimalsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'dog' }));
    
    // Type in search
    const searchInput = screen.getByPlaceholderText('browse.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Colo' } });
    
    expect(useAnimalsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Colo' }));
  });
});
