<script setup>
import { onMounted, computed, ref } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import { 
  TrendingUp, TrendingDown, Activity, Zap, 
  AlertTriangle, ArrowUpRight, BarChart3, PieChart, 
  RefreshCcw, Info, Scale, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import MiniStockTable from '@/features/dashboard/components/MiniStockTable.vue'
import VueApexCharts from 'vue3-apexcharts'

const marketStore = useMarketStore()
const portfolioStore = usePortfolioStore()

// Pagination logic
const currentPage = ref(1)
const perPage = 10

// Tabs for Market Movers
const activeMoverTab = ref('gain')

// Sorting logic
const sortKey = ref('ticker')
const sortOrder = ref('asc')

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

// Current Time logic
const currentTime = ref(new Date())
setInterval(() => { currentTime.value = new Date() }, 1000)

const activeHoldings = computed(() => {
  const data = portfolioStore.holdings
    .filter(h => parseFloat(h.quantity) > 0)
    .map(h => {
      const tickerPrefix = h.stocks?.ticker || ''
      const marketStock = marketStore.allStocks.find(s => 
        s.code === tickerPrefix || s.code.startsWith(tickerPrefix + '.')
      )
      
      const openPrice = parseFloat(marketStock?.open || 0)
      const avgPrice = parseFloat(h.avg_price || 0)
      const qty = parseFloat(h.quantity || 0)
      const liveProfit = openPrice > 0 ? (openPrice - avgPrice) * qty : 0
      const liveRoi = avgPrice > 0 && openPrice > 0 ? ((openPrice - avgPrice) / avgPrice) * 100 : 0
      
      return {
        ...h,
        liveStock: marketStock || h.stocks,
        liveProfit,
        liveRoi
      }
    })

  // Apply Sorting
  return [...data].sort((a, b) => {
    let valA, valB
    if (sortKey.value === 'ticker') {
      valA = (a.liveStock?.ticker || '').toUpperCase()
      valB = (b.liveStock?.ticker || '').toUpperCase()
    } else if (sortKey.value === 'profit') {
      valA = a.liveProfit
      valB = b.liveProfit
    } else {
      valA = a[sortKey.value] || 0
      valB = b[sortKey.value] || 0
    }
    
    if (sortOrder.value === 'asc') return valA > valB ? 1 : -1
    return valA < valB ? 1 : -1
  })
})

const totalLiveProfit = computed(() => {
  return activeHoldings.value.reduce((sum, h) => sum + (h.liveProfit || 0), 0)
})

const totalLiveRoi = computed(() => {
  const totalCost = activeHoldings.value.reduce((sum, h) => sum + (parseFloat(h.quantity) * parseFloat(h.avg_price)), 0)
  return totalCost > 0 ? (totalLiveProfit.value / totalCost) * 100 : 0
})

const totalPagesCount = computed(() => Math.ceil(activeHoldings.value.length / perPage))

const paginatedHoldings = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return activeHoldings.value.slice(start, start + perPage)
})

