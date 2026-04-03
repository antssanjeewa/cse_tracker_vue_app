<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import { 
  TrendingUp, 
  Activity, 
  Maximize2,
  LayoutGrid,
  Loader2
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'
import { useMarketStore } from '@/stores/marketStore'
import MarketStatCard from '@/components/molecules/MarketStatCard.vue'
import { 
  DashboardSidebar, 
  MiniStockTable, 
  useDashboardCharts 
} from '@/features/dashboard'

const marketStore = useMarketStore()
const selectedInterval = ref('30m')
const selectedTime = ref('10:30-11:00')
const activeTab = ref('TOP T/O')

const timeIntervals = [
  '09:30-10:00', '10:00-10:30', '10:30-11:00', '11:00-11:30', 
  '11:30-12:00', '12:00-12:30', '12:30-13:00', '13:00-13:30', '13:30-14:00'
]

const {
  treemapSeries,
  treemapOptions,
  horizontalBarSeries,
  horizontalBarOptions
} = useDashboardCharts(marketStore)

const activeStockData = computed(() => {
  const list = activeTab.value === 'GAINERS' ? marketStore.gainers : (activeTab.value === 'LOSERS' ? marketStore.losers : marketStore.topTo)
  return list.slice(0, 10).map(i => ({
    code: i.symbol,
    ltp: (i.price || 0).toFixed(2),
    to: marketStore.formatCurrency(i.turnover || 0),
    chg: activeTab.value === 'TOP T/O' ? (i.tradeCount ? marketStore.formatNumber(i.tradeCount) + ' trades' : 'N/A') : (i.changePercentage || 0).toFixed(2) + '%'
  }))
})

onMounted(() => {
  marketStore.fetchDashboardData()
})
</script>

<template>
  <DashboardLayout>
    <div class="flex h-[calc(100vh-64px)] overflow-hidden relative">
      <!-- Global Loading State -->
      <div v-if="marketStore.isLoading" class="absolute inset-0 z-50 bg-[#0b0f1a]/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
        <Loader2 class="w-16 h-16 text-indigo-500 animate-spin" />
        <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest">Syncing Market Intelligence...</p>
      </div>

      <DashboardSidebar 
        v-model:selectedInterval="selectedInterval"
        v-model:selectedTime="selectedTime"
        :timeIntervals="timeIntervals"
        @refresh="marketStore.fetchDashboardData"
      />

      <div class="flex-1 bg-[#0b0f1a] p-4 overflow-y-auto">
        <!-- Summary Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <MarketStatCard 
            v-for="stat in marketStore.stats" 
            :key="stat.label" 
            :label="stat.label" 
            :value="stat.value" 
            :sub-value="stat.subValue" 
            :icon-name="stat.icon" 
          />
        </div>

        <div class="grid grid-cols-12 gap-4">
          <!-- Turnover Treemap -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <div class="flex items-center justify-between mb-4">
                <h2 class="text-xs font-black text-white uppercase flex items-center gap-2"><TrendingUp class="w-3.5 h-3.5 text-amber-500" /> Turnover (Top 10)</h2>
                <div class="flex gap-1"><button class="p-1 px-2 text-[10px] bg-indigo-600 rounded text-white"><LayoutGrid class="w-3 h-3"/></button></div>
             </div>
             <div class="h-64">
                <VueApexCharts type="treemap" :options="treemapOptions" :series="treemapSeries" :key="treemapSeries[0].data.length" height="100%" />
             </div>
          </div>

          <!-- ASPI Movers -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <h2 class="text-xs font-black text-white uppercase flex items-center gap-2 mb-4"><Activity class="w-3.5 h-3.5 text-emerald-500" /> ASPI Movers (%)</h2>
             <div class="h-64">
                <VueApexCharts type="bar" :options="horizontalBarOptions" :series="horizontalBarSeries" height="100%" />
             </div>
          </div>

          <!-- Stock Side Table -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 rounded-xl flex flex-col overflow-hidden">
            <div class="flex border-b border-white/5 bg-slate-900/50 p-1">
              <button v-for="tab in ['TOP T/O', 'GAINERS', 'LOSERS']" :key="tab" @click="activeTab = tab"
                class="flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase"
                :class="activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'">{{ tab }}</button>
            </div>
            <MiniStockTable :stocks="activeStockData" :active-tab="activeTab" />
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
