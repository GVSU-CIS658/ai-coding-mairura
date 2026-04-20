<template>
    <div class="page">

        <!-- Header -->
        <div class="news-hero afu">
            <div class="hero-text">
                <h1 class="page-title">Market <span class="gold">News</span></h1>
                <p class="page-sub">Live financial news · Updated every 5 minutes</p>
            </div>
            <div class="hero-meta">
                <div class="live-dot">
                    <span class="dot-pulse" />
                    Live
                </div>
                <span class="upd-time mono" v-if="lastFetch">{{ lastFetch }}</span>
            </div>
        </div>

        <!-- Category tabs -->
        <div class="cats afu" style="animation-delay:.08s">
            <button v-for="cat in CATEGORIES" :key="cat.key" class="cat-btn" :class="{ active: activeCat === cat.key }"
                @click="switchCategory(cat.key)">
                <span class="cat-icon">{{ cat.icon }}</span>
                {{ cat.label }}
            </button>
        </div>

        <!-- Search filter -->
        <div class="search-row afu" style="animation-delay:.12s">
            <div class="search-wrap">
                <svg class="s-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <input v-model="filterQuery" class="input s-input" placeholder="Filter news by keyword…" />
                <button v-if="filterQuery" class="clear-btn btn btn-ghost btn-icon" @click="filterQuery = ''">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <span class="result-count" v-if="filterQuery">{{ filtered.length }} result{{ filtered.length !== 1 ? 's' : ''
                }}</span>
        </div>

        <!-- Loading skeletons -->
        <div class="news-grid" v-if="loading">
            <div class="skel-card" v-for="i in 9" :key="i">
                <div class="skel skel-img" />
                <div class="skel-body">
                    <div class="skel skel-tag" />
                    <div class="skel skel-title" />
                    <div class="skel skel-title short" />
                    <div class="skel skel-line" />
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="empty afi">
            <div class="empty-ico">⚠️</div>
            <h3>Failed to Load News</h3>
            <p>{{ error }}</p>
            <button class="btn btn-gold" @click="fetchNews(activeCat)">Try Again</button>
        </div>

        <!-- Empty filter result -->
        <div v-else-if="filtered.length === 0 && filterQuery" class="empty afi">
            <div class="empty-ico">🔍</div>
            <h3>No Results</h3>
            <p>No news matched "{{ filterQuery }}"</p>
        </div>

        <!-- News grid -->
        <div v-else class="news-grid sg">

            <!-- Featured article (first item, large) -->
            <a v-if="filtered[0]" :href="filtered[0].url" target="_blank" rel="noopener" class="news-featured">
                <div class="feat-img-wrap">
                    <img v-if="filtered[0].image" :src="filtered[0].image" :alt="filtered[0].headline" class="feat-img"
                        @error="e => e.target.style.display = 'none'" />
                    <div class="feat-img-fallback" v-else>{{CATEGORIES.find(c => c.key === activeCat)?.icon}}</div>
                    <div class="feat-overlay" />
                    <div class="feat-content">
                        <div class="feat-source-row">
                            <span class="feat-src mono">{{ filtered[0].source }}</span>
                            <span class="feat-time mono">{{ fNewsDate(filtered[0].datetime) }}</span>
                        </div>
                        <h2 class="feat-headline">{{ filtered[0].headline }}</h2>
                        <p class="feat-summary" v-if="filtered[0].summary">{{ truncate(filtered[0].summary, 160) }}</p>
                    </div>
                </div>
                <span class="feat-badge">Featured</span>
            </a>

            <!-- Rest of articles -->
            <a v-for="article in filtered.slice(1)" :key="article.id" :href="article.url" target="_blank" rel="noopener"
                class="news-card">
                <div class="nc-img-wrap" v-if="article.image">
                    <img :src="article.image" :alt="article.headline" class="nc-img"
                        @error="e => e.target.parentElement.style.display = 'none'" />
                </div>
                <div class="nc-body">
                    <div class="nc-meta">
                        <span class="nc-src mono">{{ article.source }}</span>
                        <span class="nc-time mono">{{ fNewsDate(article.datetime) }}</span>
                    </div>
                    <h3 class="nc-headline">{{ article.headline }}</h3>
                    <p class="nc-summary" v-if="article.summary">{{ truncate(article.summary, 100) }}</p>
                    <div class="nc-footer">
                        <span class="nc-tag" v-if="article.category">{{ article.category }}</span>
                        <span class="nc-related" v-if="article.related">{{ article.related }}</span>
                        <span class="read-more">Read more →</span>
                    </div>
                </div>
            </a>
        </div>

        <!-- Load more -->
        <div class="load-more-row" v-if="!loading && filtered.length > 0 && canLoadMore">
            <button class="btn btn-outline" @click="loadMore" :disabled="loadingMore">
                <svg v-if="loadingMore" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" class="spin">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                </svg>
                {{ loadingMore ? 'Loading…' : 'Load More News' }}
            </button>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNewsStore } from '@/stores/news.js'
