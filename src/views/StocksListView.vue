<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import { useMarketStore } from '@/stores/marketStore'
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

// ── Logic ───────────────────────────────────────────────────────────────────
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
} = useMarketTable(computed(() => marketStore.allStocks))

const activeColumns = computed(() => COLUMN_GROUPS[activeColumnTab.value])

onMounted(() => {
  if (marketStore.allStocks.length === 0) {
    marketStore.fetchFullMarket()
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
        :totalStocksCount="marketStore.allStocks.length"
        @prevPage="prevPage"
        @nextPage="nextPage"
        @setPage="setPage"
      />
    </div>
  </DashboardLayout>
</template>
