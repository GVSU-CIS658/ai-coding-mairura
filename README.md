# Apex Markets — Stock Watchlist & Portfolio App

A live stock tracking web app built with **Vue 3**, **Vue Router**, **Pinia**, and **Vite**.
Data is powered by the [Finnhub](https://finnhub.io) free API.

## Features

- 📈 Live stock prices via Finnhub API
- 🔍 Stock search with autocomplete
- ⭐ Personal watchlist (persisted to localStorage)
- 💼 Portfolio tracker with cost basis & P&L
- 📊 Interactive SVG price chart (1W / 1M / 3M / 6M / 1Y)
- 📰 Recent company news
- 🔁 Animated scrolling market ticker
- 🌙 Dark luxury UI with smooth animations

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vue 3 (Composition API) | UI framework |
| Vue Router 4 | Client-side routing (hash mode) |
| Pinia | State management |
| Vite | Build tool |
| Finnhub API | Live stock data |

---

## Getting Started

### 1. Get a Free API Key

Sign up at [https://finnhub.io](https://finnhub.io) — free tier gives 60 requests/minute.

### 2. Configure your API Key

```bash
cp .env.example .env
```

Edit `.env` and add your key:

```
VITE_FINNHUB_KEY=your_key_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

App will be at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

---

## Deploy to GitHub Pages

### Automatic (GitHub Actions)

1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Add a secret: `VITE_FINNHUB_KEY` = your Finnhub key
3. Push to `main` — GitHub Actions will build and deploy automatically
4. Go to **Settings → Pages** → set source to `gh-pages` branch

### Manual

```bash
npm run build
# Then push the /dist folder to gh-pages branch
```

---

## Project Structure

```
src/
├── assets/main.css          # Global design system & animations
├── components/
│   ├── NavBar.vue           # Top navigation bar
│   ├── Ticker.vue           # Scrolling market ticker
│   ├── StockCard.vue        # Reusable stock price card
│   ├── StockSearch.vue      # Search autocomplete
│   ├── AddToPortfolioModal  # Modal to log a position
│   └── AddSearchModal.vue   # Search + add in one modal
├── views/
│   ├── HomeView.vue         # Dashboard
│   ├── WatchlistView.vue    # Watchlist manager
│   ├── PortfolioView.vue    # Portfolio P&L tracker
│   └── StockDetailView.vue  # Individual stock page
├── stores/
│   ├── watchlist.js         # Pinia watchlist store
│   └── portfolio.js         # Pinia portfolio store
├── services/
│   └── stockApi.js          # Finnhub API + formatters
└── router/index.js          # Vue Router (hash history)
```

---

## AI Tools Used

- **Claude** (Anthropic) — primary code generation, component design, API integration

## Stock API

- **Finnhub** (`https://finnhub.io/api/v1`)
  - `/quote` — live price data
  - `/stock/profile2` — company info
  - `/search` — ticker search
  - `/stock/candle` — historical OHLCV
  - `/company-news` — recent news

## Known Limitations

- Finnhub free tier: 60 req/min (rate limiting may occur if refreshing rapidly)
- Historical candle data may have gaps on weekends/holidays
- The ticker bar loads on a 60s refresh cycle to stay within rate limits
- CORS is handled by Finnhub natively (no proxy needed)
