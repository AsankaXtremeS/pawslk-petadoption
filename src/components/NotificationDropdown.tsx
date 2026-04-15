import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell as Bell, FaHeart as Heart, FaComment as CommentIcon, FaCheckDouble as CheckDouble } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/contexts/UserContext';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function NotificationDropdown() {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications(user?.id, user?.userToken);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const recentNotifications = notifications?.slice(0, 5) || [];

  const handleMarkAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    await markAllRead.mutateAsync({ userId: user.id, userToken: user.userToken });
  };

  const handleNotifClick = async (notif: any) => {
    setOpen(false);
    if (!notif.is_read && user) {
      await markRead.mutateAsync({ id: notif.id, userToken: user.userToken });
    }
    navigate(`/animals/${notif.animal_id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted/60 transition-colors group">
          <Bell className={`h-4 w-4 transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden rounded-2xl border-border/50 shadow-2xl" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/20">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-primary" />
            {t('notifications.title') || 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAll}
              className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <CheckDouble className="w-3 h-3" />
              {t('notifications.markAllRead') || 'Mark all read'}
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[350px]">
          <div className="flex flex-col">
            {recentNotifications.length > 0 ? (
              <AnimatePresence initial={false}>
                {recentNotifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      relative p-3 border-b border-border/40 cursor-pointer transition-colors hover:bg-muted/30
                      ${notif.is_read ? 'opacity-60' : 'bg-primary/5'}
                    `}
                    onClick={() => handleNotifClick(notif)}
                  >
                    <div className="flex gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${notif.type === 'love' ? 'bg-rose-50 text-rose-500' : 'bg-success/10 text-success'}
                      `}>
                        {notif.type === 'love' ? <Heart className="w-3 h-3 fill-current" /> : <CommentIcon className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] leading-tight text-foreground">
                          <span className="font-bold">{notif.actor?.name || t('common.user')}</span>
                          {' '}
                          <span className="text-muted-foreground">
                            {notif.type === 'love' 
                              ? t('notifications.loved') || 'loved your'
                              : t('notifications.commented') || 'commented on your'}
                          </span>
                          {' '}
                          <span className="font-bold">
                            {t('notifications.post')}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : (i18n.language === 'si' ? 'si-LK' : 'ta-LK'), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-muted-foreground/30" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">{t('detail.noComments') || 'No notifications yet'}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 bg-muted/10 border-t">
          <Link 
            to="/notifications" 
            onClick={() => setOpen(false)}
            className="block w-full text-center py-2 rounded-xl bg-muted/50 hover:bg-muted text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            {t('notifications.viewAll') || 'View all notifications'}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
