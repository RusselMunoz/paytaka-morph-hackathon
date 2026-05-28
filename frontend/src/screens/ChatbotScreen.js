import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import BackgroundGradient from '../components/BackgroundGradient';
import { useAuth, useWallet } from '../contexts';
import { aiApi, budgetApi, remittanceApi } from '../lib/api';
import { chatStyles } from '../styles/chatStyles';

const quickPrompts = ['Check Balance', 'Give me a budget breakdown'];

const parseAmount = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numeric = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatCurrency = (value, options = {}) => {
  const amount = parseAmount(value);
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${options.approx ? '~' : ''}$${formatted}`;
};

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

const getTodayLabel = () =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const isWithinCurrentWeek = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
};

const detectIntent = (text) => {
  const normalized = text.toLowerCase();

  if (/\b(budget|breakdown|free to spend|weekly)\b/.test(normalized)) {
    return 'budget';
  }

  if (/\b(balance|wallet|funds|how much money)\b/.test(normalized)) {
    return 'balance';
  }

  if (/\b(suggest|suggestion|advice|save|saving|spend|limit|grocer|expense|habit)\b/.test(normalized)) {
    return 'advice';
  }

  if (/\b(send|transfer|remit|pay)\b/.test(normalized)) {
    return 'transfer';
  }

  return 'general';
};

const buildBudgetCard = (snapshot) => {
  const totalBalance = snapshot.balanceAmount;
  const essentialSpent = snapshot.essentialSpent;
  const essentialLimit = snapshot.essentialLimit;
  const hasLimit = essentialLimit > 0;
  const freeToSpend = Math.max(totalBalance - essentialSpent, 0);
  const progress = hasLimit ? Math.min(essentialSpent / essentialLimit, 1) : 0;

  return {
    type: 'budget',
    title: 'WEEKLY BUDGET',
    totalBalance,
    essentialSpent,
    essentialLimit,
    freeToSpend,
    progress,
    caption: hasLimit
      ? `${Math.round(progress * 100)}% of budget used wisely`
      : 'No weekly budget limit set yet',
  };
};

const createInitialMessages = (snapshot, displayName) => {
  const firstName = displayName || 'User';
  const hasBalance = snapshot.hasBalance;
  const incomingText = snapshot.recentIncoming > 0 ? ` You just received ${formatCurrency(snapshot.recentIncoming)} USDC.` : '';
  const balanceText = hasBalance
    ? `Your total balance is ${formatCurrency(snapshot.balanceAmount)}.`
    : 'Load your wallet balance so I can give exact numbers.';

  return [
    {
      id: 'assistant-1',
      role: 'assistant',
      text: `Hi ${firstName}! I'm Taka, your financial companion.${incomingText} ${balanceText}`,
      time: formatTime(),
    },
    {
      id: 'assistant-2',
      role: 'assistant',
      text:
        snapshot.freeToSpend > 0
          ? `Your essential expenses are covered and you still have about ${formatCurrency(snapshot.freeToSpend)} free to spend. I can help you manage your budget and reduce unnecessary spending based on your financial habits.`
          : 'I can check your balance, review recent spending, and help set a budget once your wallet and budget data are loaded.',
      time: formatTime(),
    },
  ];
};

const buildBalanceReply = (snapshot) => {
  if (!snapshot.hasBalance) {
    return {
      text: snapshot.address
        ? 'I could not load a live balance yet. Try refreshing the wallet, then ask me again.'
        : 'Connect or load a wallet first so I can check the real balance.',
    };
  }

  return {
    text: `Your current balance is ${formatCurrency(snapshot.balanceAmount)} ${snapshot.tokenSymbol}. You have about ${formatCurrency(snapshot.freeToSpend)} available after tracked essential spending.`,
  };
};

