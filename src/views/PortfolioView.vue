<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useMarketStore } from '@/stores/marketStore'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import { PortfolioStats, HoldingsTable, RecentTransactions, AddTransactionModal } from '@/features/portfolio'
import { Loader2, Plus, Info } from 'lucide-vue-next'

const portfolioStore = usePortfolioStore()
const marketStore = useMarketStore()
const isModalOpen = ref(false)
const filterType = ref('current') // 'all', 'current'

onMounted(async () => {
  await Promise.all([
    portfolioStore.fetchPortfolio(),
    portfolioStore.fetchProfile(),
    marketStore.fetchFullMarket()
  ])
})

const handleSaveTransaction = (data) => {
  console.log('Trade Executed:', data)
  // TODO: Add real persistence to portfolioStore
  isModalOpen.value = false
  // For demo/dev purposes, we could refresh the portfolio
  portfolioStore.fetchPortfolio()
}

const enrichedHoldings = computed(() => {
  let list = portfolioStore.holdings
  if (filterType.value === 'current') {
    list = list.filter(h => parseFloat(h.quantity) > 0)
  }

  return list.map(h => {
    const tickerPrefix = (h.stocks?.ticker || '').toUpperCase().split('.')[0]
    const marketStock = marketStore.allStocks.find(s =>
      (s.code || '').toUpperCase().split('.')[0] === tickerPrefix
    )

    const currentMarketPrice = parseFloat(marketStock?.close || marketStock?.price || h.avg_price)
    const avgPrice = parseFloat(h.avg_price || 0)
    const qty = parseFloat(h.quantity || 0)

    // Calculate live values
    const currentCost = qty * avgPrice
    const marketValue = qty * currentMarketPrice * 0.9888
    const liveProfit = marketValue - currentCost
    const liveRoi = currentCost > 0 ? (liveProfit / currentCost) * 100 : 0

    return {
      ...h,
      market_price: currentMarketPrice,
      marketValue,
      liveProfit,
      liveRoi
    }
  })
})
</script>

<template>
  <DashboardLayout>
    <div class="p-6 max-w-[1600px] mx-auto min-h-screen bg-[#0c1221]">
      <!-- Header -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div class="flex flex-col">
          <h1 class="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3 italic">
            <span class="text-indigo-500 font-black px-1.5 py-0.5 rounded-lg border-2 border-indigo-500 not-italic">P</span>
            MY PORTFOLIO
          </h1>
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {{ filterType === 'current' ? 'Active Trading Positions' : 'Full Portfolio History' }}
            ({{ enrichedHoldings.length }} items)
          </p>
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto">
          <button @click="isModalOpen = true" class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-indigo-600/20 active:translate-y-0.5">
            <Plus class="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="portfolioStore.isLoading" class="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 class="w-12 h-12 text-indigo-500 animate-spin" />
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Scanning Supabase Database...</span>
      </div>

      <div v-else-if="portfolioStore.error" class="p-12 text-center bg-rose-500/5 border border-rose-500/10 rounded-3xl">
        <Info class="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 class="text-lg font-black text-white uppercase mb-2">Sync Error</h3>
        <p class="text-xs font-bold text-rose-400 uppercase tracking-tight">{{ portfolioStore.error }}</p>
        <button @click="portfolioStore.fetchPortfolio()" class="mt-6 px-8 py-2 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-500">
          TRY AGAIN
        </button>
      </div>

      <div v-else>
        <!-- Stats Row -->
        <PortfolioStats :equity="portfolioStore.totalEquity" :profit="portfolioStore.totalProfit" :cash="portfolioStore.cashBalance" :totalDividends="portfolioStore.totalDividends" :netWorth="portfolioStore.netWorth" />

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Main Holdings Table -->
          <div class="xl:col-span-2">
            <HoldingsTable :holdings="enrichedHoldings" v-model:view="filterType" @addTransaction="isModalOpen = true" />
          </div>

          <!-- Recent Transactions Sidebar -->
          <div class="xl:col-span-1">
            <RecentTransactions :transactions="portfolioStore.transactions.slice(0, 8)" />
          </div>
        </div>
      </div>

      <!-- Modals -->
      <AddTransactionModal :is-open="isModalOpen" @close="isModalOpen = false" @save="handleSaveTransaction" />
    </div>
  </DashboardLayout>
</template>
