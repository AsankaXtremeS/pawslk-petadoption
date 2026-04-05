import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
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
 * Ownership is verified client-side (UI hides button) and server-side (RLS).
 */
export function useUpdateAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: {
      id: string;
      updates: Partial<Pick<Animal, 'type' | 'gender' | 'photo_url' | 'location_name' | 'description'>>
    }) => {
      const { data, error } = await supabase
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
 */
export function useMarkAdopted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('animals')
        .update({ is_adopted: true, adopted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId); // Double-check ownership
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['animals'] }),
  });
}

export function useUploadPhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('animal-photos').upload(fileName, file);
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
