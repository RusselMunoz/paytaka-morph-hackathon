import { View, StyleSheet } from 'react-native';

export default function BackgroundGradient() {
  return (
    <View style={styles.background} pointerEvents="none" />
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0D0D0D',
    opacity: 1,
  },
});

// Made with Bob
