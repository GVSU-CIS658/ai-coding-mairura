import { defineStore } from "pinia";
import { ref } from "vue";

export const useNewsStore = defineStore("news", () => {
  const articles = ref([]);
  const category = ref("general");
  const loading = ref(false);
  const error = ref(null);
  const lastFetch = ref(null);

  const cache = ref({});

  function setCategory(cat) {
    category.value = cat;
  }

  function storeArticles(cat, data) {
    cache.value[cat] = data;
    articles.value = data;
    lastFetch.value = Date.now();
  }

  function getCached(cat) {
    return cache.value[cat] || null;
  }

  return {
    articles,
    category,
    loading,
    error,
    lastFetch,
    cache,
    setCategory,
    storeArticles,
    getCached,
  };
});
