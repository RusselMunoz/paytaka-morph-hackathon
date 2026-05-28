import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function BackgroundGradient() {
  return (
    <LinearGradient
      colors={['rgba(147, 76, 255, 0.15)', 'rgba(147, 76, 255, 0.05)', 'rgba(8, 7, 7, 0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.8 }}
      style={styles.gradient}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    left: -100,
    top: -50,
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.6,
  },
});

// Made with Bob
