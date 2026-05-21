import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AICompanionScreen } from "../screens/AICompanionScreen";
import { BudgetOverviewScreen } from "../screens/BudgetOverviewScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { QRScannerScreen } from "../screens/QRScannerScreen";
import { RecipientWalletScreen } from "../screens/RecipientWalletScreen";
import { SenderDashboardScreen } from "../screens/SenderDashboardScreen";
import { TransactionHistoryScreen } from "../screens/TransactionHistoryScreen";
import { colors } from "../theme/colors";

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  QRScanner: undefined;
};

export type MainTabParamList = {
  Send: undefined;
  Wallet: undefined;
  Budget: undefined;
  History: undefined;
  AI: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          borderTopColor: colors.line
        }
      }}
    >
      <Tab.Screen name="Send" component={SenderDashboardScreen} />
      <Tab.Screen name="Wallet" component={RecipientWalletScreen} />
      <Tab.Screen name="Budget" component={BudgetOverviewScreen} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} />
      <Tab.Screen name="AI" component={AICompanionScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: "Welcome" }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ title: "Scan QR" }} />
    </Stack.Navigator>
  );
}
