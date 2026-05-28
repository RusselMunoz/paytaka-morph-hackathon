import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { landingStyles } from '../styles/landingStyles';
import BrandMark from '../components/BrandMark';
import AuthSheet from '../components/AuthSheet';

const buttons = [
  { label: 'Create Wallet', variant: 'primary' },
  { label: 'I have a wallet', variant: 'secondary' },
];

export default function LandingScreen({ onAuthenticated }) {
  const [sheet, setSheet] = useState(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const markSize = isCompact ? 170 : 210;

  const openSheet = (mode) => {
    setSheet({ mode, isOpen: true });
  };

  const switchSheetMode = (mode) => {
    setSheet({ mode, isOpen: true });
  };

  const requestCloseSheet = () => {
    setSheet((currentSheet) => {
      if (!currentSheet) {
        return currentSheet;
      }

      return {
        ...currentSheet,
        isOpen: false,
      };
    });
  };

  const dismissSheet = () => {
    setSheet(null);
  };

  return (
    <SafeAreaView style={landingStyles.safeArea}>
      <StatusBar style="light" />

      <Image source={require('../../assets/Vector.png')} style={landingStyles.vectorTopLeft} />
      <View style={landingStyles.frame}>
        <View style={landingStyles.header}>
          <Image
            source={require('../../assets/AppName.png')}
            resizeMode="contain"
            style={landingStyles.headerLogo}
          />
        </View>

        <View style={landingStyles.heroArea}>
          <BrandMark size={markSize} />
        </View>

        <View style={landingStyles.footer}>
          <View style={landingStyles.buttonStack}>
            {buttons.map((button) => (
              <Pressable
                key={button.label}
                onPress={() => openSheet(button.variant === 'primary' ? 'signup' : 'login')}
                style={({ pressed }) => [
                  landingStyles.buttonBase,
                  button.variant === 'primary'
                    ? landingStyles.buttonPrimary
                    : landingStyles.buttonSecondary,
                  pressed && landingStyles.buttonPressed,
                ]}
              >
                <Text
                  style={[
                    landingStyles.buttonLabel,
                    button.variant === 'secondary' && landingStyles.buttonLabelSecondary,
                  ]}
                >
                  {button.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={landingStyles.legalText}>
            By continuing you agree to {' '}
            <Text style={landingStyles.legalLink}>Privacy Policy</Text> and {' '}
            <Text style={landingStyles.legalLink}>User Agreement</Text>
          </Text>
        </View>
      </View>

      <AuthSheet
        sheet={sheet}
        onRequestClose={requestCloseSheet}
        onDismiss={dismissSheet}
        onSwitchMode={switchSheetMode}
        onAuthenticated={onAuthenticated}
      />
    </SafeAreaView>
  );
}