const buildBudgetReply = (snapshot) => {
  const card = buildBudgetCard(snapshot);

  if (!snapshot.hasBalance && !snapshot.hasBudget && snapshot.outgoingThisWeek <= 0) {
    return {
      text: 'I need a loaded wallet balance, a budget, or recent transactions before I can build a real weekly breakdown.',
    };
  }

  return {
    text: snapshot.hasBudget
      ? 'Here is your weekly budget breakdown using your saved budget and wallet balance.'
      : 'Here is a budget breakdown from your current wallet balance and recent outgoing activity.',
    card,
  };
};

const buildAdviceReply = (snapshot) => {
  if (!snapshot.hasBalance) {
    return {
      text: 'I need your live wallet balance before giving spending advice. Load your wallet, then I can compare spending against your available funds.',
    };
  }

  if (snapshot.freeToSpend <= 0) {
    return {
      text: `You have ${formatCurrency(snapshot.balanceAmount)} available, but tracked essential spending already uses the weekly buffer. I would pause non-essential spending and keep incoming funds for bills first.`,
    };
  }

  const suggestedSavings = Math.max(snapshot.freeToSpend * 0.25, 0);
  return {
    text: `You can spend carefully from about ${formatCurrency(snapshot.freeToSpend)}. A sensible move is to keep at least ${formatCurrency(suggestedSavings)} aside for savings and cap flexible purchases below ${formatCurrency(snapshot.freeToSpend - suggestedSavings)} this week.`,
  };
};

const buildLocalReply = (text, snapshot) => {
  const intent = detectIntent(text);

  if (intent === 'budget') {
    return buildBudgetReply(snapshot);
  }

  if (intent === 'balance') {
    return buildBalanceReply(snapshot);
  }

  if (intent === 'advice') {
    return buildAdviceReply(snapshot);
  }

  if (intent === 'transfer') {
    return {
      text: `I can help you prepare a transfer. Your loaded balance is ${snapshot.hasBalance ? formatCurrency(snapshot.balanceAmount) : 'not available yet'}, so tell me the amount, recipient, and token.`,
    };
  }

  return {
    text: snapshot.hasBalance
      ? `I can help with balances, budgets, spending suggestions, and transfers. Your current loaded balance is ${formatCurrency(snapshot.balanceAmount)} ${snapshot.tokenSymbol}.`
      : 'I can help with balances, budgets, spending suggestions, and transfers. Load a wallet balance first for exact answers.',
  };
};

function BudgetBreakdownCard({ card }) {
  const progressPercent = `${Math.round(card.progress * 100)}%`;

  return (
    <View style={chatStyles.budgetCard}>
      <Text style={chatStyles.budgetTitle}>{card.title}</Text>

      <View style={chatStyles.budgetLine}>
        <Text style={chatStyles.budgetLabel}>Total Balance</Text>
        <Text style={chatStyles.budgetValue}>{formatCurrency(card.totalBalance)}</Text>
      </View>

      <View style={chatStyles.budgetLine}>
        <Text style={chatStyles.budgetLabel}>Essential Expense</Text>
        <Text style={chatStyles.budgetValue}>
          {formatCurrency(card.essentialSpent)} / {card.essentialLimit > 0 ? formatCurrency(card.essentialLimit) : 'No limit'}
        </Text>
      </View>

      <View style={chatStyles.budgetLine}>
        <Text style={chatStyles.budgetLabel}>Free To Spend</Text>
        <Text style={chatStyles.budgetValue}>{formatCurrency(card.freeToSpend, { approx: true })}</Text>
      </View>

      <View style={chatStyles.progressTrack}>
        <View style={[chatStyles.progressFill, { width: progressPercent }]} />
      </View>

      <Text style={chatStyles.budgetCaption}>{card.caption}</Text>
    </View>
  );
}

