import { Suspense, lazy, useState, useEffect } from 'react';
import ScreenTransition from '../components/ScreenTransition';
import ScreenLoader from '../components/ScreenLoader';
import { useAuth, useWallet } from '../contexts';

const LandingScreen = lazy(() => import('../screens/LandingScreen'));
const WalletScreen = lazy(() => import('../screens/WalletScreen'));
const RemitScreen = lazy(() => import('../screens/RemitScreen'));
const ScannerScreen = lazy(() => import('../screens/ScannerScreen'));
const ChatbotScreen = lazy(() => import('../screens/ChatbotScreen'));
const HistoryScreen = lazy(() => import('../screens/HistoryScreen'));
const ReceiptScreen = lazy(() => import('../screens/ReceiptScreen'));
const AddFundsScreen = lazy(() => import('../screens/AddFundsScreen'));

// Demo session data
const DEMO_USER = {
  id: 'demo-user-123',
  displayName: 'Demo User',
  email: 'demo@paytaka.com',
  role: 'RECIPIENT',
};

const DEMO_TOKEN = 'demo-token-for-testing';
const DEMO_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export default function AppNavigator() {
  const [activeScreen, setActiveScreen] = useState({ name: 'landing', params: {} });
  const [isDemoSessionLoaded, setIsDemoSessionLoaded] = useState(false);
  const { user, token } = useAuth();
  const { address, connectWithAddress } = useWallet();

  // Auto-load demo session on app start
  useEffect(() => {
    if (!isDemoSessionLoaded && !user && !token) {
      // Simulate demo session by setting context values
      // Note: Since we can't directly call context setters here,
      // we'll rely on the WalletScreen to auto-connect the demo wallet
      setIsDemoSessionLoaded(true);
    }
  }, [isDemoSessionLoaded, user, token]);

  const openScreen = (name, params = {}) => {
    setActiveScreen({ name, params });
  };

  let screen;

  if (activeScreen.name === 'addFunds') {
    screen = (
      <AddFundsScreen
        onBack={() => openScreen('wallet')}
      />
    );
  } else if (activeScreen.name === 'chatbot') {
    screen = (
      <ChatbotScreen
        onBackToWallet={() => openScreen('wallet')}
        onBackToLanding={() => openScreen('landing')}
      />
    );
  } else if (activeScreen.name === 'history') {
    screen = (
      <HistoryScreen
        onBackToWallet={() => openScreen('wallet')}
        onBackToLanding={() => openScreen('landing')}
        onOpenRemit={(prefill) => openScreen('remit', { prefill })}
        onOpenScanner={() => openScreen('scanner')}
        onOpenReceipt={(remittance) => openScreen('receipt', { remittance })}
      />
    );
  } else if (activeScreen.name === 'receipt') {
    screen = (
      <ReceiptScreen
        remittance={activeScreen.params.remittance}
        onBackToWallet={() => openScreen('wallet')}
        onBackToLanding={() => openScreen('landing')}
        onOpenHistory={() => openScreen('history')}
      />
    );
  } else if (activeScreen.name === 'remit') {
    screen = (
      <RemitScreen
        prefill={activeScreen.params.prefill}
        onBackToWallet={() => openScreen('wallet')}
        onBackToLanding={() => openScreen('landing')}
        onOpenHistory={() => openScreen('history')}
        onOpenScanner={() => openScreen('scanner')}
        onOpenReceipt={(remittance) => openScreen('receipt', { remittance })}
      />
    );
  } else if (activeScreen.name === 'scanner') {
    screen = (
      <ScannerScreen
        onBackToWallet={() => openScreen('wallet')}
        onBackToLanding={() => openScreen('landing')}
        onOpenHistory={() => openScreen('history')}
        onOpenRemit={(prefill) => openScreen('remit', { prefill })}
      />
    );
  } else if (activeScreen.name === 'wallet') {
    screen = (
      <WalletScreen
        onBackToLanding={() => openScreen('landing')}
        onOpenChatbot={() => openScreen('chatbot')}
        onOpenHistory={() => openScreen('history')}
        onOpenRemit={(prefill) => openScreen('remit', { prefill })}
        onOpenScanner={() => openScreen('scanner')}
        onOpenReceipt={(remittance) => openScreen('receipt', { remittance })}
        onOpenAddFunds={() => openScreen('addFunds')}
      />
    );
  } else {
    screen = <LandingScreen onAuthenticated={() => openScreen('wallet')} />;
  }

  return (
    <ScreenTransition screenKey={activeScreen.name}>
      <Suspense fallback={<ScreenLoader />}>{screen}</Suspense>
    </ScreenTransition>
  );
}
