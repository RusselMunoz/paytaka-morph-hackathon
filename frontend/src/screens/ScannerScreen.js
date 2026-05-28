import { useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Image, Linking, Pressable, SafeAreaView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import TabIcon from '../components/TabIcon';
import { scannerStyles } from '../styles/scannerStyles';
import { qrApi } from '../lib/api';

const bottomTabs = ['Wallet', 'Remit', 'Scanner', 'History'];

export default function ScannerScreen({ onBackToWallet, onBackToLanding, onOpenHistory, onOpenRemit }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState('');
  const [hasScanned, setHasScanned] = useState(false);
  const [activeTab, setActiveTab] = useState('scanner');
  const [parsedQr, setParsedQr] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canScan = Boolean(permission?.granted) && !hasScanned;
  const scanMessage = useMemo(() => {
    if (!scannedData) {
      return 'Align code within the frame';
    }

    return scannedData;
  }, [scannedData]);

  const openRemitFromQr = (payload) => {
    onOpenRemit?.(payload);
  };

  const parseWithBackend = async (data) => {
    setIsParsing(true);
    setErrorMessage('');

    try {
      const parsed = await qrApi.parse(String(data));
      setParsedQr(parsed);
      return parsed;
    } catch (error) {
      setErrorMessage(error?.message ?? 'Could not parse QR payload');
      return null;
    } finally {
      setIsParsing(false);
    }
  };

  const handleBarcodeScanned = async ({ data, type }) => {
    if (hasScanned) {
      return;
    }

    setHasScanned(true);
    setScannedData(`${type.toUpperCase()}: ${data}`);
    await parseWithBackend(data);

    if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
      Linking.openURL(data).catch(() => {});
    }
  };

  const resetScanner = () => {
    setHasScanned(false);
    setScannedData('');
  };

  const scanFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow photo access to scan QR codes from your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    try {
      const decoded = await Camera.scanFromURLAsync(result.assets[0].uri, ['qr']);

      if (!decoded.length) {
        Alert.alert('No QR found', 'That image does not appear to contain a QR code.');
        return;
      }

      const [firstResult] = decoded;
      const value = `${firstResult.type.toUpperCase()}: ${firstResult.data}`;
      setScannedData(value);
      setHasScanned(true);
      await parseWithBackend(firstResult.data);

      if (typeof firstResult.data === 'string' && /^https?:\/\//i.test(firstResult.data)) {
        Linking.openURL(firstResult.data).catch(() => {});
      }
    } catch (error) {
      Alert.alert('Scan failed', 'Could not scan a QR code from that image.');
    }
  };

  const renderBottomNav = () => (
    <View style={scannerStyles.bottomNav}>
      {bottomTabs.map((tab) => {
        const tabKey = tab.toLowerCase();
        const isActive = activeTab === tabKey;

        return (
          <Pressable
            key={tab}
            style={scannerStyles.tabItem}
            onPress={() => {
              setActiveTab(tabKey);

              if (tab === 'Wallet') {
                onBackToWallet?.();
                return;
              }

              if (tab === 'Remit') {
                onOpenRemit?.();
                return;
              }

              if (tab === 'History') {
                onOpenHistory?.();
              }
            }}
          >
            <TabIcon tab={tab} active={isActive} />
            <Text style={[scannerStyles.tabLabel, isActive && scannerStyles.tabLabelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (!permission) {
    return (
      <SafeAreaView style={scannerStyles.safeArea}>
        <View style={scannerStyles.permissionCard}>
          <Text style={scannerStyles.permissionText}>Loading camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={scannerStyles.safeArea}>
      <Image source={require('../../assets/Vector.png')} style={scannerStyles.vectorTopLeft} />

      <View style={scannerStyles.headerRow}>
        <Pressable style={scannerStyles.iconButton} onPress={onBackToWallet ?? onBackToLanding}>
          <Text style={scannerStyles.menuIcon}>≡</Text>
        </Pressable>

        <View style={scannerStyles.avatarMark}>
          <Text style={scannerStyles.avatarLetter}>u</Text>
        </View>
      </View>

      <View style={scannerStyles.titleWrap}>
        <Image source={require('../../assets/QRIcon.png')} style={scannerStyles.titleIcon} />
        <Text style={scannerStyles.title}>SCAN QR CODE</Text>
        <Text style={scannerStyles.subtitle}>{scanMessage}</Text>
      </View>

      {isParsing ? (
        <View style={{ paddingBottom: 10 }}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : null}

      {errorMessage ? <Text style={{ color: '#f7d3d3', textAlign: 'center', marginBottom: 8 }}>{errorMessage}</Text> : null}

      <View style={scannerStyles.scanFrameOuter}>
        {permission.granted && canScan ? (
          <CameraView
            style={scannerStyles.camera}
            facing="back"
            active={canScan}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
        ) : (
          <View style={scannerStyles.cameraFallback}>
            <Text style={scannerStyles.cameraFallbackText}>Camera unavailable</Text>
          </View>
        )}

        <View style={scannerStyles.scanCorners} pointerEvents="none">
          <View style={[scannerStyles.corner, scannerStyles.cornerTopLeft]} />
          <View style={[scannerStyles.corner, scannerStyles.cornerTopRight]} />
          <View style={[scannerStyles.corner, scannerStyles.cornerBottomLeft]} />
          <View style={[scannerStyles.corner, scannerStyles.cornerBottomRight]} />
          <View style={scannerStyles.scanLine} />
        </View>
      </View>

      {scannedData ? (
        <View style={scannerStyles.resultCard}>
          <Text style={scannerStyles.resultLabel}>SCANNED RESULT</Text>
          <Text style={scannerStyles.resultValue}>{scannedData}</Text>
          {parsedQr ? (
            <View style={{ marginTop: 10 }}>
              <Text style={scannerStyles.resultLabel}>BACKEND PARSED</Text>
              <Text style={scannerStyles.resultValue}>Provider: {parsedQr.provider}</Text>
              {parsedQr.merchantName ? <Text style={scannerStyles.resultValue}>Merchant: {parsedQr.merchantName}</Text> : null}
              {parsedQr.amount ? <Text style={scannerStyles.resultValue}>Amount: {parsedQr.amount}</Text> : null}
              {parsedQr.reference ? <Text style={scannerStyles.resultValue}>Reference: {parsedQr.reference}</Text> : null}
              <Pressable
                style={scannerStyles.resultButton}
                onPress={() =>
                  openRemitFromQr({
                    recipientId: parsedQr.merchantName ?? '',
                    recipientName: parsedQr.merchantName ?? '',
                    amount: parsedQr.amount ?? '',
                    memo: parsedQr.reference ?? '',
                    rawPayload: parsedQr.rawPayload,
                  })
                }
              >
                <Text style={scannerStyles.resultButtonText}>Use in Remit</Text>
              </Pressable>
            </View>
          ) : null}
          <Pressable style={scannerStyles.resultButton} onPress={resetScanner}>
            <Text style={scannerStyles.resultButtonText}>Scan Again</Text>
          </Pressable>
        </View>
      ) : null}

      {!permission.granted ? (
        <View style={scannerStyles.permissionCard}>
          <Text style={scannerStyles.permissionText}>We need camera access to scan QR codes.</Text>
          <Pressable style={scannerStyles.permissionButton} onPress={requestPermission}>
            <Text style={scannerStyles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={scannerStyles.galleryButton} onPress={scanFromGallery}>
          <Text style={scannerStyles.galleryButtonText}>Upload from Gallery</Text>
        </Pressable>
      )}

      {renderBottomNav()}
    </SafeAreaView>
  );
}
