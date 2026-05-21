import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { BalanceCard } from "../components/BalanceCard";
import { useWallet } from "../contexts/WalletContext";
import { colors } from "../theme/colors";

export function RecipientWalletScreen() {
  const wallet = useWallet();

  return (
    <View style={styles.container}>
      <BalanceCard label="Recipient wallet" amount="328.40 USDC" subtitle={wallet.address ?? "No wallet connected yet"} />
      <View style={styles.panel}>
        <Text style={styles.heading}>Cash-out and spending rails</Text>
        <Text style={styles.copy}>GCash, QRPh, and InstaPay adapters will attach to this wallet flow.</Text>
      </View>
      <AppButton label={wallet.isConnected ? "Wallet connected" : "Connect wallet"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    padding: 20
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  },
  heading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8
  }
});
