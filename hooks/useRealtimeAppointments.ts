import { useEffect, useCallback } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/realtime/client";

type AppointmentRow = {
  id: string;
  status: string;
  staffId: string | null;
  startTime: string;
  businessId: string;
};

type Options = {
  businessId: string;
  onInsert?: (row: AppointmentRow) => void;
  onUpdate?: (row: AppointmentRow) => void;
  onDelete?: (row: AppointmentRow) => void;
};

// Escucha cambios en tiempo real en las citas de un negocio
export function useRealtimeAppointments({ businessId, onInsert, onUpdate, onDelete }: Options) {
  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<AppointmentRow>) => {
      if (payload.eventType === "INSERT" && onInsert) onInsert(payload.new);
      if (payload.eventType === "UPDATE" && onUpdate) onUpdate(payload.new);
      if (payload.eventType === "DELETE" && onDelete) onDelete(payload.old as AppointmentRow);
    },
    [onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !businessId) return;

    const channel = supabase
      .channel(`appointments:${businessId}`)
      .on<AppointmentRow>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Appointment",
          filter: `businessId=eq.${businessId}`,
        },
        handleChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, handleChange]);
}
