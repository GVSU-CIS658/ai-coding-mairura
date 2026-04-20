<template>
  <div class="page">

    <!-- Back -->
    <button class="btn btn-ghost btn-sm back afu" @click="$router.back()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back
    </button>

    <!-- Loading state -->
    <div v-if="loading && !quote" class="loading-state">
      <div class="spinner-lg" />
      <p>Loading {{ symbol }}…</p>
    </div>

    <template v-else>
      <!-- Hero header -->
      <div class="hero afu" style="animation-delay:.05s">
        <div class="hero-left">
          <div class="av" :style="{ background: avBg }">{{ symbol[0] }}</div>
          <div>
            <div class="sym-name">
              <span class="mono" style="font-size:26px;font-weight:700;color:var(--t1)">{{ symbol }}</span>
              <span class="exch mono" v-if="profile?.exchange">{{ profile.exchange }}</span>
              <span class="industry" v-if="profile?.finnhubIndustry">{{ profile.finnhubIndustry }}</span>
            </div>
            <div class="company-name" v-if="profile?.name">{{ profile.name }}</div>
            <div class="company-name skel-line" v-else />
          </div>
        </div>

        <div class="hero-right">
          <div class="big-price mono" :class="priceFlash">
            {{ quote ? '$' + quote.c?.toFixed(2) : '—' }}
          </div>
          <div class="price-meta" v-if="quote">
            <span class="badge" :class="quote.dp >= 0 ? 'badge-up' : 'badge-down'">
              <svg v-if="quote.dp >= 0" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="3">
                <path d="m18 15-6-6-6 6" />
              </svg>
              <svg v-else width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="m6 9 6 6 6-6" />
              </svg>
              {{ fPct(quote.dp) }}
            </span>
            <span class="mono" :class="quote.d >= 0 ? 'up' : 'down'" style="font-size:14px">
              {{ quote.d >= 0 ? '+' : '' }}{{ quote.d?.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action bar -->
      <div class="action-bar afu" style="animation-delay:.1s">
        <button class="btn" :class="wl.has(symbol) ? 'btn-outline' : 'btn-gold'" @click="toggleWatch">
          <svg v-if="wl.has(symbol)" width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)"
            stroke-width="1.5">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {{ wl.has(symbol) ? 'Watching' : 'Add to Watchlist' }}
        </button>
        <button class="btn btn-outline" @click="pfModal = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          Add to Portfolio
        </button>
        <a v-if="profile?.weburl" :href="profile.weburl" target="_blank" class="btn btn-ghost btn-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Website ↗
        </a>
      </div>

      <!-- Main grid -->
      <div class="main-grid">

        <!-- Left column -->
        <div class="left-col">

          <!-- Chart -->
          <div class="card chart-card afu" style="animation-delay:.15s">
            <div class="card-head">
              <div class="card-title">Price History</div>
              <div class="range-tabs">
                <button v-for="r in ranges" :key="r.label" class="range-tab" :class="{ active: range === r }"
                  @click="setRange(r)">{{ r.label }}</button>
              </div>
            </div>

            <div class="chart-wrap" v-if="candles.length">
              <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line v-for="i in 4" :key="'gy' + i" :x1="PAD" :y1="(H - PAD) * (i / 4)" :x2="W - PAD / 2"
                  :y2="(H - PAD) * (i / 4)" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

                <!-- Gradient fill -->
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="chartColor" stop-opacity="0.3" />
                    <stop offset="100%" :stop-color="chartColor" stop-opacity="0.0" />
                  </linearGradient>
                </defs>
                <path :d="areaPath" fill="url(#chartGrad)" />
                <path :d="linePath" fill="none" :stroke="chartColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Hover dot -->
                <circle v-if="hover" :cx="hover.x" :cy="hover.y" r="5" :fill="chartColor" stroke="#07070d"
                  stroke-width="2" />
              </svg>

              <!-- Hover overlay -->
              <div class="chart-hover-layer" @mousemove="onChartHover" @mouseleave="hover = null">
                <div class="hover-tip" v-if="hover" :style="{ left: Math.min(hover.x, W - 120) + 'px' }">
                  <div class="ht-date mono">{{ hover.date }}</div>
                  <div class="ht-price mono">${{ hover.price }}</div>
                </div>
              </div>

              <!-- X labels -->
              <div class="x-labels">
                <span v-for="l in xLabels" :key="l" class="x-lab mono">{{ l }}</span>
              </div>
            </div>

            <div class="chart-loading" v-else>
              <div class="spinner-sm" />
            </div>
          </div>

          <!-- Stats grid -->
          <div class="stats-grid afu" style="animation-delay:.2s" v-if="quote">
            <div class="stat-item" v-for="s in statItems" :key="s.l">
              <div class="si-l">{{ s.l }}</div>
              <div class="si-v mono" :class="s.c">{{ s.v }}</div>
            </div>
          </div>

        </div>

        <!-- Right column -->
        <div class="right-col">

          <!-- Company info -->
          <div class="card afu" style="animation-delay:.2s" v-if="profile?.name">
            <div class="card-title">About</div>
            <div class="about-grid">
              <div class="ag-item" v-for="a in aboutItems" :key="a.l">
                <div class="ag-l">{{ a.l }}</div>
                <div class="ag-v">{{ a.v }}</div>
              </div>
            </div>
          </div>

          <!-- News -->
          <div class="card news-card afu" style="animation-delay:.25s">
            <div class="card-title">Recent News</div>
            <div class="news-loading" v-if="newsLoading">
              <div class="spinner-sm" />
            </div>
            <div v-else-if="!news.length" class="no-news">No recent news available.</div>
            <div class="news-list" v-else>
              <a v-for="n in news.slice(0, 5)" :key="n.id" :href="n.url" target="_blank" class="news-item">
                <div class="ni-src mono">{{ n.source }}</div>
                <div class="ni-head">{{ n.headline }}</div>
                <div class="ni-date mono">{{ fDate(n.datetime) }}</div>
              </a>
            </div>
          </div>

        </div>
      </div>
    </template>

    <!-- Portfolio modal -->
    <AddToPortfolioModal :show="pfModal" :symbol="symbol" :price="quote?.c ?? null" @close="pfModal = false"
      @add="onAddPortfolio" />

    <!-- Toast -->
    <transition name="t">
      <div v-if="toast" class="toast" :class="toastType">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWatchlistStore } from '@/stores/watchlist.js'
