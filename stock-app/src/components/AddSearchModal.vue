<template>
  <teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <div class="box">
        <div class="mh">
          <h3>Add Position</h3>
          <button class="btn btn-ghost btn-icon" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="mb">
          <!-- Step 1: Search -->
          <div v-if="!chosen">
            <div class="step-l">Step 1 — Search for a stock</div>
            <StockSearch @select="onSelect" placeholder="Search ticker or company…" />
          </div>

          <!-- Step 2: Fill form -->
          <template v-else>
            <div class="chosen-row">
              <span class="mono gold" style="font-size:18px;font-weight:700">{{ chosen.displaySymbol }}</span>
              <span class="chosen-name">{{ chosen.description }}</span>
              <button class="btn btn-ghost btn-sm" @click="chosen=null">Change</button>
            </div>

            <div class="fg">
              <label class="fl">Shares</label>
              <input v-model.number="f.shares" type="number" min="0.001" step="0.001" class="input" placeholder="e.g. 10" />
            </div>
            <div class="fg">
              <label class="fl">Buy Price / Share ($)</label>
              <input v-model.number="f.buyPrice" type="number" min="0.01" step="0.01" class="input" placeholder="e.g. 150.00" />
            </div>
            <div class="fg">
              <label class="fl">Date Purchased</label>
              <input v-model="f.buyDate" type="date" class="input" />
            </div>
            <div class="fg">
              <label class="fl">Note (optional)</label>
              <input v-model="f.note" class="input" placeholder="e.g. Long-term hold" />
            </div>

            <div class="preview" v-if="f.shares && f.buyPrice">
              <div class="pr"><span>Total Cost</span><span class="mono gold">${{ (f.shares*f.buyPrice).toFixed(2) }}</span></div>
            </div>
          </template>
        </div>

        <div class="mf">
          <button class="btn btn-outline" @click="$emit('close')">Cancel</button>
          <button class="btn btn-gold" v-if="chosen" @click="submit" :disabled="!valid">Add Position</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import StockSearch from '@/components/StockSearch.vue'

const emit   = defineEmits(['close','add'])
const chosen = ref(null)
const today  = () => new Date().toISOString().split('T')[0]
const f = reactive({ shares:'', buyPrice:'', buyDate:today(), note:'' })
const valid = computed(() => f.shares>0 && f.buyPrice>0)

function onSelect(r) { chosen.value = r }
function submit() {
  if (!valid.value) return
  emit('add', { symbol:chosen.value.displaySymbol, shares:f.shares, buyPrice:f.buyPrice, buyDate:f.buyDate, note:f.note })
  emit('close')
}
</script>

<style scoped>
.overlay { position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
.box { background:var(--card); border:1px solid var(--border); border-radius:var(--rl); width:100%; max-width:440px; box-shadow:0 24px 60px rgba(0,0,0,.55); }
.mh { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--border); }
.mh h3 { font-size:17px; }
.mb { padding:22px; display:flex; flex-direction:column; gap:14px; }
.mf { padding:14px 22px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; }

.step-l { font-size:11px; color:var(--t3); text-transform:uppercase; letter-spacing:.4px; margin-bottom:10px; }
.chosen-row { display:flex; align-items:center; gap:10px; background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:12px 14px; flex-wrap:wrap; }
.chosen-name { font-size:13px; color:var(--t2); flex:1; }
.fg { display:flex; flex-direction:column; gap:5px; }
.fl { font-size:11px; font-weight:500; color:var(--t2); text-transform:uppercase; letter-spacing:.4px; }
.preview { background:var(--bg2); border-radius:var(--r); padding:12px 14px; }
.pr { display:flex; justify-content:space-between; font-size:13px; color:var(--t2); }
</style>
