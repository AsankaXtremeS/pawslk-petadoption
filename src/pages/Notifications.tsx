import { useUser } from '@/contexts/UserContext';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart as HeartSolid, FaComment as CommentIcon, FaCheck as CheckIcon, FaArrowLeft as ArrowLeft, FaBell as BellOff } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: notifications, isLoading } = useNotifications(user?.id, user?.userToken);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await markRead.mutateAsync({ id: notif.id, userToken: user!.userToken });
    }
    navigate(`/animals/${notif.animal_id}`);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead.mutateAsync({ userId: user.id, userToken: user.userToken });
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8 space-y-4 px-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="container max-w-2xl h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="font-heading text-lg font-bold">{t('notifications.title')}</h1>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full"
            >
              <CheckIcon className="w-3 h-3 mr-1.5" />
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>
      </div>

      <div className="container max-w-2xl py-6 px-4">
        <AnimatePresence mode="popLayout">
          {notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`
                    flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98]
                    ${notif.is_read 
                      ? 'bg-card border-border opacity-80' 
                      : 'bg-primary/5 border-primary/20 ring-1 ring-primary/10 shadow-sm'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${notif.type === 'love' ? 'bg-rose-50 text-rose-500' : 'bg-success/10 text-success'}
                  `}>
                    {notif.type === 'love' ? <HeartSolid className="w-4 h-4" /> : <CommentIcon className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1">
                      <p className="text-sm leading-tight">
                        <span className="font-bold text-foreground">
                          {notif.actor?.name || t('common.user')}
                        </span>{' '}
                        {notif.type === 'love' ? t('notifications.loved') : t('notifications.commented')}
                        {' '}<span className="font-bold text-primary">{t('notifications.post')}</span>
                      </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0 bg-destructive" />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BellOff className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <h3 className="font-heading text-lg font-bold">{t('notifications.empty')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('notifications.emptyDesc')}</p>
              <Button
                variant="outline"
                className="mt-6 rounded-full px-6"
                onClick={() => navigate('/animals')}
              >
                {t('browse.title')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
