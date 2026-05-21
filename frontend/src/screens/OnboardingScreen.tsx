import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { MascotPlaceholder } from "../components/MascotPlaceholder";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send stablecoins. Spend locally.</Text>
      <Text style={styles.subtitle}>
        Starter login screen for OFW remittance, recipient wallet access, and merchant QR payments.
      </Text>
      <MascotPlaceholder />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry />
      <AppButton label="Continue to demo" onPress={() => navigation.replace("MainTabs")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    padding: 20
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 24
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 14
  }
});
