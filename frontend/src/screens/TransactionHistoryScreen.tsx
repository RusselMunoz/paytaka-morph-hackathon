import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const demoTransactions = [
  { id: "1", title: "Remittance to Ana", amount: "-120.00 USDC", status: "Confirmed" },
  { id: "2", title: "QR payment - sari-sari store", amount: "-8.25 USDC", status: "Pending" },
  { id: "3", title: "Received from Mark", amount: "+300.00 USDC", status: "Confirmed" }
];

export function TransactionHistoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {demoTransactions.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          <Text style={styles.amount}>{item.amount}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    padding: 20
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14
  },
  rowText: {
    flex: 1,
    paddingRight: 12
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  status: {
    color: colors.muted,
    marginTop: 4
  },
  amount: {
    color: colors.ink,
    fontWeight: "800"
  }
});
