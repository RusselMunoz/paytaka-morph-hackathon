import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, Text, View, Image as RNImage, ActivityIndicator } from 'react-native';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import { historyStyles } from '../styles/historyStyles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { remittanceApi } from '../lib/api';
import { useAuth } from '../contexts';
import { shortAddress, formatDatePretty } from '../lib/morph';

const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];



export default function HistoryScreen({ onBackToWallet, onBackToLanding, onOpenRemit, onOpenScanner, onOpenReceipt }) {
  const { user } = useAuth();
  const [remittances, setRemittances] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadRemittances = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const list = await remittanceApi.list();
      setRemittances(list);
    } catch (err) {
      setErrorMessage(err?.message ?? 'Could not load remittances');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRemittances();
  }, [loadRemittances]);

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
        time: `${isIncoming ? 'Received' : 'Sent'} • ${new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        amount: `${isIncoming ? '+' : '-'}$${Number(r.amount).toFixed(2)}`,
        fiat: '-',
        status: r.status ?? 'Draft',
        positive: isIncoming,
      });
    });

    return Object.keys(groups).map((k) => ({ title: k, items: groups[k] }));
  }, [remittances, user]);

  const renderBottomNav = () => (
    <View style={historyStyles.bottomNav}>
      {bottomTabs.map((tab) => (
        <Pressable
          key={tab}
          style={historyStyles.tabItem}
          onPress={() => {
            if (tab === 'Wallet') {
              onBackToWallet?.();
            }

            if (tab === 'Remit') {
              onOpenRemit?.();
            }

            if (tab === 'Scanner') {
              onOpenScanner?.();
            }

            if (tab === 'History') {
              return;
            }
          }}
        >
          <TabIcon tab={tab} active={tab === 'History'} />
          <Text style={[historyStyles.tabLabel, tab === 'History' && historyStyles.tabLabelActive]}>{tab}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={historyStyles.safeArea}>
      <StatusBar style="light" />

      <RNImage source={require('../../assets/Vector.png')} style={historyStyles.vectorTopLeft} />

      <ScrollView contentContainerStyle={historyStyles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ padding: 24 }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        {errorMessage ? (
          <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
            <Text style={{ color: '#f7d3d3', marginBottom: 12 }}>{errorMessage}</Text>
            <Pressable style={historyStyles.iconButton} onPress={loadRemittances}>
              <Text style={historyStyles.menuIcon}>↻</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={historyStyles.headerRow}>
          <Pressable style={historyStyles.iconButton} onPress={onBackToWallet ?? onBackToLanding}>
            <Text style={historyStyles.menuIcon}>‹</Text>
          </Pressable>

          <View style={historyStyles.headerCenter}>
            <Text style={historyStyles.headerTitle}>Taka</Text>
            <Text style={historyStyles.headerSubtitle}>Activity history</Text>
          </View>

          <View style={historyStyles.avatarMark}>
            <Text style={historyStyles.avatarLetter}>u</Text>
          </View>
        </View>

        <GlassBox style={historyStyles.summaryCard} contentStyle={historyStyles.summaryCardContent} vectorHeight={114}>
          <Text style={historyStyles.summaryTitle}>THIS MONTH</Text>
          <View style={historyStyles.summaryGrid}>
            <View style={historyStyles.summaryItem}>
              <Text style={historyStyles.summaryValue}>+$500.00</Text>
              <Text style={historyStyles.summaryLabel}>Received</Text>
            </View>
            <View style={historyStyles.summaryItem}>
              <Text style={[historyStyles.summaryValue, historyStyles.summaryNegative]}>-$245.50</Text>
              <Text style={historyStyles.summaryLabel}>Sent</Text>
            </View>
            <View style={historyStyles.summaryItem}>
              <Text style={historyStyles.summaryValue}>+$254.50</Text>
              <Text style={historyStyles.summaryLabel}>Net</Text>
            </View>
          </View>
        </GlassBox>

        {sections.map((section) => (
          <View key={section.title} style={historyStyles.sectionBlock}>
            <View style={historyStyles.sectionHeaderRow}>
              <View style={historyStyles.sectionRule} />
              <Text style={historyStyles.sectionTitle}>{section.title}</Text>
              <View style={historyStyles.sectionRule} />
            </View>

            {section.items.map((item) => (
              <Pressable key={`${section.title}-${item.name}-${item.time}`} onPress={() => onOpenReceipt?.(item.remittance)}>
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
                    <View style={[historyStyles.statusPill, item.status === 'Pending' ? historyStyles.statusPending : historyStyles.statusConfirmed]}>
                      <Text style={historyStyles.statusPillText}>{item.status}</Text>
                    </View>
                  </View>
                </GlassBox>
              </Pressable>
            ))}
          </View>
        ))}

        {!loading && !errorMessage && sections.length === 0 ? (
          <View style={{ paddingHorizontal: 24, paddingVertical: 18 }}>
            <Text style={{ color: 'rgba(234,232,241,0.8)' }}>No backend remittances yet. Create one from Remit to see it here.</Text>
          </View>
        ) : null}
      </ScrollView>

      {renderBottomNav()}
    </SafeAreaView>
  );
}
