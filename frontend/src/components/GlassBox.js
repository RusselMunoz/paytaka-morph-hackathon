import { Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

const vectorSource = require('../../assets/Vector.png');

export default function GlassBox({ children, contentStyle, radius = 18, showVector = true, style, tint = 'dark', intensity = 50, vectorHeight }) {
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const resolvedVectorHeight =
    vectorHeight ??
    (typeof flattenedStyle.height === 'number' ? Math.max(84, Math.round(flattenedStyle.height * 0.62)) : 138);

  return (
    <View style={[styles.container, { borderRadius: radius }, style]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.tintLayer, { borderRadius: radius }]} />
      <View style={[StyleSheet.absoluteFill, styles.edgeGlow, { borderRadius: radius }]} />
      {showVector ? <Image pointerEvents="none" source={vectorSource} resizeMode="cover" style={[styles.vectorOverlay, { height: resolvedVectorHeight }]} /> : null}
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'rgba(64, 63, 63, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  tintLayer: {
    backgroundColor: 'rgba(64, 63, 63, 0.12)',
  },
  edgeGlow: {
    backgroundColor: 'rgba(167, 81, 235, 0.06)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(227, 191, 255, 0.22)',
  },
  vectorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    width: '100%',
    opacity: 0.95,
  },
});