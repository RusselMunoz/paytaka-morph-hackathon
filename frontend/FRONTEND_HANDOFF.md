# Frontend Backend Handoff

This frontend is ready to drop into the monorepo `frontend/` folder and talk to the existing Fastify backend.

## What is wired

- `src/lib/api.js` centralizes calls to the backend under `EXPO_PUBLIC_API_URL`.
- `src/contexts/AuthContext.js` manages login/register state and attaches the JWT to future API calls.
- `src/contexts/WalletContext.js` validates EVM addresses, can save a wallet to the backend, and can refresh USDC balance.
- `src/contexts/RealtimeContext.js` connects to `EXPO_PUBLIC_API_WS_URL/users/:userId` after login.
- `App.js` wraps the design app with Auth, Wallet, and Realtime providers.
- `src/navigation/AppNavigator.js` keeps the existing design flow while matching the placeholder frontend's structure.

## Backend routes used

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/wallets/:address/balance`
- `POST /api/wallets`
- `POST /api/ai/advise`
- Helpers also exist for `/api/remittances`, `/api/qr/*`, and `/api/budgets`.

## Local env

Create `frontend/.env` from `frontend/.env.example`.

For simulator on the same machine:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_API_WS_URL=ws://localhost:4000/ws
```

For a physical phone, replace `localhost` with the laptop LAN IP.

## Remaining integration work

- Add a real wallet-connect/input UI that calls `connectWithAddress(address, { syncToBackend: true })`.
- Replace static remittance/history/budget data with `remittanceApi`, `budgetApi`, and `qrApi` calls.
- Run backend setup first: Postgres, Redis, backend `.env`, Prisma generate/migrate, then `npm run dev:backend`.

## Verification done

- Expo SDK v54 docs were checked before code changes.
- `npx expo export --platform ios --output-dir /private/tmp/paytaka-export-ios` passed from the standalone frontend workspace.
