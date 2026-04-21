<template>
  <teleport to="body">
    <transition name="mo">
      <div v-if="show" class="overlay" @click.self="$emit('close')">
        <div class="box">

          <div class="mh">
            <h3>Add to Portfolio</h3>
            <button class="btn btn-ghost btn-icon" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="mb">
            <div class="sym-row">
              <span class="mono gold" style="font-size:20px;font-weight:700">{{ symbol }}</span>
              <span class="mono" style="font-size:17px" v-if="price">${{ price.toFixed(2) }}</span>
            </div>

            <div class="fg">
              <label class="fl">Shares</label>
              <input v-model.number="f.shares" type="number" min="0.001" step="0.001" class="input" placeholder="e.g. 10" />
            </div>
            <div class="fg">
              <label class="fl">Buy Price / Share ($)</label>
              <input v-model.number="f.buyPrice" type="number" min="0.01" step="0.01" class="input" placeholder="e.g. 150.00" />
              <button v-if="price" class="use-cur" @click.prevent="f.buyPrice=+price.toFixed(2)">Use current price</button>
            </div>
            <div class="fg">
              <label class="fl">Date Purchased</label>
              <input v-model="f.buyDate" type="date" class="input" />
            </div>
            <div class="fg">
              <label class="fl">Note (optional)</label>
              <input v-model="f.note" type="text" class="input" placeholder="e.g. Long-term hold" />
            </div>

            <div class="preview" v-if="f.shares && f.buyPrice">
              <div class="pr"><span>Total Cost</span><span class="mono gold">${{ (f.shares*f.buyPrice).toFixed(2) }}</span></div>
              <div class="pr" v-if="price">
                <span>Current Value</span>
                <span class="mono" :class="(f.shares*price) >= (f.shares*f.buyPrice) ? 'up':'down'">${{ (f.shares*price).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="mf">
            <button class="btn btn-outline" @click="$emit('close')">Cancel</button>
            <button class="btn btn-gold" @click="submit" :disabled="!valid">Add Position</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { reactive, computed } from 'vue'
const props = defineProps({ show:Boolean, symbol:String, price:{ type:Number, default:null } })
const emit  = defineEmits(['close','add'])
const today = () => new Date().toISOString().split('T')[0]
const f = reactive({ shares:'', buyPrice:'', buyDate:today(), note:'' })
const valid = computed(() => f.shares>0 && f.buyPrice>0)
function submit() {
  if (!valid.value) return
  emit('add', { symbol:props.symbol, shares:f.shares, buyPrice:f.buyPrice, buyDate:f.buyDate, note:f.note })
  Object.assign(f, { shares:'', buyPrice:'', buyDate:today(), note:'' })
  emit('close')
}
</script>

<style scoped>
.overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.72);
  backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center;
  z-index:1000; padding:20px;
}
.box { background:var(--card); border:1px solid var(--border); border-radius:var(--rl); width:100%; max-width:430px; box-shadow:0 24px 60px rgba(0,0,0,.55); }

.mh { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; border-bottom:1px solid var(--border); }
.mh h3 { font-size:18px; }
.mb { padding:22px; display:flex; flex-direction:column; gap:14px; }
.mf { padding:14px 22px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; }

.sym-row { display:flex; justify-content:space-between; align-items:center; background:var(--bg2); border:1px solid var(--border); border-radius:var(--r); padding:11px 14px; }
.fg { display:flex; flex-direction:column; gap:5px; }
.fl { font-size:11px; font-weight:500; color:var(--t2); text-transform:uppercase; letter-spacing:.4px; }
.use-cur { align-self:flex-end; background:none; border:none; color:var(--gold); font-size:11px; cursor:pointer; text-decoration:underline; font-family:var(--sans); }

.preview { background:var(--bg2); border-radius:var(--r); padding:12px 14px; display:flex; flex-direction:column; gap:7px; }
.pr { display:flex; justify-content:space-between; font-size:13px; color:var(--t2); }

.mo-enter-active,.mo-leave-active{transition:all .2s}
.mo-enter-from,.mo-leave-to{opacity:0}
.mo-enter-from .box,.mo-leave-to .box{transform:scale(.96) translateY(8px)}
</style>
