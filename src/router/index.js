import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    meta: { title: "Dashboard" },
  },
  {
    path: "/watchlist",
    name: "watchlist",
    component: () => import("@/views/WatchlistView.vue"),
    meta: { title: "Watchlist" },
  },
  {
    path: "/portfolio",
    name: "portfolio",
    component: () => import("@/views/PortfolioView.vue"),
    meta: { title: "Portfolio" },
  },
  {
    path: "/news",
    name: "news",
    component: () => import("@/views/NewsView.vue"),
    meta: { title: "Market News" },
  },
  {
    path: "/stock/:symbol",
    name: "stock",
    component: () => import("@/views/StockDetailView.vue"),
    meta: { title: "Stock" },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: "smooth" }),
});

router.afterEach((to) => {
  document.title = `${to.meta.title} · Apex Markets`;
});

export default router;
