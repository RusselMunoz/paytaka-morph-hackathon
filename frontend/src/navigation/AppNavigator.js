import { useState } from 'react';
import LandingScreen from '../screens/LandingScreen';
import WalletScreen from '../screens/WalletScreen';
import RemitScreen from '../screens/RemitScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import ScreenTransition from '../components/ScreenTransition';

export default function AppNavigator() {
  const [activeScreen, setActiveScreen] = useState('landing');

  if (activeScreen === 'wallet') {
    return (
      <ScreenTransition screenKey={activeScreen}>
        <WalletScreen
          onBackToLanding={() => setActiveScreen('landing')}
          onOpenChatbot={() => setActiveScreen('chatbot')}
          onOpenHistory={() => setActiveScreen('history')}
          onOpenRemit={() => setActiveScreen('remit')}
          onOpenScanner={() => setActiveScreen('scanner')}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen === 'chatbot') {
    return (
      <ScreenTransition screenKey={activeScreen}>
        <ChatbotScreen
          onBackToWallet={() => setActiveScreen('wallet')}
          onBackToLanding={() => setActiveScreen('landing')}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen === 'remit') {
    return (
      <ScreenTransition screenKey={activeScreen}>
        <RemitScreen
          onBackToWallet={() => setActiveScreen('wallet')}
          onBackToLanding={() => setActiveScreen('landing')}
          onOpenHistory={() => setActiveScreen('history')}
          onOpenScanner={() => setActiveScreen('scanner')}
          onOpenReceipt={() => setActiveScreen('receipt')}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen === 'receipt') {
    return (
      <ScreenTransition screenKey={activeScreen}>
        <ReceiptScreen
          onBackToWallet={() => setActiveScreen('wallet')}
          onBackToLanding={() => setActiveScreen('landing')}
          onOpenHistory={() => setActiveScreen('history')}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen === 'scanner') {
    return (
      <ScreenTransition screenKey={activeScreen}>
        <ScannerScreen
          onBackToWallet={() => setActiveScreen('wallet')}
          onBackToLanding={() => setActiveScreen('landing')}
          onOpenHistory={() => setActiveScreen('history')}
          onOpenRemit={() => setActiveScreen('remit')}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen === 'history') {
    return (
      <ScreenTransition screenKey={activeScreen}>
        <HistoryScreen
          onBackToWallet={() => setActiveScreen('wallet')}
          onBackToLanding={() => setActiveScreen('landing')}
          onOpenRemit={() => setActiveScreen('remit')}
          onOpenScanner={() => setActiveScreen('scanner')}
        />
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition screenKey={activeScreen}>
      <LandingScreen onAuthenticated={() => setActiveScreen('wallet')} />
    </ScreenTransition>
  );
}
