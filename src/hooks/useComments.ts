import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, createSecureClient } from '@/utils/supabase';

export type Comment = {
  id: string;
  animal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    name: string;
  };
};

export function useComments(animalId: string) {
  return useQuery({
    queryKey: ['comments', animalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('animal_comments')
        .select('*, user:users(name)')
        .eq('animal_id', animalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: !!animalId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ animalId, userId, userToken, content }: {
      animalId: string;
      userId: string;
      userToken: string;
      content: string;
    }) => {
      const secureClient = createSecureClient(userToken);
      const { data, error } = await secureClient
        .from('animal_comments')
        .insert({
          animal_id: animalId,
          user_id: userId,
          content
        })
        .select('*, user:users(name)')
        .single();

      if (error) throw error;
      return data as Comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.animalId] });
      queryClient.invalidateQueries({ queryKey: ['animals'] }); // Refresh counts
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userToken }: { id: string; userToken: string }) => {
      const secureClient = createSecureClient(userToken);
      const { error } = await secureClient
        .from('animal_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    },
  });
}
