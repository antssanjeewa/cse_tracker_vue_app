<script setup>
import { ref, onMounted, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Clock, 
  RefreshCw, 
  Maximize2,
  Filter,
  LayoutGrid,
  Loader2,
  ExternalLink
} from 'lucide-vue-next'

const selectedInterval = ref('30m')
const selectedTime = ref('10:30-11:00')
const isLoading = ref(true)

const timeIntervals = [
  '09:30-10:00', '10:00-10:30', '10:30-11:00', '11:00-11:30', 
  '11:30-12:00', '12:00-12:30', '12:30-13:00', '13:00-13:30', '13:30-14:00'
]

const stats = ref([
  { label: 'Market Turnover', value: '0.00', subValue: 'Loading...', icon: RefreshCw },
  { label: 'ASPI', value: '0.00', subValue: '0.00%', icon: Activity },
  { label: 'Listed Companies', value: '0', subValue: 'Market Stats', icon: Users },
  { label: 'Market Trades', value: '0', subValue: 'Live', icon: Clock },
])

const treemapSeries = ref([{ name: 'Turnover', data: [] }])
const treemapOptions = ref({
  chart: { 
    type: 'treemap', 
    toolbar: { show: false }, 
    background: 'transparent',
    animations: { enabled: true }
  },
  theme: { mode: 'dark' },
  colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],
  plotOptions: { 
    treemap: { 
      distributed: true, 
      enableShades: false 
    } 
  },
  dataLabels: { 
    enabled: true, 
    style: { fontSize: '12px', fontWeight: 'bold' },
    offsetY: -4
  },
  grid: { padding: { left: 0, right: 0 } },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => formatCurrency(val)
    }
  }
})

// ASPI Movers Series
const horizontalBarSeries = ref([{ data: [] }])
const horizontalBarOptions = ref({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 2, barHeight: '70%' } },
  colors: ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#ef4444', '#ef4444', '#ef4444'],
  dataLabels: { enabled: true, formatter: (val) => val.toFixed(2), offsetX: 0, style: { fontSize: '10px' } },
  xaxis: { categories: [], labels: { show: false } },
  grid: { show: false }
})

// Divergence (Static for now as API might not exist)
const divergenceOptions = ref({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  plotOptions: { bar: { colors: { ranges: [{ from: -200, to: 0, color: '#ef4444' }, { from: 1, to: 200, color: '#10b981' }] } } },
  xaxis: { categories: ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'], labels: { style: { fontSize: '9px' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)' }
})
const divergenceSeries = ref([{ name: 'Divergence', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }])

