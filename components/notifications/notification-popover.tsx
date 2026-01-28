"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Inbox } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationsInbox } from "@/hooks/use-notifications-inbox"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function NotificationPopover() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationsInbox()

  const handleNotificationClick = (notificationId: string, url?: string) => {
    markAsRead(notificationId)
    if (url) {
      setOpen(false)
      router.push(url)
    }
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
  }

  const handleClearAll = () => {
    clearAll()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-3">
          <h3 className="font-semibold">Notificaciones</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Marcar todo
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No tienes notificaciones
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative flex cursor-pointer gap-3 p-3 transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() =>
                    handleNotificationClick(notification.id, notification.url)
                  }
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                  )}

                  <div className="min-w-0 flex-1 pl-2">
                    <p
                      className={cn(
                        "text-sm",
                        !notification.read && "font-medium"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.body}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                      {notification.url && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              setOpen(false)
              router.push("/dashboard/notificaciones")
            }}
          >
            Ver centro de notificaciones
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
