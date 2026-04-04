<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/marketStore'
import { usePortfolioStore } from '@/stores/portfolioStore'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import {
  ArrowLeft, TrendingUp, TrendingDown, Activity,
  BarChart3, Info, Globe,
  Building2, PieChart, DollarSign, Briefcase,
  LayoutPanelTop, Zap, Target,
  Wallet, Layers
} from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'

const route = useRoute()
const router = useRouter()
const marketStore = useMarketStore()
const portfolioStore = usePortfolioStore()
const symbol = computed(() => route.params.symbol)

const isLoading = ref(true)
const stockData = ref(null)
const error = ref(null)

// ── Portfolio Matching ──────────────────────────────────────────────────────
const userPosition = computed(() => {
  if (!portfolioStore.holdings || !stockData.value) return null
  const ticker = stockData.value.ticker.split('.')[0].toUpperCase()
  return portfolioStore.holdings.find(h =>
    (h.stocks?.ticker || '').toUpperCase().startsWith(ticker)
  )
})

const userTransactions = computed(() => {
  if (!portfolioStore.transactions || !stockData.value) return []
  const ticker = stockData.value.ticker.split('.')[0].toUpperCase()
  return portfolioStore.transactions.filter(t =>
    (t.stocks?.ticker || '').toUpperCase().startsWith(ticker)
  ).slice(0, 5)
})

// ── Data Resolution Logic ───────────────────────────────────────────────────
/**
* Resolves stock data by first checking the store's pre-fetched market list.
*/
const resolveStockData = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Ensure stores are populated
    const promises = []
    if (marketStore.allStocks.length === 0) promises.push(marketStore.fetchFullMarket())
    if (portfolioStore.holdings.length === 0) promises.push(portfolioStore.fetchPortfolio())
    if (promises.length > 0) await Promise.all(promises)

    // Robust matching for CSE tickers (e.g. TJL vs TJL.N0000)
    const tickerPrefix = symbol.value.split('.')[0].toUpperCase()
    const found = marketStore.allStocks.find(s => {
      const code = (s.code || '').toUpperCase()
      return code === symbol.value.toUpperCase() ||
        code === tickerPrefix ||
        code.startsWith(tickerPrefix + '.')
    })

    if (found) {
      stockData.value = {
        symbol: found.code,
        ticker: found.ticker || found.code,
        fullName: found.name || found.description,
        description: found.description,
        logo: found.logo,
        price: parseFloat(found.price || 0),
        change: parseFloat(found.change || 0),
        changePercent: parseFloat(found.percentageChange || found.changePct || found.changePercent || 0),
        high: parseFloat(found.high || 0),
        low: parseFloat(found.low || 0),
        open: parseFloat(found.open || 0),
        volume: found.volume || 0,
        marketCap: found.mktCap || 0,
        peRatio: found.peRatio || 0,
        dividendYield: found.divYield || '0.00%',
        sector: found.sector || 'N/A',
        rsi: found.rsi || 0,
        ema20: found.ema20 || 0,
        recommendation: found.recommendation || 0,
        // Performance metrics
        perf1w: found.perf1w || '0.00%',
        perf1m: found.perf1m || '0.00%',
        perf3m: found.perf3m || '0.00%',
        perf6m: found.perf6m || '0.00%',
        perfYtd: found.perfYtd || '0.00%',
        perf1y: found.perf1y || '0.00%',
        // Fundamentals
        eps: found.eps || 0,
        revenue: found.revenue || 0,
        netIncome: found.netIncome || 0,
        roe: found.roe || 'N/A'
      }
      generateChartData()
    } else {
      await marketStore.fetchStockDetailFromTV(symbol.value)
      if (marketStore.stockDetail) {
        stockData.value = marketStore.stockDetail
        generateChartData()
      } else {
        throw new Error(`Terminal could not synchronize ${symbol.value} with active session.`)
      }
    }
  } catch (err) {
    console.error('Resolution Error:', err)
    error.value = err.message || "Failed to synchronize local stock data."
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (val) => marketStore.formatCurrency(val)

const getRecommendationText = (val) => {
  if (val > 0.5) return 'Strong Buy'
  if (val > 0.1) return 'Buy'
  if (val < -0.5) return 'Strong Sell'
  if (val < -0.1) return 'Sell'
  return 'Neutral'
}
// ── Chart Logic ───────────────────────────────────────────────────────────── 
const chartSeries = ref([{ name: 'Price', data: [] }])
const generateChartData = () => {
  if (!stockData.value) return;

  const currentPrice = stockData.value.price
  const change = stockData.value.change || 0
  const prevClose = currentPrice - change

  // Generate a realistic looking intraday path
  const points = 20
  const data = []
  let lastPrice = prevClose

  for (let i = 0; i < points - 1; i++) {
    const volatility = Math.abs(change) * 0.5
    const movement = (Math.random() - 0.48) * volatility // Slight upward bias if positive 
    lastPrice += movement
    data.push(parseFloat(lastPrice.toFixed(2)))
  }
  data.push(currentPrice)
  chartSeries.value[0].data = data
}
const chartOptions = computed(() => ({
  chart: { type: 'area', height: 350, toolbar: { show: false }, background: 'transparent', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  stroke: { curve: 'smooth', width: 3, colors: [stockData.value?.change >= 0 ? '#10b981' : '#f43f5e'] },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100], colorStops: [{ offset: 0, color: stockData.value?.change >= 0 ? '#10b981' : '#f43f5e', opacity: 0.4 }, { offset: 100, color: 'transparent', opacity: 0 }] } },
  theme: { mode: 'dark' },
  xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { show: true, style: { colors: '#64748b', fontSize: '10px' }, formatter: (val) => val.toFixed(2) }, opposite: true },
  grid: { borderColor: 'rgba(255,255,255,0.03)', strokeDashArray: 4 },
  tooltip: { theme: 'dark', x: { show: false }, y: { formatter: (val) => `LKR ${val.toFixed(2)}` } },
  markers: { size: 0, hover: { size: 5 } }
}))


