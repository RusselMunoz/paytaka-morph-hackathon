import "react-native-gesture-handler";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RealtimeProvider } from "./src/contexts/RealtimeContext";
import { WalletProvider } from "./src/contexts/WalletContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <RealtimeProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </RealtimeProvider>
      </WalletProvider>
    </SafeAreaProvider>
  );
}
