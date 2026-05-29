# PayTaka Architecture

## Overview

PayTaka is a React Native mobile application built with Expo that integrates directly with the Morph blockchain for stablecoin remittances. The architecture emphasizes simplicity, real-time data, and seamless blockchain interaction.

## Frontend Architecture

### Technology Stack
- **React Native** with Expo SDK 55
- **React Navigation** for screen management
- **Context API** for state management
- **AsyncStorage** for local persistence
- **Axios** for HTTP requests
- **Direct RPC calls** for blockchain interaction

### Core Design Principles
1. **Context-driven state**: Global state managed through React Context
2. **Direct blockchain access**: No intermediary blockchain libraries, pure RPC calls
3. **Graceful degradation**: Fallback mechanisms for network failures
4. **Real-time updates**: Auto-refresh every 30 seconds
5. **Persistent wallet**: Address stored locally for seamless re-entry

## WalletContext Responsibilities

The `WalletContext` is the heart of the blockchain integration and manages:

### 1. Wallet Management
- **Address validation**: EVM address format checking
- **Persistence**: Stores wallet address in AsyncStorage
- **Connection state**: Tracks whether a wallet is connected

### 2. Balance Fetching
- **Native HodETH**: Uses `eth_getBalance` RPC call
- **USDC Balance**: ERC20 `balanceOf` via `eth_call`
- **USDT Balance**: ERC20 `balanceOf` via `eth_call`
- **Parallel fetching**: All balances fetched simultaneously with `Promise.all`
- **Auto-refresh**: Updates every 30 seconds automatically

### 3. Exchange Rate Integration
- **USD/PHP Rate**: Fetches from exchangerate-api.com
- **Fallback rate**: 56.5 PHP per USD if API fails
- **Real-time conversion**: Calculates PHP equivalents for all balances

### 4. Balance Change Tracking
- **Previous balance storage**: Saves last total balance in AsyncStorage
- **Change calculation**: Compares current vs previous to show gains/losses
- **Percentage display**: Shows percentage change for user insight

### 5. Transaction History
- **Block range**: Fetches Transfer events from latest 3000 blocks
- **Event parsing**: Decodes ERC20 Transfer events from logs
- **Direction detection**: Identifies incoming vs outgoing transactions
- **Timestamp extraction**: Converts block timestamps to readable dates

### 6. Error Handling
- **RPC fallback**: Multiple RPC endpoints tried in sequence
- **Silent failures**: Errors logged but don't crash the app
- **Demo data fallback**: Shows placeholder data if all RPCs fail

## Navigation Flow

```
LandingScreen
    ↓
WalletInputScreen (enter address)
    ↓
Main Tab Navigator
    ├── WalletScreen (home)
    ├── RemitScreen (send money)
    ├── QRScreen (scan/generate QR)
    ├── HistoryScreen (transactions)
    └── ChatbotScreen (AI assistant)
```

### Screen Transitions
- **ScreenTransition component**: Smooth fade animations between screens
- **Tab navigation**: Bottom tab bar with custom icons
- **Modal overlays**: Settings drawer, auth sheets

## Blockchain Integration Flow

### 1. Initial Connection
```
User enters address → Validate format → Save to AsyncStorage → Fetch all data
```

### 2. Balance Fetching Process
```
1. Fetch USD/PHP exchange rate
2. Parallel fetch:
   - eth_getBalance for native ETH
   - eth_call for USDC balanceOf
   - eth_call for USDT balanceOf
3. Calculate total USD value
4. Convert to PHP using exchange rate
5. Compare with previous balance
6. Update context state
```

### 3. Transaction History Strategy
```
1. Get latest block number
2. Calculate fromBlock (latest - 3000)
3. eth_getLogs with Transfer event signature
4. Filter logs for user address (from or to)
5. Parse log data (from, to, amount)
6. Convert amounts from wei to human-readable
7. Sort by block number (newest first)
8. Merge with backend remittance data
```

### 4. RPC Call Structure

**Native Balance:**
```javascript
{
  jsonrpc: "2.0",
  method: "eth_getBalance",
  params: [address, "latest"],
  id: 1
}
```

**Token Balance:**
```javascript
{
  jsonrpc: "2.0",
  method: "eth_call",
  params: [{
    to: tokenAddress,
    data: "0x70a08231" + paddedAddress
  }, "latest"],
  id: 1
}
```

**Transaction Logs:**
```javascript
{
  jsonrpc: "2.0",
  method: "eth_getLogs",
  params: [{
    fromBlock: "0x..." (latest - 3000),
    toBlock: "latest",
    address: [usdcAddress, usdtAddress],
    topics: [transferEventSignature, null, null]
  }],
  id: 1
}
```

## AsyncStorage Wallet Persistence

