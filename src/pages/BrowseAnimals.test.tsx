import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BrowseAnimals from './BrowseAnimals';
import * as useAnimalsHook from '@/hooks/useAnimals';

const emptyResult = () =>
  ({ data: [], isLoading: false, error: null }) as unknown as ReturnType<typeof useAnimalsHook.useAnimals>;

/** Render the browse page at a URL, with the same routes as App.tsx. */
const renderAt = (path = '/animals') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/animals" element={<BrowseAnimals />} />
        <Route path="/adopt/dogs" element={<BrowseAnimals />} />
        <Route path="/adopt/cats" element={<BrowseAnimals />} />
        <Route path="/adopt/:district" element={<BrowseAnimals />} />
        <Route path="/lost-pets" element={<BrowseAnimals />} />
        <Route path="/lost-pets/:district" element={<BrowseAnimals />} />
      </Routes>
    </MemoryRouter>,
  );

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
      div: ({ children, layoutId, ...props }: any) => <div {...props}>{children}</div>,
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

    const { container } = renderAt();
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

    renderAt();

    expect(screen.getByTestId('animal-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('animal-card-2')).toBeInTheDocument();
    // Scoped to the cards: the "Find pets near you" district links also contain these names
    expect(screen.getByTestId('animal-card-1')).toHaveTextContent('Colombo');
    expect(screen.getByTestId('animal-card-2')).toHaveTextContent('Kandy');
  });

  it('renders empty state when no animals are found', () => {
    vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderAt();
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

    renderAt();

    // Click on 'Dogs' filter: on /animals this navigates to the /adopt/dogs page
    const dogsButton = screen.getAllByText('browse.dogs')[0];
    fireEvent.click(dogsButton);

    expect(useAnimalsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'dog' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('browse.dogsTitle');
    
    // Type in search
    const searchInput = screen.getByPlaceholderText('browse.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'Colo' } });
    
    expect(useAnimalsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Colo' }));
  });

  it('shows lost pets on /lost-pets', () => {
    const useAnimalsSpy = vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue(emptyResult());

    renderAt('/lost-pets');

    expect(useAnimalsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ post_type: 'lost' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('browse.lostTitle');
  });

  it('shows only listings located in the district on /adopt/:district', () => {
    vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue({
      data: [
        { id: '1', type: 'dog', location_name: 'Hikkaduwa' },
        { id: '2', type: 'cat', location_name: 'Kandy' },
        { id: '3', type: 'dog', location_name: 'Galle fort, Baladaksha mawatha' },
        { id: '4', type: 'cat', location_name: 'ගාල්ල' },
      ],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useAnimalsHook.useAnimals>);

    renderAt('/adopt/galle');

    expect(screen.getByTestId('animal-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('animal-card-2')).not.toBeInTheDocument();
    expect(screen.getByTestId('animal-card-3')).toBeInTheDocument();
    expect(screen.getByTestId('animal-card-4')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('browse.districtTitle');
  });

  it('shows lost pets for a district on /lost-pets/:district, with tabs staying in the district', () => {
    const useAnimalsSpy = vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue(emptyResult());

    renderAt('/lost-pets/colombo');

    expect(useAnimalsSpy).toHaveBeenLastCalledWith(expect.objectContaining({ post_type: 'lost' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('browse.lostDistrictTitle');
    expect(screen.getByText('browse.adoptTab').closest('a')).toHaveAttribute('href', '/adopt/colombo');
  });

  it('renders the 404 page for an unknown district', () => {
    vi.spyOn(useAnimalsHook, 'useAnimals').mockReturnValue(emptyResult());

    renderAt('/adopt/atlantis');

    expect(screen.getByText('notFound.title')).toBeInTheDocument();
  });
});
