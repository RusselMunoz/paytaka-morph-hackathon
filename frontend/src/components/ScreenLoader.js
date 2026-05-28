import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function ScreenLoader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F4EEF9" />
      <Text style={styles.label}>Loading</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080707',
  },
  label: {
    marginTop: 10,
    color: 'rgba(244, 238, 249, 0.72)',
    fontSize: 12,
    fontWeight: '700',
  },
});
