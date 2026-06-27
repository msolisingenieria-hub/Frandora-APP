import { useEffect, useCallback } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/realtime/client";

type NotificationRow = {
  id: string;
  type: string;
  event: string;
  body: string;
  businessId: string | null;
  userId: string | null;
};

type Options = {
  userId?: string;
  businessId?: string;
  onNew?: (row: NotificationRow) => void;
};

// Escucha notificaciones en tiempo real para un usuario o negocio
export function useRealtimeNotifications({ userId, businessId, onNew }: Options) {
  const handleInsert = useCallback(
    (payload: RealtimePostgresChangesPayload<NotificationRow>) => {
      if (payload.eventType === "INSERT" && onNew) onNew(payload.new);
    },
    [onNew]
  );

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || (!userId && !businessId)) return;

    const channelName = userId
      ? `notifications:user:${userId}`
      : `notifications:biz:${businessId}`;

    const filter = userId
      ? `userId=eq.${userId}`
      : `businessId=eq.${businessId}`;

    const channel = supabase
      .channel(channelName)
      .on<NotificationRow>(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Notification", filter },
        handleInsert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, businessId, handleInsert]);
}
