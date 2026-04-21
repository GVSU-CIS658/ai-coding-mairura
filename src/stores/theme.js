import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(localStorage.getItem("theme") !== "light");

  function apply() {
    if (isDark.value) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
  }

  function toggle() {
    isDark.value = !isDark.value;
    apply();
  }

  apply();

  return { isDark, toggle };
});