// ASPI Movement chart options
const lineOptions = ref({
  chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  stroke: { curve: 'smooth', width: 2, colors: ['#ef4444'] },
  xaxis: { categories: ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30'], labels: { style: { fontSize: '9px' } } },
  markers: { size: 4, colors: ['#ef4444'], strokeColors: '#0b0f1a', strokeWidth: 2 },
  grid: { borderColor: 'rgba(255,255,255,0.05)' }
})
const lineSeries = ref([{ name: 'ASPI', data: [0, 0, 0, 0, 0, 0] }])

// Session Turnover chart options
const sessionOptions = ref({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  colors: ['rgba(255,255,255,0.2)'],
  plotOptions: { bar: { borderRadius: 2, columnWidth: '60%' } },
  xaxis: { categories: ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30'], labels: { style: { fontSize: '9px' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)' }
})
const sessionSeries = ref([{ name: 'Turnover', data: [0, 0, 0, 0, 0, 0] }])

const activeTab = ref('TOP T/O')
const gainers = ref([])
const losers = ref([])
const topTo = ref([])

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    const commonHeaders = { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    }
    const postBody = ''

    // Helper for safe fetching
    const safeFetch = async (url) => {
      try {
        const res = await fetch(url, { method: 'POST', headers: commonHeaders, body: postBody })
        if (!res.ok) return null
        return await res.json()
      } catch (e) {
        console.warn(`Fetch failed for ${url}:`, e)
        return null
      }
    }

    // 1. Fetch Summary
    const summaryData = await safeFetch('/api/dailyMarketSummery')
    if (summaryData && Array.isArray(summaryData) && summaryData[0]?.[0]) {
      const latest = summaryData[0][0]
      const prev = summaryData[1]?.[0] || latest
      const asiChange = latest.asi - prev.asi
      const asiChangePct = prev.asi !== 0 ? (asiChange / prev.asi) * 100 : 0

      stats.value[0].value = formatCurrency(latest.marketTurnover)
      stats.value[0].subValue = `${formatNumber(latest.volumeOfTurnOverNumber)} VOL`
      stats.value[1].value = formatNumber(latest.asi)
      stats.value[1].subValue = (asiChangePct >= 0 ? '+' : '') + asiChangePct.toFixed(2) + '%'
      stats.value[2].value = (latest.listedCompanyNumber || 0).toString()
      stats.value[2].subValue = `${latest.tradeCompanyNumber} Active`
      stats.value[3].value = formatNumber(latest.marketTrades)
      stats.value[3].subValue = 'Total Trades'
    }

    // 2. Fetch Lists
    const [gainData, loseData, toData] = await Promise.all([
      safeFetch('/api/topGainers'),
      safeFetch('/api/topLooses'),
      safeFetch('/api/mostActiveTrades')
    ])

    if (gainData) gainers.value = Array.isArray(gainData) ? gainData : (gainData.reqTradeSummery || [])
    if (loseData) losers.value = Array.isArray(loseData) ? loseData : (loseData.reqTradeSummery || [])
    if (toData) topTo.value = Array.isArray(toData) ? toData : (toData.reqTradeSummery || [])

    // Update charts if data exists
    if (topTo.value.length > 0) {
      const mappedData = topTo.value.slice(0, 12).map(item => {
        let toValue = item.turnover || 0
        if (typeof toValue === 'string') {
          toValue = toValue.replace(/,/g, '')
        }
        const numericTO = parseFloat(toValue) || 0
        return {
          x: (item.symbol || '').split('.')[0],
          y: numericTO
        }
      })
      
      // Ensure we only update if we have actual values
      if (mappedData.some(d => d.y > 0)) {
        treemapSeries.value = [{
          name: 'Market Turnover',
          data: mappedData
        }]
      }
    }

    if (gainers.value.length > 0 || losers.value.length > 0) {
      const topG = gainers.value.slice(0, 5)
      const topL = losers.value.slice(0, 3)
      horizontalBarSeries.value = [{
        data: [...topG.map(i => i.changePercentage || 0), ...topL.map(i => i.changePercentage || 0)]
      }]
      horizontalBarOptions.value = {
        ...horizontalBarOptions.value,
        xaxis: { categories: [...topG.map(i => i.symbol.split('.')[0]), ...topL.map(i => i.symbol.split('.')[0])] }
      }
    }


  } catch (err) {
    console.error('Critical Dashboard Error:', err)
  } finally {
    isLoading.value = false
  }
}


const formatCurrency = (val) => {
  if (typeof val === 'string') val = val.replace(/,/g, '')
  const num = parseFloat(val) || 0
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  return num.toLocaleString()
}

const formatNumber = (val) => {
  if (typeof val === 'string') val = val.replace(/,/g, '')
  return (parseFloat(val) || 0).toLocaleString()
}

const activeStockData = computed(() => {
  if (activeTab.value === 'GAINERS') return gainers.value.slice(0, 10).map(i => ({ code: i.symbol, ltp: (i.price || 0).toFixed(2), to: formatCurrency(i.turnover || 0), chg: (i.changePercentage || 0).toFixed(2) + '%' }))
  if (activeTab.value === 'LOSERS') return losers.value.slice(0, 10).map(i => ({ code: i.symbol, ltp: (i.price || 0).toFixed(2), to: formatCurrency(i.turnover || 0), chg: (i.changePercentage || 0).toFixed(2) + '%' }))
  return topTo.value.slice(0, 10).map(i => ({ code: i.symbol, ltp: (i.price || 0).toFixed(2), to: formatCurrency(i.turnover), chg: i.tradeCount ? formatNumber(i.tradeCount) + ' trades' : 'N/A' }))
})


onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <DashboardLayout>
    <div class="flex h-[calc(100vh-64px)] overflow-hidden relative">
      <!-- Global Loading State -->
      <div v-if="isLoading" class="absolute inset-0 z-50 bg-[#0b0f1a]/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
        <div class="relative">
          <Loader2 class="w-16 h-16 text-indigo-500 animate-spin" />
          <div class="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
        </div>
        <p class="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Syncing Market Intelligence...</p>
      </div>

      <!-- Dashboard Sidebar: Time Selection -->
      <aside class="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col p-4 shrink-0 overflow-y-auto custom-scrollbar">
        <div class="mb-6">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Date</p>
          <div class="bg-slate-900 border border-white/5 p-2 rounded-lg flex items-center justify-between cursor-pointer">
            <span class="text-xs font-bold font-mono text-slate-300">2026-03-20</span>
            <RefreshCw class="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        <div class="mb-6">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Interval Turnover</p>
          <div class="grid grid-cols-2 gap-2">
            <button 
              @click="selectedInterval = '15m'"
              class="py-2 text-[10px] font-bold rounded-lg border border-white/5 transition-all"
              :class="selectedInterval === '15m' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-500'"
            >15m</button>
            <button 
              @click="selectedInterval = '30m'"
              class="py-2 text-[10px] font-bold rounded-lg border border-white/5 transition-all"
              :class="selectedInterval === '30m' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-500'"
            >30m</button>
          </div>
          <button @click="fetchDashboardData" class="w-full mt-2 py-2.5 bg-amber-600/20 text-amber-500 text-[10px] font-black rounded-lg border border-amber-500/20 uppercase tracking-widest hover:bg-amber-600/30 transition-all active:scale-95">
            LOAD DATA
          </button>
        </div>

        <div class="flex-1">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Periods</p>
          <div class="space-y-1">
            <button 
              v-for="time in timeIntervals" 
              :key="time"
              @click="selectedTime = time"
              class="w-full py-2.5 px-3 rounded-lg text-left text-[11px] font-bold border transition-all"
              :class="selectedTime === time 
                ? 'bg-amber-600/10 border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/5' 
                : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'"
            >
              {{ time }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Dashboard Main Area -->
      <div class="flex-1 bg-[#0b0f1a] p-4 overflow-y-auto custom-scrollbar">
        
        <!-- Summary Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div v-for="stat in stats" :key="stat.label" class="bg-[#151c2c] border border-white/5 p-4 rounded-xl relative hover:border-white/10 transition-colors">
            <p class="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-tighter">{{ stat.label }}</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-lg font-black text-white font-mono">{{ stat.value }}</h3>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5" :class="stat.subValue.includes('-') ? 'text-rose-500' : 'text-emerald-500'">
                {{ stat.subValue }}
              </span>
            </div>
            <div class="absolute top-2 right-2 p-1.5 opacity-10">
              <component :is="stat.icon" class="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-12 gap-4">
          
          <!-- Turnover Treemap -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <TrendingUp class="w-3.5 h-3.5 text-amber-500" />
                <h2 class="text-xs font-black text-white uppercase">Turnover (Top 10)</h2>
              </div>
              <div class="flex gap-1 shrink-0">
                <button class="p-1 px-2 text-[10px] bg-indigo-600 rounded text-white shadow-lg shadow-indigo-500/20"><LayoutGrid class="w-3 h-3"/></button>
                <button class="p-1 px-2 text-[10px] bg-white/5 rounded text-slate-500"><Maximize2 class="w-3 h-3"/></button>
              </div>
            </div>
            <div class="h-64 relative">
              <div v-if="treemapSeries[0].data.length === 0" class="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                No turnover data...
              </div>
              <VueApexCharts 
                v-else
                type="treemap" 
                :options="treemapOptions" 
                :series="treemapSeries" 
                :key="treemapSeries[0].data.length"
                height="100%" 
              />
            </div>
          </div>

          <!-- ASPI Movers -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xs font-black text-white uppercase flex items-center gap-2">
                <Activity class="w-3.5 h-3.5 text-emerald-500" /> ASPI Movers (%)
              </h2>
              <div class="flex gap-1 shrink-0">
                <button class="p-1 px-2 text-[10px] bg-white/5 rounded text-slate-500 hover:text-white transition-colors"><Maximize2 class="w-3 h-3"/></button>
              </div>
            </div>
            <div class="h-64">
              <VueApexCharts :options="horizontalBarOptions" :series="horizontalBarSeries" height="100%" />
            </div>
          </div>

          <!-- Stock Lists side table -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 rounded-xl flex flex-col overflow-hidden">
            <div class="flex border-b border-white/5 bg-slate-900/50 p-1">
              <button 
                v-for="tab in ['TOP T/O', 'GAINERS', 'LOSERS']" 
                :key="tab"
                @click="activeTab = tab"
                class="flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase tracking-widest"
                :class="activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'"
              >{{ tab }}</button>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar">
              <table class="w-full text-left">
                <thead class="bg-slate-900/30 text-[9px] font-bold text-slate-500 sticky top-0 uppercase">
                  <tr>
                    <th class="p-2">CODE</th>
                    <th class="p-2 text-right">PRICE</th>
                    <th class="p-2 text-right">T/O</th>
                    <th class="p-2 text-right">CHG / TRADES</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5 font-mono">
                  <tr v-for="stock in activeStockData" :key="stock.code" class="hover:bg-white/5 transition-colors">
                    <td class="p-2 text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1 transition-colors">
                      {{ stock.code.split('.')[0] }}
                    </td>
                    <td class="p-2 text-[10px] font-black text-right text-slate-100">{{ stock.ltp }}</td>
                    <td class="p-2 text-[10px] font-bold text-right text-slate-400 font-mono">{{ stock.to }}</td>
                    <td class="p-2 text-[10px] font-bold text-right" :class="stock.chg.includes('-') ? 'text-rose-500' : 'text-emerald-500'">{{ stock.chg }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bottom Row: T/O Divergence, ASPI Movement, Session Turnover -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <h2 class="text-[10px] font-black text-white uppercase mb-4 flex items-center justify-between">
               T/O Divergence (Avg) - Avg 415.6M
               <Maximize2 class="w-3 h-3 text-slate-500" />
             </h2>
             <div class="h-48">
               <VueApexCharts :options="divergenceOptions" :series="divergenceSeries" height="100%" />
             </div>
          </div>

          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <h2 class="text-[10px] font-black text-white uppercase mb-4 flex items-center justify-between">
               ASPI Movement
               <Maximize2 class="w-3 h-3 text-slate-500" />
             </h2>
             <div class="h-48">
               <VueApexCharts :options="lineOptions" :series="lineSeries" height="100%" />
             </div>
          </div>

          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <h2 class="text-[10px] font-black text-white uppercase mb-4 flex items-center justify-between">
               Session Turnover
               <Maximize2 class="w-3 h-3 text-slate-500" />
             </h2>
             <div class="h-48">
               <VueApexCharts :options="sessionOptions" :series="sessionSeries" height="100%" />
             </div>
          </div>

        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
:deep(.apexcharts-tooltip) {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
  border-radius: 8px !important;
}
:deep(.apexcharts-tooltip-title) {
  background: rgba(255, 255, 255, 0.05) !important;
  font-size: 10px !important;
  padding: 4px 8px !important;
}
:deep(.apexcharts-text) {
  fill: #94a3b8 !important;
}
</style>
