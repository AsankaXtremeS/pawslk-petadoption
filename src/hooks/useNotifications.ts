import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, createSecureClient } from '@/utils/supabase';
import { useEffect } from 'react';

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  animal_id: string;
  type: 'love' | 'comment';
  is_read: boolean;
  created_at: string;
  actor?: {
    name: string;
  };
  animal?: {
    type: string;
    location_name: string;
  };
};

export function useNotifications(userId: string | undefined, userToken: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    
    // Use a unique channel ID for each instance to avoid "after subscribe" errors
    const channelId = `notifications-${userId}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId || !userToken) return [];
      
      const secureClient = createSecureClient(userToken);
      const { data, error } = await secureClient
        .from('notifications')
        .select('*, actor:users!notifications_actor_id_fkey(name), animal:animals(type, location_name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId && !!userToken,
  });
}

export function useUnreadNotificationCount(userId: string | undefined, userToken: string | undefined) {
  const { data: notifications } = useNotifications(userId, userToken);
  return notifications?.filter(n => !n.is_read).length || 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userToken }: { id: string; userToken: string }) => {
      const secureClient = createSecureClient(userToken);
      const { error } = await secureClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userToken }: { userId: string; userToken: string }) => {
      const secureClient = createSecureClient(userToken);
      const { error } = await secureClient
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
