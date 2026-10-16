import { renderHook, waitFor } from '@testing-library/react';
import { useAnimals, useReportAnimal } from './useAnimals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase, createSecureClient } from '@/utils/supabase';

// Mock the supabase client
vi.mock('@/utils/supabase', () => {
  return {
    supabase: {
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn(),
      }),
      removeChannel: vi.fn(),
      from: vi.fn(),
    },
    createSecureClient: vi.fn(),
  };
});

describe('useAnimals hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('useAnimals fetches and formats animal data correctly', async () => {
    const mockData = [
      {
        id: '1',
        type: 'dog',
        is_adopted: false,
        reaction_count: [{ count: 5 }],
        comment_count: [{ count: 2 }],
      },
    ];

    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    // Setup the mock chain: supabase.from('animals').select(...).order(...)
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
    } as any);

    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
    } as any);

    const { result } = renderHook(() => useAnimals(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data![0].reaction_count).toBe(5);
    expect(result.current.data![0].comment_count).toBe(2);
    expect(supabase.from).toHaveBeenCalledWith('animals');
  });

  it('useReportAnimal inserts via the secure client without leaking the token into the row', async () => {
    const newAnimal = {
      type: 'cat',
      gender: 'female',
      location_name: 'Colombo',
    };

    const mockInsert = vi.fn();
    const mockSelect = vi.fn();
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: '2', ...newAnimal }, error: null });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

    vi.mocked(createSecureClient).mockReturnValue({ from: mockFrom } as any);
    mockInsert.mockReturnValue({ select: mockSelect } as any);
    mockSelect.mockReturnValue({ single: mockSingle } as any);

    const { result } = renderHook(() => useReportAnimal(), { wrapper });

    result.current.mutate({ ...newAnimal, userToken: 'token-123' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createSecureClient).toHaveBeenCalledWith('token-123');
    expect(mockFrom).toHaveBeenCalledWith('animals');
    expect(mockInsert).toHaveBeenCalledWith([newAnimal]);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
