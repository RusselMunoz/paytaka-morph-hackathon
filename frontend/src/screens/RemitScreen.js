import { StatusBar } from 'expo-status-bar';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import { remitStyles } from '../styles/remitStyles';
import { useEffect, useMemo, useState } from 'react';
import { remittanceApi } from '../lib/api';
import { useWallet } from '../contexts/WalletContext';

const quickAmounts = ['$25', '$50', '$100', '$500'];
const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

export default function RemitScreen({ prefill, onBackToWallet, onBackToLanding, onOpenHistory, onOpenReceipt, onOpenScanner }) {
  const wallet = useWallet();
  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount).replace('$', '') : '');
  const [recipientId, setRecipientId] = useState(prefill?.recipientId ?? prefill?.recipientName ?? '');
  const [note, setNote] = useState(prefill?.memo ?? '');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!prefill) return;
    setAmount(prefill.amount ? String(prefill.amount).replace('$', '') : '');
    setRecipientId(prefill.recipientId ?? prefill.recipientName ?? '');
    setNote(prefill.memo ?? '');
  }, [prefill]);

  const activeAsset = useMemo(
    () => ({
      symbol: wallet.balance?.tokenSymbol ?? 'USDC',
      name: 'USD Coin',
      balance: wallet.balance?.formatted ? `$${Number(wallet.balance.formatted).toLocaleString()}` : '$0.00',
      tone: 'blue',
    }),
    [wallet.balance]
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
      Alert.alert('Missing recipient', 'Please enter a recipient user ID. The backend remittance route requires a real backend user id.');
      return;
    }

    if (!wallet.address) {
      Alert.alert('Connect wallet first', 'Load a wallet address from the Wallet screen before creating a backend remittance draft.');
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    try {
      const draft = await remittanceApi.createDraft({
        recipientId: recipientId.trim(),
        amount,
        memo: note.trim() || undefined,
        fromAddress: wallet.address,
        toAddress: recipientId.trim(),
      });

      onOpenReceipt?.(draft);
    } catch (err) {
      console.error(err);
      const message = err?.message || 'Could not create remittance';
      setErrorMessage(message);
      Alert.alert('Send failed', message);
    } finally {
      setIsSending(false);
    }
  };

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
          <Text style={remitStyles.totalBalanceValue}>{wallet.balance?.formatted ? `$ ${Number(wallet.balance.formatted).toLocaleString()}` : '$ 0.00'}</Text>
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

          <Text style={remitStyles.transferFieldLabel}>Amount</Text>
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

          <Text style={remitStyles.transferFieldLabel}>Recipient User ID</Text>
          <TextInput
            value={recipientId}
            onChangeText={setRecipientId}
            placeholder="User ID from the backend"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={remitStyles.textField}
          />

          <Text style={remitStyles.transferFieldLabel}>Note (Optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor="rgba(255,255,255,0.34)"
            style={remitStyles.textField}
            multiline
          />

          <Pressable style={remitStyles.sendButton} onPress={handleSend} disabled={isSending}>
            <Text style={remitStyles.sendButtonText}>{isSending ? 'Sending…' : 'Send Now'}</Text>
          </Pressable>

          {errorMessage ? <Text style={{ color: '#f7d3d3', marginTop: 12 }}>{errorMessage}</Text> : null}
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
