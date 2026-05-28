import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image as RNImage, Pressable, SectionList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import BackgroundGradient from '../components/BackgroundGradient';
import { useAuth, useWallet } from '../contexts';
import { remittanceApi } from '../lib/api';
import { formatDatePretty, shortAddress } from '../lib/morph';
import { historyStyles } from '../styles/historyStyles';

const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

export default function HistoryScreen({ onBackToWallet, onBackToLanding, onOpenRemit, onOpenScanner, onOpenReceipt }) {
  const { user } = useAuth();
  const { transactions, address } = useWallet();
  const [remittances, setRemittances] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRemittances = useCallback(async () => {
    setLoading(true);

    try {
      // Try to get backend remittances first
      const list = await remittanceApi.list();
      
      // Merge with blockchain transactions
      const mergedTxs = [...list];
      
      // Add blockchain transactions that aren't in backend
      if (transactions && transactions.length > 0) {
        transactions.forEach(tx => {
          const exists = list.find(r => r.txHash === tx.hash);
          if (!exists) {
            mergedTxs.push({
              id: tx.id,
              amount: tx.amount,
              tokenSymbol: tx.tokenSymbol,
              status: 'COMPLETED',
              createdAt: new Date(tx.timestamp).toISOString(),
              fromAddress: tx.from,
              toAddress: tx.to,
              txHash: tx.hash,
              recipientId: tx.direction === 'sent' ? 'blockchain-user' : null,
              recipient: tx.direction === 'sent' ? { displayName: shortAddress(tx.to) } : null,
              sender: tx.direction === 'received' ? { displayName: shortAddress(tx.from) } : null,
            });
          }
        });
      }
      
      setRemittances(mergedTxs);
    } catch (err) {
      // Use blockchain transactions as fallback
      console.log('Using blockchain transaction data:', err?.message);
      if (transactions && transactions.length > 0) {
        const blockchainTxs = transactions.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          tokenSymbol: tx.tokenSymbol,
          status: 'COMPLETED',
          createdAt: new Date(tx.timestamp).toISOString(),
          fromAddress: tx.from,
          toAddress: tx.to,
          txHash: tx.hash,
          recipientId: tx.direction === 'sent' ? 'blockchain-user' : null,
          recipient: tx.direction === 'sent' ? { displayName: shortAddress(tx.to) } : null,
          sender: tx.direction === 'received' ? { displayName: shortAddress(tx.from) } : null,
        }));
        setRemittances(blockchainTxs);
      } else {
        setRemittances([]);
      }
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  useEffect(() => {
    loadRemittances();
  }, [loadRemittances]);

  // Calculate monthly summary from real transaction data
  const monthlySummary = useMemo(() => {
    if (!remittances || !remittances.length) {
      return { received: 0, sent: 0, net: 0 };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let received = 0;
    let sent = 0;

    remittances.forEach((r) => {
      const txDate = new Date(r.createdAt || r.updatedAt || Date.now());
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        const amount = Number(r.amount) || 0;
        const isIncoming = r.recipientId === user?.id;
        
        if (isIncoming) {
          received += amount;
        } else {
          sent += amount;
        }
      }
    });

    return {
      received,
      sent,
      net: received - sent,
    };
  }, [remittances, user]);

  const sections = useMemo(() => {
    if (!remittances || !remittances.length) return [];

    const groups = {};
    const now = new Date();

    remittances.forEach((r) => {
      const dt = new Date(r.createdAt || r.updatedAt || Date.now());
      const diffDays = Math.floor((now - dt) / (1000 * 60 * 60 * 24));
      let title = formatDatePretty(dt);

      if (diffDays === 0) title = 'TODAY';
      else if (diffDays === 1) title = 'YESTERDAY';
      else title = dt.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();

      groups[title] = groups[title] || [];

      const isIncoming = r.recipientId === user?.id;
      const other = isIncoming ? r.sender : r.recipient;
      const name = other?.displayName ?? other?.address ?? other?.email ?? shortAddress(isIncoming ? r.fromAddress : r.toAddress);
      const initials = (name || '').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

      groups[title].push({
        id: r.id,
        remittance: r,
        initials,
        name,
        tag: r.tokenSymbol ?? 'USDC',
        time: `${isIncoming ? 'Received' : 'Sent'} - ${new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        amount: `${isIncoming ? '+' : '-'}$${Number(r.amount).toFixed(2)}`,
        fiat: '-',
        status: r.status ?? 'Draft',
        positive: isIncoming,
      });
    });

    return Object.keys(groups).map((title) => ({ title, data: groups[title] }));
  }, [remittances, user]);

  const renderBottomNav = () => (
    <View style={historyStyles.bottomNav}>
      {bottomTabs.map((tab) => (
        <Pressable
          key={tab}
          style={historyStyles.tabItem}
          onPress={() => {
            if (tab === 'Wallet') onBackToWallet?.();
            if (tab === 'Remit') onOpenRemit?.();
            if (tab === 'Scanner') onOpenScanner?.();
          }}
        >
          <TabIcon tab={tab} active={tab === 'History'} />
          <Text style={[historyStyles.tabLabel, tab === 'History' && historyStyles.tabLabelActive]}>{tab}</Text>
        </Pressable>
      ))}
    </View>
  );

  const renderHeader = () => (
    <>
      {loading ? (
        <View style={{ padding: 24 }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : null}

      <View style={historyStyles.headerRow}>
        <Pressable style={historyStyles.iconButton} onPress={onBackToWallet ?? onBackToLanding}>
          <Text style={historyStyles.menuIcon}>☰</Text>
        </Pressable>

        <View style={historyStyles.headerCenter}>
          <Text style={historyStyles.headerTitle}>Taka</Text>
          <Text style={historyStyles.headerSubtitle}>Activity history</Text>
        </View>

        <Pressable style={historyStyles.avatarMark} onPress={onBackToLanding}>
          <Text style={historyStyles.avatarLetter}>{(user?.displayName ?? 'U').charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      <GlassBox style={historyStyles.summaryCard} contentStyle={historyStyles.summaryCardContent} vectorHeight={114}>
        <Text style={historyStyles.summaryTitle}>THIS MONTH</Text>
        <View style={historyStyles.summaryGrid}>
          <View style={historyStyles.summaryItem}>
            <Text style={historyStyles.summaryValue}>+${monthlySummary.received.toFixed(2)}</Text>
            <Text style={historyStyles.summaryLabel}>Received</Text>
          </View>
          <View style={historyStyles.summaryItem}>
            <Text style={[historyStyles.summaryValue, historyStyles.summaryNegative]}>-${monthlySummary.sent.toFixed(2)}</Text>
            <Text style={historyStyles.summaryLabel}>Sent</Text>
          </View>
          <View style={historyStyles.summaryItem}>
            <Text style={historyStyles.summaryValue}>{monthlySummary.net >= 0 ? '+' : ''}${monthlySummary.net.toFixed(2)}</Text>
            <Text style={historyStyles.summaryLabel}>Net</Text>
          </View>
        </View>
      </GlassBox>
    </>
  );

  const renderSectionHeader = ({ section }) => (
    <View style={historyStyles.sectionHeaderRow}>
      <View style={historyStyles.sectionRule} />
      <Text style={historyStyles.sectionTitle}>{section.title}</Text>
      <View style={historyStyles.sectionRule} />
    </View>
  );

  const renderItem = ({ item }) => (
    <Pressable onPress={() => onOpenReceipt?.(item.remittance)}>
      <GlassBox style={historyStyles.activityCard} contentStyle={historyStyles.activityCardContent} vectorHeight={92}>
        <View style={historyStyles.activityLeft}>
          <View style={historyStyles.activityAvatarWrap}>
            <View style={historyStyles.activityAvatar}>
              <Text style={historyStyles.activityAvatarText}>{item.initials}</Text>
            </View>
            <View style={[historyStyles.activityDot, item.positive ? historyStyles.activityDotPositive : historyStyles.activityDotNegative]} />
          </View>

          <View style={historyStyles.activityTextWrap}>
            <View style={historyStyles.activityNameRow}>
              <Text style={historyStyles.activityName}>{item.name}</Text>
              <View style={historyStyles.tagPill}>
                <Text style={historyStyles.tagPillText}>{item.tag}</Text>
              </View>
            </View>
            <Text style={historyStyles.activityMeta}>{item.time}</Text>
          </View>
        </View>

        <View style={historyStyles.activityRight}>
          <Text style={[historyStyles.activityAmount, item.positive ? historyStyles.activityAmountPositive : historyStyles.activityAmountNegative]}>{item.amount}</Text>
          <Text style={historyStyles.activityFiat}>{item.fiat}</Text>
          <View style={[historyStyles.statusPill, item.status === 'PENDING' ? historyStyles.statusPending : historyStyles.statusConfirmed]}>
            <Text style={historyStyles.statusPillText}>{item.status}</Text>
          </View>
        </View>
      </GlassBox>
    </Pressable>
  );

  const renderEmpty = () =>
    !loading ? (
      <View style={{ paddingHorizontal: 24, paddingVertical: 18 }}>
        <Text style={{ color: 'rgba(234,232,241,0.8)' }}>No transactions yet. Send or receive funds to see your activity here.</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={historyStyles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <BackgroundGradient />
      <RNImage source={require('../../assets/Vector.png')} style={historyStyles.vectorTopLeft} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={historyStyles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />

      {renderBottomNav()}
    </SafeAreaView>
  );
}