const nextPage = () => { if (currentPage.value < totalPagesCount.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

onMounted(async () => {
  // Parallel fetch for speed
  await Promise.all([
    marketStore.fetchDashboardData(),
    marketStore.fetchFullMarket(),
    portfolioStore.fetchPortfolio()
  ])
})

const formatCurrency = (val) => marketStore.formatCurrency(val)

// ── Portfolio Insights ──────────────────────────────────────────────────────
const portfolioInsights = computed(() => {
  const insights = []
  
  // 1. Portfolio ROI vs ASPI
  const aspiStat = marketStore.stats.find(s => s.label === 'ASPI')
  const aspiChange = aspiStat ? parseFloat(aspiStat.subValue) : 0
  const portfolioReturn = (portfolioStore.totalProfit / (portfolioStore.totalEquity - portfolioStore.totalProfit) * 100)
  
  if (portfolioReturn > aspiChange) {
    insights.push({ type: 'success', icon: TrendingUp, title: 'Outperforming Market', desc: `Portfolio alpha is ${(portfolioReturn - aspiChange).toFixed(2)}% above ASPI.` })
  } else {
    insights.push({ type: 'warning', icon: AlertTriangle, title: 'Lagging ASPI', desc: `Portfolio is trailing the benchmark by ${(aspiChange - portfolioReturn).toFixed(2)}%.` })
  }

  // 2. Technical Health (RSI)
  portfolioStore.holdings.forEach(h => {
    const rsi = h.stocks?.rsi
    if (rsi < 30) insights.push({ type: 'info', icon: Zap, title: `Oversold: ${h.stocks?.ticker}`, desc: `RSI is ${rsi.toFixed(0)}, indicating a potential reversal.` })
    if (rsi > 70) insights.push({ type: 'warning', icon: AlertTriangle, title: `Overbought: ${h.stocks?.ticker}`, desc: `RSI is ${rsi.toFixed(0)}, risk of pullback.` })
  })

  return insights.slice(0, 4)
})

// ── Chart Data ───────────────────────────────────────────────────────────────
const chartOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: portfolioStore.holdings.map(h => h.stocks?.ticker || 'N/A'),
  theme: { mode: 'dark' },
  stroke: { show: false },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      expandOnClick: true,
      donut: { 
        size: '75%', 
        labels: { 
          show: true, 
          total: { 
            show: true, 
            label: 'TOTAL VALUE', 
            color: '#64748b', 
            fontSize: '9px', 
            fontWeight: 'bold',
            formatter: () => formatCurrency(portfolioStore.totalEquity)
          },
          value: {
            show: true,
            fontSize: '14px',
            fontWeight: '900',
            color: '#fff',
            formatter: (val) => formatCurrency(val)
          }
        } 
      }
    }
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val) => formatCurrency(val) }
  }
}))

const chartSeries = computed(() => portfolioStore.holdings.map(h => parseFloat(h.marketValue || 0)))
</script>

