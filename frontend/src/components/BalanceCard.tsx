import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type BalanceCardProps = {
  label: string;
  amount: string;
  subtitle?: string;
};

export function BalanceCard({ label, amount, subtitle }: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.amount}>{amount}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    padding: 20
  },
  label: {
    color: "#CBE6DD",
    fontSize: 14
  },
  amount: {
    color: colors.surface,
    fontSize: 34,
    fontWeight: "800",
    marginTop: 10
  },
  subtitle: {
    color: "#CBE6DD",
    fontSize: 13,
    marginTop: 8
  }
});
