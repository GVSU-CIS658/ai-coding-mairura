const KEY = import.meta.env.VITE_FINNHUB_KEY || "";
const BASE = "https://finnhub.io/api/v1";

async function get(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("token", KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

/* ── Endpoints ──────────────────────────────────── */
export const getQuote = (sym) => get("/quote", { symbol: sym.toUpperCase() });
export const getProfile = (sym) =>
  get("/stock/profile2", { symbol: sym.toUpperCase() });
export const searchStocks = async (q) => {
  const d = await get("/search", { q });
  return (d.result || [])
    .filter((r) => r.type === "Common Stock" && !r.displaySymbol.includes("."))
    .slice(0, 8);
};
export const getCandles = (sym, days = 30) => {
  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 86400;
  return get("/stock/candle", {
    symbol: sym.toUpperCase(),
    resolution: "D",
    from,
    to,
  });
};
export const getNews = (sym) => {
  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - 7 * 86400 * 1000)
    .toISOString()
    .split("T")[0];
  return get("/company-news", { symbol: sym.toUpperCase(), from, to });
};

export async function getMultipleQuotes(symbols) {
  const results = await Promise.allSettled(
    symbols.map((s) => getQuote(s).then((q) => ({ symbol: s, ...q }))),
  );
  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
}

/* ── Formatters ─── */
export const fPrice = (v) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(v);

export const fChange = (v) =>
  v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
export const fPct = (v) =>
  v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
export const fMktCap = (v) => {
  if (!v) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  return `$${v.toLocaleString()}`;
};
export const dir = (v) => (v > 0 ? "up" : v < 0 ? "down" : "neutral");

/* ── Defaults ── */
export const HOT_SYMBOLS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "NVDA",
  "META",
  "NFLX",
  "AMD",
  "V",
  "JPM",
  "DIS",
];

/* ── Market News ── */
export const getMarketNews = (category = "general") =>
  get("/news", { category });

export const getSymbolNewsSentiment = async (sym) => {
  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - 14 * 86400 * 1000)
    .toISOString()
    .split("T")[0];
  return get("/company-news", { symbol: sym.toUpperCase(), from, to });
};

/* ── Time formatter for news ────────────────────── */
export const fNewsDate = (ts) => {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const MARKET_HOLIDAYS = new Set([
  "2025-01-01",
  "2025-01-20",
  "2025-02-17",
  "2025-04-18",
  "2025-05-26",
  "2025-06-19",
  "2025-07-04",
  "2025-09-01",
  "2025-11-27",
  "2025-12-25",
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-04-03",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-11-26",
  "2026-12-25",
]);

function getETSnapshot() {
  const now = new Date();
  // Convert to ET
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const date = now.toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
  const day = et.getDay();
  const mins = et.getHours() * 60 + et.getMinutes();
  return { et, date, day, mins };
}

export function getMarketStatus() {
  const { day, mins, date } = getETSnapshot();
  const isWeekday = day >= 1 && day <= 5;
  const isHoliday = MARKET_HOLIDAYS.has(date);

  if (!isWeekday || isHoliday)
    return {
      label: "Closed",
      sub: "Opens weekdays 9:30 AM ET",
      color: "closed",
    };
  if (mins >= 570 && mins < 960)
    return { label: "Open", sub: "9:30 AM – 4:00 PM ET", color: "open" };
  if (mins >= 240 && mins < 570)
    return { label: "Pre‑Market", sub: "Opens at 9:30 AM ET", color: "pre" };
  if (mins >= 960 && mins < 1200)
    return {
      label: "After‑Hours",
      sub: "Closed at 4:00 PM ET",
      color: "after",
    };
  return { label: "Closed", sub: "Opens weekdays 9:30 AM ET", color: "closed" };
}

export function getETClock() {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}

export function getNextOpen() {
  const { day, mins, date } = getETSnapshot();
  const isWeekday = day >= 1 && day <= 5;
  const isHoliday = MARKET_HOLIDAYS.has(date);

  if (isWeekday && !isHoliday && mins < 570) {
    const rem = 570 - mins;
    return `Opens in ${Math.floor(rem / 60)}h ${rem % 60}m`;
  }

  const daysAhead = day === 5 || day === 6 ? 8 - day : 1;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const nextName = dayNames[(day + daysAhead) % 7];
  return `Opens ${nextName} at 9:30 AM ET`;
}