<template>
  <DashboardLayout>
    <div class="p-6 max-w-[1700px] mx-auto min-h-screen bg-[#0c1221] space-y-6 relative">
      
      <!-- Top Session Header: Clock & Meta -->
      <div class="flex items-center justify-between pb-2 border-b border-white/5">
         <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sessional Live Terminal</span>
         </div>
         <div class="flex items-center gap-4">
            <div class="text-right">
               <div class="text-xl font-black text-white italic tracking-tighter leading-none">{{ currentTime.toLocaleTimeString('en-LK', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}</div>
               <div class="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{{ currentTime.toLocaleDateString('en-GB') }}</div>
            </div>
         </div>
      </div>

      <!-- Top Row: Intelligence Terminal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- 1. Benchmark Monitoring -->
        <div class="bg-[#121a2c]/40 border border-white/5 p-6 rounded-3xl h-40">
           <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Index Performance</span>
              <Activity class="w-4 h-4 text-indigo-500" />
           </div>
           <div class="space-y-4">
              <div v-for="stat in marketStore.stats.slice(0, 2)" :key="stat.label" class="flex items-center justify-between">
                 <span class="text-xs font-bold text-slate-400 uppercase tracking-tight">{{ stat.label }}</span>
                 <div class="text-right">
                    <p class="text-base font-black text-white leading-none">{{ stat.value }}</p>
                    <p class="text-[9px] font-bold mt-1" :class="stat.subValue.includes('+') ? 'text-emerald-500' : 'text-rose-500'">{{ stat.subValue }}</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- 2. Portfolio Balance Matrix -->
        <div class="bg-[#1a2133] border border-white/5 p-6 rounded-3xl text-white relative shadow-2xl overflow-hidden group h-40">
           <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Portfolio Net Worth</span>
              <ExternalLink class="w-4 h-4 text-slate-500" />
           </div>
           <div class="flex flex-col">
              <h3 class="text-3xl font-black italic tracking-tighter text-white">{{ formatCurrency(portfolioStore.netWorth) }}</h3>
              <div class="grid grid-cols-2 gap-4 mt-3">
                 <div class="flex flex-col">
                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-tight">Total Return</span>
                    <span class="text-xs font-black" :class="totalLiveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                       {{ (totalLiveProfit >= 0 ? '+' : '') }}{{ formatCurrency(totalLiveProfit) }}
                    </span>
                 </div>
                 <div class="flex flex-col text-right">
                    <span class="text-[8px] font-black text-slate-500 uppercase tracking-tight">Return %</span>
                    <span class="text-xs font-black" :class="totalLiveRoi >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                       {{ totalLiveRoi.toFixed(2) }}%
                    </span>
                 </div>
              </div>
           </div>
           <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Activity class="w-24 h-24 text-indigo-500" /></div>
        </div>

        <!-- 3. Live Sentiment Pulse -->
        <div class="bg-[#121a2c]/40 border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-40">
           <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Breadth Pulse</span>
              <Scale class="w-4 h-4 text-slate-500" />
           </div>
           <div class="flex items-end justify-between mb-2">
              <div class="flex flex-col">
                 <span class="text-3xl font-black text-white italic tracking-tighter">{{ marketStore.breadthCount.advancers }}</span>
                 <span class="text-[9px] font-black text-emerald-500 uppercase">Advancers</span>
              </div>
              <div class="flex flex-col items-center">
                 <span class="text-xl font-black text-slate-400 italic tracking-tighter">{{ marketStore.breadthCount.unchanged }}</span>
                 <span class="text-[9px] font-black text-slate-500 uppercase">Unchanged</span>
              </div>
              <div class="flex flex-col items-end">
                 <span class="text-3xl font-black text-white italic tracking-tighter">{{ marketStore.breadthCount.decliners }}</span>
                 <span class="text-[9px] font-black text-rose-500 uppercase">Decliners</span>
              </div>
           </div>
           <div class="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
              <div class="bg-emerald-500" :style="{ width: (marketStore.breadthCount.advancers / marketStore.breadthCount.total * 100) + '%' }"></div>
              <div class="bg-slate-700" :style="{ width: (marketStore.breadthCount.unchanged / marketStore.breadthCount.total * 100) + '%' }"></div>
              <div class="bg-rose-500" :style="{ width: (marketStore.breadthCount.decliners / marketStore.breadthCount.total * 100) + '%' }"></div>
           </div>
           <p class="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-tight">
             Live Sentiment: {{ marketStore.breadthCount.advancers > marketStore.breadthCount.decliners ? 'BULLISH' : 'BEARISH' }}
           </p>
        </div>
      </div>

      <!-- Main Decision Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        <!-- Left: Investment Intelligence (8/12) -->
        <div class="xl:col-span-8 space-y-6">
           <div class="bg-[#121a2c]/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
              <div class="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <h2 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                   Portfolio Performance Analysis
                 </h2>
                 <span class="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 uppercase tracking-widest italic tracking-wider">LIVE SYSTEM MONITORING</span>
              </div>
              <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left font-mono">
                  <thead class="bg-indigo-950/20 text-[9px] font-black text-slate-500 uppercase border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th @click="toggleSort('ticker')" class="px-5 py-4 cursor-pointer hover:text-white transition-colors">
                         Stock {{ sortKey === 'ticker' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
                      </th>
                      <th @click="toggleSort('quantity')" class="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors">
                         Holdings {{ sortKey === 'quantity' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
                      </th>
                      <th @click="toggleSort('avg_price')" class="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors">
                         Avg Price {{ sortKey === 'avg_price' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
                      </th>
                      <th class="px-5 py-4 text-right">Total Cost</th>
                      <th class="px-5 py-4 text-right text-indigo-400">Market Open</th>
                      <th @click="toggleSort('profit')" class="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors">
                         Gain/Loss {{ sortKey === 'profit' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/5">
                    <tr v-for="h in paginatedHoldings" :key="h.id" class="hover:bg-white/5 transition-colors group">
                      <td class="px-5 py-4">
                        <div class="flex flex-col">
                          <span class="text-[11px] font-black text-white uppercase group-hover:text-indigo-400 transition-colors">{{ h.liveStock?.ticker || h.liveStock?.code || h.stocks?.ticker }}</span>
                          <span class="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{{ h.liveStock?.name || h.stocks?.name }}</span>
                        </div>
                      </td>
                      <td class="px-5 py-4 text-right text-[11px] font-bold text-slate-400">{{ h.quantity }}</td>
                      <td class="px-5 py-4 text-right text-[11px] font-bold text-slate-400">{{ formatCurrency(h.avg_price) }}</td>
                      <td class="px-5 py-4 text-right text-[11px] font-bold text-slate-400">{{ formatCurrency(h.quantity * h.avg_price) }}</td>
                      <td class="px-5 py-4 text-right text-[11px] font-black text-white">{{ formatCurrency(h.liveStock?.open || '0.00') }}</td>
                      <td class="px-5 py-4 text-right">
                         <div class="flex flex-col items-end">
                            <span class="text-[11px] font-black" :class="h.liveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                              {{ h.liveProfit >= 0 ? '+' : '' }}{{ formatCurrency(h.liveProfit) }}
                            </span>
                            <span class="text-[9px] font-bold" :class="h.liveProfit >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'">
                              {{ (h.liveRoi || 0).toFixed(2) }}%
                            </span>
                         </div>
                      </td>
                    </tr>
                    <tr v-if="activeHoldings.length === 0">
                      <td colspan="6" class="p-12 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">No active holdings found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Pagination -->
              <div v-if="totalPagesCount > 1" class="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div class="flex items-center gap-2">
                   <button @click="prevPage" :disabled="currentPage === 1" class="p-1 w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronLeft class="w-4 h-4" />
                   </button>
                   <div class="flex items-center gap-1">
                      <button v-for="p in totalPagesCount" :key="p" 
                         @click="currentPage = p"
                         class="w-8 h-8 rounded-lg text-[10px] font-black border transition-all"
                         :class="currentPage === p ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/[0.03] border-white/5 text-slate-500 hover:text-white hover:bg-white/5'"
                      >
                         {{ p }}
                      </button>
                   </div>
                   <button @click="nextPage" :disabled="currentPage === totalPagesCount" class="p-1 w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronRight class="w-4 h-4" />
                   </button>
                </div>
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Displaying {{ (currentPage-1)*perPage + 1 }} - {{ Math.min(currentPage*perPage, activeHoldings.length) }} of {{ activeHoldings.length }} Positions</span>
              </div>
           </div>
        </div>

        <!-- Right: Professional Intelligence Hub (4/12) -->
        <div class="xl:col-span-4 space-y-6">
           
           <!-- Tabbed Market Activity Terminal -->
           <div class="bg-[#121a2c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
              <div class="p-2 border-b border-white/5 flex items-center gap-1 bg-white/[0.02]">
                 <button v-for="tab in ['gain', 'loss', 'turnover']" :key="tab"
                    @click="activeMoverTab = tab"
                    class="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl"
                    :class="activeMoverTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:bg-white/5'"
                 >
                    {{ tab === 'turnover' ? 'Vol' : tab + 's' }}
                 </button>
              </div>
              <div class="flex-1 overflow-y-auto">
                 <MiniStockTable 
                    v-if="activeMoverTab === 'gain'" 
                    :stocks="marketStore.gainers.slice(0, 10)" 
                    type="gain" 
                 />
                 <MiniStockTable 
                    v-if="activeMoverTab === 'loss'" 
                    :stocks="marketStore.losers.slice(0, 10)" 
                    type="loss" 
                 />
                 <MiniStockTable 
                    v-if="activeMoverTab === 'turnover'" 
                    :stocks="marketStore.topTo.slice(0, 10)" 
                    type="default" 
                 />
              </div>
           </div>

           <!-- Diversification Index -->
           <div class="bg-[#121a2c] border border-white/5 p-6 rounded-3xl overflow-hidden">
              <div class="flex items-center justify-between mb-4">
                 <h2 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <PieChart class="w-4 h-4 text-indigo-400" />
                   Diversification
                 </h2>
                 <span class="text-[9px] font-black text-slate-600 uppercase">Sector Weighting</span>
              </div>
              <div class="flex items-center justify-center h-52 relative">
                 <div class="w-full">
                    <VueApexCharts v-if="portfolioStore.holdings.length > 0" type="donut" height="220" :options="chartOptions" :series="chartSeries" />
                    <div v-else class="h-full flex items-center justify-center opacity-20"><PieChart class="w-12 h-12" /></div>
                 </div>
              </div>
           </div>
        </div>

        </div>
      </div>
 
  </DashboardLayout>
</template>