import { usePortfolioStore } from '@/stores/portfolio.js'
import AddToPortfolioModal from '@/components/AddToPortfolioModal.vue'
import { getQuote, getProfile, getCandles, getNews, fPct, fMktCap, dir } from '@/services/stockApi.js'

const route = useRoute()
const wl = useWatchlistStore()
const pf = usePortfolioStore()

const symbol = computed(() => route.params.symbol?.toUpperCase())
const quote = ref(null)
const profile = ref(null)
const news = ref([])
const candles = ref([])
const loading = ref(true)
const newsLoading = ref(true)
const pfModal = ref(false)
const toast = ref('')
const toastType = ref('ok')
const hover = ref(null)
const priceFlash = ref('')

/* Chart dims */
const W = 700, H = 200, PAD = 24

const ranges = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 }
]
const range = ref(ranges[1])

/* Colors */
const COLORS = ['#f0b42922', '#4fc3f722', '#a78bfa22', '#34d39922', '#f9731622', '#ec489922']
const avBg = computed(() => COLORS[(symbol.value?.charCodeAt(0) || 0) % COLORS.length])
const chartColor = computed(() => {
  if (!candles.value.length) return 'var(--gold)'
  const first = candles.value[0]?.c
  const last = candles.value[candles.value.length - 1]?.c
  return last >= first ? 'var(--green)' : 'var(--red)'
})

/* Chart paths */
const cPoints = computed(() => {
  if (!candles.value.length) return []
  const prices = candles.value.map(c => c.c)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range_ = max - min || 1
  return candles.value.map((c, i) => ({
    x: PAD + ((W - PAD * 1.5) / (candles.value.length - 1 || 1)) * i,
    y: PAD + (H - PAD * 1.5) - ((c.c - min) / range_) * (H - PAD * 1.5),
    c: c.c,
    t: c.t
  }))
})

