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
  const [activeScreen, setActiveScreen] = useState({ name: 'landing', params: {} });

  const openScreen = (name, params = {}) => {
    setActiveScreen({ name, params });
  };

  if (activeScreen.name === 'wallet') {
    return (
      <ScreenTransition screenKey={activeScreen.name}>
        <WalletScreen
          onBackToLanding={() => openScreen('landing')}
          onOpenChatbot={() => openScreen('chatbot')}
          onOpenHistory={() => openScreen('history')}
          onOpenRemit={(prefill) => openScreen('remit', { prefill })}
          onOpenScanner={() => openScreen('scanner')}
          onOpenReceipt={(remittance) => openScreen('receipt', { remittance })}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen.name === 'chatbot') {
    return (
      <ScreenTransition screenKey={activeScreen.name}>
        <ChatbotScreen
          onBackToWallet={() => openScreen('wallet')}
          onBackToLanding={() => openScreen('landing')}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen.name === 'remit') {
    return (
      <ScreenTransition screenKey={activeScreen.name}>
        <RemitScreen
          prefill={activeScreen.params.prefill}
          onBackToWallet={() => openScreen('wallet')}
          onBackToLanding={() => openScreen('landing')}
          onOpenHistory={() => openScreen('history')}
          onOpenScanner={() => openScreen('scanner')}
          onOpenReceipt={(remittance) => openScreen('receipt', { remittance })}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen.name === 'receipt') {
    return (
      <ScreenTransition screenKey={activeScreen.name}>
        <ReceiptScreen
          remittance={activeScreen.params.remittance}
          onBackToWallet={() => openScreen('wallet')}
          onBackToLanding={() => openScreen('landing')}
          onOpenHistory={() => openScreen('history')}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen.name === 'scanner') {
    return (
      <ScreenTransition screenKey={activeScreen.name}>
        <ScannerScreen
          onBackToWallet={() => openScreen('wallet')}
          onBackToLanding={() => openScreen('landing')}
          onOpenHistory={() => openScreen('history')}
          onOpenRemit={(prefill) => openScreen('remit', { prefill })}
        />
      </ScreenTransition>
    );
  }

  if (activeScreen.name === 'history') {
    return (
      <ScreenTransition screenKey={activeScreen.name}>
        <HistoryScreen
          onBackToWallet={() => openScreen('wallet')}
          onBackToLanding={() => openScreen('landing')}
          onOpenRemit={(prefill) => openScreen('remit', { prefill })}
          onOpenScanner={() => openScreen('scanner')}
          onOpenReceipt={(remittance) => openScreen('receipt', { remittance })}
        />
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition screenKey={activeScreen.name}>
      <LandingScreen onAuthenticated={() => openScreen('wallet')} />
    </ScreenTransition>
  );
}
