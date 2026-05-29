import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBox from '../components/GlassBox';
import BackgroundGradient from '../components/BackgroundGradient';
import { remitStyles } from '../styles/remitStyles';
import { useAuth, useWallet } from '../contexts';

const quickAmounts = ['$25', '$50', '$100', '$500'];
const paymentMethods = [
  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
  { id: 'crypto', label: 'Crypto Deposit', icon: '₿' },
];

export default function AddFundsScreen({ onBack }) {
  const { user } = useAuth();
  const { address } = useWallet();
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const displayName = user?.displayName ?? 'User';

  const applyQuickAmount = (q) => {
    setAmount(q.replace('$', ''));
  };

  const handleConfirm = () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0');
      return;
    }

    Alert.alert(
      'Add Funds',
      `Demo: Adding $${amount} ${selectedToken} via ${paymentMethods.find(m => m.id === selectedMethod)?.label}. In production, this would initiate a real transaction.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setAmount('');
            onBack?.();
          },
        },
      ]
    );
  };

  const copyAddress = () => {
    if (address) {
      Alert.alert('Address Copied', `Wallet address copied to clipboard:\n${address}`);
    } else {
      Alert.alert('No Wallet', 'Please connect a wallet first');
    }
  };

  return (
    <SafeAreaView style={remitStyles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <BackgroundGradient />
      <Image source={require('../../assets/Vector.png')} style={remitStyles.vectorTopLeft} />

      <ScrollView contentContainerStyle={remitStyles.content} showsVerticalScrollIndicator={false}>
        <View style={remitStyles.headerRow}>
          <Pressable style={remitStyles.iconButton} onPress={onBack}>
            <Text style={remitStyles.menuIcon}>←</Text>
          </Pressable>

          <Pressable style={remitStyles.avatarMark} onPress={onBack}>
            <Text style={remitStyles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <Text style={remitStyles.remitTitle}>Add Funds</Text>

        <GlassBox style={remitStyles.transferCard} contentStyle={remitStyles.transferCardContent} vectorHeight={126}>
          <Text style={remitStyles.transferCardTitle}>FUNDING DETAILS</Text>

          <Text style={remitStyles.transferFieldLabel}>SELECT TOKEN</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {['USDC', 'USDT'].map((token) => (
              <Pressable
                key={token}
                onPress={() => setSelectedToken(token)}
                style={[
                  remitStyles.quickAmountChip,
                  { flex: 1, minHeight: 36 },
                  selectedToken === token && { backgroundColor: '#9D7AA8' },
                ]}
              >
                <Text style={remitStyles.quickAmountText}>{token}</Text>
              </Pressable>
            ))}
          </View>

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

          <Text style={remitStyles.transferFieldLabel}>PAYMENT METHOD</Text>
          <View style={{ gap: 8, marginBottom: 16 }}>
            {paymentMethods.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                style={[
                  remitStyles.tokenSelect,
                  selectedMethod === method.id && { backgroundColor: '#7D6B85' },
                ]}
              >
                <View style={remitStyles.tokenSelectLeft}>
                  <Text style={{ fontSize: 20 }}>{method.icon}</Text>
                  <Text style={remitStyles.tokenSymbol}>{method.label}</Text>
                </View>
                {selectedMethod === method.id && <Text style={{ color: '#8AE06E', fontSize: 16 }}>✓</Text>}
              </Pressable>
            ))}
          </View>

          {selectedMethod === 'crypto' && (
            <>
              <Text style={remitStyles.transferFieldLabel}>DEPOSIT ADDRESS</Text>
              <Pressable onPress={copyAddress} style={[remitStyles.textField, { marginBottom: 12 }]}>
                <Text style={{ color: '#E8E0ED', fontSize: 10 }}>{address || 'No wallet connected'}</Text>
              </Pressable>
              <View style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: '#333', fontSize: 10 }}>QR Code Placeholder</Text>
                <Text style={{ color: '#666', fontSize: 8, marginTop: 4 }}>Scan to deposit</Text>
              </View>
            </>
          )}

          <Pressable style={remitStyles.sendButton} onPress={handleConfirm}>
            <Text style={remitStyles.sendButtonText}>Confirm</Text>
          </Pressable>
        </GlassBox>
      </ScrollView>
    </SafeAreaView>
  );
}

// Made with Bob
