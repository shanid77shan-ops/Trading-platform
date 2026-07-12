# TradeHub - Trading Platform

A mobile-first trading platform built with Next.js, matching the STARTRADER-style UI from your reference images.

## Features

- **Home Dashboard** — Account equity, floating PnL, margin level, and market watchlist
- **Category Tabs** — Watchlist, Crypto, Forex, Commodities, Indices, Metals, Share CFDs, ETF
- **Live Prices** — Simulated real-time price updates every 2 seconds
- **Chart View** — Candlestick chart with EMAs, volume, buy/sell panel, lot sizing
- **Trading** — One-tap buy/sell execution with position tracking
- **Admin Dashboard** — Manage symbols, account settings, and platform config
- **Web3 Wallet** — Reown AppKit + Wagmi connection (Mainnet, Polygon)
- **Supabase Auth** — Email/password signup and login with real user profiles in database

## Getting Started

```bash
cd trading-app
npm install
npm run dev
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Authentication

1. Open [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
2. Register with **name**, **email**, and **password**
3. Sign in at [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
4. Your profile and trading account are saved in Supabase

> If email confirmation is enabled in Supabase, confirm your email before signing in, or disable confirmation in Supabase Auth settings for development.

### Wallet Connection

1. Create a project at [Reown Cloud](https://dashboard.reown.com)
2. Add your Project ID to `.env.local`:

```
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Open **Profile** in the app and tap **Connect Wallet**

Open [http://localhost:3000](http://localhost:3000) for the trading app.

Open [http://localhost:3000/admin](http://localhost:3000/admin) for the management dashboard.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — market watchlist |
| `/chart/[symbol]` | Chart & trading (e.g. `/chart/btcusd`) |
| `/trades` | Open positions |
| `/admin` | Platform management |
| `/profile` | User profile + admin link |

## Admin Capabilities

- Add, edit, and delete trading symbols
- Adjust account balance, margin, and equity
- Configure platform name and default lot size
- View trade history and overview stats

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Lightweight Charts (TradingView)
- Lucide React icons
- Reown AppKit + Wagmi + Viem

## Next Steps

To connect real market data, replace the simulated `tickPrices()` in `src/lib/store.ts` with a WebSocket feed from your broker or data provider (e.g. Binance, MetaTrader bridge, or Polygon.io).
