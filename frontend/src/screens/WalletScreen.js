import { StatusBar } from 'expo-status-bar';
import { Alert, Image as RNImage, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import { walletStyles } from '../styles/walletStyles';
import { useAuth, useWallet } from '../contexts';
import { shortAddress } from '../lib/morph';
import { useEffect, useMemo, useState } from 'react';

const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

export default function WalletScreen({ onBackToLanding, onOpenChatbot, onOpenHistory, onOpenRemit, onOpenScanner }) {
  const { user, isAuthenticated } = useAuth();
  const { address, balance, connectWithAddress, refreshBalance, isLoadingBalance } = useWallet();
  const [addressInput, setAddressInput] = useState(address ?? '');
  const [loadError, setLoadError] = useState('');
  const displayName = user?.displayName ?? 'User';
  const totalBalance = balance?.formatted ? `$ ${Number(balance.formatted).toLocaleString()}` : '$ 0.00';

  useEffect(() => {
    if (address) {
      setAddressInput(address);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      refreshBalance(address).catch((error) => setLoadError(error?.message ?? 'Could not refresh balance'));
    }
  }, [address, refreshBalance]);

  const quickAssets = useMemo(
    () => [
      {
        symbol: balance?.tokenSymbol ?? 'USDC',
        name: 'USD Coin',
        balance: balance?.formatted ? `$${Number(balance.formatted).toLocaleString()}` : 'No balance loaded',
        tone: 'blue',
      },
    ],
    [balance]
  );

  const loadWallet = async () => {
    const trimmed = addressInput.trim();

    if (!trimmed) {
      Alert.alert('Enter a wallet address', 'The backend balance route needs a wallet address to load balance data.');
      return;
    }

    try {
      setLoadError('');
      await connectWithAddress(trimmed, { syncToBackend: isAuthenticated });
      await refreshBalance(trimmed);
    } catch (error) {
      setLoadError(error?.message ?? 'Could not load wallet');
      Alert.alert('Wallet load failed', error?.message ?? 'Could not load wallet');
    }
  };

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
    <SafeAreaView style={walletStyles.safeArea}>
      <StatusBar style="light" />

      <RNImage source={require('../../assets/Vector.png')} style={walletStyles.vectorTopLeft} />

      <ScrollView contentContainerStyle={walletStyles.content} showsVerticalScrollIndicator={false}>
        <View style={walletStyles.headerRow}>
          <Pressable style={walletStyles.iconButton} onPress={onBackToLanding}>
            <Text style={walletStyles.menuIcon}>≡</Text>
          </Pressable>

          <View style={walletStyles.avatarMark}>
            <Text style={walletStyles.avatarLetter}>{displayName.charAt(0).toLowerCase()}</Text>
          </View>
        </View>

        <View style={walletStyles.greetingBlock}>
          <Text style={walletStyles.greeting}>Good morning,</Text>
          <Text style={walletStyles.userName}>{displayName}</Text>
        </View>

        <GlassBox style={walletStyles.balanceCard} contentStyle={walletStyles.balanceCardContent} vectorHeight={112}>
          <Text style={walletStyles.cardLabel}>{address ? shortAddress(address) : 'Total Balance (USD)'}</Text>
          <Text style={walletStyles.balanceValue}>{totalBalance}</Text>
          <Text style={walletStyles.balanceDelta}>{balance?.tokenSymbol ? `${balance.tokenSymbol} balance from backend` : 'Load a wallet address to fetch balance'}</Text>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: 'rgba(234,232,241,0.75)', marginBottom: 8 }}>Wallet address</Text>
            <TextInput
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="0x..."
              placeholderTextColor="rgba(255,255,255,0.34)"
              autoCapitalize="none"
              style={{
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.10)',
                color: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 10,
              }}
            />
            <Pressable style={walletStyles.actionButtonPrimary} onPress={loadWallet}>
              <Text style={walletStyles.actionButtonText}>{isLoadingBalance ? 'Loading...' : 'Load from Backend'}</Text>
            </Pressable>
            {loadError ? <Text style={{ color: '#f7d3d3', marginTop: 10 }}>{loadError}</Text> : null}
          </View>

          <View style={walletStyles.actionRow}>
            <Pressable style={walletStyles.actionButtonPrimary}>
              <Text style={walletStyles.actionButtonText}>Add Funds</Text>
            </Pressable>
            <Pressable style={walletStyles.actionButtonSecondary} onPress={onOpenRemit}>
              <Text style={walletStyles.actionButtonText}>Withdraw</Text>
            </Pressable>
          </View>
        </GlassBox>

        <GlassBox style={walletStyles.insightCard} contentStyle={walletStyles.insightCardContent} vectorHeight={120}>
          <View style={walletStyles.insightAvatar}>
            <Text style={walletStyles.insightAvatarText}>☺</Text>
          </View>

          <View style={walletStyles.insightBody}>
            <Text style={walletStyles.insightTitle}>AI INSIGHT</Text>
            <Text style={walletStyles.insightText}>
              Hey there! You just received <Text style={walletStyles.highlightBlue}>$200 USDC</Text> from Alex. Your essential expenses are fully covered for the week, so I want to put these funds to work. We could allocate <Text style={walletStyles.highlightOrange}>$120 into BTC</Text> and stake the remaining <Text style={walletStyles.highlightOrange}>$50 to earn some passive yield.</Text> Let me know if you want me to set that up.
            </Text>

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
                  <Text style={walletStyles.assetBadgeText}>{asset.symbol === 'USDC' ? '$' : '◈'}</Text>
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

        <Pressable style={walletStyles.floatingBot} onPress={onOpenChatbot}>
          <RNImage source={require('../../assets/PaytakaChatBot.png')} style={walletStyles.floatingBotIcon} />
          <View style={walletStyles.notificationDot} />
        </Pressable>
      </ScrollView>

      {renderBottomNav()}
    </SafeAreaView>
  );
}
