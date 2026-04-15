-- =============================================
-- Migration: Add Reactions, Comments, and Notifications
-- =============================================

-- 1. Create animal_reactions table
CREATE TABLE IF NOT EXISTS public.animal_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(animal_id, user_id)
);

-- 2. Create animal_comments table
CREATE TABLE IF NOT EXISTS public.animal_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- recipient
  actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- person who reacted/commented
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('love', 'comment')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.animal_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Helper function to verify user by token
CREATE OR REPLACE FUNCTION public.verify_user_token(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_user_id
    AND u.user_token::text = coalesce(
      current_setting('request.headers', true)::json->>'x-user-token',
      ''
    )
  );
END;
$$;

-- 6. RLS Policies

-- Reactions
CREATE POLICY "Reactions are publicly viewable" ON public.animal_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.animal_reactions
  FOR ALL
  USING (verify_user_token(user_id))
  WITH CHECK (verify_user_token(user_id));

-- Comments
CREATE POLICY "Comments are publicly viewable" ON public.animal_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON public.animal_comments
  FOR ALL
  USING (verify_user_token(user_id))
  WITH CHECK (verify_user_token(user_id));

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT
  USING (verify_user_token(user_id));

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  USING (verify_user_token(user_id))
  WITH CHECK (verify_user_token(user_id));

-- 7. Triggers for notifications

-- Function for reaction notification
CREATE OR REPLACE FUNCTION public.handle_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Get the owner of the animal
  SELECT user_id INTO v_owner_id FROM public.animals WHERE id = NEW.animal_id;
  
  -- Don't notify if the owner is reacting to their own post
  IF v_owner_id IS NOT NULL AND v_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, animal_id, type)
    VALUES (v_owner_id, NEW.user_id, NEW.animal_id, 'love');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_animal_reaction
  AFTER INSERT ON public.animal_reactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_reaction_notification();

-- Function for comment notification
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Get the owner of the animal
  SELECT user_id INTO v_owner_id FROM public.animals WHERE id = NEW.animal_id;
  
  -- Don't notify if the owner is commenting on their own post
  IF v_owner_id IS NOT NULL AND v_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, animal_id, type)
    VALUES (v_owner_id, NEW.user_id, NEW.animal_id, 'comment');
  END IF;
  
  -- Note: Could also notify other commenters here if threading is added later
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_animal_comment
  AFTER INSERT ON public.animal_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();

-- 8. Grants
GRANT SELECT, INSERT, DELETE ON public.animal_reactions TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.animal_comments TO anon, authenticated;
GRANT SELECT, UPDATE ON public.notifications TO anon, authenticated;
