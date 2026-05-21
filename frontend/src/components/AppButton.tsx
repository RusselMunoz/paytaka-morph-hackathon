import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type AppButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  onPress?: () => void;
};

export function AppButton({ label, variant = "primary", onPress }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 16
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryLabel: {
    color: colors.ink
  },
  pressed: {
    opacity: 0.8
  }
});
