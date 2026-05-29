import { StatusBar } from 'expo-status-bar';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import BackgroundGradient from '../components/BackgroundGradient';
import { remitStyles } from '../styles/remitStyles';
import { useEffect, useMemo, useState } from 'react';
import { remittanceApi } from '../lib/api';
import { useWallet, useAuth } from '../contexts';

const quickAmounts = ['$25', '$50', '$100', '$500'];
const defaultContacts = ['Mom', 'Wife', 'Brother', 'Alex R.'];
const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];
const CONTACTS_STORAGE_KEY = '@paytaka_contacts';

export default function RemitScreen({ prefill, onBackToWallet, onBackToLanding, onOpenHistory, onOpenReceipt, onOpenScanner }) {
  const { user } = useAuth();
  const { balance, usdcBalance, usdtBalance } = useWallet();
  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount).replace('$', '') : '');
  const [recipientId, setRecipientId] = useState(prefill?.recipientId ?? prefill?.recipientName ?? '');
  const [note, setNote] = useState(prefill?.memo ?? '');
  const [isSending, setIsSending] = useState(false);
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [errorMessage, setErrorMessage] = useState('');
  const [contacts, setContacts] = useState([]);

  const displayName = user?.displayName ?? 'User';
  const balanceValue = balance?.formatted ? Number(balance.formatted) : 0;
  const totalBalance = `$ ${balanceValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  useEffect(() => {
    if (!prefill) return;
    setAmount(prefill.amount ? String(prefill.amount).replace('$', '') : '');
    setRecipientId(prefill.recipientId ?? prefill.recipientName ?? '');
    setNote(prefill.memo ?? '');
  }, [prefill]);

  // Load contacts from AsyncStorage
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
        if (stored) {
          const parsedContacts = JSON.parse(stored);
          setContacts(parsedContacts);
        }
      } catch (error) {
        console.error('Failed to load contacts:', error);
      }
    };
    loadContacts();
  }, []);

  // Use saved contacts if available, otherwise use defaults
  const displayContacts = contacts.length > 0
    ? contacts.map(c => c.nickname)
    : defaultContacts;

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

  const pickRecipient = (nickname) => {
    // If we have saved contacts, find the address
    if (contacts.length > 0) {
      const contact = contacts.find(c => c.nickname === nickname);
      if (contact) {
        setRecipientId(contact.address);
        return;
      }
    }
    // Otherwise just use the nickname
    setRecipientId(nickname);
  };

  const handleSend = async () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0');
      return;
    }

    if (!recipientId.trim()) {
      Alert.alert('Missing recipient', 'Please enter a recipient name, address, or @handle');
      return;
    }

    // Create transaction data for receipt
    const transactionData = {
      amount: Number(amount),
      recipient: recipientId,
      token: selectedToken,
      txHash: '0x8f8a...9k2m',
      timestamp: new Date().toISOString(),
      memo: note,
    };

    // Navigate to receipt screen with transaction data
    if (onOpenReceipt) {
      onOpenReceipt(transactionData);
    } else {
      // Fallback: show alert if receipt screen not wired
      Alert.alert(
        'Payment Successful!',
        `Sent $${amount} ${selectedToken} to ${recipientId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setRecipientId('');
              setNote('');
              onBackToWallet?.();
            },
          },
        ]
      );
    }
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
            {displayContacts.map((contact) => (
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