const linePath = computed(() => {
  if (!cPoints.value.length) return ''
  return cPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
})

const areaPath = computed(() => {
  if (!cPoints.value.length) return ''
  const pts = cPoints.value
  const bottom = H - PAD / 2
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    + ` L${pts[pts.length - 1].x.toFixed(1)},${bottom} L${pts[0].x.toFixed(1)},${bottom} Z`
})

const xLabels = computed(() => {
  if (!candles.value.length) return []
  const step = Math.floor(candles.value.length / 4)
  return [0, 1, 2, 3].map(i => {
    const c = candles.value[i * step]
    return c ? new Date(c.t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
  })
})

/* Hover */
function onChartHover(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  if (!cPoints.value.length) return
  let closest = cPoints.value.reduce((a, b) => Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)
  hover.value = {
    x: closest.x, y: closest.y,
    price: closest.c.toFixed(2),
    date: new Date(closest.t * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

/* Stats */
const statItems = computed(() => quote.value ? [
  { l: 'Open', v: '$' + quote.value.o?.toFixed(2), c: '' },
  { l: 'Day High', v: '$' + quote.value.h?.toFixed(2), c: 'up' },
  { l: 'Day Low', v: '$' + quote.value.l?.toFixed(2), c: 'down' },
  { l: 'Prev Close', v: '$' + quote.value.pc?.toFixed(2), c: '' },
  { l: 'Change', v: (quote.value.d >= 0 ? '+' : '') + quote.value.d?.toFixed(2), c: dir(quote.value.d) },
  { l: '% Change', v: fPct(quote.value.dp), c: dir(quote.value.dp) },
] : [])

/* About */
const aboutItems = computed(() => profile.value ? [
  { l: 'Exchange', v: profile.value.exchange || '—' },
  { l: 'Industry', v: profile.value.finnhubIndustry || '—' },
  { l: 'Country', v: profile.value.country || '—' },
  { l: 'Currency', v: profile.value.currency || '—' },
  { l: 'Market Cap', v: fMktCap(profile.value.marketCapitalization * 1e6) },
  { l: 'Shares Out', v: profile.value.shareOutstanding ? (profile.value.shareOutstanding / 1e3).toFixed(2) + 'B' : '—' },
  { l: 'IPO Date', v: profile.value.ipo || '—' },
].filter(a => a.v !== '—') : [])

const fDate = (ts) => ts ? new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

/* Load */
async function load() {
  loading.value = true
  try {
    const [q, p] = await Promise.all([getQuote(symbol.value), getProfile(symbol.value)])
    quote.value = q; profile.value = p
    wl.setQuote(symbol.value, { symbol: symbol.value, ...q })
    wl.setProfile(symbol.value, p)
  } catch (e) { console.error(e) }
  finally { loading.value = false }

  await loadCandles()

  newsLoading.value = true
  try { news.value = (await getNews(symbol.value)).slice(0, 5) } catch { }
  finally { newsLoading.value = false }
}

async function loadCandles() {
  try {
    const d = await getCandles(symbol.value, range.value.days)
    if (d.s === 'ok' && d.c?.length) {
      candles.value = d.t.map((t, i) => ({ t, c: d.c[i], o: d.o[i], h: d.h[i], l: d.l[i] }))
    }
  } catch { }
}

async function setRange(r) { range.value = r; candles.value = []; await loadCandles() }

function toggleWatch() {
  if (wl.has(symbol.value)) { wl.remove(symbol.value); showToast('Removed from watchlist', 'info') }
  else { wl.add(symbol.value); showToast(`${symbol.value} added to watchlist ✓`) }
}

function onAddPortfolio(h) { pf.add(h); showToast(`${h.symbol} added to portfolio ✓`) }

let tt
function showToast(msg, type = 'ok') {
  toast.value = msg; toastType.value = type; clearTimeout(tt)
  tt = setTimeout(() => toast.value = '', 2400)
}

watch(() => route.params.symbol, load)
onMounted(load)
</script>

<style scoped>
.back {
  margin-bottom: 20px;
  color: var(--t3);
}

/* Hero */
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.av {
  width: 52px;
  height: 52px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--gold);
  border: 1px solid var(--border-g);
  flex-shrink: 0;
}

.sym-name {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.exch {
  font-size: 11px;
  background: var(--gold-d);
  color: var(--gold);
  border: 1px solid var(--border-g);
  padding: 2px 8px;
  border-radius: 5px;
}

.industry {
  font-size: 11px;
  color: var(--t3);
  background: rgba(255, 255, 255, .04);
  padding: 2px 8px;
  border-radius: 5px;
}

.company-name {
  font-size: 14px;
  color: var(--t2);
}

.skel-line {
  height: 14px;
  width: 180px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--card) 25%, var(--card-h) 50%, var(--card) 75%);
  background-size: 200% 100%;
  animation: sh 1.5s infinite;
}

.hero-right {
  text-align: right;
}

.big-price {
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -1px;
}

.price-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
}

/* Action bar */
.action-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

/* Main grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--rl);
  padding: 22px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--t3);
  margin-bottom: 14px;
}

/* Chart */
.chart-card {
  padding-bottom: 8px;
}

.chart-wrap {
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 200px;
  display: block;
  overflow: visible;
}

.chart-hover-layer {
  position: absolute;
  inset: 0;
  cursor: crosshair;
}

.hover-tip {
  position: absolute;
  top: -36px;
  background: var(--card-h);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 5px 10px;
  pointer-events: none;
  white-space: nowrap;
}

.ht-date {
  font-size: 10px;
  color: var(--t3);
}

.ht-price {
  font-size: 13px;
  font-weight: 600;
}

.x-labels {
  display: flex;
  justify-content: space-between;
  padding: 4px 24px 0;
}

.x-lab {
  font-size: 10px;
  color: var(--t3);
}

.range-tabs {
  display: flex;
  gap: 2px;
}

.range-tab {
  background: transparent;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--t3);
  cursor: pointer;
  transition: .15s;
  font-family: var(--mono);
}

