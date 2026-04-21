<template>
  <div class="page">

    <!-- Header -->
    <div class="ph afu">
      <div>
        <h1 class="page-title">Portfolio</h1>
        <p class="page-sub">{{ pf.holdings.length }} position{{ pf.holdings.length !== 1 ? 's' : '' }} · Real-time
          P&amp;L
        </p>
      </div>
      <div class="ph-right">
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
        <button class="btn btn-gold btn-sm" @click="addModal = true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Position
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="!pf.holdings.length" class="empty afi">
      <div class="empty-ico">💼</div>
      <h3>No Positions Yet</h3>
      <p>Add your first stock position to start tracking your portfolio performance.</p>
      <button class="btn btn-gold" @click="addModal = true">Add First Position</button>
    </div>

    <template v-else>
      <!-- Summary cards -->
      <div class="summary sg">
        <div class="sum-card">
          <div class="sum-l">Portfolio Value</div>
          <div class="sum-v mono">${{ fmt(pf.totalVal) }}</div>
        </div>
        <div class="sum-card">
          <div class="sum-l">Total Cost</div>
          <div class="sum-v mono">${{ fmt(pf.totalCost) }}</div>
        </div>
        <div class="sum-card" :class="pf.totalGL >= 0 ? 'pos' : 'neg'">
          <div class="sum-l">Total Gain / Loss</div>
          <div class="sum-v mono" :class="pf.totalGL >= 0 ? 'up' : 'down'">
            {{ pf.totalGL >= 0 ? '+' : '' }}${{ fmt(Math.abs(pf.totalGL)) }}
          </div>
          <div class="sum-sub mono" :class="pf.totalGLPct >= 0 ? 'up' : 'down'">
            {{ pf.totalGLPct >= 0 ? '+' : '' }}{{ pf.totalGLPct.toFixed(2) }}%
          </div>
        </div>
        <div class="sum-card">
          <div class="sum-l">Positions</div>
          <div class="sum-v mono">{{ pf.holdings.length }}</div>
          <div class="sum-sub">across {{ pf.symbols.length }} stocks</div>
        </div>
      </div>

      <!-- Allocation chart -->
      <div class="alloc-wrap afu" style="animation-delay:.15s" v-if="allocData.length">
        <div class="section-title">Allocation</div>
        <div class="alloc-bars">
          <div v-for="a in allocData" :key="a.sym" class="alloc-row">
            <div class="alloc-sym mono">{{ a.sym }}</div>
            <div class="alloc-bar-wrap">
              <div class="alloc-bar" :style="{ width: a.pct + '%', background: a.color }" />
            </div>
            <div class="alloc-pct mono">{{ a.pct.toFixed(1) }}%</div>
            <div class="alloc-val mono">${{ fmt(a.val) }}</div>
          </div>
        </div>
      </div>

      <!-- Holdings table -->
      <div class="section-title" style="margin-bottom:12px">Holdings</div>
      <div class="holdings">
        <div class="h-head">
          <span>Symbol</span>
          <span>Shares</span>
          <span>Buy Price</span>
          <span>Current</span>
          <span>Cost Basis</span>
          <span>Mkt Value</span>
          <span>Gain / Loss</span>
          <span>Return</span>
          <span>Date</span>
          <span />
        </div>

        <transition-group name="list" tag="div">
          <div class="h-row" v-for="h in pf.enriched" :key="h.id" @click="$router.push(`/stock/${h.symbol}`)">
            <span>
              <span class="mono gold fw">{{ h.symbol }}</span>
              <span class="note" v-if="h.note">{{ h.note }}</span>
            </span>
            <span class="mono">{{ h.shares }}</span>
            <span class="mono">${{ h.buyPrice.toFixed(2) }}</span>
            <span class="mono" :class="h.cur >= h.buyPrice ? 'up' : 'down'">${{ h.cur.toFixed(2) }}</span>
            <span class="mono">${{ fmt(h.cost) }}</span>
            <span class="mono">${{ fmt(h.val) }}</span>
            <span class="mono" :class="h.gl >= 0 ? 'up' : 'down'">
              {{ h.gl >= 0 ? '+' : '' }}${{ fmt(Math.abs(h.gl)) }}
            </span>
            <span>
              <span class="badge" :class="h.glp >= 0 ? 'badge-up' : 'badge-down'">
                {{ h.glp >= 0 ? '+' : '' }}{{ h.glp.toFixed(2) }}%
              </span>
            </span>
            <span class="date-cell">{{ h.buyDate }}</span>
            <span class="h-acts" @click.stop>
              <button class="btn btn-icon btn-ghost btn-sm del-btn" title="Remove" @click.stop="remove(h.id)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </span>
          </div>
        </transition-group>
      </div>
    </template>

    <!-- Add position modal -->
    <AddSearchModal v-if="addModal" @close="addModal = false" @add="onAdd" />

    <!-- Toast -->
    <transition name="t">
      <div v-if="toast" class="toast" :class="toastType">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio.js'
