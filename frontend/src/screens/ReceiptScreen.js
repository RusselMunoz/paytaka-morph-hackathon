import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { receiptActions, receiptPlaceholder } from '../data/receiptData';
import { receiptStyles } from '../styles/receiptStyles';
import BackgroundGradient from '../components/BackgroundGradient';
import { useCallback, useEffect, useState } from 'react';
import { remittanceApi } from '../lib/api';
import { formatDatePretty, shortAddress } from '../lib/morph';

export default function ReceiptScreen({ onBackToWallet, onBackToLanding, onOpenHistory, remittanceId, remittance: remittanceProp }) {
  const [receipt, setReceipt] = useState(remittanceProp ? mapRemitToReceipt(remittanceProp) : null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReceipt = useCallback(async () => {
    if (remittanceProp) {
      setReceipt(mapRemitToReceipt(remittanceProp));
      setErrorMessage('');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const list = await remittanceApi.list();
      if (remittanceId) {
        const found = list.find((r) => r.id === remittanceId);
        if (found) {
          setReceipt(mapRemitToReceipt(found));
          return;
        }
      } else if (list && list.length) {
        setReceipt(mapRemitToReceipt(list[0]));
        return;
      }

      setErrorMessage('No receipt data available yet.');
    } catch (err) {
      setErrorMessage(err?.message ?? 'Could not load receipt data');
    } finally {
      setLoading(false);
    }
  }, [remittanceId, remittanceProp]);

  useEffect(() => {
    loadReceipt();
  }, [loadReceipt]);

  const shown = receipt ?? receiptPlaceholder;
  const hasBackendReceipt = Boolean(receipt);

  return (
    <SafeAreaView style={receiptStyles.safeArea} edges={['top']}>
      <BackgroundGradient />
      <Image source={require('../../assets/Vector.png')} style={receiptStyles.vectorTopLeft} />
      <ScrollView contentContainerStyle={receiptStyles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ padding: 24 }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        {errorMessage ? (
          <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
            <Text style={{ color: '#f7d3d3', marginBottom: 12 }}>{errorMessage}</Text>
            <Pressable style={receiptStyles.secondaryAction} onPress={loadReceipt}>
              <Text style={receiptStyles.secondaryActionText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={receiptStyles.receiptCard}>
          <View style={receiptStyles.successBadge}>
            <Text style={receiptStyles.successIcon}>✓</Text>
          </View>

          <Text style={receiptStyles.statusTitle}>{shown.statusTitle}</Text>

          {!hasBackendReceipt && !loading && !errorMessage ? (
            <View style={{ marginTop: 10, marginBottom: 4 }}>
              <Text style={{ color: 'rgba(234,232,241,0.78)', textAlign: 'center' }}>
                Connect a remittance from the backend to populate this receipt.
              </Text>
            </View>
          ) : null}

          <View style={receiptStyles.sectionLabelRow}>
            <Text style={receiptStyles.sectionLabel}>PAID TO</Text>
          </View>

          <View style={receiptStyles.recipientRow}>
            <View style={receiptStyles.recipientAvatar}>
              <Text style={receiptStyles.recipientAvatarText}>{shown.recipientInitials}</Text>
            </View>

            <View style={receiptStyles.recipientTextWrap}>
              <Text style={receiptStyles.recipientName}>{shown.recipientName}</Text>
              <Text style={receiptStyles.recipientSubtext}>{shown.recipientSubtext}</Text>
            </View>
          </View>

          <View style={receiptStyles.detailDivider} />

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Amount Paid</Text>
            <Text style={receiptStyles.detailValuePrimary}>{shown.amountPaid}</Text>
          </View>

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Paid Using</Text>
            <Text style={receiptStyles.detailValue}>{shown.paidUsing}</Text>
          </View>

          {shown.exchangeRate ? (
            <>
              <View style={receiptStyles.detailRow}>
                <Text style={receiptStyles.detailLabel}>Exchange Rate</Text>
                <Text style={receiptStyles.detailValueGreen}>{shown.exchangeRate}</Text>
              </View>

              <View style={receiptStyles.detailDivider} />
            </>
          ) : null}

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Payment Method</Text>
            <Text style={receiptStyles.detailValue}>{shown.paymentMethod}</Text>
          </View>

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Date & Time</Text>
            <Text style={receiptStyles.detailValueMuted}>{shown.dateTime}</Text>
          </View>

          {shown.transactionHash && shown.transactionHash !== '--' ? (
            <View style={receiptStyles.detailRow}>
              <Text style={receiptStyles.detailLabel}>Transaction Hash</Text>
              <Text style={receiptStyles.detailValuePurple}>{shown.transactionHash}</Text>
            </View>
          ) : null}

          {shown.remainingBalance && shown.remainingBalance !== '--' ? (
            <View style={receiptStyles.detailRow}>
              <Text style={receiptStyles.detailLabel}>Remaining Balance</Text>
              <Text style={receiptStyles.detailValueMixed}>{shown.remainingBalance}</Text>
            </View>
          ) : null}

          <Pressable style={receiptStyles.primaryAction} onPress={onBackToWallet ?? onBackToLanding}>
            <Text style={receiptStyles.primaryActionText}>{receiptActions.backLabel}</Text>
          </Pressable>

          <View style={receiptStyles.secondaryRow}>
            <Pressable style={receiptStyles.secondaryAction} onPress={onOpenHistory}>
              <Text style={receiptStyles.secondaryActionText}>{receiptActions.historyLabel}</Text>
            </Pressable>

            <Pressable style={receiptStyles.secondaryAction}>
              <Text style={receiptStyles.secondaryActionText}>{receiptActions.shareLabel}</Text>
            </Pressable>
          </View>

          <View style={receiptStyles.footerNoteBox}>
            <Text style={receiptStyles.footerNote}>{shown.footerNote}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function mapRemitToReceipt(remit) {
  if (!remit) return receiptPlaceholder;

  const recipientName = remit.recipient?.displayName ?? remit.recipientId ?? remit.toAddress ?? 'Recipient';
  const initials = recipientName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const status = String(remit.status ?? 'DRAFT').toUpperCase();
  const isCompleted = status === 'CONFIRMED';
  const isPending = status === 'PENDING' || status === 'DRAFT';

  return {
    statusTitle: isCompleted ? 'Payment Confirmed' : isPending ? 'Receipt Pending' : status,
    recipientInitials: initials,
    recipientName,
    recipientSubtext: remit.recipient?.email ?? shortAddress(remit.toAddress) ?? 'Backend remittance target',
    amountPaid: `${remit.amount ?? '0.00'} ${remit.tokenSymbol ?? 'USDC'}`,
    paidUsing: remit.tokenSymbol ?? 'USDC',
    exchangeRate: remit.exchangeRate ?? '',
    paymentMethod: remit.transaction?.txHash ? 'On-chain transfer' : isPending ? 'Backend draft' : 'Pending',
    dateTime: formatDatePretty(remit.updatedAt ?? remit.createdAt ?? new Date().toISOString()),
    transactionHash: remit.transaction?.txHash ?? remit.transactionId ?? '',
    remainingBalance: remit.remainingBalance ?? '--',
    footerNote: remit.memo ?? '',
  };
}