<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Maximize2,
  LayoutGrid,
  Loader2
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'
import { useMarketStore } from '../stores/marketStore'
import MarketStatCard from '../components/molecules/MarketStatCard.vue'
import MiniStockTable from '../components/organisms/MiniStockTable.vue'

const marketStore = useMarketStore()
const selectedInterval = ref('30m')
const selectedTime = ref('10:30-11:00')
const activeTab = ref('TOP T/O')

const timeIntervals = [
  '09:30-10:00', '10:00-10:30', '10:30-11:00', '11:00-11:30', 
  '11:30-12:00', '12:00-12:30', '12:30-13:00', '13:00-13:30', '13:30-14:00'
]

// Treemap logic
const treemapSeries = computed(() => {
  if (marketStore.topTo.length === 0) return [{ name: 'Turnover', data: [] }]
  return [{
    name: 'Market Turnover',
    data: marketStore.topTo.slice(0, 12).map(item => ({
      x: (item.symbol || '').split('.')[0],
      y: parseFloat(String(item.turnover || 0).replace(/,/g, '')) || 0
    }))
  }]
})

const treemapOptions = {
  chart: { type: 'treemap', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],
  plotOptions: { treemap: { distributed: true, enableShades: false } },
  dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 'bold' } },
  tooltip: { theme: 'dark', y: { formatter: (val) => marketStore.formatCurrency(val) } }
}

// Top Movers logic
const horizontalBarSeries = computed(() => {
  const topG = marketStore.gainers.slice(0, 5)
  const topL = marketStore.losers.slice(0, 3)
  return [{
    data: [...topG.map(i => i.changePercentage || 0), ...topL.map(i => i.changePercentage || 0)]
  }]
})

const horizontalBarOptions = computed(() => {
  const topG = marketStore.gainers.slice(0, 5)
  const topL = marketStore.losers.slice(0, 3)
  return {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: 'dark' },
    plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 2, barHeight: '70%' } },
    colors: ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#ef4444', '#ef4444', '#ef4444'],
    xaxis: { categories: [...topG.map(i => i.symbol.split('.')[0]), ...topL.map(i => i.symbol.split('.')[0])], labels: { show: false } },
    grid: { show: false }
  }
})

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

      <aside class="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col p-4 shrink-0 overflow-y-auto hidden md:flex">
        <div class="mb-6">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Interval Selection</p>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="int in ['15m', '30m']" :key="int" @click="selectedInterval = int" 
              class="py-2 text-[10px] font-bold rounded-lg border border-white/5 transition-all"
              :class="selectedInterval === int ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'">{{ int }}</button>
          </div>
          <button @click="marketStore.fetchDashboardData" class="w-full mt-2 py-2.5 bg-amber-600/20 text-amber-500 text-[10px] font-black rounded-lg border border-amber-500/20 uppercase tracking-widest">LOAD DATA</button>
        </div>

        <div class="flex-1">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Trading Periods</p>
          <div class="space-y-1">
            <button v-for="time in timeIntervals" :key="time" @click="selectedTime = time"
              class="w-full py-2.5 px-3 rounded-lg text-left text-[11px] font-bold border transition-all"
              :class="selectedTime === time ? 'bg-amber-600/10 border-amber-500/30 text-amber-500' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'">
              {{ time }}
            </button>
          </div>
        </div>
      </aside>

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
