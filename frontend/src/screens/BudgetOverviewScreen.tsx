import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const budgets = [
  { name: "Groceries", spent: "72.00", limit: "180.00" },
  { name: "School", spent: "45.00", limit: "90.00" },
  { name: "Bills", spent: "110.00", limit: "160.00" }
];

export function BudgetOverviewScreen() {
  return (
    <View style={styles.container}>
      {budgets.map((budget) => (
        <View key={budget.name} style={styles.row}>
          <Text style={styles.title}>{budget.name}</Text>
          <Text style={styles.copy}>
            {budget.spent} / {budget.limit} USDC
          </Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${(Number(budget.spent) / Number(budget.limit)) * 100}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 20
  },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  copy: {
    color: colors.muted,
    marginTop: 6
  },
  track: {
    backgroundColor: "#EAE4DA",
    borderRadius: 999,
    height: 8,
    marginTop: 12,
    overflow: "hidden"
  },
  bar: {
    backgroundColor: colors.accent,
    height: 8
  }
});
