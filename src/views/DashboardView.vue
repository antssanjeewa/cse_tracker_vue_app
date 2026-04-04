<script setup>
import { onMounted, computed, ref } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'

// Components
import MarketBreadthPulse from '@/features/dashboard/components/MarketBreadthPulse.vue'
import IndexBenchmarkCard from '@/features/dashboard/components/IndexBenchmarkCard.vue'
import NetWorthSummaryCard from '@/features/dashboard/components/NetWorthSummaryCard.vue'
import SessionalPerformanceTable from '@/features/dashboard/components/SessionalPerformanceTable.vue'
import MarketActivityTerminal from '@/features/dashboard/components/MarketActivityTerminal.vue'
import PortfolioDiversificationIndex from '@/features/dashboard/components/PortfolioDiversificationIndex.vue'

const marketStore = useMarketStore()
const portfolioStore = usePortfolioStore()

// ── Shared UI State ──────────────────────────────────────────────────────────
const currentPage = ref(1)
const perPage = 10
const sortKey = ref('ticker')
const sortOrder = ref('asc')
const currentTime = ref(new Date())

setInterval(() => { currentTime.value = new Date() }, 1000)

// ── Data Processing ─────────────────────────────────────────────────────────
const activeHoldings = computed(() => {
  const data = portfolioStore.holdings
    .filter(h => parseFloat(h.quantity) > 0)
    .map(h => {
      const tickerPrefix = h.stocks?.ticker || ''
      const marketStock = marketStore.allStocks.find(s =>
        (s.code || '').toUpperCase() === tickerPrefix.toUpperCase()
      )

      const closePrice = parseFloat(marketStock?.close || h.avg_price)
      const avgPrice = parseFloat(h.avg_price || 0)
      const qty = parseFloat(h.quantity || 0)
      const currentCost = h.quantity * h.avg_price
      const liveCost = h.quantity * closePrice * 0.9888
      const liveProfit = liveCost - currentCost
      const liveRoi = avgPrice > 0 && closePrice > 0 ? ((liveCost - currentCost) / currentCost) * 100 : 0

      return { ...h, liveStock: marketStock || h.stocks, liveProfit, liveRoi }
    })

  // Apply Sorting
  return [...data].sort((a, b) => {
    let valA, valB
    if (sortKey.value === 'ticker') {
      valA = (a.liveStock?.code || '').toUpperCase()
      valB = (b.liveStock?.code || '').toUpperCase()
    } else if (sortKey.value === 'profit') {
      valA = a.liveProfit
      valB = b.liveProfit
    } else {
      valA = a[sortKey.value] || 0
      valB = b[sortKey.value] || 0
    }

    const modifier = sortOrder.value === 'asc' ? 1 : -1
    return valA > valB ? modifier : -modifier
  })
})

const totalLiveProfit = computed(() => activeHoldings.value.reduce((sum, h) => sum + (h.liveProfit || 0), 0))

const totalLiveRoi = computed(() => {
  const totalCost = activeHoldings.value.reduce((sum, h) => sum + (parseFloat(h.quantity) * parseFloat(h.avg_price)), 0)
  return totalCost > 0 ? (totalLiveProfit.value / totalCost) * 100 : 0
})

const totalItems = computed(() => activeHoldings.value.length)
const totalPagesCount = computed(() => Math.ceil(totalItems.value / perPage))

const paginatedHoldings = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return activeHoldings.value.slice(start, start + perPage)
})

// ── Actions ──────────────────────────────────────────────────────────────────
const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

onMounted(async () => {
  await Promise.all([
    marketStore.fetchDashboardData(),
    marketStore.fetchFullMarket(),
    portfolioStore.fetchPortfolio()
  ])
})
</script>

<template>
  <DashboardLayout>
    <div class="p-6 max-w-[1700px] mx-auto min-h-screen bg-[#0c1221] space-y-6 relative">

      <!-- Top Session Header -->
      <div class="flex items-center justify-between pb-2 border-b border-white/5">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Investment Live Terminal v2.0.1</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-xl font-black text-white italic tracking-tighter leading-none font-mono">
              {{ currentTime.toLocaleTimeString('en-LK', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
            </div>
            <div class="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">
              {{ currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tier 1: Intelligence Hub -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <IndexBenchmarkCard />
        <NetWorthSummaryCard :totalLiveProfit="totalLiveProfit" :totalLiveRoi="totalLiveRoi" />
        <MarketBreadthPulse />
      </div>

      <!-- Tier 2: Main Decision Matrix -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">

        <!-- Left: Investment Performance Table (8/12) -->
        <div class="xl:col-span-8">
          <SessionalPerformanceTable :paginatedHoldings="paginatedHoldings" :totalPagesCount="totalPagesCount" :currentPage="currentPage" :perPage="perPage" :totalItems="totalItems" :sortKey="sortKey" :sortOrder="sortOrder" @toggleSort="toggleSort" @prevPage="currentPage > 1 && currentPage--" @nextPage="currentPage < totalPagesCount && currentPage++" @setPage="(p) => currentPage = p" />
        </div>

        <!-- Right: Market Pulse & Diversification (4/12) -->
        <div class="xl:col-span-4 space-y-6">
          <MarketActivityTerminal />
          <PortfolioDiversificationIndex />
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
