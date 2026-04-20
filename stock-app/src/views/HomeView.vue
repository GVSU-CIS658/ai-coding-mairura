<template>
  <div class="page">

    <!-- Hero -->
    <div class="hero afu">
      <div>
        <h1 class="page-title">Good {{ tod }},<br /><span class="gold">Trader.</span></h1>
        <p class="page-sub">{{ dateStr }} &nbsp;·&nbsp; Live market data</p>
      </div>

      <!-- Market status card -->
      <div class="mkt-card">
        <div class="mkt-main">
          <div class="dot" :class="`dot-${mktStatus.color}`" />
          <span class="mkt-label">{{ mktStatus.label }}</span>
        </div>
        <div class="mkt-detail mono">{{ mktStatus.detail }}</div>
        <div class="mkt-et mono">🕐 {{ etTime }}</div>
        <div class="mkt-next" v-if="mktStatus.color === 'closed' || mktStatus.color === 'after'">
          {{ nextOpen }}
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="search-wrap afu" style="animation-delay:.1s">
      <StockSearch placeholder="Search any stock to explore…" @select="onSearch" />
    </div>

    <!-- Summary pills -->
    <div class="pills sg" v-if="Object.keys(quotes).length">
      <div class="pill" v-for="p in pills" :key="p.l">
        <div class="pill-l">{{ p.l }}</div>
        <div class="pill-v mono" :class="p.c">{{ p.v }}</div>
      </div>
    </div>

    <!-- Section -->
    <div class="sec-head">
      <h2 class="sec-title">Hot Stocks</h2>
      <router-link to="/watchlist" class="sec-link">Open Watchlist →</router-link>
    </div>

    <div class="grid sg" v-if="!loading">
      <StockCard v-for="sym in SYMS" :key="sym" :symbol="sym" :quote="quotes[sym]" :profile="profiles[sym]">
        <template #actions>
          <button class="btn btn-icon btn-ghost" @click.stop="toggleWatch(sym)"
            :title="wl.has(sym) ? 'Remove' : 'Add to watchlist'">
            <svg v-if="wl.has(sym)" width="15" height="15" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)"
              stroke-width="1.5">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </template>
      </StockCard>
    </div>

    <!-- Loading skeleton -->
    <div class="grid" v-else>
      <div class="card-skel" v-for="i in 12" :key="i" />
    </div>

    <!-- Refresh -->
    <div class="refresh-row">
      <button class="btn btn-outline btn-sm" @click="load" :disabled="loading">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          :class="{ spin: loading }">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        {{ loading ? 'Loading…' : 'Refresh Prices' }}
      </button>
      <span class="upd-time" v-if="updTime">Updated {{ updTime }}</span>
    </div>

    <!-- Toast -->
    <transition name="t">
      <div v-if="toast" class="toast" :class="toastType">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import StockCard from '@/components/StockCard.vue'
import StockSearch from '@/components/StockSearch.vue'
import { useWatchlistStore } from '@/stores/watchlist.js'
import { getMultipleQuotes, getProfile, HOT_SYMBOLS, fPct, getMarketStatus, getETClock, getNextOpen } from '@/services/stockApi.js'

const router = useRouter()
const wl = useWatchlistStore()
const SYMS = HOT_SYMBOLS
const quotes = ref({})
const profiles = ref({})
const loading = ref(true)
const updTime = ref('')
const toast = ref('')
const toastType = ref('ok')

// Live clock — updates every 30s so ET time & status stay fresh
const now = ref(new Date())
let clockTimer = null

const etTime = computed(() => getETClock())
const mktStatus = computed(() => { void now.value; return getMarketStatus() })
const nextOpen = computed(() => { void now.value; return getNextOpen() })

const tod = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
})
const dateStr = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