### Stored Data
- `@paytaka_wallet_address`: User's wallet address
- `@paytaka_last_balance`: Previous total balance for change tracking
- `@paytaka_last_fetch_time`: Timestamp of last successful fetch

### Persistence Flow
```
App Launch → Check AsyncStorage → Auto-connect if address exists → Fetch balances
```

### Benefits
- **Seamless re-entry**: Users don't re-enter address on every launch
- **Offline capability**: Last known balance available offline
- **Change tracking**: Historical comparison for balance changes

## Taka Chatbot Integration

### Backend Integration
- **Endpoint**: `POST /api/ai/advise`
- **Context-aware**: Sends user's balance and recent transactions
- **OpenAI powered**: Uses GPT for intelligent responses
- **Fallback**: Deterministic responses if OpenAI unavailable

### Frontend Implementation
- **ChatbotScreen**: Full-screen chat interface
- **Message history**: Maintains conversation context
- **Real-time typing**: Shows AI "thinking" indicator
- **Transaction context**: Automatically includes relevant financial data

## Why Morph Was Chosen

### Technical Advantages
1. **EVM Compatibility**: Standard Ethereum tooling works out of the box
2. **Low Gas Fees**: Makes micro-remittances economically viable
3. **Fast Finality**: Quick transaction confirmation for better UX
4. **Testnet Availability**: Hoodi testnet perfect for development and demos

### Business Advantages
1. **Growing Ecosystem**: Active community and developer support
2. **Stablecoin Support**: Native USDC/USDT integration
3. **Cross-border Focus**: Aligned with remittance use case
4. **Hackathon Support**: Excellent documentation and resources

### Integration Benefits
1. **Direct RPC Access**: No need for complex Web3 libraries
2. **Standard JSON-RPC**: Simple HTTP requests for all operations
3. **Multiple RPC Endpoints**: Fallback options for reliability
4. **Block Explorer**: Easy transaction verification for users

## Performance Optimizations

### 1. Parallel Data Fetching
- All blockchain calls made simultaneously
- Reduces total wait time from ~3s to ~1s

### 2. Efficient Re-renders
- `useMemo` for computed values
- Context updates only when data changes
- Prevents unnecessary screen re-renders

### 3. Smart Refresh Strategy
- 30-second interval (not too aggressive)
- Only fetches when app is active
- Cancels pending requests on unmount

### 4. Minimal Dependencies
- Direct RPC calls instead of heavy Web3 libraries
- Reduces bundle size and improves load time

## Known Limitations

### 1. Transaction History
- Limited to last 3000 blocks (~6-12 hours on Morph)
- Older transactions not visible in app
- Could be extended with backend indexing

### 2. Wallet Connection
- Manual address entry (no WalletConnect yet)
- No transaction signing capability
- Read-only blockchain interaction

### 3. Token Support
- Only USDC and USDT currently supported
- Hardcoded token addresses
- Could be extended to support any ERC20

### 4. Network Reliability
- Depends on RPC endpoint availability
- Multiple fallbacks help but not foolproof
- Could benefit from backend RPC proxy

## Future Improvements

### Short-term
1. Add WalletConnect for easier wallet connection
2. Implement transaction signing for actual sends
3. Add more token support (DAI, USDC.e, etc.)
4. Backend transaction indexing for full history

### Long-term
1. Multi-chain support (Ethereum, Polygon, etc.)
2. Fiat on/off ramps integration
3. Recurring payment scheduling
4. Bill payment integrations
5. Merchant dashboard for QR payments

## Security Considerations

### Current Implementation
- **Read-only**: No private keys stored or handled
- **Address validation**: Prevents invalid addresses
- **HTTPS only**: All API calls over secure connections
- **No sensitive data**: Balances are public blockchain data

### Production Requirements
1. **Private key management**: Secure enclave storage
2. **Transaction signing**: Local signing, never send keys
3. **Biometric auth**: Face ID / Touch ID for transactions
4. **Rate limiting**: Prevent API abuse
5. **Input sanitization**: Validate all user inputs

## Development Workflow

### Local Development
1. Start backend services (PostgreSQL, Redis)
2. Run backend API server
3. Start Expo development server
4. Test on simulator or physical device

### Testing Strategy
- Manual testing on iOS and Android
- RPC endpoint fallback testing
- Network failure simulation
- Balance calculation verification

### Deployment
- Backend: Docker containers on cloud provider
- Frontend: Expo EAS Build for app stores
- Database: Managed PostgreSQL instance
- Redis: Managed Redis instance

## Conclusion

PayTaka's architecture prioritizes simplicity and directness. By using pure RPC calls instead of heavy Web3 libraries, the app remains lightweight and fast. The Context-based state management keeps the codebase clean and maintainable, while the multiple fallback mechanisms ensure reliability even with network issues.

The choice of Morph blockchain provides the perfect balance of EVM compatibility, low costs, and fast finality needed for a remittance application targeting Filipino families.