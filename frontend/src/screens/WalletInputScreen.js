import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGradient from '../components/BackgroundGradient';
import { useWallet } from '../contexts/WalletContext';
import { landingStyles } from '../styles/landingStyles';

const WALLET_ADDRESS_KEY = '@paytaka_wallet_address';

export default function WalletInputScreen({ onWalletLoaded, onBack }) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { connectWithAddress } = useWallet();

  const validateAddress = (addr) => {
    // Check if address starts with 0x and has correct length
    const trimmed = addr.trim();
    if (!trimmed.startsWith('0x')) {
      return { valid: false, error: 'Address must start with 0x' };
    }
    if (trimmed.length !== 42) {
      return { valid: false, error: 'Address must be 42 characters (0x + 40 hex chars)' };
    }
    // Check if remaining characters are valid hex
    const hexPart = trimmed.slice(2);
    if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
      return { valid: false, error: 'Address contains invalid characters' };
    }
    return { valid: true };
  };

  const handleLoadWallet = async () => {
    const validation = validateAddress(address);
    
    if (!validation.valid) {
      Alert.alert('Invalid Address', validation.error);
      return;
    }

    setIsLoading(true);
    try {
      const trimmedAddress = address.trim();
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(WALLET_ADDRESS_KEY, trimmedAddress);
      
      // Connect wallet in context
      await connectWithAddress(trimmedAddress);
      
      // Navigate to dashboard
      onWalletLoaded?.();
    } catch (error) {
      console.error('Failed to load wallet:', error);
      Alert.alert('Error', 'Failed to load wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={landingStyles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <BackgroundGradient />

      <View style={landingStyles.frame}>
        <View style={landingStyles.header}>
          <Text style={landingStyles.headerTitle}>Enter Your Wallet</Text>
        </View>

        <View style={[landingStyles.heroArea, { justifyContent: 'center', paddingHorizontal: 24 }]}>
          <View style={{ width: '100%', maxWidth: 400 }}>
            <Text style={landingStyles.inputLabel}>Morph Wallet Address</Text>
            <TextInput
              style={landingStyles.textInput}
              placeholder="Enter Morph wallet address (0x...)"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              editable={!isLoading}
            />
            <Text style={landingStyles.helperText}>
              Enter your Morph Holesky testnet wallet address
            </Text>
          </View>
        </View>

        <View style={landingStyles.footer}>
          <View style={landingStyles.buttonStack}>
            <Pressable
              onPress={handleLoadWallet}
              disabled={isLoading || !address.trim()}
              style={({ pressed }) => [
                landingStyles.buttonBase,
                landingStyles.buttonPrimary,
                pressed && landingStyles.buttonPressed,
                (isLoading || !address.trim()) && landingStyles.buttonDisabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={landingStyles.buttonLabel}>Load Wallet</Text>
              )}
            </Pressable>

            <Pressable
              onPress={onBack}
              disabled={isLoading}
              style={({ pressed }) => [
                landingStyles.buttonBase,
                landingStyles.buttonSecondary,
                pressed && landingStyles.buttonPressed,
              ]}
            >
              <Text style={[landingStyles.buttonLabel, landingStyles.buttonLabelSecondary]}>
                Back
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Made with Bob
