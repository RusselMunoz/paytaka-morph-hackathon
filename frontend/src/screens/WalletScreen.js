import { StatusBar } from 'expo-status-bar';
import { Image as RNImage, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
const DEMO_WALLET_ADDRESS = '0x338442CEEd20F53f78b0A30223f7d6797e24ED48';

// Get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning,';
  if (hour >= 12 && hour < 18) return 'Good afternoon,';
  if (hour >= 18 && hour < 22) return 'Good evening,';
  return 'Good night,';
};

export default function WalletScreen({ onBackToLanding, onOpenChatbot, onOpenHistory, onOpenRemit, onOpenScanner, onOpenAddFunds, onOpenContacts }) {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    address,
    balance,
    connectWithAddress,
    usdcBalance,
    usdtBalance,
    nativeBalance,
    usdPhpRate,
    balanceChange,
    balanceChangePercent,
    isLoadingBalance,
    refreshBalance
  } = useWallet();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const displayName = user?.displayName ?? 'User';
  
  const handleSignOut = () => {
    logout();
    onBackToLanding?.();
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Pull-to-refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load primary currency preference
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const saved = await AsyncStorage.getItem('primaryCurrency');
        if (saved) setPrimaryCurrency(saved);
      } catch (error) {
        console.error('Failed to load currency preference:', error);
      }
    };
    loadCurrency();
  }, []);

  // Handle currency change from settings
  const handleCurrencyChange = (currency) => {
    setPrimaryCurrency(currency);
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

  // Quick assets with real blockchain data - HodETH first, then stablecoins
  const quickAssets = useMemo(() => {
    return [
      {
        symbol: 'HodETH',
        name: 'Native ETH',
        balance: `${nativeBalance.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ETH`,
        tone: 'purple',
      },
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
  }, [nativeBalance, usdcBalance, usdtBalance]);

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

      <ScrollView
        contentContainerStyle={walletStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#7C3AED', '#A78BFA', '#C4B5FD']}
            progressBackgroundColor="rgba(255, 255, 255, 0.1)"
            title="Pull to refresh"
            titleColor="#FFFFFF"
          />
        }
      >
        <View style={walletStyles.headerRow}>
          <Pressable style={walletStyles.iconButton} onPress={toggleSettings}>
            <Text style={walletStyles.menuIcon}>☰</Text>
          </Pressable>

          <Pressable style={walletStyles.avatarMark} onPress={toggleSettings}>
            <Text style={walletStyles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={walletStyles.greetingBlock}>
          <Text style={walletStyles.greeting}>{getTimeBasedGreeting()}</Text>
          <Text style={walletStyles.userName}>{displayName}</Text>
        </View>

        <GlassBox style={walletStyles.balanceCard} contentStyle={walletStyles.balanceCardContent} vectorHeight={112}>
          <Text style={walletStyles.cardLabel}>{address ? shortAddress(address) : `Total Balance (${primaryCurrency})`}</Text>
          {primaryCurrency === 'USD' ? (
            <>
              <Text style={walletStyles.balanceValue}>{totalBalance}</Text>
              <Text style={walletStyles.balanceDelta}>
                +${balanceChange.toFixed(2)} (+{balanceChangePercent.toFixed(2)}%)
              </Text>
              <Text style={walletStyles.phpEquivalent}>
                ≈ ₱{phpBalance} PHP
              </Text>
            </>
          ) : (
            <>
              <Text style={walletStyles.balanceValue}>₱{phpBalance}</Text>
              <Text style={walletStyles.balanceDelta}>
                +₱{(balanceChange * usdPhpRate).toFixed(2)} (+{balanceChangePercent.toFixed(2)}%)
              </Text>
              <Text style={walletStyles.phpEquivalent}>
                ≈ {totalBalance} USD
              </Text>
            </>
          )}

          <View style={walletStyles.actionRow}>
            <Pressable style={walletStyles.actionButtonPrimary} onPress={onOpenAddFunds}>
              <Text style={walletStyles.actionButtonText}>Add Funds</Text>
            </Pressable>
            <Pressable style={walletStyles.actionButtonSecondary} onPress={onOpenRemit}>
              <Text style={walletStyles.actionButtonText}>Withdraw</Text>
            </Pressable>
          </View>
        </GlassBox>

        <View style={[walletStyles.insightCard, { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'visible' }]}>
          {console.log('INSIGHT RENDER')}
          <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 2, overflow: 'hidden' }}>
            <RNImage source={require('../../assets/PaytakaChatBot.png')} style={walletStyles.takaAvatarIcon} />
          </View>

          <View style={walletStyles.insightBody}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: 0.5 }}>AI INSIGHT</Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: '#FFFFFF', marginBottom: 12, fontWeight: '400' }}>
              Hi! I'm Taka, your financial companion. Ask me anything about your balance, spending, or next move.
            </Text>

            <Pressable
              style={{
                alignSelf: 'flex-end',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: '#7C3AED'
              }}
              onPress={onOpenChatbot}
            >
              <RNImage source={require('../../assets/PaytakaChatBot.png')} style={walletStyles.chatBotIcon} />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Chat with AI</Text>
            </Pressable>
          </View>
        </View>

        <GlassBox style={walletStyles.assetsCard} contentStyle={walletStyles.assetsCardContent} vectorHeight={104}>
          <Text style={walletStyles.assetsTitle}>QUICK ASSETS</Text>

          {quickAssets.map((asset) => (
            <View key={asset.symbol} style={walletStyles.assetRow}>
              <View style={walletStyles.assetIdentity}>
                <View style={[
                  walletStyles.assetBadge,
                  asset.tone === 'blue' ? walletStyles.assetBadgeBlue :
                  asset.tone === 'teal' ? walletStyles.assetBadgeTeal :
                  walletStyles.assetBadgePurple
                ]}>
                  <Text style={walletStyles.assetBadgeText}>
                    {asset.symbol === 'USDC' ? '$' : asset.symbol === 'USDT' ? '₮' : 'Ξ'}
                  </Text>
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

      <Pressable style={{ position: 'absolute', bottom: 110, right: 36, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }} onPress={onOpenChatbot}>
        <RNImage source={require('../../assets/PaytakaChatBot.png')} style={{ width: 100, height: 100 }} />
      </Pressable>

      {renderBottomNav()}

      <SettingsDrawer
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSignOut={handleSignOut}
        primaryCurrency={primaryCurrency}
        onCurrencyChange={handleCurrencyChange}
        onOpenContacts={onOpenContacts}
      />
    </SafeAreaView>
  );
}
