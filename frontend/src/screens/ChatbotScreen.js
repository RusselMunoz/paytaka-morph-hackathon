import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { chatStyles } from '../styles/chatStyles';
import { useAuth, useWallet } from '../contexts';
import { aiApi } from '../lib/api';

const initialMessages = [
  {
    id: 'assistant-1',
    role: 'assistant',
    text: 'Hi User. I am your financial assistant. Ask me anything about your balance, spending, or next move.',
    time: '5:00 PM',
  },
  {
    id: 'assistant-2',
    role: 'assistant',
    text: 'Your essential expenses are covered and you still have a healthy buffer. I can help you plan transfers, savings, or spending limits.',
    time: '5:01 PM',
  },
];

const quickPrompts = ['Check balance', 'Give me a budget breakdown'];

export default function ChatbotScreen({ onBackToWallet, onBackToLanding }) {
  const { isAuthenticated } = useAuth();
  const { address, balance } = useWallet();
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);
  const replyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      time: 'Now',
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputValue('');

    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
    }

    if (!isAuthenticated) {
      replyTimerRef.current = setTimeout(() => {
        const reply = buildReply(trimmed);

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            text: reply,
            time: 'Now',
          },
        ]);
      }, 700);
      return;
    }

    try {
      const response = await aiApi.advise({
        message: trimmed,
        context: {
          walletAddress: address,
          balance,
        },
      });
      const reply = response?.message?.content ?? buildReply(trimmed);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: reply,
          time: 'Now',
        },
      ]);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: buildReply(trimmed),
          time: 'Now',
        },
      ]);
    }
  };

  const buildReply = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('budget')) {
      return 'I can break your week into essentials, free spend, and savings. Based on your current balance, you are still comfortably covered.';
    }

    if (lowerText.includes('balance')) {
      return 'Your current balance looks healthy. If you want, I can also show a projected weekly burn rate next.';
    }

    if (lowerText.includes('send') || lowerText.includes('transfer')) {
      return 'I can help you prepare a transfer. Tell me the amount, recipient, and token, and I will guide the next step.';
    }

    return 'I understand. I can help with transfers, balances, budgets, and spending limits. Tell me what you want to do next.';
  };

  return (
    <SafeAreaView style={chatStyles.safeArea}>
      <Image source={require('../../assets/Vector.png')} style={chatStyles.vectorTopLeft} />

      <View style={chatStyles.headerRow}>
        <Pressable style={chatStyles.backButton} onPress={onBackToWallet ?? onBackToLanding}>
          <Text style={chatStyles.backButtonText}>‹</Text>
        </Pressable>

        <Image source={require('../../assets/PaytakaChatBot.png')} style={chatStyles.headerAvatarImage} />

        <View style={chatStyles.headerTextWrap}>
          <Text style={chatStyles.headerTitle}>Taka</Text>
          <Text style={chatStyles.headerSubtitle}>Crypto wallet assistant</Text>
        </View>

        <View style={chatStyles.onlinePill}>
          <View style={chatStyles.onlineDot} />
          <Text style={chatStyles.onlineText}>Online</Text>
        </View>
      </View>

      <View style={chatStyles.divider} />

      <KeyboardAvoidingView
        style={chatStyles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <ScrollView ref={scrollRef} style={chatStyles.messagesScroll} contentContainerStyle={chatStyles.messagesContent} showsVerticalScrollIndicator={false}>
          <View style={chatStyles.datePill}>
            <Text style={chatStyles.dateText}>Today, May 27, 2026</Text>
          </View>

          {messages.map((message) => (
            <View key={message.id} style={[chatStyles.messageRow, message.role === 'user' ? chatStyles.userRow : chatStyles.assistantRow]}>
              {message.role === 'assistant' ? <Image source={require('../../assets/PaytakaChatBot.png')} style={chatStyles.messageAvatarImage} /> : null}

              <View style={[chatStyles.messageBubble, message.role === 'user' ? chatStyles.userBubble : chatStyles.assistantBubble]}>
                <Text style={[chatStyles.messageText, message.role === 'user' && chatStyles.userText]}>{message.text}</Text>
              </View>

              {message.role === 'user' ? <View style={chatStyles.userBadge}><Text style={chatStyles.userBadgeText}>U</Text></View> : null}
            </View>
          ))}

          <View style={chatStyles.quickPromptRow}>
            {quickPrompts.map((prompt) => (
              <Pressable key={prompt} style={chatStyles.quickPromptButton} onPress={() => sendMessage(prompt)}>
                <Text style={chatStyles.quickPromptText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={chatStyles.inputShell}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Ask Taka anything..."
            placeholderTextColor="rgba(217, 209, 219, 0.5)"
            style={chatStyles.input}
            multiline
          />

          <Pressable style={chatStyles.sendButton} onPress={() => sendMessage(inputValue)}>
            <Text style={chatStyles.sendButtonText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
