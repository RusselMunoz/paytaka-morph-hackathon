import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { MascotPlaceholder } from "../components/MascotPlaceholder";
import { api } from "../lib/api";
import { colors } from "../theme/colors";

export function AICompanionScreen() {
  const [message, setMessage] = useState("Should I send 120 USDC today or split it across the month?");
  const [reply, setReply] = useState<string>();

  const ask = async () => {
    const response = await api.post("/ai/advise", {
      message,
      context: {
        screen: "AICompanion",
        walletBalance: "328.40 USDC",
        upcomingBills: ["rent", "school supplies"]
      }
    });
    setReply(response.data.message.content);
  };

  return (
    <View style={styles.container}>
      <MascotPlaceholder />
      <TextInput style={styles.input} value={message} onChangeText={setMessage} multiline />
      <AppButton label="Ask companion" onPress={ask} />
      <View style={styles.reply}>
        <Text style={styles.heading}>Advice</Text>
        <Text style={styles.copy}>{reply ?? "Contextual suggestions will appear here during remittance and QR payment flows."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    padding: 20
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 108,
    padding: 14,
    textAlignVertical: "top"
  },
  reply: {
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
