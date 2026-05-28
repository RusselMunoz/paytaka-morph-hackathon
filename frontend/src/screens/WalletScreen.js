import { StatusBar } from 'expo-status-bar';
import { Image as RNImage, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import BackgroundGradient from '../components/BackgroundGradient';
import SettingsDrawer from '../components/SettingsDrawer';
import { walletStyles } from '../styles/walletStyles';
import { useAuth, useWallet } from '../contexts';
import { shortAddress } from '../lib/morph';
import { useEffect, useMemo, useState } from 'react';

const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

// Demo wallet address
const DEMO_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

export default function WalletScreen({ onBackToLanding, onOpenChatbot, onOpenHistory, onOpenRemit, onOpenScanner, onOpenAddFunds }) {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    address,
    balance,
    connectWithAddress,
    usdcBalance,
    usdtBalance,
    usdPhpRate,
    balanceChange,
    balanceChangePercent,
    isLoadingBalance
  } = useWallet();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const displayName = user?.displayName ?? 'User';
  
  const handleSignOut = () => {
    logout();
    onBackToLanding?.();
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };
  
  // Calculate balance values from real blockchain data
  const balanceValue = balance?.formatted ? Number(balance.formatted) : 0;
  const totalBalance = `$${balanceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const phpBalance = (balanceValue * usdPhpRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Auto-connect demo wallet if no address is set
  useEffect(() => {
    if (!address && isAuthenticated) {
      connectWithAddress(DEMO_WALLET_ADDRESS, { syncToBackend: true })
        .catch(() => {
          // Silent fail for demo - use mock data
        });
    }
  }, [address, isAuthenticated, connectWithAddress]);

  // Quick assets with real blockchain data
  const quickAssets = useMemo(() => {
    return [
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: `$${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        tone: 'blue',
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        balance: `$${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        tone: 'teal',
      },
    ];
  }, [usdcBalance, usdtBalance]);

  // Hardcoded AI insight message - always visible
  const aiInsightMessage = "Hi! I'm Taka, your financial companion. Ask me anything about your balance, spending, or next move.";

  const renderBottomNav = () => (
    <View style={walletStyles.bottomNav}>
      {bottomTabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => {
            if (tab === 'Remit') {
              onOpenRemit?.();
            }

            if (tab === 'Scanner') {
              onOpenScanner?.();
            }

            if (tab === 'History') {
              onOpenHistory?.();
            }
          }}
          style={walletStyles.tabItem}
        >
          <TabIcon tab={tab} active={tab === 'Wallet'} />
          <Text style={walletStyles.tabLabel}>{tab}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={walletStyles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <BackgroundGradient />
      <RNImage source={require('../../assets/Vector.png')} style={walletStyles.vectorTopLeft} />

      <ScrollView contentContainerStyle={walletStyles.content} showsVerticalScrollIndicator={false}>
        <View style={walletStyles.headerRow}>
          <Pressable style={walletStyles.iconButton} onPress={toggleSettings}>
            <Text style={walletStyles.menuIcon}>☰</Text>
          </Pressable>

          <Pressable style={walletStyles.avatarMark} onPress={toggleSettings}>
            <Text style={walletStyles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={walletStyles.greetingBlock}>
          <Text style={walletStyles.greeting}>Good morning,</Text>
          <Text style={walletStyles.userName}>{displayName}</Text>
        </View>

        <GlassBox style={walletStyles.balanceCard} contentStyle={walletStyles.balanceCardContent} vectorHeight={112}>
          <Text style={walletStyles.cardLabel}>{address ? shortAddress(address) : 'Total Balance (USD)'}</Text>
          <Text style={walletStyles.balanceValue}>{totalBalance}</Text>
          <Text style={walletStyles.balanceDelta}>
            +${balanceChange.toFixed(2)} (+{balanceChangePercent.toFixed(2)}%)
          </Text>
          <Text style={walletStyles.phpEquivalent}>
            ≈ ₱{phpBalance} PHP
          </Text>

          <View style={walletStyles.actionRow}>
            <Pressable style={walletStyles.actionButtonPrimary} onPress={onOpenAddFunds}>
              <Text style={walletStyles.actionButtonText}>Add Funds</Text>
            </Pressable>
            <Pressable style={walletStyles.actionButtonSecondary} onPress={onOpenRemit}>
              <Text style={walletStyles.actionButtonText}>Withdraw</Text>
            </Pressable>
          </View>
        </GlassBox>

        <GlassBox style={walletStyles.insightCard} contentStyle={walletStyles.insightCardContent} vectorHeight={120}>
          <View style={walletStyles.insightAvatar}>
            <RNImage source={require('../../assets/PaytakaChatBot.png')} style={walletStyles.takaAvatarIcon} />
          </View>

          <View style={walletStyles.insightBody}>
            <Text style={[walletStyles.insightTitle, { fontSize: 11, color: '#E5D8EE', marginBottom: 8 }]}>AI INSIGHT</Text>
            <Text style={[walletStyles.insightText, { fontSize: 11, lineHeight: 16, color: '#D7D0D6', marginBottom: 12 }]}>{aiInsightMessage}</Text>

            <Pressable style={walletStyles.chatButton} onPress={onOpenChatbot}>
              <RNImage source={require('../../assets/PaytakaChatBot.png')} style={walletStyles.chatBotIcon} />
              <Text style={walletStyles.chatButtonText}>Chat with AI</Text>
            </Pressable>
          </View>
        </GlassBox>

        <GlassBox style={walletStyles.assetsCard} contentStyle={walletStyles.assetsCardContent} vectorHeight={104}>
          <Text style={walletStyles.assetsTitle}>QUICK ASSETS</Text>

          {quickAssets.map((asset) => (
            <View key={asset.symbol} style={walletStyles.assetRow}>
              <View style={walletStyles.assetIdentity}>
                <View style={[walletStyles.assetBadge, asset.tone === 'blue' ? walletStyles.assetBadgeBlue : walletStyles.assetBadgeTeal]}>
                  <Text style={walletStyles.assetBadgeText}>{asset.symbol === 'USDC' ? '$' : '₮'}</Text>
                </View>

                <View>
                  <Text style={walletStyles.assetSymbol}>{asset.symbol}</Text>
                  <Text style={walletStyles.assetName}>{asset.name}</Text>
                </View>
              </View>

              <Text style={walletStyles.assetBalance}>{asset.balance}</Text>
            </View>
          ))}
        </GlassBox>
      </ScrollView>

      <Pressable style={{ position: 'absolute', bottom: 100, right: 26, width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }} onPress={onOpenChatbot}>
        <RNImage source={require('../../assets/PaytakaChatBot.png')} style={{ width: 150, height: 150 }} />
      </Pressable>

      {renderBottomNav()}

      <SettingsDrawer
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSignOut={handleSignOut}
      />
    </SafeAreaView>
  );
}
