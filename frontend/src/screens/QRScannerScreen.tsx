import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { api } from "../lib/api";
import { colors } from "../theme/colors";

export function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastPayload, setLastPayload] = useState<string>();
  const [parsed, setParsed] = useState<string>();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.copy}>Camera permission is needed to scan payment QRs.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={async ({ data }: { data: string }) => {
          if (data === lastPayload) {
            return;
          }

          setLastPayload(data);
          const response = await api.post("/qr/parse", { rawPayload: data });
          setParsed(JSON.stringify(response.data, null, 2));
        }}
      />
      <View style={styles.result}>
        <Text style={styles.heading}>Detected QR</Text>
        <Text style={styles.copy}>{parsed ?? "Point the camera at a QRPh, GCash, or merchant payment code."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  camera: {
    aspectRatio: 1,
    margin: 20,
    overflow: "hidden"
  },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  result: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
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
