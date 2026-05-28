import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, RealtimeProvider, WalletProvider, useAuth, useRealtime } from './src/contexts';

function SessionBridge({ children }) {
  const { user } = useAuth();
  const { connectUserStream, disconnect } = useRealtime();

  useEffect(() => {
    if (user?.id) {
      connectUserStream(user.id);
      return;
    }

    disconnect();
  }, [connectUserStream, disconnect, user?.id]);

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <RealtimeProvider>
          <SessionBridge>
            <AppNavigator />
          </SessionBridge>
        </RealtimeProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
