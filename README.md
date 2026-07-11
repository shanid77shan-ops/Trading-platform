# TradeHub - Trading Platform

A mobile-first trading platform built with Next.js, matching the STARTRADER-style UI from your reference images.

## Features

- **Home Dashboard** — Account equity, floating PnL, margin level, and market watchlist
- **Category Tabs** — Watchlist, Crypto, Forex, Commodities, Indices, Metals, Share CFDs, ETF
- **Live Prices** — Simulated real-time price updates every 2 seconds
- **Chart View** — Candlestick chart with EMAs, volume, buy/sell panel, lot sizing
- **Trading** — One-tap buy/sell execution with position tracking
- **Admin Dashboard** — Manage symbols, account settings, and platform config

## Getting Started

```bash
cd trading-app
npm install
npm run dev
```

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

## Next Steps

To connect real market data, replace the simulated `tickPrices()` in `src/lib/store.ts` with a WebSocket feed from your broker or data provider (e.g. Binance, MetaTrader bridge, or Polygon.io).
