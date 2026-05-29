import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, useWindowDimensions, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { landingStyles } from '../styles/landingStyles';
import BrandMark from '../components/BrandMark';
import BackgroundGradient from '../components/BackgroundGradient';

const buttons = [
  { label: 'Create Wallet', variant: 'primary' },
  { label: 'I have a wallet', variant: 'secondary' },
];

export default function LandingScreen({ onAuthenticated, onNavigateToWalletInput }) {
  const [sheet, setSheet] = useState(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const markSize = isCompact ? 170 : 210;

  // Handle button press based on which button was clicked
  const handleButtonPress = (buttonLabel) => {
    if (buttonLabel === 'I have a wallet') {
      onNavigateToWalletInput?.();
    } else {
      // "Create Wallet" - for now, also go to wallet input
      // In future, this could open a wallet creation flow
      onNavigateToWalletInput?.();
    }
  };

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
    <SafeAreaView style={landingStyles.safeArea} edges={['top']}>
      <StatusBar style="light" />

      <BackgroundGradient />
      <Image source={require('../../assets/Vector.png')} style={landingStyles.vectorTopLeft} />
      
      {/* Decorative elements */}
      <View style={[landingStyles.floatingSquare, landingStyles.floatingSquareTopLeft, { width: 32, height: 32 }]} />
      <View style={[landingStyles.floatingSquare, landingStyles.floatingSquareTopRight, { width: 28, height: 28 }]} />
      <View style={[landingStyles.floatingSquare, landingStyles.floatingSquareBottomRight, { width: 36, height: 36 }]} />
      <View style={landingStyles.curvedLineLeft} />
      <View style={landingStyles.curvedLineRight} />
      <View style={landingStyles.bottomRightGlow} />
      
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
                onPress={() => handleButtonPress(button.label)}
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
            By continuing you agree to --'s{' '}
            <Text style={landingStyles.legalLink}>Privacy Policy</Text> and{' '}
            <Text style={landingStyles.legalLink}>User Agreement</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}