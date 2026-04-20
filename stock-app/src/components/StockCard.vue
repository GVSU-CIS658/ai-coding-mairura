<template>
  <div class="sc" @click="$router.push(`/stock/${symbol}`)">

    <!-- top row -->
    <div class="sc-top">
      <div class="sc-id">
        <div class="sc-av" :style="{background: avatarBg}">{{ symbol[0] }}</div>
        <div>
          <div class="sc-sym mono">{{ symbol }}</div>
          <div class="sc-name">{{ shortName }}</div>
        </div>
      </div>
      <div class="sc-actions" @click.stop><slot name="actions"/></div>
    </div>

    <!-- price -->
    <div class="sc-price" :class="flash">
      <div class="price-big mono" v-if="quote">${{ quote.c?.toFixed(2) ?? '—' }}</div>
      <div class="price-big skel" v-else/>
      <div class="price-row" v-if="quote">
        <span class="badge" :class="`badge-${d}`">
          <svg v-if="d==='up'"   width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-if="d==='down'" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m6 9 6 6 6-6"/></svg>
          {{ fPct(quote.dp) }}
        </span>
        <span class="chg mono" :class="d">{{ fChange(quote.d) }}</span>
      </div>
    </div>

    <!-- stats -->
    <div class="sc-stats" v-if="quote">
      <div class="s-item" v-for="s in stats" :key="s.l">
        <div class="s-l">{{ s.l }}</div>
        <div class="s-v mono" :class="s.c">${{ s.v }}</div>
      </div>
    </div>
    <div class="sc-stats skel-block" v-else/>

    <!-- range bar -->
    <div class="range-bar" v-if="quote">
      <div class="range-fill" :class="d" :style="{width: pct+'%'}"/>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { fPct, fChange, dir } from '@/services/stockApi.js'

const props = defineProps({
  symbol:  { type:String, required:true },
  quote:   { type:Object, default:null },
  profile: { type:Object, default:null }
})

const COLORS = ['#f0b42922','#4fc3f722','#a78bfa22','#34d39922','#f9731622','#ec489922']
const avatarBg = computed(() => COLORS[props.symbol.charCodeAt(0) % COLORS.length])
const shortName = computed(() => {
  const n = props.profile?.name || ''
  return n.length > 20 ? n.slice(0,20)+'…' : n
})
const d   = computed(() => dir(props.quote?.d ?? 0))
const pct = computed(() => {
  if (!props.quote) return 50
  const { l,h,c } = props.quote
  return h===l ? 50 : Math.round(((c-l)/(h-l))*100)
})
const stats = computed(() => props.quote ? [
  { l:'Open', v:props.quote.o?.toFixed(2),  c:'' },
  { l:'High', v:props.quote.h?.toFixed(2),  c:'up' },
  { l:'Low',  v:props.quote.l?.toFixed(2),  c:'down' },
  { l:'Prev', v:props.quote.pc?.toFixed(2), c:'' }
] : [])

const flash = ref('')
watch(() => props.quote?.c, (n, o) => {
  if (o==null || n===o) return
  flash.value = n>o ? 'flash-up' : 'flash-down'
  setTimeout(() => flash.value='', 800)
})
</script>

<style scoped>
.sc {
  background:var(--card); border:1px solid var(--border);
  border-radius:var(--rl); padding:18px; cursor:pointer;
  transition:all .22s; position:relative; overflow:hidden;
}
.sc::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(135deg, rgba(240,180,41,.04) 0%, transparent 55%);
  opacity:0; transition:opacity .3s;
}
.sc:hover { border-color:var(--border-g); transform:translateY(-2px); box-shadow:0 10px 32px rgba(0,0,0,.28), 0 0 28px rgba(240,180,41,.07); }
.sc:hover::before { opacity:1; }

/* top */
.sc-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
.sc-id  { display:flex; align-items:center; gap:10px; }
.sc-av  { width:38px; height:38px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-family:var(--serif); font-size:17px; font-weight:700; color:var(--gold); border:1px solid var(--border-g); flex-shrink:0; }
.sc-sym { font-size:14px; font-weight:600; color:var(--t1); }
.sc-name{ font-size:11px; color:var(--t3); margin-top:1px; }

/* price */
.sc-price { padding:3px; margin-left:-3px; border-radius:8px; transition:background .3s; margin-bottom:14px; }
.price-big { font-size:26px; font-weight:600; color:var(--t1); letter-spacing:-.5px; margin-bottom:5px; }
.price-row { display:flex; align-items:center; gap:8px; }
.chg { font-size:12px; }

@keyframes fu { 0%{background:transparent}30%{background:rgba(0,214,143,.14)}100%{background:transparent} }
@keyframes fd { 0%{background:transparent}30%{background:rgba(255,71,87,.14)}100%{background:transparent} }
.flash-up   { animation: fu .8s ease; }
.flash-down { animation: fd .8s ease; }

/* stats */
.sc-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:12px; }
.s-item { display:flex; flex-direction:column; gap:2px; }
.s-l { font-size:9px; color:var(--t3); text-transform:uppercase; letter-spacing:.4px; }
.s-v { font-size:11px; color:var(--t2); }

/* range */
.range-bar  { height:3px; background:var(--border); border-radius:2px; overflow:hidden; }
.range-fill { height:100%; border-radius:2px; transition:width .6s ease; }
.range-fill.up      { background:var(--green); }
.range-fill.down    { background:var(--red);   }
.range-fill.neutral { background:var(--t3);   }

/* skeletons */
@keyframes sh { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
.skel { height:26px; width:110px; border-radius:6px; background:linear-gradient(90deg,var(--card) 25%,var(--card-h) 50%,var(--card) 75%); background-size:200% 100%; animation:sh 1.5s infinite; margin-bottom:5px; }
.skel-block { height:40px; border-radius:8px; background:linear-gradient(90deg,var(--card) 25%,var(--card-h) 50%,var(--card) 75%); background-size:200% 100%; animation:sh 1.5s infinite; }
</style>
