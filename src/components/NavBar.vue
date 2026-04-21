<template>
  <nav class="nav">
    <div class="nav-inner">

      <router-link to="/" class="logo">
        <div class="logo-mark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <span>Apex<em>Markets</em></span>
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nl" exact-active-class="active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </router-link>
        <router-link to="/watchlist" class="nl" active-class="active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Watchlist
          <span class="nav-count" v-if="wl.symbols.length">{{ wl.symbols.length }}</span>
        </router-link>
        <router-link to="/portfolio" class="nl" active-class="active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          Portfolio
          <span class="nav-count" v-if="pf.holdings.length">{{ pf.holdings.length }}</span>
        </router-link>
        <router-link to="/news" class="nl" active-class="active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
          </svg>
          News
          <span class="new-badge">Live</span>
        </router-link>
      </div>

      <div class="nav-right">
        <!-- Theme toggle -->
        <button class="theme-toggle" @click="theme.toggle()"
          :title="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <transition name="icon" mode="out-in">
            <svg v-if="theme.isDark" key="moon" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <svg v-else key="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </transition>
        </button>

        <button class="hamburger" @click="open = !open" :class="{ open }">
          <span /><span /><span />
        </button>
      </div>
    </div>

    <transition name="mob">
      <div v-if="open" class="mob-menu">
        <router-link to="/" @click="open = false" class="mob-link">Dashboard</router-link>
        <router-link to="/watchlist" @click="open = false" class="mob-link">Watchlist</router-link>
        <router-link to="/portfolio" @click="open = false" class="mob-link">Portfolio</router-link>
        <router-link to="/news" @click="open = false" class="mob-link">Market News</router-link>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useWatchlistStore } from '@/stores/watchlist.js'
import { usePortfolioStore } from '@/stores/portfolio.js'
import { useThemeStore } from '@/stores/theme.js'

const wl = useWatchlistStore()
const pf = usePortfolioStore()
const theme = useThemeStore()
const open = ref(false)
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--t1);
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 700;
}

.logo em {
  color: var(--gold);
  font-style: normal;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gold-d);
  border: 1px solid var(--border-g);
  color: var(--gold);
}

.logo:hover .logo-mark {
  background: var(--gold);
  color: #fff;
}

.nav-links {
  display: flex;
  gap: 2px;
}

.nl {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--t2);
  font-size: 14px;
  font-weight: 500;
  position: relative;
}

.nl:hover {
  color: var(--t1);
  background: rgba(0, 0, 0, .05);
}

.nl.active {
  color: var(--gold);
  background: var(--gold-d);
}

.nav-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 100px;
  background: var(--gold);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 0 4px;
}

.new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  border-radius: 100px;
  background: var(--green);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 0 5px;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 196, 122, 0);
  }

  50% {
    box-shadow: 0 0 6px 2px rgba(0, 196, 122, 0.4);
  }
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gold-d);
  border: 1px solid var(--border-g);
  color: var(--gold);
  cursor: pointer;
}

.theme-toggle:hover {
  background: var(--gold);
  color: #fff;
  transform: rotate(15deg);
}

.icon-enter-active,
.icon-leave-active {
  transition: all 0.2s ease;
}

.icon-enter-from {
  opacity: 0;
  transform: rotate(-60deg) scale(0.6);
}

.icon-leave-to {
  opacity: 0;
  transform: rotate(60deg) scale(0.6);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--t2);
  border-radius: 2px;
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.mob-menu {
  padding: 8px 24px 16px;
  background: var(--nav-bg);
}

.mob-link {
  display: block;
  padding: 11px 14px;
  color: var(--t2);
  text-decoration: none;
  border-radius: 8px;
  font-size: 15px;
}

.mob-link:hover,
.mob-link.router-link-active {
  color: var(--gold);
  background: var(--gold-d);
}

.mob-enter-active,
.mob-leave-active {
  transition: all .2s;
}

.mob-enter-from,
.mob-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media(max-width:700px) {
  .nav-links {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}
</style>