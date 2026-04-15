import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, createSecureClient } from '@/utils/supabase';

export type Reaction = {
  id: string;
  animal_id: string;
  user_id: string;
  created_at: string;
};

export function useReactionStatus(animalId: string, userId?: string) {
  return useQuery({
    queryKey: ['reactions', animalId, userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('animal_reactions')
        .select('*')
        .eq('animal_id', animalId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!animalId && !!userId,
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ animalId, userId, userToken, hasReacted }: { 
      animalId: string; 
      userId: string; 
      userToken: string; 
      hasReacted: boolean 
    }) => {
      const secureClient = createSecureClient(userToken);

      if (hasReacted) {
        // Remove reaction
        const { error } = await secureClient
          .from('animal_reactions')
          .delete()
          .eq('animal_id', animalId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await secureClient
          .from('animal_reactions')
          .insert({ animal_id: animalId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.animalId] });
      queryClient.invalidateQueries({ queryKey: ['animals'] }); // Refresh counts
    },
  });
}
