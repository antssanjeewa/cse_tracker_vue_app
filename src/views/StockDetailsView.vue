<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Info,
  ExternalLink,
  Globe,
  Building2,
  PieChart,
  DollarSign,
  Briefcase,
  LayoutPanelTop
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'

const route = useRoute()
const router = useRouter()
const symbol = computed(() => route.params.symbol)
const isLoading = ref(true)
const stockData = ref(null)
const error = ref(null)

const fetchStockDetails = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await fetch('/tv-api/screener-facade/api/v1/screener-table/scan?table_id=stocks_market_movers.all_stocks&version=54&market=srilanka&columnset_id=overview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symbols: {
          tickers: [`CSELK:${symbol.value}`],
          query: { types: [] }
        },
        columns: [
          "name",
          "close",
          "change",
          "volume",
          "market_cap_basic",
          "price_earnings_ttm",
          "earnings_per_share_basic_ttm",
          "dividend_yield_recent",
          "sector",
          "RSI",
          "EMA20",
          "description",
          "logoid",
          "open",
          "high",
          "low",
          "change_abs",
          "change_percent"
        ]
      })
    })

    if (!response.ok) {
       const errorText = await response.text()
       throw new Error(`API Error (${response.status}): ${errorText.substring(0, 100)}`)
    }
    
    const result = await response.json()
    if (result.data && result.data.length > 0) {
      // Map TradingView data structure
      const data = {}
      result.data.forEach((col) => {
        data[col.id] = col.rawValues[0]
      })
      
      stockData.value = {
        symbol: symbol.value,
        fullName: data.description || symbol.value,
        logo: data.logoid ? `https://s3-symbol-logo.tradingview.com/${data.logoid}.svg` : null,
        price: data.close || 0,
        change: data.change_abs || 0,
        changePercent: data.change || data.change_percent || 0,
        high: data.high || 0,
        low: data.low || 0,
        open: data.open || 0,
        volume: data.volume || 0,
        marketCap: data.market_cap_basic || 0,
        peRatio: data.price_earnings_ttm || 'N/A',
        dividendYield: data.dividend_yield_recent ? data.dividend_yield_recent.toFixed(2) + '%' : 'N/A',
        sector: data.sector || 'Unknown',
        industry: data.industry || 'Unknown',
        eps: data.earnings_per_share_basic_ttm || 0,
        rsi: data.RSI || 0,
        ema20: data.EMA20 || 0,
        recommendation: data['Recommend.All'] || 0
      }
    } else {
      error.value = "Stock not found in TradingView database."
    }
  } catch (err) {
    console.error('Error fetching stock details:', err)
    error.value = "Failed to load stock data. Please try again later."
  } finally {
    isLoading.value = false
  }
}

const chartSeries = ref([
  {
    name: 'Price',
    data: [120, 122, 121, 125, 124, 128, 127, 130, 132, 131] // Simulated historical data
  }
])

