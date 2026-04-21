<template>
  <div class="ticker">
    <div class="track">
      <div class="belt">
        <template v-for="(item, i) in belt" :key="i">
          <span class="t-item" @click="go(item.s)">
            <span class="t-sym">{{ item.s }}</span>
            <span class="t-price mono">{{ item.p }}</span>
            <span class="t-chg" :class="item.dir">{{ item.c }}</span>
          </span>
          <span class="sep">·</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMultipleQuotes, fPct } from '@/services/stockApi.js'

const router = useRouter()
const SYMS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'V', 'JPM', 'WMT', 'DIS', 'BABA']

const data = ref(SYMS.map(s => ({ s, p: '—', c: '—', dir: 'neutral' })))

// Duplicate for seamless loop
const belt = computed(() => [...data.value, ...data.value])

const go = (s) => router.push(`/stock/${s}`)

async function fetch() {
  try {
    const qs = await getMultipleQuotes(SYMS)
    qs.forEach(q => {
      const idx = data.value.findIndex(d => d.s === q.symbol)
      if (idx !== -1) data.value[idx] = {
        s: q.symbol,
        p: q.c?.toFixed(2) ?? '—',
        c: fPct(q.dp),
        dir: q.dp > 0 ? 'up' : q.dp < 0 ? 'down' : 'neutral'
      }
    })
  } catch { }
}

onMounted(() => { fetch(); setInterval(fetch, 60_000) })
</script>

<style scoped>
.ticker {
  height: 32px;
  overflow: hidden;
  position: relative;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
}

/* edge fades */
.ticker::before,
.ticker::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  z-index: 2;
  pointer-events: none;
}

.ticker::before {
  left: 0;
  background: linear-gradient(90deg, var(--bg2), transparent);
}

.ticker::after {
  right: 0;
  background: linear-gradient(-90deg, var(--bg2), transparent);
}

.track {
  display: flex;
  align-items: center;
  height: 100%;
  overflow: hidden;
}

.belt {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  animation: scroll 55s linear infinite;
}

.belt:hover {
  animation-play-state: paused;
}

@keyframes scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

.t-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 18px;
  height: 32px;
  cursor: pointer;
  transition: background .15s;
}

.t-item:hover {
  background: rgba(255, 255, 255, .04);
}

.t-sym {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  color: var(--t2);
  letter-spacing: .4px;
}

.t-price {
  font-size: 10px;
  color: var(--t1);
}

.t-chg {
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 500;
}

.t-chg.up {
  color: var(--green);
}

.t-chg.down {
  color: var(--red);
}

.t-chg.neutral {
  color: var(--t3);
}

.sep {
  color: var(--t3);
  font-size: 9px;
  opacity: .4;
}
</style>
