# Frontend Overview

## Introduction

PayTaka's frontend is a React Native mobile application built with Expo SDK 55. It provides a modern, glassmorphic UI for stablecoin remittances on the Morph blockchain.

## Screens

### 1. LandingScreen
**Purpose**: First screen users see when opening the app

**Features:**
- PayTaka branding and logo
- "Create Wallet" button (coming soon)
- "I have a wallet" button → navigates to WalletInputScreen
- Glassmorphic design with gradient background

**File**: `src/screens/LandingScreen.js`

### 2. WalletInputScreen
**Purpose**: Manual wallet address entry

**Features:**
- Text input for EVM address
- Real-time address validation
- "Connect Wallet" button
- Error handling for invalid addresses
- Saves address to AsyncStorage on successful connection

**File**: `src/screens/WalletInputScreen.js`

**Validation:**
- Checks for valid EVM address format (0x + 40 hex characters)
- Shows error message if invalid
- Prevents connection with invalid address

### 3. WalletScreen (Home)
**Purpose**: Main dashboard showing wallet balances and quick actions

**Features:**
- Total balance display (USD and PHP)
- Balance change indicator (percentage and amount)
- Currency toggle (USD ⟷ PHP)
- Quick Assets section:
  - HodETH balance
  - USDC balance
  - USDT balance
- Quick Actions:
  - Add Funds
  - Remit
  - QR Code
  - History
- Settings hamburger menu (top right)
- Real-time balance updates every 30 seconds

**File**: `src/screens/WalletScreen.js`

**Data Sources:**
- All balances from WalletContext
- Exchange rate from exchangerate-api.com
- Balance change calculated from AsyncStorage comparison

### 4. RemitScreen
**Purpose**: Send stablecoins to recipients

**Features:**
- Recipient selection from contacts
- Token selector (USDC / USDT)
- Amount input with balance display
- Total balance calculation
- "Send" button with confirmation
- Real-time balance updates

**File**: `src/screens/RemitScreen.js`

**Flow:**
1. Select recipient from contacts list
2. Choose token (USDC or USDT)
3. Enter amount (validates against balance)
4. Confirm and send

### 5. ScannerScreen (QR)
**Purpose**: Scan QR codes for payments or generate QR to receive

**Features:**
- Camera-based QR scanner
- QR code generation for receiving payments
- Tab toggle between Scan and Generate
- Payment amount input
- Address display with copy functionality

**File**: `src/screens/ScannerScreen.js`

**Permissions:**
- Requires camera permission for scanning
- Handles permission denial gracefully

### 6. HistoryScreen
**Purpose**: View transaction history

**Features:**
- List of all transactions (on-chain + backend)
- Transaction details:
  - Direction (incoming/outgoing)
  - Amount and token
  - Recipient/sender address
  - Transaction hash
  - Timestamp
- Pull-to-refresh
- Merges blockchain data with backend remittances

**File**: `src/screens/HistoryScreen.js`

**Data Sources:**
- On-chain transactions from eth_getLogs
- Backend remittances from API
- Sorted by timestamp (newest first)

### 7. ChatbotScreen (Taka)
**Purpose**: AI-powered financial assistant

**Features:**
- Chat interface with message history
- Context-aware responses (includes balance and transactions)
- Typing indicator
- Powered by OpenAI GPT
- Fallback to deterministic responses if API unavailable

**File**: `src/screens/ChatbotScreen.js`

**Integration:**
- Sends user context (balance, recent transactions) to backend
- Backend calls OpenAI API
- Displays responses in chat format

### 8. AddFundsScreen
**Purpose**: Options to add funds to wallet

**Features:**
- Multiple funding options:
  - Bank transfer
  - Credit/debit card
  - Crypto exchange
  - P2P transfer
- Coming soon placeholders
- Instructions for each method

**File**: `src/screens/AddFundsScreen.js`

### 9. ContactsScreen
**Purpose**: Manage recipient contacts

**Features:**
- List of saved contacts
- Add new contact
- Edit existing contacts
- Delete contacts
- Search/filter functionality

**File**: `src/screens/ContactsScreen.js`

### 10. ReceiptScreen
**Purpose**: Transaction confirmation and receipt

**Features:**
- Transaction details summary
- Success/failure status
- Transaction hash
- Share receipt functionality
- Return to home button

**File**: `src/screens/ReceiptScreen.js`

## Navigation Structure

### Stack Navigator
```
Landing Stack
  ├── LandingScreen
  └── WalletInputScreen

Main Tab Navigator (after wallet connection)
  ├── WalletScreen (Home)
  ├── RemitScreen
  ├── ScannerScreen (QR)
  ├── HistoryScreen
  └── ChatbotScreen (Taka)

Modal Screens
  ├── AddFundsScreen
  ├── ContactsScreen
  └── ReceiptScreen
```

**File**: `src/navigation/AppNavigator.js`

### Navigation Flow
1. App opens → LandingScreen
2. User taps "I have a wallet" → WalletInputScreen
3. User enters address → Main Tab Navigator
4. User can navigate between tabs
5. Certain actions open modal screens