.range-tab:hover {
  color: var(--t1);
}

.range-tab.active {
  background: var(--gold-d);
  color: var(--gold);
}

.chart-loading {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 14px;
}

.si-l {
  font-size: 10px;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 4px;
}

.si-v {
  font-size: 16px;
  font-weight: 600;
}

/* About */
.about-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ag-item {
  display: flex;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.ag-item:last-child {
  border-bottom: none;
}

.ag-l {
  color: var(--t3);
}

.ag-v {
  color: var(--t1);
  font-weight: 500;
}

/* News */
.news-card {
  padding: 20px;
}

.no-news {
  color: var(--t3);
  font-size: 13px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.news-item {
  display: block;
  text-decoration: none;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  transition: background .12s;
  border-radius: 6px;
}

.news-item:last-child {
  border-bottom: none;
}

.news-item:hover {
  background: rgba(255, 255, 255, .03);
  padding-left: 6px;
}

.ni-src {
  font-size: 10px;
  color: var(--gold);
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: .3px;
}

.ni-head {
  font-size: 13px;
  color: var(--t1);
  line-height: 1.4;
  margin-bottom: 4px;
}

.ni-date {
  font-size: 10px;
  color: var(--t3);
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
  color: var(--t2);
}

.spinner-lg {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.news-loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  padding: 12px 18px;
  border-radius: var(--r);
  font-size: 13px;
  font-weight: 500;
  z-index: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
}

.toast.ok {
  background: var(--green);
  color: #07070d;
}

.toast.info {
  background: var(--card-h);
  color: var(--t1);
  border: 1px solid var(--border);
}

.t-enter-active,
.t-leave-active {
  transition: all .25s
}

.t-enter-from,
.t-leave-to {
  opacity: 0;
  transform: translateY(8px)
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}

@keyframes sh {
  0% {
    background-position: -200% 0
  }

  100% {
    background-position: 200% 0
  }
}

@media(max-width:900px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media(max-width:480px) {
  .big-price {
    font-size: 28px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