import { getMultipleQuotes } from '@/services/stockApi.js'
import AddSearchModal from '@/components/AddSearchModal.vue'

const pf = usePortfolioStore()
const loading = ref(false)
const addModal = ref(false)
const toast = ref('')
const toastType = ref('ok')

const PALETTE = ['#f0b429', '#4fc3f7', '#a78bfa', '#34d399', '#f97316', '#ec4899', '#06b6d4', '#84cc16']

const fmt = (n) => n == null ? '—' : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const allocData = computed(() => {
  if (!pf.totalVal) return []
  const bySymbol = {}
  pf.enriched.forEach(h => {
    bySymbol[h.symbol] = (bySymbol[h.symbol] || 0) + h.val
  })
  return Object.entries(bySymbol)
    .map(([sym, val], i) => ({ sym, val, pct: (val / pf.totalVal) * 100, color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.val - a.val)
})

async function refresh() {
  if (!pf.symbols.length) return
  loading.value = true
  try {
    const qs = await getMultipleQuotes(pf.symbols)
    qs.forEach(q => pf.setPrice(q.symbol, q.c))
  } finally { loading.value = false }
}

function remove(id) { pf.remove(id); showToast('Position removed', 'info') }

function onAdd(h) { pf.add(h); showToast(`${h.symbol} position added ✓`); refresh() }

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
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.ph-right {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* Summary */
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.sum-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--rl);
  padding: 20px;
  transition: border-color .2s;
}

.sum-card:hover {
  border-color: var(--border-g);
}

.sum-card.pos {
  border-color: rgba(0, 214, 143, .2);
}

.sum-card.neg {
  border-color: rgba(255, 71, 87, .2);
}

.sum-l {
  font-size: 11px;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: .4px;
  margin-bottom: 6px;
}

.sum-v {
  font-size: 22px;
  font-weight: 600;
}

.sum-sub {
  font-size: 12px;
  color: var(--t2);
  margin-top: 3px;
}

/* Allocation */
.alloc-wrap {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--rl);
  padding: 22px;
  margin-bottom: 28px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--t2);
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 16px;
}

.alloc-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alloc-row {
  display: grid;
  grid-template-columns: 70px 1fr 60px 100px;
  align-items: center;
  gap: 12px;
}

.alloc-sym {
  font-size: 12px;
  font-weight: 600;
  color: var(--gold);
}

.alloc-bar-wrap {
  background: var(--border);
  border-radius: 3px;
  height: 6px;
  overflow: hidden;
}

.alloc-bar {
  height: 100%;
  border-radius: 3px;
  transition: width .6s ease;
}

.alloc-pct {
  font-size: 11px;
  color: var(--t2);
  text-align: right;
}

.alloc-val {
  font-size: 11px;
  color: var(--t2);
  text-align: right;
}

/* Holdings table */
.holdings {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--rl);
  overflow: hidden;
  margin-bottom: 40px;
  overflow-x: auto;
}

.h-head {
  display: grid;
  grid-template-columns: 130px 80px 90px 90px 100px 100px 110px 90px 90px 50px;
  padding: 10px 18px;
  gap: 8px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .4px;
  color: var(--t3);
  border-bottom: 1px solid var(--border);
  min-width: 900px;
}

.h-row {
  display: grid;
  grid-template-columns: 130px 80px 90px 90px 100px 100px 110px 90px 90px 50px;
  align-items: center;
  padding: 12px 18px;
  gap: 8px;
  font-size: 13px;
  color: var(--t2);
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background .12s;
  min-width: 900px;
}

.h-row:last-child {
  border-bottom: none;
}

.h-row:hover {
  background: var(--card-h);
}

.h-acts {
  display: flex;
  justify-content: flex-end;
}

.del-btn {
  color: var(--red) !important;
}

.fw {
  font-weight: 600;
}

.note {
  display: block;
  font-size: 10px;
  color: var(--t3);
  margin-top: 1px;
}

.date-cell {
  font-size: 11px;
  font-family: var(--mono);
}

/* List transition */
.list-enter-active,
.list-leave-active {
  transition: all .3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
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
