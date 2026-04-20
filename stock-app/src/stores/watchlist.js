import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useWatchlistStore = defineStore("watchlist", () => {
  const symbols = ref(
    JSON.parse(
      localStorage.getItem("wl_syms") || '["AAPL","MSFT","TSLA","NVDA"]',
    ),
  );
  const quotes = ref({});
  const profiles = ref({});

  const save = () =>
    localStorage.setItem("wl_syms", JSON.stringify(symbols.value));

  const has = computed(() => (s) => symbols.value.includes(s.toUpperCase()));
  const items = computed(() =>
    symbols.value.map((s) => ({
      symbol: s,
      quote: quotes.value[s] || null,
      profile: profiles.value[s] || null,
    })),
  );

  function add(s) {
    const u = s.toUpperCase();
    if (!symbols.value.includes(u)) {
      symbols.value.push(u);
      save();
    }
  }
  function remove(s) {
    symbols.value = symbols.value.filter((x) => x !== s.toUpperCase());
    save();
  }
  function setQuote(s, q) {
    quotes.value[s.toUpperCase()] = q;
  }
  function setProfile(s, p) {
    profiles.value[s.toUpperCase()] = p;
  }

  return {
    symbols,
    quotes,
    profiles,
    has,
    items,
    add,
    remove,
    setQuote,
    setProfile,
  };
});
