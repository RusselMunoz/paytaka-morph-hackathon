import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function MascotPlaceholder() {
  return (
    <View style={styles.container}>
      <View style={styles.face}>
        <Text style={styles.faceText}>AI</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Companion placeholder</Text>
        <Text style={styles.subtitle}>Drop the cute mascot art here when the visual identity lands.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#EEF6F2",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  face: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    width: 54
  },
  faceText: {
    color: colors.surface,
    fontWeight: "900"
  },
  copy: {
    flex: 1
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  }
});