const pills = computed(() => {
  const qs = Object.values(quotes.value).filter(q => q?.c)
  if (!qs.length) return []
  const gainers = qs.filter(q => q.dp > 0).length
  const losers = qs.filter(q => q.dp < 0).length
  const avg = qs.reduce((s, q) => s + (q.dp || 0), 0) / qs.length
  const best = SYMS.reduce((b, s) => { const q = quotes.value[s]; return (!b || ((q?.dp ?? -999) > (quotes.value[b]?.dp ?? -999))) ? s : b }, null)
  return [
    { l: 'Gainers', v: gainers, c: 'up' },
    { l: 'Losers', v: losers, c: 'down' },
    { l: 'Avg Chg', v: fPct(avg), c: avg >= 0 ? 'up' : 'down' },
    { l: 'Leader', v: best || '—', c: 'gold' }
  ]
})

async function load() {
  loading.value = true
  try {
    const qs = await getMultipleQuotes(SYMS)
    qs.forEach(q => { quotes.value[q.symbol] = q })
    updTime.value = new Date().toLocaleTimeString()
    SYMS.forEach(async sym => {
      if (!profiles.value[sym]) {
        try { profiles.value[sym] = await getProfile(sym) } catch { }
      }
    })
  } catch (e) { showToast('Failed to fetch prices', 'err') }
  finally { loading.value = false }
}

function toggleWatch(sym) {
  if (wl.has(sym)) { wl.remove(sym); showToast(`${sym} removed`, 'info') }
  else { wl.add(sym); showToast(`${sym} added to watchlist ✓`) }
}

function onSearch(r) { router.push(`/stock/${r.displaySymbol}`) }

let toastTimer
function showToast(msg, type = 'ok') {
  toast.value = msg; toastType.value = type
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.value = '', 2400)
}

onMounted(() => {
  load()
  clockTimer = setInterval(() => { now.value = new Date() }, 30_000)
})
onUnmounted(() => clearInterval(clockTimer))
</script>

<style scoped>
/* Hero */
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 14px;
}

/* Market status card */
.mkt-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 18px;
  align-self: flex-start;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 210px;
}

.mkt-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mkt-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--t1);
}

.mkt-detail {
  font-size: 11px;
  color: var(--t3);
}

.mkt-et {
  font-size: 12px;
  color: var(--t2);
}

.mkt-next {
  font-size: 11px;
  color: var(--gold);
  font-weight: 500;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-open {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
  animation: pulse 2s infinite;
}

.dot-pre {
  background: #f0b429;
  box-shadow: 0 0 8px #f0b429;
  animation: pulse 2s infinite;
}

.dot-after {
  background: var(--blue);
  box-shadow: 0 0 8px var(--blue);
  animation: pulse 2s infinite;
}

.dot-closed {
  background: var(--t3);
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1
  }

  50% {
    transform: scale(1.35);
    opacity: .65
  }
}

.search-wrap {
  max-width: 580px;
  margin-bottom: 28px;
}

/* Pills */
.pills {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.pill {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--r);
  padding: 12px 18px;
  min-width: 100px;
  flex: 1;
}

.pill-l {
  font-size: 10px;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 3px;
}

.pill-v {
  font-size: 17px;
  font-weight: 600;
}

/* Section */
.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sec-title {
  font-size: 20px;
}

.sec-link {
  color: var(--gold);
  text-decoration: none;
  font-size: 13px;
}

.sec-link:hover {
  opacity: .7;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.card-skel {
  height: 175px;
  border-radius: var(--rl);
  background: linear-gradient(90deg, var(--card) 25%, var(--card-h) 50%, var(--card) 75%);
  background-size: 200% 100%;
  animation: sh 1.5s infinite;
}

@keyframes sh {
  0% {
    background-position: -200% 0
  }

  100% {
    background-position: 200% 0
  }
}

/* Refresh */
.refresh-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 40px;
}

.upd-time {
  font-size: 11px;
  color: var(--t3);
  font-family: var(--mono);
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

.toast.err {
  background: var(--red);
  color: #fff;
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

.spin {
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}
</style>