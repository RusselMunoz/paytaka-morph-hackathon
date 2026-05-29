import { Suspense, lazy, useState, useEffect } from 'react';
import ScreenTransition from '../components/ScreenTransition';
import ScreenLoader from '../components/ScreenLoader';
import { useAuth, useWallet } from '../contexts';

const LandingScreen = lazy(() => import('../screens/LandingScreen'));
const WalletInputScreen = lazy(() => import('../screens/WalletInputScreen'));
const WalletScreen = lazy(() => import('../screens/WalletScreen'));
const RemitScreen = lazy(() => import('../screens/RemitScreen'));
const ScannerScreen = lazy(() => import('../screens/ScannerScreen'));
const ChatbotScreen = lazy(() => import('../screens/ChatbotScreen'));
const HistoryScreen = lazy(() => import('../screens/HistoryScreen'));
const ReceiptScreen = lazy(() => import('../screens/ReceiptScreen'));
const AddFundsScreen = lazy(() => import('../screens/AddFundsScreen'));
const ContactsScreen = lazy(() => import('../screens/ContactsScreen'));

export default function AppNavigator() {
  const [activeScreen, setActiveScreen] = useState({ name: 'landing', params: {} });
  const [isInitializing, setIsInitializing] = useState(true);
  const { user, token } = useAuth();
  const { address, isConnected } = useWallet();

  // Check for saved wallet on app launch
  useEffect(() => {
    const checkSavedWallet = async () => {
      // Wait a moment for WalletContext to load saved address
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If wallet is connected (loaded from AsyncStorage), go to wallet screen
      if (isConnected && address) {
        console.log('[AppNavigator] Saved wallet found, navigating to wallet screen');
        setActiveScreen({ name: 'wallet', params: {} });
      }
      
      setIsInitializing(false);
    };

    checkSavedWallet();
  }, [isConnected, address]);

  // Show loader while checking for saved wallet
  if (isInitializing) {
    return <ScreenLoader />;
  }

  const openScreen = (name, params = {}) => {
    setActiveScreen({ name, params });
  };

  let screen;

  if (activeScreen.name === 'walletInput') {
    screen = (
      <WalletInputScreen
        onWalletLoaded={() => openScreen('wallet')}
        onBack={() => openScreen('landing')}
      />
    );
  } else if (activeScreen.name === 'contacts') {
    screen = (
      <ContactsScreen
        onBack={() => openScreen('wallet')}
      />
    );
  } else if (activeScreen.name === 'addFunds') {
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
        onOpenContacts={() => openScreen('contacts')}
      />
    );
  } else {
    screen = (
      <LandingScreen
        onAuthenticated={() => openScreen('wallet')}
        onNavigateToWalletInput={() => openScreen('walletInput')}
      />
    );
  }

  return (
    <ScreenTransition screenKey={activeScreen.name}>
      <Suspense fallback={<ScreenLoader />}>{screen}</Suspense>
    </ScreenTransition>
  );
}