import { getMarketNews, fNewsDate } from '@/services/stockApi.js'

const newsStore = useNewsStore()

const CATEGORIES = [
    { key: 'general', label: 'General', icon: '📰' },
    { key: 'forex', label: 'Forex', icon: '💱' },
    { key: 'crypto', label: 'Crypto', icon: '₿' },
    { key: 'merger', label: 'Mergers', icon: '🤝' },
]

const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const activeCat = ref('general')
const filterQuery = ref('')
const allArticles = ref([])
const displayCount = ref(20)
const lastFetch = ref('')
let refreshTimer = null

const filtered = computed(() => {
    let list = allArticles.value.slice(0, displayCount.value)
    if (!filterQuery.value.trim()) return list
    const q = filterQuery.value.toLowerCase()
    return allArticles.value.filter(a =>
        a.headline?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.source?.toLowerCase().includes(q) ||
        a.related?.toLowerCase().includes(q)
    )
})

const canLoadMore = computed(() => displayCount.value < allArticles.value.length)

async function fetchNews(cat, force = false) {
    // Use cache unless forced
    if (!force) {
        const cached = newsStore.getCached(cat)
        if (cached) { allArticles.value = cached; return }
    }
    loading.value = true
    error.value = null
    try {
        const data = await getMarketNews(cat)
        const sorted = (data || [])
            .filter(a => a.headline && a.url)
            .sort((a, b) => b.datetime - a.datetime)
        allArticles.value = sorted
        newsStore.storeArticles(cat, sorted)
        lastFetch.value = 'Updated ' + new Date().toLocaleTimeString()
    } catch (e) {
        error.value = e.message || 'Failed to fetch news'
    } finally {
        loading.value = false
    }
}

async function switchCategory(cat) {
    if (cat === activeCat.value && allArticles.value.length) return
    activeCat.value = cat
    displayCount.value = 20
    filterQuery.value = ''
    allArticles.value = []
    await fetchNews(cat)
}

function loadMore() {
    displayCount.value += 15
}

function truncate(str, len) {
    if (!str) return ''
    return str.length > len ? str.slice(0, len) + '…' : str
}

// Auto-refresh every 5 minutes
function startAutoRefresh() {
    refreshTimer = setInterval(() => {
        fetchNews(activeCat.value, true)
    }, 5 * 60 * 1000)
}

onMounted(() => { fetchNews('general'); startAutoRefresh() })
onUnmounted(() => clearInterval(refreshTimer))
</script>

<style scoped>
/* Hero */
.news-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
}

.hero-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.live-dot {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--green-d);
    border: 1px solid rgba(0, 196, 122, .2);
    color: var(--green);
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
}

.dot-pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 1
    }

    50% {
        transform: scale(1.4);
        opacity: .6
    }
}

.upd-time {
    font-size: 11px;
    color: var(--t3);
}

/* Categories */
.cats {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.cat-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 100px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--t2);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.cat-btn:hover {
    border-color: var(--border-g);
    color: var(--t1);
}

.cat-btn.active {
    background: var(--gold-d);
    border-color: var(--border-g);
    color: var(--gold);
    font-weight: 600;
}

.cat-icon {
    font-size: 14px;
}

