<template>
  <NavBar />
  <Ticker />
  <main>
    <router-view v-slot="{ Component }">
      <transition name="route" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import Ticker from '@/components/Ticker.vue'
</script>

<style>
main { min-height: calc(100vh - 98px); }
</style>
