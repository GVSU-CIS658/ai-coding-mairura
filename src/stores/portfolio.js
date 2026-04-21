import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const usePortfolioStore = defineStore("portfolio", () => {
  const holdings = ref(JSON.parse(localStorage.getItem("portfolio") || "[]"));
  const prices = ref({});

  const save = () =>
    localStorage.setItem("portfolio", JSON.stringify(holdings.value));

  const symbols = computed(() => [
    ...new Set(holdings.value.map((h) => h.symbol)),
  ]);

  const enriched = computed(() =>
    holdings.value.map((h) => {
      const cur = prices.value[h.symbol] ?? h.buyPrice;
      const cost = h.buyPrice * h.shares;
      const val = cur * h.shares;
      const gl = val - cost;
      const glp = cost ? (gl / cost) * 100 : 0;
      return { ...h, cur, cost, val, gl, glp };
    }),
  );

  const totalCost = computed(() =>
    enriched.value.reduce((s, h) => s + h.cost, 0),
  );
  const totalVal = computed(() =>
    enriched.value.reduce((s, h) => s + h.val, 0),
  );
  const totalGL = computed(() => totalVal.value - totalCost.value);
  const totalGLPct = computed(() =>
    totalCost.value ? (totalGL.value / totalCost.value) * 100 : 0,
  );

  function add(h) {
    holdings.value.push({
      id: Date.now(),
      ...h,
      symbol: h.symbol.toUpperCase(),
      shares: +h.shares,
      buyPrice: +h.buyPrice,
    });
    save();
  }
  function remove(id) {
    holdings.value = holdings.value.filter((h) => h.id !== id);
    save();
  }
  function setPrice(s, p) {
    prices.value[s.toUpperCase()] = p;
  }

  return {
    holdings,
    prices,
    symbols,
    enriched,
    totalCost,
    totalVal,
    totalGL,
    totalGLPct,
    add,
    remove,
    setPrice,
  };
});
