# Morph Payments Hackathon Starter

A fast monorepo starter for a stablecoin remittance and merchant QR payments app on Morph. It includes an Expo React Native app, a Fastify API, Prisma/PostgreSQL, Redis, Morph chain helpers, QR payment parsing, and an AI companion endpoint.

## Stack

- Frontend: Expo SDK 55, React Native, TypeScript, React Navigation, Axios, viem, expo-camera, Reanimated, Gesture Handler
- Backend: Node.js, TypeScript, Fastify, Prisma, PostgreSQL, Redis, viem, OpenAI
- Chain default: Morph Hoodi Testnet, chain ID `2910`, RPC `https://rpc-hoodi.morph.network`

## Folder Structure

```txt
.
├── backend
│   ├── prisma
│   │   └── schema.prisma
│   ├── src
│   │   ├── config
│   │   │   ├── env.ts
│   │   │   └── morph.ts
│   │   ├── lib
│   │   │   ├── prisma.ts
│   │   │   └── redis.ts
│   │   ├── routes
│   │   │   ├── ai.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── budget.routes.ts
│   │   │   ├── health.routes.ts
│   │   │   ├── qr.routes.ts
│   │   │   ├── remittance.routes.ts
│   │   │   └── wallet.routes.ts
│   │   ├── services
│   │   │   ├── aiCompanion.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── blockchain.service.ts
│   │   │   ├── budget.service.ts
│   │   │   ├── qrPayment.service.ts
│   │   │   └── remittance.service.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   ├── utils
│   │   │   └── errors.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend
│   ├── src
│   │   ├── components
│   │   │   ├── AppButton.tsx
│   │   │   ├── BalanceCard.tsx
│   │   │   └── MascotPlaceholder.tsx
│   │   ├── contexts
│   │   │   ├── RealtimeContext.tsx
│   │   │   └── WalletContext.tsx
│   │   ├── lib
│   │   │   ├── api.ts
│   │   │   └── morph.ts
│   │   ├── navigation
│   │   │   └── AppNavigator.tsx
│   │   ├── screens
│   │   │   ├── AICompanionScreen.tsx
│   │   │   ├── BudgetOverviewScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── QRScannerScreen.tsx
│   │   │   ├── RecipientWalletScreen.tsx
│   │   │   ├── SenderDashboardScreen.tsx
│   │   │   └── TransactionHistoryScreen.tsx
│   │   └── theme
│   │       ├── colors.ts
│   │       └── theme.ts
│   ├── App.tsx
│   ├── app.json
│   ├── babel.config.js
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── package.json
└── README.md
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start Postgres and Redis:

```bash
docker compose up -d
```

3. Configure backend:

```bash
cp backend/.env.example backend/.env
npm run db:generate
npm run db:migrate
npm run dev:backend
```

4. Configure frontend:

```bash
cd frontend
cp .env.example .env
npm run start
```

## Notes For The Hackathon

- Put a test USDC or mock USDC contract in `MORPH_USDC_ADDRESS`.
- If you need actual production USDC on Morph, confirm token addresses before demo day.
- The AI companion route is ready for contextual transaction prompts and will fall back to a deterministic response if `OPENAI_API_KEY` is missing.
- QR parsing supports JSON payloads immediately and leaves a clean place to add QRPh, InstaPay, and GCash vendor-specific parsing.

Morph network defaults are based on the official Morph docs: https://docs.morph.network/docs/build-on-morph/build-on-morph/integration-one-page/
