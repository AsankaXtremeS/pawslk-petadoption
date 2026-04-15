import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, createSecureClient } from '@/utils/supabase';
import { useEffect } from 'react';

export type Animal = {
  id: string;
  created_at: string;
  type: 'dog' | 'cat';
  gender: 'male' | 'female';
  photo_url: string | null;
  location_name: string;
  description: string | null;
  reporter_name: string | null;
  is_adopted: boolean;
  adopted_at: string | null;
  user_id: string | null;
  contact_number: string | null;
};

export function useAnimals(filters?: { type?: string; gender?: string; status?: string; search?: string }) {
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('animals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, () => {
        queryClient.invalidateQueries({ queryKey: ['animals'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['animals', filters],
    queryFn: async () => {
      let query = supabase.from('animals').select('*').order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters?.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }
      if (filters?.status === 'adopted') {
        query = query.eq('is_adopted', true);
      } else if (filters?.status === 'waiting') {
        query = query.eq('is_adopted', false);
      }
      if (filters?.search) {
        query = query.or(`location_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Animal[];
    },
  });
}

/**
 * Fetch waiting (not adopted) animals only — used for main Index view.
 */
export function useWaitingAnimals() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('animals-waiting')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, () => {
        queryClient.invalidateQueries({ queryKey: ['animals', 'waiting'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ['animals', 'waiting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('is_adopted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Animal[];
    },
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ['animals', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('animals').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Animal;
    },
    enabled: !!id,
  });
}

export function useReportAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (animal: {
      type: string;
      gender: string;
      photo_url?: string;
      location_name: string;
      description?: string;
      reporter_name?: string;
      user_id?: string;
      contact_number?: string;
    }) => {
      const { data, error } = await supabase.from('animals').insert([animal]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animals'] }),
  });
}

/**
 * Update an animal post — only the owner should call this.
 * Uses createSecureClient with user_token header for SERVER-SIDE ownership verification.
 * The RLS policy checks x-user-token against the user's secret in the DB.
 */
export function useUpdateAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userToken, updates }: {
      id: string;
      userToken: string;
      updates: Partial<Pick<Animal, 'type' | 'gender' | 'photo_url' | 'location_name' | 'description'>>
    }) => {
      const secureClient = createSecureClient(userToken);
      const { data, error } = await secureClient
        .from('animals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animals'] }),
  });
}

/**
 * Mark an animal as adopted — only the post creator should call this.
 * Uses secure client with user_token for server-side ownership check.
 */
export function useMarkAdopted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, userToken, isAdopted = true }: { id: string; userId: string; userToken: string; isAdopted?: boolean }) => {
      const secureClient = createSecureClient(userToken);
      const { data, error } = await secureClient
        .from('animals')
        .update({ 
          is_adopted: isAdopted, 
          adopted_at: isAdopted ? new Date().toISOString() : null 
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Verification failed. Only the post creator can change this status.');
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animals'] }),
  });
}


export function useUploadPhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Dynamically import to keep the main bundle lean
      const { compressImage, validateImageSize } = await import('@/utils/imageCompression');

      // Validate size (max 5MB)
      if (!validateImageSize(file)) {
        throw new Error('Image is too large. Maximum size is 5MB.');
      }

      // Compress to WebP (~300KB, max 1200px)
      const compressed = await compressImage(file);

      const fileName = `${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from('animal-photos').upload(fileName, compressed, {
        contentType: 'image/webp',
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('animal-photos').getPublicUrl(fileName);
      return urlData.publicUrl;
    },
  });
}

export function useAnimalStats() {
  return useQuery({
    queryKey: ['animals', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('animals').select('*');
      if (error) throw error;
      const animals = data as Animal[];
      const total = animals.length;
      const adopted = animals.filter(a => a.is_adopted).length;
      const waiting = total - adopted;
      const dogs = animals.filter(a => a.type === 'dog').length;
      const cats = animals.filter(a => a.type === 'cat').length;
      const adoptionRate = total > 0 ? Math.round((adopted / total) * 100) : 0;

      // Monthly data (last 6 months)
      const now = new Date();
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const count = animals.filter(a => {
          const created = new Date(a.created_at);
          return created >= d && created <= monthEnd;
        }).length;
        monthlyData.push({
          month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          count,
        });
      }

      // Top locations
      const locationMap: Record<string, number> = {};
      animals.forEach(a => {
        locationMap[a.location_name] = (locationMap[a.location_name] || 0) + 1;
      });
      const topLocations = Object.entries(locationMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Recently adopted
      const recentlyAdopted = animals
        .filter(a => a.is_adopted && a.adopted_at)
        .sort((a, b) => new Date(b.adopted_at!).getTime() - new Date(a.adopted_at!).getTime())
        .slice(0, 5);

      return { total, adopted, waiting, dogs, cats, adoptionRate, monthlyData, topLocations, recentlyAdopted };
    },
  });
}

/**
 * Fetch all animals belonging to a specific user.
 * Used on the Profile page to show the user's listings.
 */
export function useUserAnimals(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('user-animals-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animals' }, () => {
        queryClient.invalidateQueries({ queryKey: ['animals', 'user', userId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, userId]);

  return useQuery({
    queryKey: ['animals', 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Animal[];
    },
    enabled: !!userId,
  });
}

/**
 * Delete an animal post — only the owner can do this.
 * Uses createSecureClient with user_token header for SERVER-SIDE ownership verification.
 */
export function useDeleteAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userToken }: { id: string; userToken: string }) => {
      const secureClient = createSecureClient(userToken);
      const { error } = await secureClient
        .from('animals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animals'] }),
  });
}
