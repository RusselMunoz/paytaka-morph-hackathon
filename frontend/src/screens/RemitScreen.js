import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import GlassBox from '../components/GlassBox';
import { walletAssets } from '../data/walletAssets';
import TabIcon from '../components/TabIcon';
import { remitStyles } from '../styles/remitStyles';

const quickAmounts = ['$25', '$50', '$100', '$500'];
const recipients = ['Mom', 'Wife', 'Brother', 'Alex R.'];
const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

export default function RemitScreen({ onBackToWallet, onBackToLanding, onOpenHistory, onOpenReceipt, onOpenScanner }) {
  const activeAsset = walletAssets[0];

  return (
    <SafeAreaView style={remitStyles.safeArea}>
      <StatusBar style="light" />

      <Image source={require('../../assets/Vector.png')} style={remitStyles.vectorTopLeft} />

      <ScrollView contentContainerStyle={remitStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={remitStyles.screenHeader}>Send/Remit</Text>

        <View style={remitStyles.headerRow}>
          <Pressable style={remitStyles.iconButton} onPress={onBackToWallet ?? onBackToLanding}>
            <Text style={remitStyles.menuIcon}>≡</Text>
          </Pressable>

          <View style={remitStyles.avatarMark}>
            <Text style={remitStyles.avatarLetter}>u</Text>
          </View>
        </View>

        <Text style={remitStyles.remitTitle}>Send Money</Text>

        <GlassBox style={remitStyles.totalBalancePanel} contentStyle={remitStyles.totalBalancePanelContent} vectorHeight={96}>
          <Text style={remitStyles.totalBalanceLabel}>TOTAL BALANCE</Text>
          <Text style={remitStyles.totalBalanceValue}>$ 4,797.45</Text>
        </GlassBox>

        <GlassBox style={remitStyles.transferCard} contentStyle={remitStyles.transferCardContent} vectorHeight={126}>
          <Text style={remitStyles.transferCardTitle}>TRANSFER DETAILS</Text>

          <Text style={remitStyles.transferFieldLabel}>Send Token</Text>
          <Pressable style={remitStyles.tokenSelect}>
            <View style={remitStyles.tokenSelectLeft}>
              <View style={[remitStyles.assetBadge, activeAsset.tone === 'blue' ? remitStyles.assetBadgeBlue : remitStyles.assetBadgeTeal]}>
                <Text style={remitStyles.assetBadgeText}>{activeAsset.symbol === 'USDC' ? '$' : '◈'}</Text>
              </View>
              <View>
                <Text style={remitStyles.tokenSymbol}>{activeAsset.symbol}</Text>
                <Text style={remitStyles.tokenBalance}>Balance: {activeAsset.balance}</Text>
              </View>
            </View>
            <Text style={remitStyles.dropdownChevron}>⌄</Text>
          </Pressable>

          <View style={remitStyles.assetPickerRow}>
            {walletAssets.map((asset) => (
              <View key={asset.symbol} style={remitStyles.assetChip}>
                <Text style={remitStyles.assetChipText}>{asset.symbol}</Text>
              </View>
            ))}
          </View>

          <Text style={remitStyles.transferFieldLabel}>Amount</Text>
          <View style={remitStyles.amountBlock}>
            <TextInput
              value="0.00"
              editable={false}
              keyboardType="decimal-pad"
              placeholder="$ 0.00"
              placeholderTextColor="rgba(255,255,255,0.34)"
              style={remitStyles.amountInput}
            />

            <View style={remitStyles.quickAmountRow}>
              {quickAmounts.map((quickAmount) => (
                <View key={quickAmount} style={remitStyles.quickAmountChip}>
                  <Text style={remitStyles.quickAmountText}>{quickAmount}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={remitStyles.transferFieldLabel}>Recipient</Text>
          <TextInput
            editable={false}
            placeholder="Name, address, or @handle"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={remitStyles.textField}
          />

          <View style={remitStyles.recipientPillsRow}>
            {recipients.map((item) => (
              <View key={item} style={remitStyles.recipientChip}>
                <Text style={remitStyles.recipientChipText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={remitStyles.transferFieldLabel}>Note (Optional)</Text>
          <TextInput
            editable={false}
            placeholder="What's this for?"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={remitStyles.textField}
          />

          <Pressable style={remitStyles.sendButton} onPress={onOpenReceipt}>
            <Text style={remitStyles.sendButtonText}>Send Now</Text>
          </Pressable>
        </GlassBox>
      </ScrollView>

      <View style={remitStyles.bottomNav}>
        {bottomTabs.map((tab) => (
          <Pressable
            key={tab}
            style={remitStyles.tabItem}
            onPress={() => {
              if (tab === 'Wallet') {
                onBackToWallet?.();
              }

              if (tab === 'Scanner') {
                onOpenScanner?.();
              }

              if (tab === 'History') {
                onOpenHistory?.();
              }
            }}
          >
            <TabIcon tab={tab} active={tab === 'Remit'} />
            <Text style={[remitStyles.tabLabel, tab === 'Remit' && remitStyles.tabLabelActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
