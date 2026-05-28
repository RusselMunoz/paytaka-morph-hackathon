import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { authSheetStyles } from '../styles/authSheetStyles';
import { useAuth } from '../contexts';

const authProviders = [
  { key: 'google', icon: 'G', createLabel: 'Create with Google', loginLabel: 'Login with Google' },
  { key: 'apple', icon: '', createLabel: 'Create with Apple', loginLabel: 'Login with Apple' },
  { key: 'email', icon: '✉', createLabel: 'Create with Email', loginLabel: 'Login with Email' },
];

const defaultSignupForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const defaultLoginForm = {
  email: 'user123@gmail.com',
  password: 'password123',
};

export default function AuthSheet({ sheet, onRequestClose, onDismiss, onSwitchMode, onAuthenticated }) {
  const slideY = useRef(new Animated.Value(1)).current;
  const googleCardProgress = useRef(new Animated.Value(0)).current;
  const { login, register, isLoading } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [signupForm, setSignupForm] = useState(defaultSignupForm);
  const [loginForm, setLoginForm] = useState(defaultLoginForm);

  useEffect(() => {
    if (!sheet) {
      return;
    }

    setSelectedProvider(null);
    setSignupForm(defaultSignupForm);
    setLoginForm(defaultLoginForm);
    googleCardProgress.setValue(0);
  }, [sheet?.mode]);

  useEffect(() => {
    Animated.timing(googleCardProgress, {
      toValue: selectedProvider ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [googleCardProgress, selectedProvider]);

  useEffect(() => {
    if (!sheet) {
      return;
    }

    if (sheet.isOpen) {
      slideY.setValue(1);
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.9,
      }).start();
      return;
    }

    Animated.timing(slideY, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onDismiss();
      }
    });
  }, [sheet, onDismiss, slideY]);

  const updateSignupField = (field, value) => {
    setSignupForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateLoginField = (field, value) => {
    setLoginForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const submitSignup = async () => {
    const fullName = signupForm.fullName.trim();
    const email = signupForm.email.trim();
    const password = signupForm.password.trim();
    const confirmPassword = signupForm.confirmPassword.trim();

    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Complete the form', 'Please fill in all sign up fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make both passwords the same.');
      return;
    }

    try {
      await register({
        displayName: fullName,
        email,
        password,
        role: 'RECIPIENT',
      });
      Alert.alert('Account created', `Welcome, ${fullName}. Your wallet setup can continue next.`);
      onAuthenticated?.();
      onRequestClose();
    } catch (error) {
      if (isBackendUnavailable(error)) {
        onAuthenticated?.();
        onRequestClose();
        return;
      }

      Alert.alert('Sign up failed', error.message ?? 'Please try again.');
    }
  };

  const submitLogin = async () => {
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();

    if (!email || !password) {
      Alert.alert('Complete the form', 'Please enter your email and password.');
      return;
    }

    try {
      await login({ email, password });
      Alert.alert('Signed in', 'Login completed successfully.');
      onAuthenticated?.();
      onRequestClose();
    } catch (error) {
      if (isBackendUnavailable(error)) {
        onAuthenticated?.();
        onRequestClose();
        return;
      }

      Alert.alert('Login failed', error.message ?? 'Please try again.');
    }
  };

  if (!sheet) {
    return null;
  }

  const mode = sheet.mode;
  const isLogin = mode === 'login';
  const hasSelectedProvider = Boolean(selectedProvider);

  const getProviderLabel = (provider) => (isLogin ? provider.loginLabel : provider.createLabel);

  const isBackendUnavailable = (error) =>
    typeof error?.message === 'string' && error.message.includes('Could not reach the backend');

  const renderCollapsedProvider = (provider) => (
    <Pressable
      key={provider.key}
      onPress={() => setSelectedProvider(provider.key)}
      style={({ pressed }) => [
        authSheetStyles.providerCard,
        authSheetStyles.providerCardCollapsed,
        pressed && authSheetStyles.pressedState,
      ]}
    >
      <Text
        style={[
          authSheetStyles.providerIcon,
          provider.key === 'google' && authSheetStyles.providerIconGoogle,
          provider.key === 'apple' && authSheetStyles.providerIconApple,
        ]}
      >
        {provider.icon}
      </Text>
      <Text style={authSheetStyles.providerLabel}>{getProviderLabel(provider)}</Text>
      <Text style={authSheetStyles.providerArrow}>›</Text>
    </Pressable>
  );

  const renderExpandedCredentialsCard = (provider) => (
    <Animated.View
      style={[
        authSheetStyles.providerCardExpanded,
        {
          opacity: googleCardProgress,
          transform: [
            {
              scaleY: googleCardProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1],
              }),
            },
            {
              translateY: googleCardProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={authSheetStyles.providerHeaderRow}>
        <Text
          style={[
            authSheetStyles.providerIcon,
            provider.key === 'google' && authSheetStyles.providerIconGoogle,
            provider.key === 'apple' && authSheetStyles.providerIconApple,
          ]}
        >
          {provider.icon}
        </Text>
        <Text style={authSheetStyles.providerHeaderLabel}>
          {getProviderLabel(provider)}
        </Text>
      </View>

      <View style={authSheetStyles.fieldGroup}>
        {!isLogin ? (
          <>
            <Text style={authSheetStyles.fieldLabel}>Full Name</Text>
            <TextInput
              value={signupForm.fullName}
              onChangeText={(value) => updateSignupField('fullName', value)}
              placeholder="Jane Doe"
              placeholderTextColor="rgba(255,255,255,0.38)"
              autoCapitalize="words"
              style={authSheetStyles.input}
            />
          </>
        ) : null}

        <Text style={authSheetStyles.fieldLabel}>Email</Text>
        <TextInput
          value={isLogin ? loginForm.email : signupForm.email}
          onChangeText={(value) => (isLogin ? updateLoginField('email', value) : updateSignupField('email', value))}
          placeholder={isLogin ? 'user123@gmail.com' : 'jane@paytaka.com'}
          placeholderTextColor="rgba(255,255,255,0.38)"
          autoCapitalize="none"
          keyboardType="email-address"
          style={authSheetStyles.input}
        />

        <Text style={authSheetStyles.fieldLabel}>Password</Text>
        <TextInput
          value={isLogin ? loginForm.password : signupForm.password}
          onChangeText={(value) => (isLogin ? updateLoginField('password', value) : updateSignupField('password', value))}
          placeholder="**********"
          placeholderTextColor="rgba(255,255,255,0.38)"
          secureTextEntry
          style={authSheetStyles.input}
        />

        {!isLogin ? (
          <>
            <Text style={authSheetStyles.fieldLabel}>Confirm Password</Text>
            <TextInput
              value={signupForm.confirmPassword}
              onChangeText={(value) => updateSignupField('confirmPassword', value)}
              placeholder="**********"
              placeholderTextColor="rgba(255,255,255,0.38)"
              secureTextEntry
              style={authSheetStyles.input}
            />
          </>
        ) : null}
      </View>
    </Animated.View>
  );

  const renderProvider = (provider) => {
    if (selectedProvider === provider.key) {
      return <View key={provider.key}>{renderExpandedCredentialsCard(provider)}</View>;
    }

    return renderCollapsedProvider(provider);
  };

  return (
    <Modal transparent visible onRequestClose={onRequestClose} animationType="none">
      <Pressable style={authSheetStyles.backdrop} onPress={onRequestClose} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={authSheetStyles.keyboardWrap}>
        <Animated.View
          style={[
            authSheetStyles.sheet,
            {
              transform: [
                {
                  translateY: slideY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 520],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurView intensity={28} tint="dark" style={authSheetStyles.blurLayer} />
          <View style={authSheetStyles.sheetOverlay} pointerEvents="none" />

          <ScrollView
            style={authSheetStyles.contentShell}
            contentContainerStyle={authSheetStyles.contentScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={authSheetStyles.handle} />
            <Text style={authSheetStyles.title}>{isLogin ? 'Login' : 'Create wallet'}</Text>

            <View style={authSheetStyles.sheetBody}>
              <View style={authSheetStyles.providerGroup}>
                {authProviders.map(renderProvider)}
              </View>

              {isLogin ? (
                <Pressable
                  onPress={hasSelectedProvider ? submitLogin : () => setSelectedProvider('email')}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    authSheetStyles.submitButton,
                    pressed && authSheetStyles.pressedState,
                  ]}
                >
                  <Text style={authSheetStyles.submitLabel}>{isLoading ? 'Logging in...' : 'Login'}</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={hasSelectedProvider ? submitSignup : () => setSelectedProvider('email')}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    authSheetStyles.submitButton,
                    pressed && authSheetStyles.pressedState,
                  ]}
                >
                  <Text style={authSheetStyles.submitLabel}>{isLoading ? 'Creating...' : 'Create Wallet'}</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => onSwitchMode(isLogin ? 'signup' : 'login')}
                style={authSheetStyles.switchButton}
              >
                <Text style={authSheetStyles.switchLabel}>
                  {isLogin ? (
                    <>
                      Don't have an account? <Text style={authSheetStyles.switchLabelStrong}>Create Wallet</Text>
                    </>
                  ) : (
                    <>
                      Already have an account? <Text style={authSheetStyles.switchLabelStrong}>Login</Text>
                    </>
                  )}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