export default function ChatbotScreen({ onBackToWallet, onBackToLanding }) {
  const { isAuthenticated, user } = useAuth();
  const { address, balance, usdcBalance, usdtBalance, refreshBalance } = useWallet();
  const [budgets, setBudgets] = useState([]);
  const [remittances, setRemittances] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef(null);
  const replyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (address && !balance) {
      refreshBalance(address).catch(() => {});
    }
  }, [address, balance, refreshBalance]);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      setBudgets([]);
      setRemittances([]);
      return () => {
        isMounted = false;
      };
    }

    Promise.allSettled([budgetApi.list(), remittanceApi.list()]).then(([budgetResult, remittanceResult]) => {
      if (!isMounted) {
        return;
      }

      setBudgets(budgetResult.status === 'fulfilled' && Array.isArray(budgetResult.value) ? budgetResult.value : []);
      setRemittances(
        remittanceResult.status === 'fulfilled' && Array.isArray(remittanceResult.value) ? remittanceResult.value : []
      );
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const snapshot = useMemo(() => {
    const balanceAmount = balance?.formatted ? parseAmount(balance.formatted) : (usdcBalance + usdtBalance);
    const tokenSymbol = 'USDC';
    const weeklyBudget =
      budgets.find((budget) => {
        const periodMatches = budget.period === 'WEEKLY';
        const startsAt = budget.startsAt ? new Date(budget.startsAt) : null;
        const endsAt = budget.endsAt ? new Date(budget.endsAt) : null;
        const now = new Date();

        return periodMatches && (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
      }) ??
      budgets.find((budget) => budget.period === 'WEEKLY') ??
      budgets[0];

    const outgoingThisWeek = remittances
      .filter((item) => item.senderId === user?.id && isWithinCurrentWeek(item.createdAt))
      .reduce((total, item) => total + parseAmount(item.amount), 0);
    const recentIncoming = remittances
      .filter((item) => item.recipientId === user?.id && isWithinCurrentWeek(item.createdAt))
      .reduce((total, item) => total + parseAmount(item.amount), 0);
    const budgetSpent = parseAmount(weeklyBudget?.spentAmount);
    const essentialSpent = budgetSpent > 0 ? budgetSpent : outgoingThisWeek;
    const essentialLimit = parseAmount(weeklyBudget?.limitAmount);
    const freeToSpend = Math.max(balanceAmount - essentialSpent, 0);

    return {
      address,
      balanceAmount,
      tokenSymbol,
      hasBalance: Boolean(balance),
      hasBudget: Boolean(weeklyBudget),
      weeklyBudget,
      essentialSpent,
      essentialLimit,
      freeToSpend,
      outgoingThisWeek,
      recentIncoming,
      remittances,
      budgets,
    };
  }, [address, balance, budgets, remittances, user?.id]);

  useEffect(() => {
    setMessages((currentMessages) => {
      const hasUserMessage = currentMessages.some((message) => message.role === 'user');

      if (hasUserMessage) {
        return currentMessages;
      }

      return createInitialMessages(snapshot, user?.displayName);
    });
  }, [snapshot, user?.displayName]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    });
  }, [messages]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();

      if (!trimmed) {
        return;
      }

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        time: formatTime(),
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setInputValue('');

      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }

      const intent = detectIntent(trimmed);
      const localReply = buildLocalReply(trimmed, snapshot);

      if (intent !== 'general' || !isAuthenticated) {
        replyTimerRef.current = setTimeout(() => {
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              text: localReply.text,
              card: localReply.card,
              time: formatTime(),
            },
          ]);
        }, 350);
        return;
      }

      try {
        const response = await aiApi.advise({
          message: trimmed,
          context: {
            walletAddress: address,
            balance: {
              amount: snapshot.balanceAmount,
              tokenSymbol: snapshot.tokenSymbol,
              raw: balance,
            },
            budgets,
            spending: {
              outgoingThisWeek: snapshot.outgoingThisWeek,
              recentIncoming: snapshot.recentIncoming,
              freeToSpend: snapshot.freeToSpend,
              transactions: remittances,
            },
          },
        });
        const reply = response?.message?.content || localReply.text;

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: reply,
            time: formatTime(),
          },
        ]);
      } catch {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: localReply.text,
            card: localReply.card,
            time: formatTime(),
          },
        ]);
      }
    },
    [address, balance, budgets, isAuthenticated, remittances, snapshot]
  );

  const chatRows = useMemo(
    () => [{ id: 'date', type: 'date' }, ...messages.map((message) => ({ ...message, type: 'message' }))],
    [messages]
  );

  const renderChatRow = useCallback(({ item }) => {
    if (item.type === 'date') {
      return (
        <View style={chatStyles.datePill}>
          <Text style={chatStyles.dateText}>{getTodayLabel()}</Text>
        </View>
      );
    }

    const isUser = item.role === 'user';

    return (
      <View style={[chatStyles.messageRow, isUser ? chatStyles.userRow : chatStyles.assistantRow]}>
        {!isUser ? (
          <Image source={require('../../assets/PaytakaChatBot.png')} style={chatStyles.messageAvatarImage} />
        ) : null}

        <View style={[chatStyles.messageStack, isUser && chatStyles.userMessageStack]}>
          <View style={[chatStyles.messageBubble, isUser ? chatStyles.userBubble : chatStyles.assistantBubble]}>
            <Text style={[chatStyles.messageText, isUser && chatStyles.userText]}>{item.text}</Text>
          </View>

          {item.card?.type === 'budget' ? <BudgetBreakdownCard card={item.card} /> : null}

          <Text style={[chatStyles.timestamp, isUser && chatStyles.userTimestamp]}>{item.time}</Text>
        </View>

        {isUser ? (
          <View style={chatStyles.userBadge}>
            <Text style={chatStyles.userBadgeText}>U</Text>
          </View>
        ) : null}
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={chatStyles.safeArea} edges={['top']}>
      <BackgroundGradient />
      <Image source={require('../../assets/Vector.png')} style={chatStyles.vectorTopLeft} />

      <View style={chatStyles.headerRow}>
        <Pressable 
          style={chatStyles.backButton} 
          onPress={() => {
            if (onBackToWallet) {
              onBackToWallet();
            } else if (onBackToLanding) {
              onBackToLanding();
            }
          }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Feather name="chevron-left" size={28} color="#F4EEF9" />
        </Pressable>

        <Image source={require('../../assets/PaytakaChatBot.png')} style={chatStyles.headerAvatarImage} />

        <View style={chatStyles.headerTextWrap}>
          <View style={chatStyles.headerTitleRow}>
            <Text style={chatStyles.headerTitle}>Taka</Text>
            <View style={chatStyles.onlineDot} />
            <Text style={chatStyles.onlineText}>Online</Text>
          </View>
          <Text style={chatStyles.headerSubtitle}>Crypto-wallet companion</Text>
        </View>
      </View>

      <View style={chatStyles.divider} />

      <KeyboardAvoidingView
        style={chatStyles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <FlatList
          ref={listRef}
          data={chatRows}
          keyExtractor={(item) => item.id}
          renderItem={renderChatRow}
          style={chatStyles.messagesScroll}
          contentContainerStyle={chatStyles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={5}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
        />

        <View style={chatStyles.composer}>
          <View style={chatStyles.quickPromptRow}>
            {quickPrompts.map((prompt) => (
              <Pressable key={prompt} style={chatStyles.quickPromptButton} onPress={() => sendMessage(prompt)}>
                <Feather
                  name={prompt.includes('Balance') ? 'check' : 'star'}
                  size={15}
                  color="#B95EFF"
                />
                <Text style={chatStyles.quickPromptText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>

          <View style={chatStyles.inputShell}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Ask Taka anything..."
              placeholderTextColor="rgba(217, 209, 219, 0.42)"
              style={chatStyles.input}
              multiline
            />
            <Feather name="mic" size={18} color="rgba(210, 200, 217, 0.42)" />
            <Pressable style={chatStyles.sendButton} onPress={() => sendMessage(inputValue)}>
              <Feather name="send" size={19} color="rgba(210, 200, 217, 0.64)" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