/* Search */
.search-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.search-wrap {
    position: relative;
    flex: 1;
    max-width: 480px;
}

.s-ico {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--t3);
    pointer-events: none;
}

.s-input {
    padding-left: 38px;
    padding-right: 36px;
}

.clear-btn {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
}

.result-count {
    font-size: 13px;
    color: var(--t2);
    white-space: nowrap;
}

/* Grid */
.news-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
}

.news-grid>*:first-child {
    grid-column: 1 / -1;
}

/* Featured card */
.news-featured {
    display: block;
    text-decoration: none;
    border-radius: var(--rl);
    overflow: hidden;
    position: relative;
    cursor: pointer;
    border: 1px solid var(--border);
    transition: transform .2s, box-shadow .2s;
    min-height: 340px;
    background: var(--card);
}

.news-featured:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, .25);
    border-color: var(--border-g);
}

.feat-img-wrap {
    position: relative;
    width: 100%;
    height: 340px;
    overflow: hidden;
}

.feat-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .4s;
}

.news-featured:hover .feat-img {
    transform: scale(1.03);
}

.feat-img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    background: var(--bg2);
}

.feat-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, .85) 0%, rgba(0, 0, 0, .2) 60%, transparent 100%);
}

.feat-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px;
}

.feat-source-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.feat-src {
    font-size: 11px;
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: .5px;
}

.feat-time {
    font-size: 11px;
    color: rgba(255, 255, 255, .5);
}

.feat-headline {
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    line-height: 1.35;
    margin-bottom: 8px;
}

.feat-summary {
    font-size: 13px;
    color: rgba(255, 255, 255, .7);
    line-height: 1.5;
}

.feat-badge {
    position: absolute;
    top: 14px;
    left: 14px;
    background: var(--gold);
    color: #07070d;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
    padding: 3px 9px;
    border-radius: 5px;
}

/* Regular news card */
.news-card {
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--rl);
    overflow: hidden;
    text-decoration: none;
    cursor: pointer;
    transition: all .2s;
}

.news-card:hover {
    border-color: var(--border-g);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, .15);
}

.nc-img-wrap {
    width: 100%;
    height: 160px;
    overflow: hidden;
    flex-shrink: 0;
}

.nc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .3s;
}

.news-card:hover .nc-img {
    transform: scale(1.04);
}

.nc-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.nc-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nc-src {
    font-size: 10px;
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: .4px;
    font-weight: 600;
}

.nc-time {
    font-size: 10px;
    color: var(--t3);
}

.nc-headline {
    font-size: 14px;
    font-weight: 600;
    color: var(--t1);
    line-height: 1.4;
    flex: 1;
}

.nc-summary {
    font-size: 12px;
    color: var(--t2);
    line-height: 1.5;
}

.nc-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid var(--border);
}

.nc-tag {
    font-size: 10px;
    background: var(--gold-d);
    color: var(--gold);
    border-radius: 4px;
    padding: 2px 7px;
    text-transform: capitalize;
}

.nc-related {
    font-size: 10px;
    color: var(--t3);
    font-family: var(--mono);
}

.read-more {
    margin-left: auto;
    font-size: 11px;
    color: var(--gold);
    font-weight: 500;
}

/* Skeleton cards */
.skel-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--rl);
    overflow: hidden;
}

.skel-card:first-child {
    grid-column: 1 / -1;
    height: 340px;
}

.skel-img {
    height: 160px;
    border-radius: 0;
}

.skel-card:first-child .skel-img {
    height: 100%;
}

.skel-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skel-tag {
    height: 12px;
    width: 60px;
}

.skel-title {
    height: 14px;
    width: 90%;
}

.skel-title.short {
    width: 60%;
}

.skel-line {
    height: 12px;
    width: 100%;
}

/* Load more */
.load-more-row {
    display: flex;
    justify-content: center;
    padding-bottom: 40px;
}

.spin {
    animation: spin .8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 900px) {
    .news-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 600px) {
    .news-grid {
        grid-template-columns: 1fr;
    }

    .feat-img-wrap,
    .feat-img-wrap {
        height: 240px;
    }

    .feat-headline {
        font-size: 17px;
    }
}
</style>