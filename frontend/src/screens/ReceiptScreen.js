import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { receiptActions, receiptPlaceholder } from '../data/receiptData';
import { receiptStyles } from '../styles/receiptStyles';

export default function ReceiptScreen({ onBackToWallet, onBackToLanding, onOpenHistory }) {
  const receipt = receiptPlaceholder;

  return (
    <SafeAreaView style={receiptStyles.safeArea}>
      <ScrollView contentContainerStyle={receiptStyles.content} showsVerticalScrollIndicator={false}>
        <View style={receiptStyles.receiptCard}>
          <View style={receiptStyles.successBadge}>
            <Text style={receiptStyles.successIcon}>✓</Text>
          </View>

          <Text style={receiptStyles.statusTitle}>{receipt.statusTitle}</Text>

          <View style={receiptStyles.sectionLabelRow}>
            <Text style={receiptStyles.sectionLabel}>PAID TO</Text>
          </View>

          <View style={receiptStyles.recipientRow}>
            <View style={receiptStyles.recipientAvatar}>
              <Text style={receiptStyles.recipientAvatarText}>{receipt.recipientInitials}</Text>
            </View>

            <View style={receiptStyles.recipientTextWrap}>
              <Text style={receiptStyles.recipientName}>{receipt.recipientName}</Text>
              <Text style={receiptStyles.recipientSubtext}>{receipt.recipientSubtext}</Text>
            </View>
          </View>

          <View style={receiptStyles.detailDivider} />

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Amount Paid</Text>
            <Text style={receiptStyles.detailValuePrimary}>{receipt.amountPaid}</Text>
          </View>

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Paid Using</Text>
            <Text style={receiptStyles.detailValue}>{receipt.paidUsing}</Text>
          </View>

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Exchange Rate</Text>
            <Text style={receiptStyles.detailValueGreen}>{receipt.exchangeRate}</Text>
          </View>

          <View style={receiptStyles.detailDivider} />

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Payment Method</Text>
            <Text style={receiptStyles.detailValue}>{receipt.paymentMethod}</Text>
          </View>

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Date & Time</Text>
            <Text style={receiptStyles.detailValueMuted}>{receipt.dateTime}</Text>
          </View>

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Transaction Hash</Text>
            <Text style={receiptStyles.detailValuePurple}>{receipt.transactionHash}</Text>
          </View>

          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.detailLabel}>Remaining Balance</Text>
            <Text style={receiptStyles.detailValueMixed}>{receipt.remainingBalance}</Text>
          </View>

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
            <Text style={receiptStyles.footerNote}>{receipt.footerNote}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}