<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import { useMarketStore } from '@/stores/marketStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { 
  MarketToolbar, 
  MarketFilterBar, 
  MarketTabs, 
  MarketTable, 
  MarketPagination, 
  MARKET_TABS, 
  COLUMN_GROUPS, 
  useMarketTable 
} from '@/features/market'

const router = useRouter()
const marketStore = useMarketStore()
const portfolioStore = usePortfolioStore()

// ── View Management ─────────────────────────────────────────────────────────
const viewMode = ref('all') // 'all' or 'portfolio'

/**
 * Robust ticker matching: 
 * Strips exchange classifiers (e.g., .N0000) to ensure portfolio 
 * symbols like 'TJL' match market codes like 'TJL.N0000'.
 */
const sourceStocks = computed(() => {
  if (viewMode.value === 'portfolio') {
    const portfolioTickers = portfolioStore.holdings
      .filter(h => parseFloat(h.quantity) > 0)
      .map(h => {
        const symbol = h.stocks?.ticker || h.stocks?.code || ''
        return symbol.toUpperCase().split('.')[0]
      })
    
    return marketStore.allStocks.filter(s => {
      const stockTicker = (s.code || '').toUpperCase().split('.')[0]
      return portfolioTickers.includes(stockTicker)
    })
  }
  return marketStore.allStocks
})

// ── Table Logic ─────────────────────────────────────────────────────────────
const {
  searchQuery,
  currentPage,
  itemsPerPage,
  sortKey,
  sortDir,
  activeColumnTab,
  filteredStocks,
  paginatedStocks,
  totalPages,
  sortBy,
  nextPage,
  prevPage,
  setPage
} = useMarketTable(sourceStocks)

const activeColumns = computed(() => COLUMN_GROUPS[activeColumnTab.value])

onMounted(async () => {
  if (marketStore.allStocks.length === 0) {
    await marketStore.fetchFullMarket()
  }
  if (portfolioStore.holdings.length === 0) {
    await portfolioStore.fetchPortfolio()
  }
})

const goToStock = (code) => {
  router.push(`/stock/${code}`)
}
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#0c1221]">
      <MarketToolbar
        v-model:searchQuery="searchQuery"
        v-model:viewMode="viewMode"
        :isLoading="marketStore.isLoading"
        @refresh="marketStore.fetchFullMarket"
      />

      <MarketFilterBar />

      <MarketTabs
        v-model:activeTab="activeColumnTab"
        :tabs="MARKET_TABS"
      />

      <MarketTable
        :columns="activeColumns"
        :stocks="paginatedStocks"
        :sortKey="sortKey"
        :sortDir="sortDir"
        :isLoading="marketStore.isLoading"
        :error="marketStore.error"
        :activeTab="activeColumnTab"
        @sort="sortBy"
        @refresh="marketStore.fetchFullMarket"
        @rowClick="goToStock"
      />

      <MarketPagination
        v-model:itemsPerPage="itemsPerPage"
        :totalItems="filteredStocks.length"
        :currentPage="currentPage"
        :totalPages="totalPages"
        :totalStocksCount="sourceStocks.length"
        @prevPage="prevPage"
        @nextPage="nextPage"
        @setPage="setPage"
      />
    </div>
  </DashboardLayout>
</template>
