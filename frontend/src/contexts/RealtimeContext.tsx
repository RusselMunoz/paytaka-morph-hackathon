import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

type RealtimeEvent = {
  type: string;
  [key: string]: unknown;
};

type RealtimeContextValue = {
  events: RealtimeEvent[];
  connectUserStream: (userId: string) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export function RealtimeProvider({ children }: PropsWithChildren) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const connectUserStream = useCallback((userId: string) => {
    const wsBaseUrl = process.env.EXPO_PUBLIC_API_WS_URL ?? "ws://localhost:4000/ws";
    const ws = new WebSocket(`${wsBaseUrl}/users/${userId}`);

    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as RealtimeEvent;
        setEvents((current) => [event, ...current].slice(0, 50));
      } catch {
        setEvents((current) => [{ type: "unknown", raw: message.data }, ...current].slice(0, 50));
      }
    };
  }, []);

  const value = useMemo(() => ({ events, connectUserStream }), [connectUserStream, events]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used inside RealtimeProvider");
  }

  return context;
}
