<template>
  <div class="page">

    <!-- Header -->
    <div class="ph afu">
      <div>
        <h1 class="page-title">Watchlist</h1>
        <p class="page-sub">{{ wl.symbols.length }} stocks · Click any card to explore</p>
      </div>
      <button class="btn btn-outline btn-sm" @click="refresh" :disabled="loading">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          :class="{ spin: loading }">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Add stock -->
    <div class="add-wrap afu" style="animation-delay:.08s">
      <div class="add-label">Add to Watchlist</div>
      <StockSearch @select="onAdd" placeholder="Search and add a stock…" />
    </div>

    <!-- Empty -->
    <div v-if="!wl.symbols.length" class="empty afi">
      <div class="empty-ico">📋</div>
      <h3>Your Watchlist is Empty</h3>
      <p>Search above to start tracking stocks in real time.</p>
    </div>

    <!-- Cards grid -->
    <div class="grid sg" v-else>
      <StockCard v-for="item in wl.items" :key="item.symbol" :symbol="item.symbol" :quote="item.quote"
        :profile="item.profile">
        <template #actions>
          <div class="btns">
            <button class="btn btn-icon btn-ghost" title="Add to Portfolio" @click.stop="openModal(item)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </button>
            <button class="btn btn-icon btn-ghost" title="Remove" @click.stop="remove(item.symbol)"
              style="color:var(--red)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        </template>
      </StockCard>
    </div>

    <!-- Table view -->
    <div class="table-wrap" v-if="wl.symbols.length && hasData">
      <div class="tbl-title">Table View</div>
      <div class="tbl">
        <div class="tbl-head">
          <span>Symbol</span><span>Price</span><span>Change</span><span>%
            Change</span><span>High</span><span>Low</span><span>Prev Close</span><span />
        </div>
        <div class="tbl-row" v-for="item in wl.items" :key="'r' + item.symbol"
          @click="$router.push(`/stock/${item.symbol}`)">
          <span class="mono gold fw">{{ item.symbol }}</span>
          <span class="mono">${{ item.quote?.c?.toFixed(2) ?? '—' }}</span>
          <span class="mono" :class="item.quote?.d >= 0 ? 'up' : 'down'">{{ item.quote?.d != null ?
            (item.quote.d >= 0 ? '+' : '') + item.quote.d.toFixed(2) : '—' }}</span>
          <span>
            <span class="badge" v-if="item.quote" :class="item.quote.dp >= 0 ? 'badge-up' : 'badge-down'">
              {{ item.quote.dp >= 0 ? '+' : '' }}{{ item.quote.dp?.toFixed(2) }}%
            </span>
          </span>
          <span class="mono up">${{ item.quote?.h?.toFixed(2) ?? '—' }}</span>
          <span class="mono down">${{ item.quote?.l?.toFixed(2) ?? '—' }}</span>
          <span class="mono">${{ item.quote?.pc?.toFixed(2) ?? '—' }}</span>
          <span class="tbl-acts" @click.stop>
            <button class="btn btn-icon btn-ghost btn-sm" @click.stop="remove(item.symbol)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Portfolio modal -->
    <AddToPortfolioModal :show="modal.show" :symbol="modal.sym" :price="modal.price" @close="modal.show = false"
      @add="onAddPortfolio" />

    <!-- Toast -->
    <transition name="t">
      <div v-if="toast" class="toast" :class="toastType">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import StockCard from '@/components/StockCard.vue'
import StockSearch from '@/components/StockSearch.vue'
import AddToPortfolioModal from '@/components/AddToPortfolioModal.vue'
import { useWatchlistStore } from '@/stores/watchlist.js'
import { usePortfolioStore } from '@/stores/portfolio.js'
import { getMultipleQuotes, getProfile, getQuote } from '@/services/stockApi.js'

const wl = useWatchlistStore()
const pf = usePortfolioStore()

const loading = ref(false)
const toast = ref('')
const toastType = ref('ok')
const modal = reactive({ show: false, sym: '', price: null })

const hasData = computed(() => wl.items.some(i => i.quote))

async function refresh() {
  if (!wl.symbols.length) return
  loading.value = true
  try {
    const qs = await getMultipleQuotes(wl.symbols)
    qs.forEach(q => wl.setQuote(q.symbol, q))
    wl.symbols.forEach(async sym => {
      if (!wl.profiles[sym]) {
        try { wl.setProfile(sym, await getProfile(sym)) } catch { }
      }
    })
  } finally { loading.value = false }
}

async function onAdd(result) {
  const sym = result.displaySymbol
  if (wl.has(sym)) { showToast(`${sym} already in watchlist`, 'info'); return }
  wl.add(sym)
  showToast(`${sym} added ✓`)
  try { const q = await getQuote(sym); wl.setQuote(sym, { symbol: sym, ...q }) } catch { }
}

function remove(sym) { wl.remove(sym); showToast(`${sym} removed`, 'info') }

function openModal(item) {
  modal.sym = item.symbol
  modal.price = item.quote?.c ?? null
  modal.show = true
}

function onAddPortfolio(h) { pf.add(h); showToast(`${h.symbol} added to portfolio ✓`) }

let tt
function showToast(msg, type = 'ok') {
  toast.value = msg; toastType.value = type; clearTimeout(tt)
  tt = setTimeout(() => toast.value = '', 2400)
}

onMounted(refresh)
</script>

<style scoped>
.ph {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.add-wrap {
  max-width: 540px;
  margin-bottom: 28px;
}

.add-label {
  font-size: 11px;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 7px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
  gap: 14px;
  margin-bottom: 36px;
}

.btns {
  display: flex;
  gap: 2px;
}

/* Table */
.table-wrap {
  margin-top: 8px;
  margin-bottom: 40px;
}

.tbl-title {
  font-size: 12px;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 10px;
}

.tbl {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--rl);
  overflow: hidden;
}

.tbl-head,
.tbl-row {
  display: grid;
  grid-template-columns: 90px 100px 100px 110px 90px 90px 110px 50px;
  align-items: center;
  padding: 10px 18px;
  gap: 8px;
}

.tbl-head {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .4px;
  color: var(--t3);
  border-bottom: 1px solid var(--border);
}

.tbl-row {
  font-size: 13px;
  color: var(--t2);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background .12s;
}

.tbl-row:last-child {
  border-bottom: none;
}

.tbl-row:hover {
  background: var(--card-h);
}

.tbl-acts {
  display: flex;
  justify-content: flex-end;
}

.fw {
  font-weight: 600;
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

@media(max-width:900px) {
  .tbl {
    display: none;
  }
}
</style>
