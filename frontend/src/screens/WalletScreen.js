import { StatusBar } from 'expo-status-bar';
import { Image as RNImage, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import GlassBox from '../components/GlassBox';
import { walletAssets } from '../data/walletAssets';
import TabIcon from '../components/TabIcon';
import { walletStyles } from '../styles/walletStyles';
import { useAuth, useWallet } from '../contexts';
import { shortAddress } from '../lib/morph';

const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

export default function WalletScreen({ onBackToLanding, onOpenChatbot, onOpenHistory, onOpenRemit, onOpenScanner }) {
  const { user } = useAuth();
  const { address, balance } = useWallet();
  const displayName = user?.displayName ?? 'User';
  const totalBalance = balance?.formatted ? `$ ${Number(balance.formatted).toLocaleString()}` : '$ 4,797.45';

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
          <Text style={walletStyles.balanceDelta}>
            {balance?.tokenSymbol ? `${balance.tokenSymbol} from backend` : '+$37.12 (+0.78%)  ₱270,250 PHP'}
          </Text>

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

          {walletAssets.map((asset) => (
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
