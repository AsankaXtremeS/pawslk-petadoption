import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRegComment as CommentIcon, FaPaperPlane as SendIcon, FaTrashAlt as TrashIcon } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useComments';
import { friendlyError } from '@/utils/errors';
import { getDateLocale } from '@/lib/utils';

interface CommentsSectionProps {
  animalId: string;
  commentCount: number;
}

export default function CommentsSection({ animalId, commentCount }: CommentsSectionProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: comments } = useComments(animalId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const goToLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}&message=detail.loginRequired`);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      goToLogin();
      return;
    }
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      await addComment.mutateAsync({
        animalId,
        userId: user.id,
        userToken: user.userToken,
        content: commentText.trim()
      });
      setCommentText('');
      toast.success(t('detail.commentAdded'));
    } catch (err) {
      toast.error(friendlyError(err, t('detail.genericError')));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    const deletePromise = deleteComment.mutateAsync({
      id: commentId,
      userToken: user.userToken
    });

    toast.promise(deletePromise, {
      loading: t('profile.actions.deleting'),
      success: t('detail.commentDeleted'),
      error: (err) => friendlyError(err, t('detail.genericError'))
    });
  };

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white/60 dark:bg-card/60 backdrop-blur-md border border-white/20 dark:border-border/10 shadow-soft space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <h3 className="font-heading text-lg font-black inline-flex items-center gap-2 text-foreground">
          <CommentIcon className="text-primary h-5 w-5" />
          {t('detail.comments')}
          <span className="text-sm font-bold text-muted-foreground ml-1">
            ({commentCount})
          </span>
        </h3>
      </div>

      {/* Comment List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 hide-scrollbar">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={comment.id}
              className="flex gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/5 shadow-sm">
                {comment.user?.name.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 bg-muted/30 dark:bg-muted/10 rounded-2xl p-3 relative border border-border/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-foreground">
                    {comment.user?.name || t('common.user')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      {new Date(comment.created_at).toLocaleDateString(getDateLocale(i18n.language), { month: 'short', day: 'numeric' })}
                    </span>
                    {user && comment.user_id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded hover:bg-destructive/10"
                        title={t('common.delete')}
                      >
                        <TrashIcon className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 bg-muted/20 dark:bg-muted/5 rounded-2xl border border-dashed border-border/30">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">{t('detail.noComments')}</p>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="relative mt-4 pt-4 border-t border-border/40">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t('detail.addCommentPlaceholder')}
          className="w-full min-h-[90px] bg-muted/20 dark:bg-muted/5 border border-border/30 dark:border-border/10 rounded-2xl p-4 text-xs md:text-sm resize-none focus:ring-2 focus:ring-primary/20 transition-all outline-none pb-12 text-foreground"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment(e);
            }
          }}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={!commentText.trim() || isSubmittingComment}
            className="rounded-xl px-4 py-2 h-8 font-black text-xs shadow-sm"
          >
            {isSubmittingComment ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <SendIcon className="w-3 h-3 mr-2" />
                {t('common.send')}
              </>
            )}
          </Button>
        </div>
        {!user && (
          <div
            className="absolute inset-0 bg-background/50 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl cursor-pointer group"
            onClick={goToLogin}
          >
            <div className="bg-background border shadow-md px-4 py-2 rounded-full text-xs font-black text-primary group-hover:scale-105 transition-transform">
              {t('detail.loginToComment')}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
