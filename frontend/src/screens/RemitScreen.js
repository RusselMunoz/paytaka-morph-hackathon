import { StatusBar } from 'expo-status-bar';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import BackgroundGradient from '../components/BackgroundGradient';
import { remitStyles } from '../styles/remitStyles';
import { useEffect, useMemo, useState } from 'react';
import { remittanceApi } from '../lib/api';
import { useWallet, useAuth } from '../contexts';

const quickAmounts = ['$25', '$50', '$100', '$500'];
const savedContacts = ['Mom', 'Wife', 'Brother', 'Alex R.'];
const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

export default function RemitScreen({ prefill, onBackToWallet, onBackToLanding, onOpenHistory, onOpenReceipt, onOpenScanner }) {
  const { user } = useAuth();
  const { balance, usdcBalance, usdtBalance } = useWallet();
  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount).replace('$', '') : '');
  const [recipientId, setRecipientId] = useState(prefill?.recipientId ?? prefill?.recipientName ?? '');
  const [note, setNote] = useState(prefill?.memo ?? '');
  const [isSending, setIsSending] = useState(false);
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [errorMessage, setErrorMessage] = useState('');

  const displayName = user?.displayName ?? 'User';
  const balanceValue = balance?.formatted ? Number(balance.formatted) : 0;
  const totalBalance = `$ ${balanceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  useEffect(() => {
    if (!prefill) return;
    setAmount(prefill.amount ? String(prefill.amount).replace('$', '') : '');
    setRecipientId(prefill.recipientId ?? prefill.recipientName ?? '');
    setNote(prefill.memo ?? '');
  }, [prefill]);

  const activeAsset = useMemo(
    () => {
      if (selectedToken === 'USDT') {
        return {
          symbol: 'USDT',
          name: 'Tether',
          balance: `$${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          tone: 'teal',
        };
      }
      return {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: `$${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        tone: 'blue',
      };
    },
    [selectedToken, usdcBalance, usdtBalance]
  );

  const applyQuickAmount = (q) => {
    // strip $ and set numeric string
    setAmount(q.replace('$', ''));
  };

  const pickRecipient = (r) => setRecipientId(r);

  const handleSend = async () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0');
      return;
    }

    if (!recipientId.trim()) {
      Alert.alert('Missing recipient', 'Please enter a recipient name, address, or @handle');
      return;
    }

    // Demo mode: simulate successful send
    Alert.alert(
      'Transfer Initiated',
      `Sending $${amount} USDC to ${recipientId}. This is a demo - no real transaction occurred.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setAmount('');
            setRecipientId('');
            setNote('');
            // Navigate back to wallet
            onBackToWallet?.();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={remitStyles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <BackgroundGradient />
      <Image source={require('../../assets/Vector.png')} style={remitStyles.vectorTopLeft} />

      <ScrollView contentContainerStyle={remitStyles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={remitStyles.headerRow}>
          <Pressable style={remitStyles.iconButton} onPress={onBackToWallet ?? onBackToLanding}>
            <Text style={remitStyles.menuIcon}>☰</Text>
          </Pressable>

          <Pressable style={remitStyles.avatarMark} onPress={onBackToLanding}>
            <Text style={remitStyles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <Text style={remitStyles.remitTitle}>Send Money</Text>

        <GlassBox style={remitStyles.totalBalancePanel} contentStyle={remitStyles.totalBalancePanelContent} vectorHeight={96}>
          <Text style={remitStyles.totalBalanceLabel}>TOTAL BALANCE</Text>
          <Text style={remitStyles.totalBalanceValue}>{totalBalance}</Text>
        </GlassBox>

        <GlassBox style={remitStyles.transferCard} contentStyle={remitStyles.transferCardContent} vectorHeight={126}>
          <Text style={remitStyles.transferCardTitle}>TRANSFER DETAILS</Text>

          <Text style={remitStyles.transferFieldLabel}>Send Token</Text>
          <Pressable style={remitStyles.tokenSelect}>
            <View style={remitStyles.tokenSelectLeft}>
              <View style={[remitStyles.assetBadge, remitStyles.assetBadgeBlue]}>
                <Text style={remitStyles.assetBadgeText}>$</Text>
              </View>
              <View>
                <Text style={remitStyles.tokenSymbol}>{activeAsset.symbol}</Text>
                <Text style={remitStyles.tokenBalance}>Balance: {activeAsset.balance}</Text>
              </View>
            </View>
            <Text style={remitStyles.dropdownChevron}>⌄</Text>
          </Pressable>

          <Text style={remitStyles.transferFieldLabel}>AMOUNT</Text>
          <View style={remitStyles.amountBlock}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="$ 0.00"
              placeholderTextColor="rgba(255,255,255,0.34)"
              style={remitStyles.amountInput}
            />

            <View style={remitStyles.quickAmountRow}>
              {quickAmounts.map((quickAmount) => (
                <Pressable key={quickAmount} onPress={() => applyQuickAmount(quickAmount)} style={remitStyles.quickAmountChip}>
                  <Text style={remitStyles.quickAmountText}>{quickAmount}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={remitStyles.transferFieldLabel}>RECIPIENT</Text>
          <TextInput
            value={recipientId}
            onChangeText={setRecipientId}
            placeholder="Name, address, or @handle"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={remitStyles.textField}
          />
          
          <View style={remitStyles.recipientPillsRow}>
            {savedContacts.map((contact) => (
              <Pressable key={contact} onPress={() => pickRecipient(contact)} style={remitStyles.recipientChip}>
                <Text style={remitStyles.recipientChipText}>{contact}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={remitStyles.transferFieldLabel}>NOTE (OPTIONAL)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={remitStyles.textField}
            multiline
          />

          <Pressable style={remitStyles.sendButton} onPress={handleSend} disabled={isSending}>
            <Text style={remitStyles.sendButtonText}>{isSending ? 'Sending…' : '✈  Send Now'}</Text>
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