## Wallet Input Flow

### Step-by-Step Process
1. **User opens app**: Sees LandingScreen
2. **Taps "I have a wallet"**: Navigates to WalletInputScreen
3. **Enters wallet address**: Types or pastes EVM address
4. **Validation**: App checks if address is valid format
5. **Connection**: If valid, saves to AsyncStorage
6. **Data fetch**: WalletContext fetches all balances
7. **Navigation**: Automatically navigates to WalletScreen
8. **Persistence**: On next app open, auto-connects if address exists

### Address Validation
```javascript
const isEvmAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(value ?? '');
```

### Storage
```javascript
// Save address
await AsyncStorage.setItem('@paytaka_wallet_address', address);

// Retrieve on app launch
const savedAddress = await AsyncStorage.getItem('@paytaka_wallet_address');
```

## Styling Approach

### Design System
- **Color Scheme**: Purple gradient with glassmorphic elements
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px base unit for consistent spacing
- **Shadows**: Subtle shadows for depth

### Glassmorphism
- Semi-transparent backgrounds
- Backdrop blur effects
- Subtle borders
- Gradient overlays

### Component Styling
Each screen has its own style file in `src/styles/`:
- `landingStyles.js`
- `walletStyles.js`
- `remitStyles.js`
- `scannerStyles.js`
- `historyStyles.js`
- `chatStyles.js`
- `receiptStyles.js`

### Reusable Components
- **BackgroundGradient**: Consistent gradient background
- **GlassBox**: Glassmorphic container
- **BrandMark**: PayTaka logo component
- **TabIcon**: Custom tab bar icons
- **ScreenTransition**: Smooth screen transitions
- **ScreenLoader**: Loading state component

## UI Notes

### Responsive Design
- Adapts to different screen sizes
- Uses percentage-based widths
- Flexible layouts with flexbox

### Animations
- Screen transitions with fade effects
- Tab bar animations
- Button press feedback
- Loading indicators

### Accessibility
- Readable font sizes
- High contrast text
- Touch target sizes (minimum 44x44)
- Screen reader support (basic)

### Performance
- Optimized re-renders with useMemo
- Lazy loading for heavy components
- Image optimization
- Efficient list rendering with FlatList

## State Management

### Context Providers
1. **AuthContext**: User authentication state
2. **WalletContext**: Blockchain data and balances
3. **RealtimeContext**: WebSocket connection for live updates

### Local State
- Screen-specific state with useState
- Form inputs and UI toggles
- Temporary data (not persisted)

### Persistent State
- AsyncStorage for wallet address
- AsyncStorage for last balance
- AsyncStorage for user preferences

## API Integration

### Backend Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/wallets/:address/balance` - Fetch balance
- `POST /api/wallets` - Save wallet to backend
- `POST /api/ai/advise` - AI chatbot responses
- `POST /api/remittances` - Create remittance
- `GET /api/remittances` - Fetch remittance history

### API Client
**File**: `src/lib/api.js`

**Features:**
- Centralized API calls
- JWT token attachment
- Error handling
- Request/response interceptors

## Future Improvements

### Short-term
1. **WalletConnect Integration**: Replace manual address entry
2. **Biometric Auth**: Face ID / Touch ID for security
3. **Push Notifications**: Transaction alerts
4. **Offline Mode**: Cache data for offline viewing
5. **Loading States**: Better loading indicators

### Medium-term
1. **Transaction Signing**: Enable actual sends from app
2. **Multi-language Support**: Tagalog, English, etc.
3. **Dark Mode**: Theme toggle
4. **Advanced Charts**: Balance history graphs
5. **Recurring Payments**: Schedule automatic sends

### Long-term
1. **DeFi Integration**: Yield farming, staking
2. **NFT Support**: View and send NFTs
3. **Multi-chain**: Support other blockchains
4. **Merchant Dashboard**: Business features
5. **Bill Payments**: Utility bill integrations

## Development Notes

### Environment Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Testing
- Manual testing on iOS and Android simulators
- Physical device testing recommended
- Test on different screen sizes

### Debugging
- React Native Debugger
- Expo DevTools
- Console logging
- Network inspection

### Build Process
```bash
# Development build
expo start

# Production build
eas build --platform ios
eas build --platform android
```

## Known Issues

1. **Camera Permission**: May require app restart on first denial
2. **QR Scanner**: Performance varies by device
3. **WebSocket**: Occasional disconnections on poor network
4. **AsyncStorage**: Limited to 6MB on iOS

## Conclusion

PayTaka's frontend provides a clean, modern interface for blockchain-based remittances. The glassmorphic design creates a premium feel while maintaining usability. The modular architecture makes it easy to add new features and maintain existing code.

The wallet input flow is straightforward, and the persistent storage ensures users don't need to re-enter their address on every launch. Real-time balance updates and transaction history provide transparency, while the AI chatbot adds a helpful, human touch to the experience.
