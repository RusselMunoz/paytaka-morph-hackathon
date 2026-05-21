import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { BalanceCard } from "../components/BalanceCard";
import type { MainTabParamList, RootStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Send">,
  NativeStackScreenProps<RootStackParamList>
>;

export function SenderDashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <BalanceCard label="Available to send" amount="1,250.00 USDC" subtitle="Morph Hoodi Testnet demo balance" />
      <Text style={styles.heading}>New remittance</Text>
      <TextInput style={styles.input} placeholder="Recipient wallet or phone" />
      <TextInput style={styles.input} placeholder="Amount in USDC" keyboardType="decimal-pad" />
      <TextInput style={styles.input} placeholder="Memo" />
      <AppButton label="Preview transfer" />
      <AppButton label="Scan merchant QR" variant="secondary" onPress={() => navigation.navigate("QRScanner")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    padding: 20
  },
  heading: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6
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
