import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { API_WS_URL } from '../lib/config';

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const socketRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const disconnect = useCallback(() => {
    socketRef.current?.close?.();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const connectUserStream = useCallback(
    (userId) => {
      if (!userId) {
        return;
      }

      disconnect();

      const socket = new WebSocket(`${API_WS_URL}/users/${userId}`);
      socketRef.current = socket;

      socket.onopen = () => setIsConnected(true);
      socket.onclose = () => setIsConnected(false);
      socket.onerror = () => setIsConnected(false);
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          setEvents((currentEvents) => [event, ...currentEvents].slice(0, 50));
        } catch {
          setEvents((currentEvents) => [{ type: 'unknown', raw: message.data }, ...currentEvents].slice(0, 50));
        }
      };
    },
    [disconnect]
  );

  const value = useMemo(
    () => ({
      events,
      isConnected,
      connectUserStream,
      disconnect,
    }),
    [connectUserStream, disconnect, events, isConnected]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error('useRealtime must be used inside RealtimeProvider');
  }

  return context;
}
