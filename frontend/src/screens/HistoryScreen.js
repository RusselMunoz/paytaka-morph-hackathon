import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, ScrollView, Text, View, Image as RNImage } from 'react-native';
import GlassBox from '../components/GlassBox';
import TabIcon from '../components/TabIcon';
import { historyStyles } from '../styles/historyStyles';

const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

const sections = [
  {
    title: 'TODAY',
    items: [
      {
        initials: 'AR',
        name: 'Alex Rivera',
        tag: 'USDC',
        time: 'Received • 2:14 PM',
        amount: '+$200.00',
        fiat: '₱11,600',
        status: 'Confirmed',
        positive: true,
      },
      {
        initials: 'M',
        name: 'Mom',
        tag: 'USDC',
        time: 'Sent • 10:05 AM',
        amount: '-$120.00',
        fiat: '₱11,600',
        status: 'Confirmed',
        positive: false,
      },
    ],
  },
  {
    title: 'YESTERDAY',
    items: [
      {
        initials: 'W',
        name: 'Wife',
        tag: 'USDC',
        time: 'Sent • 6:32 PM',
        amount: '-$50.00',
        fiat: '₱2,900',
        status: 'Pending',
        positive: false,
      },
      {
        initials: 'D',
        name: '0xb42f...8c1a',
        tag: 'USDC',
        time: 'Sent • 6:12 PM',
        amount: '+$300.00',
        fiat: '₱17,400',
        status: 'Confirmed',
        positive: true,
      },
    ],
  },
  {
    title: 'MARCH 2026',
    items: [
      {
        initials: 'D',
        name: '0xb42f...8c1a',
        tag: 'USDC',
        time: 'Sent • Mar 28',
        amount: '-$75.50',
        fiat: '₱17,400',
        status: 'Confirmed',
        positive: false,
      },
    ],
  },
];

export default function HistoryScreen({ onBackToWallet, onBackToLanding, onOpenRemit, onOpenScanner }) {
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
              <GlassBox key={`${section.title}-${item.name}-${item.time}`} style={historyStyles.activityCard} contentStyle={historyStyles.activityCardContent} vectorHeight={92}>
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
            ))}
          </View>
        ))}
      </ScrollView>

      {renderBottomNav()}
    </SafeAreaView>
  );
}