const chartOptions = {
  chart: {
    type: 'area',
    height: 350,
    toolbar: { show: false },
    background: 'transparent',
    sparkline: { enabled: false }
  },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100, 100, 100]
    }
  },
  theme: { mode: 'dark' },
  colors: ['#3b82f6'],
  xaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: { labels: { show: true, style: { colors: '#94a3b8' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)' },
  tooltip: { theme: 'dark' }
}

const formatCurrency = (val) => {
  if (!val) return '0.00'
  if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B'
  if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M'
  return val.toLocaleString()
}

const getRecommendationText = (val) => {
  if (val > 0.5) return 'Strong Buy'
  if (val > 0.1) return 'Buy'
  if (val < -0.5) return 'Strong Sell'
  if (val < -0.1) return 'Sell'
  return 'Neutral'
}

onMounted(() => {
  fetchStockDetails()
})
</script>

<template>
  <DashboardLayout>
    <div class="p-6 max-w-7xl mx-auto space-y-6 bg-[#0b0f1a] min-h-screen">
      <!-- Top Navigation -->
      <div class="flex items-center justify-between mb-8">
        <button @click="router.back()" class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span class="text-xs font-bold uppercase tracking-widest">Back to Market</span>
        </button>
        <div class="flex items-center gap-2">
          <button class="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
            <Activity class="w-4 h-4" />
          </button>
          <button class="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <TrendingUp class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4 animate-pulse">
        <div class="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Gathering intelligence for {{ symbol }}...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl flex flex-col items-center gap-4 text-center">
        <div class="bg-rose-500/20 p-4 rounded-full">
          <Info class="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-white mb-2">Something went wrong</h2>
          <p class="text-slate-400 max-w-md">{{ error }}</p>
        </div>
        <button @click="fetchStockDetails" class="px-6 py-2 bg-rose-500 text-white rounded-lg font-bold text-sm hover:bg-rose-600 transition-colors">Retry Fetch</button>
      </div>

      <div v-else-if="stockData" class="space-y-6">
        <!-- Stock Header Card -->
        <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl">
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32"></div>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                <img v-if="stockData.logo" :src="stockData.logo" class="w-10 h-10 object-contain" @error="stockData.logo = null" />
                <span v-else class="text-2xl font-black text-indigo-500">{{ stockData.symbol.charAt(0) }}</span>
              </div>
              <div>
                <h1 class="text-2xl font-black text-white flex items-center gap-3">
                  {{ stockData.symbol.split('.')[0] }}
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase tracking-tighter">Listed</span>
                </h1>
                <p class="text-slate-400 text-sm font-medium">{{ stockData.fullName }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <span class="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <Building2 class="w-3 h-3" /> {{ stockData.sector }}
                  </span>
                  <span class="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <Globe class="w-3 h-3" /> Colombo Stock Exchange
                  </span>
                </div>
              </div>
            </div>

            <div class="text-left md:text-right">
              <div class="flex items-baseline md:justify-end gap-2">
                <span class="text-3xl font-black text-white font-mono">{{ stockData.price.toFixed(2) }}</span>
                <span class="text-xs font-bold text-slate-500">LKR</span>
              </div>
              <div class="flex items-center md:justify-end gap-2 mt-1">
                <div :class="stockData.change >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'" class="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <TrendingUp v-if="stockData.change >= 0" class="w-3 h-3" />
                  <TrendingDown v-else class="w-3 h-3" />
                  {{ stockData.changePercent.toFixed(2) }}%
                </div>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Left: Chart & Fundamentals -->
          <div class="md:col-span-2 space-y-6">
            <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                  <BarChart3 class="w-4 h-4 text-indigo-500" />
                  <h2 class="text-xs font-black text-white uppercase tracking-widest">Price Performance</h2>
                </div>
              </div>
              <div class="h-64 sm:h-80">
                <VueApexCharts :options="chartOptions" :series="chartSeries" height="100%" />
              </div>
            </div>

            <!-- Financial Summary Table -->
            <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6 overflow-hidden">
               <h2 class="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                 <LayoutPanelTop class="w-4 h-4 text-amber-500" /> Financial Intelligence (TTM)
               </h2>
               <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div v-for="fin in [
                    { label: 'Revenue', value: formatCurrency(stockData.revenue), color: 'text-indigo-400' },
                    { label: 'Net Income', value: formatCurrency(stockData.netIncome), color: 'text-emerald-400' },
                    { label: 'EPS', value: stockData.eps.toFixed(2), color: 'text-amber-400' },
                    { label: 'ROE', value: stockData.roe, color: 'text-rose-400' }
                  ]" :key="fin.label" class="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p class="text-[9px] font-bold text-slate-500 uppercase mb-1">{{ fin.label }}</p>
                    <p class="text-sm font-black text-white font-mono">{{ fin.value }}</p>
                  </div>
               </div>
            </div>
          </div>

          <!-- Right: Market Stats & Technicals -->
          <div class="space-y-6">
             <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6">
               <h2 class="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                 <PieChart class="w-4 h-4 text-emerald-500" /> Market Statistics
               </h2>
               <div class="space-y-4">
                 <div class="flex items-center justify-between py-2 border-b border-white/5">
                   <div class="flex items-center gap-2">
                     <DollarSign class="w-3.5 h-3.5 text-slate-500" />
                     <span class="text-[11px] font-bold text-slate-400">Market Cap</span>
                   </div>
                   <span class="text-sm font-black text-white font-mono">{{ formatCurrency(stockData.marketCap) }}</span>
                 </div>
                 <div class="flex items-center justify-between py-2 border-b border-white/5">
                   <div class="flex items-center gap-2">
                     <TrendingUp class="w-3.5 h-3.5 text-slate-500" />
                     <span class="text-[11px] font-bold text-slate-400">P/E Ratio</span>
                   </div>
                   <span class="text-sm font-black text-white font-mono">{{ typeof stockData.peRatio === 'number' ? stockData.peRatio.toFixed(2) : stockData.peRatio }}</span>
                 </div>
                 <div class="flex items-center justify-between py-2 border-b border-white/5">
                   <div class="flex items-center gap-2">
                     <Activity class="w-3.5 h-3.5 text-slate-500" />
                     <span class="text-[11px] font-bold text-slate-400">Div. Yield</span>
                   </div>
                   <span class="text-sm font-black text-white font-mono">{{ stockData.dividendYield }}</span>
                 </div>
                 <div class="flex items-center justify-between py-2">
                   <div class="flex items-center gap-2">
                     <Briefcase class="w-3.5 h-3.5 text-slate-500" />
                     <span class="text-[11px] font-bold text-slate-400">Recommendation</span>
                   </div>
                   <div class="flex items-center gap-1">
                     <div class="w-1.5 h-1.5 rounded-full" :class="stockData.recommendation > 0 ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                     <span class="text-[10px] font-black uppercase" :class="stockData.recommendation > 0 ? 'text-emerald-500' : 'text-rose-500'">{{ getRecommendationText(stockData.recommendation) }}</span>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Technical Analysis Card -->
             <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6">
               <h2 class="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Activity class="w-4 h-4 text-indigo-400" /> Technical Analysis
               </h2>
               <div class="grid grid-cols-2 gap-3">
                  <div class="bg-white/5 p-3 rounded-xl">
                    <p class="text-[9px] font-bold text-slate-500 uppercase mb-1">RSI (14)</p>
                    <p class="text-lg font-black text-white font-mono" :class="stockData.rsi > 70 ? 'text-rose-400' : (stockData.rsi < 30 ? 'text-emerald-400' : 'text-slate-200')">{{ stockData.rsi ? stockData.rsi.toFixed(2) : 'N/A' }}</p>
                  </div>
                  <div class="bg-white/5 p-3 rounded-xl">
                    <p class="text-[9px] font-bold text-slate-500 uppercase mb-1">EMA (20)</p>
                    <p class="text-lg font-black text-white font-mono" :class="stockData.price > stockData.ema20 ? 'text-emerald-400' : 'text-rose-400'">{{ stockData.ema20 ? stockData.ema20.toFixed(2) : 'N/A' }}</p>
                  </div>
               </div>
               <div class="mt-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                  <p class="text-[10px] text-slate-400 leading-relaxed italic">
                    The stock is trading {{ stockData.price > stockData.ema20 ? 'above' : 'below' }} its 20-day Exponential Moving Average.
                  </p>
               </div>
             </div>
          </div>
        </div>

        <!-- Bottom Row: Day Range & Volume -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div v-for="item in [
             { label: 'Day High', value: stockData.high, icon: TrendingUp, color: 'text-emerald-500' },
             { label: 'Day Low', value: stockData.low, icon: TrendingDown, color: 'text-rose-500' },
             { label: 'Open Price', value: stockData.open, icon: Globe, color: 'text-blue-500' },
             { label: 'Volume', value: formatCurrency(stockData.volume), icon: Activity, color: 'text-amber-500' }
           ]" :key="item.label" class="bg-[#151c2c] border border-white/5 p-5 rounded-2xl">
             <div class="flex items-center justify-between mb-2">
               <span class="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">{{ item.label }}</span>
               <component :is="item.icon" class="w-3.5 h-3.5 opacity-20" :class="item.color" />
             </div>
             <p class="text-lg font-black text-white font-mono">{{ typeof item.value === 'number' ? item.value.toFixed(2) : item.value }}</p>
           </div>
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