onMounted(() => {
  resolveStockData()
})

watch(() => symbol.value, () => resolveStockData())
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

      <div v-else-if="stockData" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <!-- Stock Header Card -->
        <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-xl">
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32"></div>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div class="flex items-center gap-5">
              <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                <img v-if="stockData.logo" :src="stockData.logo" class="w-10 h-10 object-contain" @error="stockData.logo = null" />
                <span v-else class="text-2xl font-black text-indigo-500">{{ stockData.symbol.charAt(0) }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-black text-white leading-tight">
                    {{ stockData.symbol.split('.')[0] }}
                  </h1>
                  <span class="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/10">Active</span>
                </div>
                <p class="text-slate-400 text-sm font-medium">{{ stockData.fullName }}</p>
                <div class="flex items-center gap-4 mt-2">
                  <span class="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <Building2 class="w-3 h-3 text-indigo-400" /> {{ stockData.sector }}
                  </span>
                  <span class="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-l border-white/10 pl-4">
                    <Globe class="w-3 h-3 text-emerald-400" /> Colombo Stock Exchange
                  </span>
                </div>
              </div>
            </div>

            <div class="text-left md:text-right border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <div class="flex items-baseline md:justify-end gap-2">
                <span class="text-xs font-bold text-slate-500">LKR</span>
                <span class="text-4xl font-black text-white font-mono tracking-tighter">{{ (stockData.price || 0).toFixed(2) }}</span>
              </div>
              <div class="flex items-center md:justify-end gap-2 mt-1">
                <div :class="stockData.change >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'" class="px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 border border-white/5">
                  <TrendingUp v-if="stockData.change >= 0" class="w-3 h-3" />
                  <TrendingDown v-else class="w-3 h-3" />
                  {{ (stockData.changePercent || 0).toFixed(2) }}%
                  <span class="opacity-50 font-medium ml-1">({{ stockData.change >= 0 ? '+' : '' }}{{ stockData.change.toFixed(2) }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Portfolio Intelligence Hub (Conditional) -->
        <div v-if="userPosition" class="bg-[#1e293b]/50 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
          <div class="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div class="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                <Wallet class="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 class="text-sm font-black text-white uppercase tracking-widest">Active Stake Detected</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Holding in Strategic Portfolio</p>
              </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full lg:w-auto">
              <div class="text-center lg:text-left">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Exposure</p>
                <p class="text-lg font-black text-white">{{ userPosition.quantity }} <span class="text-[10px] opacity-50">Units</span></p>
              </div>
              <div class="text-center lg:text-left">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cost Basis</p>
                <p class="text-lg font-black text-white font-mono">{{ formatCurrency(userPosition.avg_price) }}</p>
              </div>
              <div class="text-center lg:text-left">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Unrealized G/L</p>
                <p class="text-lg font-black font-mono" :class="userPosition.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ userPosition.profit >= 0 ? '+' : '' }}{{ formatCurrency(userPosition.profit) }}
                </p>
              </div>
              <div class="text-center lg:text-left">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Portfolio Weight</p>
                <p class="text-lg font-black text-white">{{ (userPosition.weight || 0).toFixed(2) }}%</p>
              </div>
            </div>

            <button @click="router.push('/portfolio')" class="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-xl text-[10px] font-black uppercase transition-all border border-indigo-500/20 group">
              Manage
              <ArrowLeft class="w-3 h-3 rotate-180 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <!-- Performance Statistics Pulse -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="perf in [
            { label: 'Weekly', val: stockData.perf1w },
            { label: 'Monthly', val: stockData.perf1m },
            { label: '3-Month', val: stockData.perf3m },
            { label: '6-Month', val: stockData.perf6m },
            { label: 'YTD', val: stockData.perfYtd },
            { label: '1-Year', val: stockData.perf1y },
          ]" :key="perf.label" class="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center group hover:bg-white/[0.05] transition-all">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 mb-2">{{ perf.label }}</p>
            <p class="text-sm font-black font-mono" :class="parseFloat(perf.val) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ parseFloat(perf.val) > 0 ? '+' : '' }}{{ perf.val }}
            </p>
          </div>
        </div>

        <!-- Main Content Configuration -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Analytics & Technicals -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span class="text-[8px] font-black text-slate-400 uppercase">Live Path</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                  <BarChart3 class="w-4 h-4 text-indigo-500" />
                  <h2 class="text-xs font-black text-white uppercase tracking-widest">Intraday Momentum Intelligence</h2>
                </div>
              </div>
              <div class="h-64 sm:h-80">
                <VueApexCharts :options="chartOptions" :series="chartSeries" height="100%" />
              </div>
            </div>

            <!-- Company Intelligence Biography -->
            <div v-if="stockData.description" class="bg-[#151c2c] border border-white/5 rounded-3xl p-6">
              <h2 class="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info class="w-4 h-4 text-blue-400" /> Company Intelligence
              </h2>
              <p class="text-xs leading-relaxed text-slate-400 font-medium">
                {{ stockData.description }}
              </p>
            </div>

            <!-- Financial Summary Pulse -->
            <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6 overflow-hidden">
              <h2 class="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <LayoutPanelTop class="w-4 h-4 text-amber-500" /> Financial Intelligence (TTM)
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="fin in [
                  { label: 'Revenue', value: formatCurrency(stockData.revenue), icon: TrendingUp },
                  { label: 'Net Income', value: formatCurrency(stockData.netIncome), icon: DollarSign },
                  { label: 'EPS', value: (stockData.eps || 0).toFixed(2), icon: Zap },
                  { label: 'ROE', value: stockData.roe || 'N/A', icon: Target }
                ]" :key="fin.label" class="bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">{{ fin.label }}</p>
                    <component :is="fin.icon" class="w-3 h-3 text-slate-600" />
                  </div>
                  <p class="text-md font-black text-white font-mono tracking-tight">{{ fin.value }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Valuation & Technical Indicators -->
          <div class="space-y-6">
            <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6">
              <h2 class="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <PieChart class="w-4 h-4 text-emerald-500" /> Market Valuation
              </h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-white/5">
                  <div class="flex items-center gap-2">
                    <DollarSign class="w-3.5 h-3.5 text-slate-500" />
                    <span class="text-[11px] font-bold text-slate-400">Market Capitalization</span>
                  </div>
                  <span class="text-sm font-black text-white font-mono">{{ formatCurrency(stockData.marketCap) }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-white/5">
                  <div class="flex items-center gap-2">
                    <TrendingUp class="w-3.5 h-3.5 text-slate-500" />
                    <span class="text-[11px] font-bold text-slate-400">Price/Earnings (P/E)</span>
                  </div>
                  <span class="text-sm font-black text-white font-mono">{{ typeof stockData.peRatio === 'number' ? stockData.peRatio.toFixed(2) : stockData.peRatio }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-white/5">
                  <div class="flex items-center gap-2">
                    <Activity class="w-3.5 h-3.5 text-slate-500" />
                    <span class="text-[11px] font-bold text-slate-400">Dividend Yield</span>
                  </div>
                  <span class="text-sm font-black text-white font-mono">{{ stockData.dividendYield }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <div class="flex items-center gap-2">
                    <Briefcase class="w-3.5 h-3.5 text-slate-500" />
                    <span class="text-[11px] font-bold text-slate-400">Market Sentiment</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full animate-pulse" :class="stockData.recommendation > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'"></div>
                    <span class="text-[10px] font-black uppercase tracking-widest" :class="stockData.recommendation > 0 ? 'text-emerald-500' : 'text-rose-500'">{{ getRecommendationText(stockData.recommendation) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Technical Analysis Card -->
            <div class="bg-[#151c2c] border border-white/5 rounded-3xl p-6">
              <h2 class="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity class="w-4 h-4 text-indigo-400" /> Technical Oscillators
              </h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">RSI (14-Day)</p>
                  <p class="text-xl font-black font-mono" :class="stockData.rsi > 70 ? 'text-rose-400' : (stockData.rsi < 30 ? 'text-emerald-400' : 'text-slate-200')">{{ stockData.rsi ? stockData.rsi.toFixed(2) : 'N/A' }}</p>
                  <div class="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-indigo-500" :style="{ width: stockData.rsi + '%' }"></div>
                  </div>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">EMA (20-Day)</p>
                  <p class="text-xl font-black font-mono text-white">{{ stockData.ema20 ? stockData.ema20.toFixed(2) : 'N/A' }}</p>
                  <div class="flex items-center gap-1 mt-2">
                    <div class="w-1.5 h-1.5 rounded-full" :class="stockData.price > stockData.ema20 ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                    <span class="text-[8px] font-black uppercase tracking-tighter" :class="stockData.price > stockData.ema20 ? 'text-emerald-500' : 'text-rose-500'">{{ stockData.price > stockData.ema20 ? 'Bullish' : 'Bearish' }}</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <div class="flex items-start gap-2">
                  <Zap class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p class="text-[10px] text-slate-400 leading-relaxed font-bold italic">
                    Price is navigating {{ stockData.price > stockData.ema20 ? 'above' : 'below' }} its 20-day trendline. Market momentum suggests a {{ stockData.price > stockData.ema20 ? 'constructive' : 'defensive' }} relative bias.
                  </p>
                </div>
              </div>
            </div>

            <!-- Recent Institutional Transactions (Mockup or if available) -->
            <div v-if="userTransactions.length > 0" class="bg-[#151c2c] border border-white/5 rounded-3xl p-6">
              <h2 class="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers class="w-4 h-4 text-amber-500" /> Recent Activity
              </h2>
              <div class="space-y-3">
                <div v-for="t in userTransactions" :key="t.id" class="flex items-center justify-between text-[10px] bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  <div class="flex items-center gap-2">
                    <span :class="t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'" class="px-1.5 py-0.5 rounded font-black text-[8px] uppercase border border-white/5">{{ t.type }}</span>
                    <span class="text-slate-400 font-bold">{{ new Date(t.date).toLocaleDateString() }}</span>
                  </div>
                  <span class="text-white font-black font-mono">@{{ t.unit_price.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row: High-Intensity Market Telemetry -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
          <div v-for="item in [
            { label: 'Intraday Peak', value: stockData.high, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Intraday Valley', value: stockData.low, icon: TrendingDown, color: 'text-rose-500' },
            { label: 'Opening Quote', value: stockData.open, icon: Globe, color: 'text-blue-500' },
            { label: 'Liquidity (Vol)', value: formatCurrency(stockData.volume), icon: Activity, color: 'text-amber-500' }
          ]" :key="item.label" class="bg-[#151c2c] border border-white/5 p-5 rounded-2xl group hover:border-white/10 transition-colors">
            <div class="flex items-center justify-between mb-3">
              <span class="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">{{ item.label }}</span>
              <component :is="item.icon" class="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" :class="item.color" />
            </div>
            <p class="text-2xl font-black text-white font-mono tracking-tighter">{{ typeof item.value === 'number' ? item.value.toFixed(2) : item.value }}</p>
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
