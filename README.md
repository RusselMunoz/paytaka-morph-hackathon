# PayTaka

PayTaka is a stablecoin-powered remittance and payments app built on Morph, designed for cross-border transfers for Filipino families.

## Problem Statement

Filipino families working abroad face high fees, slow processing times, and limited transparency when sending money home. Traditional remittance services charge 5-10% in fees and can take days to process, making it expensive and inefficient for overseas workers to support their families.

## Solution

PayTaka leverages Morph blockchain and stablecoins (USDC, USDT) to provide:
- **Instant transfers** with near-zero fees
- **Transparent tracking** of all transactions on-chain
- **Real-time balance updates** in both USD and PHP
- **AI-powered assistance** through "Taka" chatbot for financial guidance
- **QR code payments** for easy merchant transactions

## Core Features

- **Wallet Connection**: User-entered wallet address with validation
- **Multi-Token Support**: Track HodETH, USDC, and USDT balances
- **Remittance Flow**: Send stablecoins to family members with real-time confirmation
- **Transaction History**: View all on-chain transactions with detailed information
- **QR Code Payments**: Scan QR codes to pay merchants or generate codes to receive funds
- **Add Funds**: Multiple options to top up wallet balance
- **AI Assistant "Taka"**: Contextual financial advice and transaction guidance
- **USD/PHP Toggle**: Switch between currencies for better understanding of value
- **Real-time Updates**: Auto-refresh balances every 30 seconds

## Tech Stack

### Frontend
- **React Native** with Expo SDK 55
- **React Navigation** for screen management
- **AsyncStorage** for wallet persistence
- **Axios** for API communication
- **Reanimated & Gesture Handler** for smooth animations

### Backend
- **Node.js** with TypeScript
- **Fastify** web framework
- **Prisma ORM** with PostgreSQL
- **Redis** for caching
- **OpenAI** for AI companion

### Blockchain
- **Morph Hoodi Testnet** (Chain ID: 2910)
- **RPC**: https://rpc-hoodi.morph.network
- **Direct RPC Integration**: eth_call, eth_getBalance, eth_getLogs
- **ERC20 Token Support**: USDC and USDT balance tracking
- **Transaction History**: Fetches Transfer events from latest 3000 blocks

## Folder Structure

```
.
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   └── morph.ts
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   └── redis.ts
│   │   ├── routes/
│   │   │   ├── ai.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── budget.routes.ts
│   │   │   ├── health.routes.ts
│   │   │   ├── qr.routes.ts
│   │   │   ├── remittance.routes.ts
│   │   │   └── wallet.routes.ts
│   │   ├── services/
│   │   │   ├── aiCompanion.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── blockchain.service.ts
│   │   │   ├── budget.service.ts
│   │   │   ├── qrPayment.service.ts
│   │   │   └── remittance.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── errors.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── assets/
│   │   └── [app icons and images]
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthSheet.js
│   │   │   ├── BackgroundGradient.js
│   │   │   ├── BrandMark.js
│   │   │   ├── GlassBox.js
│   │   │   ├── ScreenLoader.js
│   │   │   ├── ScreenTransition.js
│   │   │   ├── SettingsDrawer.js
│   │   │   └── TabIcon.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   ├── RealtimeContext.js
│   │   │   └── WalletContext.js
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   ├── config.js
│   │   │   └── morph.js
│   │   ├── navigation/
│   │   │   └── AppNavigator.js
│   │   ├── screens/
│   │   │   ├── AddFundsScreen.js
│   │   │   ├── ChatbotScreen.js
│   │   │   ├── ContactsScreen.js
│   │   │   ├── HistoryScreen.js
│   │   │   ├── LandingScreen.js
│   │   │   ├── ReceiptScreen.js
│   │   │   ├── RemitScreen.js
│   │   │   ├── ScannerScreen.js
│   │   │   ├── WalletInputScreen.js
│   │   │   └── WalletScreen.js
│   │   └── styles/
│   │       └── [screen-specific styles]
│   ├── App.js
│   ├── app.json
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
├── ARCHITECTURE.md
├── MORPH_BLOCKCHAIN_INTEGRATION.md
├── FRONTEND_OVERVIEW.md
└── README.md
```

## Setup & Run Instructions

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL and Redis)
- Expo CLI (`npm install -g expo-cli`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database Services

```bash
docker compose up -d
```

### 3. Configure Backend

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your values:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET
# - OPENAI_API_KEY (optional)
# - MORPH_RPC_URL
# - MORPH_USDC_ADDRESS
# - MORPH_USDT_ADDRESS

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start backend server
npm run dev:backend
```

Backend will run on http://localhost:4000

### 4. Configure Frontend

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Edit frontend/.env with your values:
# - EXPO_PUBLIC_API_URL=http://localhost:4000/api
# - EXPO_PUBLIC_API_WS_URL=ws://localhost:4000/ws
# - EXPO_PUBLIC_MORPH_RPC_URL=https://rpc-hoodi.morph.network
# - EXPO_PUBLIC_MORPH_CHAIN_ID=2910
# - EXPO_PUBLIC_MORPH_USDC_ADDRESS
# - EXPO_PUBLIC_MORPH_USDT_ADDRESS

# Start Expo development server
npm start
```

### 5. Run on Device/Simulator

- **iOS Simulator**: Press `i` in the Expo terminal
- **Android Emulator**: Press `a` in the Expo terminal
- **Physical Device**: Scan QR code with Expo Go app

## Demo Flow for Judges

1. **Landing Screen**: Tap "I have a wallet" to enter wallet address
2. **Wallet Input**: Enter a valid Morph wallet address (or use demo address)
3. **Main Wallet**: View real-time balances for HodETH, USDC, and USDT
4. **Currency Toggle**: Switch between USD and PHP to see converted values
5. **Transaction History**: View all on-chain transactions with details
6. **Send Remittance**: 
   - Tap "Remit" tab
   - Select recipient from contacts
   - Choose token (USDC or USDT)
   - Enter amount and confirm
7. **QR Payments**: 
   - Tap "QR" tab to scan merchant codes
   - Or generate your own QR code to receive payments
8. **AI Assistant**: 
   - Tap "Taka" tab
   - Ask questions about transactions or get financial advice
9. **Add Funds**: Multiple options to top up wallet balance

## Why Morph?

PayTaka chose Morph blockchain for several key reasons:

1. **Low Transaction Costs**: Near-zero fees make micro-remittances viable
2. **Fast Finality**: Quick transaction confirmation for better UX
3. **EVM Compatibility**: Easy integration with existing Ethereum tools
4. **Growing Ecosystem**: Active development and community support
5. **Testnet Availability**: Hoodi testnet perfect for hackathon development

## Team & Hackathon

Built for the **Morph Hackathon** by developers passionate about solving real-world problems for Filipino families.

**Project Goal**: Demonstrate how blockchain technology can make remittances accessible, affordable, and transparent for everyone.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture and design decisions
- [MORPH_BLOCKCHAIN_INTEGRATION.md](./MORPH_BLOCKCHAIN_INTEGRATION.md) - Blockchain integration details
- [FRONTEND_OVERVIEW.md](./frontend/FRONTEND_OVERVIEW.md) - Frontend structure and screens

## License

MIT
