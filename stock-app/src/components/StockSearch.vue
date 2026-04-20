<template>
  <div class="sw" ref="root">
    <div class="row">
      <svg class="ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input ref="inp" v-model="q" class="input" :placeholder="placeholder" @input="onInput"
        @keydown.down.prevent="idx = Math.min(idx + 1, res.length - 1)" @keydown.up.prevent="idx = Math.max(idx - 1, 0)"
        @keydown.enter.prevent="pick(res[idx])" @keydown.escape="close" @focus="onFocus" autocomplete="off" />
      <div class="spinner" v-if="busy">
        <div class="sp" />
      </div>
      <button v-if="q" class="clr btn btn-ghost btn-icon" @click="clear">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Teleported dropdown — escapes ALL stacking contexts -->
    <teleport to="body">
      <transition name="dd">
        <div v-if="open && (res.length || (q && !busy))" class="dd" :style="ddStyle">
          <template v-if="res.length">
            <div v-for="(r, i) in res" :key="r.symbol" class="dd-item" :class="{ hi: i === idx }"
              @mousedown.prevent="pick(r)" @mouseover="idx = i">
              <span class="dd-sym">{{ r.displaySymbol }}</span>
              <span class="dd-name">{{ r.description }}</span>
            </div>
          </template>
          <div v-else class="dd-empty">No results for "{{ q }}"</div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { searchStocks } from '@/services/stockApi.js'

const props = defineProps({ placeholder: { type: String, default: 'Search ticker or company…' } })
const emit = defineEmits(['select'])

const q = ref('')
const res = ref([])
const open = ref(false)
const busy = ref(false)
const idx = ref(0)
const inp = ref(null)
const root = ref(null)

// Dropdown position — recalculated on open
const ddPos = ref({ top: 0, left: 0, width: 0 })

const ddStyle = computed(() => ({
  position: 'fixed',
  top: ddPos.value.top + 'px',
  left: ddPos.value.left + 'px',
  width: ddPos.value.width + 'px',
  zIndex: 99999,
}))

function calcPos() {
  if (!inp.value) return
  const rect = inp.value.getBoundingClientRect()
  ddPos.value = {
    top: rect.bottom + 6,
    left: rect.left,
    width: rect.width,
  }
}

let timer = null

function onInput() {
  clearTimeout(timer)
  if (!q.value.trim()) { res.value = []; open.value = false; return }
  busy.value = true
  timer = setTimeout(async () => {
    try {
      res.value = await searchStocks(q.value.trim())
      await nextTick()
      calcPos()
      open.value = true
      idx.value = 0
    } catch { }
    finally { busy.value = false }
  }, 350)
}

function onFocus() {
  if (res.value.length) { calcPos(); open.value = true }
}

function pick(r) {
  if (!r) return
  emit('select', r)
  q.value = ''; res.value = []; open.value = false
}

function clear() { q.value = ''; res.value = []; open.value = false; inp.value?.focus() }
function close() { open.value = false }

function reposition() { if (open.value) calcPos() }

const outside = (e) => { if (!root.value?.contains(e.target)) close() }

onMounted(() => {
  document.addEventListener('click', outside)
  window.addEventListener('scroll', reposition, true)
  window.addEventListener('resize', reposition)
})
onUnmounted(() => {
  document.removeEventListener('click', outside)
  window.removeEventListener('scroll', reposition, true)
  window.removeEventListener('resize', reposition)
})
</script>

<style scoped>
.sw {
  position: relative;
  width: 100%;
}

.row {
  position: relative;
  display: flex;
  align-items: center;
}

.ico {
  position: absolute;
  left: 13px;
  color: var(--t3);
  pointer-events: none;
}

.input {
  padding-left: 40px;
  padding-right: 40px;
}

.spinner,
.clr {
  position: absolute;
  right: 8px;
}

.sp {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin .6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
.dd {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(240, 180, 41, 0.08);
}

.dd-item {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}

.dd-item:last-child {
  border-bottom: none;
}

.dd-item.hi,
.dd-item:hover {
  background: var(--card-h);
}

.dd-sym {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--gold);
}

.dd-name {
  font-size: 13px;
  color: var(--t1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-empty {
  padding: 20px;
  text-align: center;
  color: var(--t3);
  font-size: 13px;
}

.dd-enter-active,
.dd-leave-active {
  transition: all 0.15s ease;
}

.dd-enter-from,
.dd-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>