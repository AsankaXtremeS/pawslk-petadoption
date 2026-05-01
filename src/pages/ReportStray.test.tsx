import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportStray from './ReportStray';
import * as useAnimalsHook from '@/hooks/useAnimals';
import * as UserContext from '@/contexts/UserContext';
import { MemoryRouter } from 'react-router-dom';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock framer-motion to skip animations
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion') as any;
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    },
  };
});

describe('ReportStray', () => {
  const mockMutateAsync = vi.fn();
  const mockUploadAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(UserContext, 'useUser').mockReturnValue({
      user: { id: 'user1', name: 'Test User', mobile: '1234567890' },
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      isLoading: false,
    });

    vi.spyOn(useAnimalsHook, 'useReportAnimal').mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    vi.spyOn(useAnimalsHook, 'useUpdateAnimal').mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.spyOn(useAnimalsHook, 'useUploadPhoto').mockReturnValue({
      mutateAsync: mockUploadAsync,
    } as any);

    vi.spyOn(useAnimalsHook, 'useAnimal').mockReturnValue({
      data: null,
    } as any);
    
    // Mock global fetch for location API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: { city: 'Test City' } }),
    } as any);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ReportStray />
      </MemoryRouter>
    );
  };

  it('renders the form correctly', () => {
    renderComponent();
    expect(screen.getByText('report.title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('report.locationPlaceholder')).toBeInTheDocument();
    // Name should be prefilled
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('shows error if location is missing on submit', async () => {
    renderComponent();
    const submitButton = screen.getByText('report.submit');
    fireEvent.click(submitButton);

    // Should not call mutation if location is empty
    expect(mockMutateAsync).not.toHaveBeenCalled();
    // Validation fails, in a real app toast.error is called.
  });

  it('submits successfully with location and mocked photo', async () => {
    renderComponent();
    
    // Fill location
    const locationInput = screen.getByPlaceholderText('report.locationPlaceholder');
    fireEvent.change(locationInput, { target: { value: 'Colombo' } });

    // Mock file input
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = document.getElementById('photo-input-0') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);

    // Provide a mocked upload URL
    mockUploadAsync.mockResolvedValueOnce('http://example.com/photo.png');

    // Submit
    const submitButton = screen.getByText('report.submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUploadAsync).toHaveBeenCalled();
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        location_name: 'Colombo',
        type: 'dog',
        gender: 'male',
      }));
    });
  });
});
