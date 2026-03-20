<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Filter, Search, ChevronDown, ChevronUp, RefreshCw, Trash2, Plus, Loader2 } from 'lucide-vue-next'
import { useMarketStore } from '../stores/marketStore'

const router      = useRouter()
const marketStore = useMarketStore()

// ── Column tab groups ─────────────────────────────────────────────────────────────────
const activeColumnTab = ref('daily')

const columnGroups = {
  daily: [
    { key: 'code',      label: 'Company',     align: '',            px: 'px-4' },
    { key: 'name',      label: 'Name',         align: '',            px: 'px-4' },
    { key: 'sector',    label: 'Sector',       align: '',            px: 'px-4' },
    { key: 'prevClose', label: 'Prev Close',   align: 'text-right',  px: 'px-4' },
    { key: 'open',      label: 'Open',         align: 'text-right',  px: 'px-2' },
    { key: 'high',      label: 'High',         align: 'text-right',  px: 'px-2', color: 'emerald' },
    { key: 'low',       label: 'Low',          align: 'text-right',  px: 'px-2', color: 'rose' },
    { key: 'close',     label: 'Close',        align: 'text-right',  px: 'px-2' },
    { key: 'change',    label: 'Change',       align: 'text-right',  px: 'px-4', highlight: true, colorByValue: true },
    { key: 'changePct', label: 'Change %',     align: 'text-center', px: 'px-4', colorByValue: true },
    { key: 'range',     label: 'Range',        align: '',            px: 'px-4' },
    { key: 'trades',    label: 'Trades',       align: 'text-right',  px: 'px-4' },
    { key: 'volume',    label: 'Volume',       align: 'text-right',  px: 'px-4' },
    { key: 'to',        label: 'Turnover',     align: 'text-right',  px: 'px-4', last: true },
  ],
  overview: [
    { key: 'code',      label: 'Company',     align: '',            px: 'px-4' },
    { key: 'name',      label: 'Name',         align: '',            px: 'px-4' },
    { key: 'sector',    label: 'Sector',       align: '',            px: 'px-4' },
    { key: 'close',     label: 'Close',        align: 'text-right',  px: 'px-2' },
    { key: 'change',    label: 'Change',       align: 'text-right',  px: 'px-4', highlight: true, colorByValue: true },
    { key: 'changePct', label: 'Change %',     align: 'text-center', px: 'px-4', colorByValue: true },
    { key: 'mktCap',    label: 'Mkt Cap',      align: 'text-right',  px: 'px-4' },
    { key: 'peRatio',   label: 'P/E Ratio',    align: 'text-right',  px: 'px-4' },
    { key: 'divYield',  label: 'Div Yield',    align: 'text-right',  px: 'px-4' },
    { key: 'to',        label: 'Turnover',     align: 'text-right',  px: 'px-4' },
    { key: 'rsi',       label: 'RSI',          align: 'text-right',  px: 'px-4', rsi: true, last: true },
  ],
  performance: [
    { key: 'code',           label: 'Company',  align: '',            px: 'px-4' },
    { key: 'name',           label: 'Name',      align: '',            px: 'px-4' },
    { key: 'close',          label: 'Close',     align: 'text-right',  px: 'px-2' },
    { key: 'changePct',      label: 'Today',     align: 'text-center', px: 'px-4', colorByValue: true },
    { key: 'perf1w',         label: '1 Week',    align: 'text-right',  px: 'px-4', colorByValue: true },
    { key: 'perf1m',         label: '1 Month',   align: 'text-right',  px: 'px-4', colorByValue: true },
    { key: 'perf3m',         label: '3 Months',  align: 'text-right',  px: 'px-4', colorByValue: true },
    { key: 'perf6m',         label: '6 Months',  align: 'text-right',  px: 'px-4', colorByValue: true },
    { key: 'perfYtd',        label: 'YTD',       align: 'text-right',  px: 'px-4', colorByValue: true },
    { key: 'perf1y',         label: '1 Year',    align: 'text-right',  px: 'px-4', colorByValue: true },
    { key: 'rsi',            label: 'RSI',       align: 'text-right',  px: 'px-4', rsi: true },
    { key: 'recommendation', label: 'Signal',    align: 'text-center', px: 'px-4', signal: true, last: true },
  ]
}

const activeColumns = computed(() => columnGroups[activeColumnTab.value])

// returns cell CSS class based on column meta + stock value
const cellClass = (col, stock) => {
  const val = stock[col.key]
  if (col.rsi) {
    const n = Number(val)
    return n > 70 ? 'text-rose-400' : n < 30 ? 'text-emerald-400' : 'text-slate-400'
  }
  if (col.signal) {
    const n = Number(val)
    return n > 0.2 ? 'text-emerald-400' : n < -0.2 ? 'text-rose-400' : 'text-slate-400'
  }
  if (col.colorByValue) {
    const n = parseFloat(String(val).replace(/[,%]/g, ''))
    return n < 0 ? 'text-rose-500' : 'text-emerald-500'
  }
  if (col.color === 'emerald') return 'text-emerald-500'
  if (col.color === 'rose')    return 'text-rose-500'
  if (col.key === 'code')      return 'text-amber-500'
  if (col.key === 'name')      return 'text-slate-300 uppercase'
  if (col.key === 'close')     return 'text-white font-black'
  if (col.key === 'to')        return 'text-amber-500'
  return 'text-slate-400'
}

// returns formatted display value for a cell
const cellValue = (col, stock) => {
  const val = stock[col.key]
  if (col.signal) {
    const n = Number(val)
    if (n >  0.5) return 'Strong Buy'
    if (n >  0.1) return 'Buy'
    if (n < -0.5) return 'Strong Sell'
    if (n < -0.1) return 'Sell'
    return 'Neutral'
  }
  if (col.rsi) return val ? Number(val).toFixed(1) : 'N/A'
  return val ?? 'N/A'
}

// ── Search ────────────────────────────────────────────────────────────────────
onMounted(() => {
  if (marketStore.allStocks.length === 0) marketStore.fetchFullMarket()
})

// ── Search ────────────────────────────────────────────────────────────────────
const searchQuery  = ref('')
const currentPage  = ref(1)
const itemsPerPage = ref(15)

import { watch } from 'vue'
watch([searchQuery, itemsPerPage], () => { currentPage.value = 1 })

const filteredStocks = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return marketStore.allStocks.filter(s =>
    s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  )
})

// ── Sorting ────────────────────────────────────────────────────────────────────
const sortKey = ref('')
const sortDir = ref('asc')

const columns = [
  { key: 'code',      label: 'Company',      align: '',            px: 'px-4' },
  { key: 'name',      label: 'Company Name',  align: '',            px: 'px-4' },
  { key: 'sector',    label: 'Sector',        align: '',            px: 'px-4' },
  { key: 'type',      label: 'Type',          align: '',            px: 'px-4' },
  { key: 'prevClose', label: 'Prev Close',    align: 'text-right',  px: 'px-4' },
  { key: 'open',      label: 'Open',          align: 'text-right',  px: 'px-2' },
  { key: 'high',      label: 'High',          align: 'text-right',  px: 'px-2' },
  { key: 'low',       label: 'Low',           align: 'text-right',  px: 'px-2' },
  { key: 'close',     label: 'Close',         align: 'text-right',  px: 'px-2' },
  { key: 'change',    label: 'Change',        align: 'text-right',  px: 'px-4', highlight: true },
  { key: 'changePct', label: 'Change %',      align: 'text-center', px: 'px-4' },
  { key: 'range',     label: 'Range',         align: '',            px: 'px-4' },
  { key: 'perf1w',    label: 'Perf 1W',       align: 'text-right',  px: 'px-4' },
  { key: 'perf1m',    label: 'Perf 1M',       align: 'text-right',  px: 'px-4' },
  { key: 'trades',    label: 'Trades',        align: 'text-right',  px: 'px-4' },
  { key: 'volume',    label: 'Volume',        align: 'text-right',  px: 'px-4' },
  { key: 'to',        label: 'Turnover',      align: 'text-right',  px: 'px-4' },
  { key: 'mktCap',    label: 'Mkt Cap',       align: 'text-right',  px: 'px-4' },
  { key: 'rsi',       label: 'RSI',           align: 'text-right',  px: 'px-4', last: true },
]

const sortBy = (key) => {
  sortKey.value === key
    ? (sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc')
    : ((sortKey.value = key), (sortDir.value = 'asc'))
  currentPage.value = 1
}

const sortedStocks = computed(() => {
  if (!sortKey.value) return filteredStocks.value
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filteredStocks.value].sort((a, b) => {
    const na = parseFloat(String(a[key]).replace(/[,%BMK]/g, ''))
    const nb = parseFloat(String(b[key]).replace(/[,%BMK]/g, ''))
    if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir
    return String(a[key]).localeCompare(String(b[key])) * dir
  })
})

const totalPages      = computed(() => Math.ceil(sortedStocks.value.length / itemsPerPage.value))
const paginatedStocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return sortedStocks.value.slice(start, start + itemsPerPage.value)
})

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const setPage  = (p) => { currentPage.value = p }
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden bg-[#0c1221]">
      
      <!-- Top Filters & Controls Bar -->
      <div class="bg-[#121a2c] border-b border-white/5 p-4 flex flex-wrap items-center gap-4 shrink-0">
        <div class="flex items-center gap-2 bg-[#0b0f1a] border border-white/10 rounded px-2 py-1 text-[10px] uppercase font-bold text-slate-400">
           SELECT DATE: <span class="text-amber-500">2026-03-20</span>
        </div>
        <div class="flex items-center gap-2 bg-[#0b0f1a] border border-white/10 rounded px-2 py-1 text-[10px] font-bold">
           TIME: <span class="text-white font-mono uppercase">14:00</span>
        </div>
        <div class="flex items-center gap-1 bg-[#0b0f1a] border border-white/10 rounded px-1 group">
           <select class="bg-transparent border-none focus:ring-0 text-[10px] font-bold uppercase p-1">
             <option>1D</option>
           </select>
        </div>
        <button 
          @click="marketStore.fetchFullMarket()"
          :disabled="marketStore.isLoading"
          class="bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] px-3 py-1.5 rounded flex items-center gap-2 uppercase transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': marketStore.isLoading }" /> 
          {{ marketStore.isLoading ? 'LOADING...' : 'LOAD' }}
        </button>

        <div class="flex-1 flex justify-center">
          <div class="relative group max-w-lg w-full">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
            <input 
              v-model="searchQuery"
              placeholder="GLOBAL SEARCH (COMPANIES, SECTORS...)"
              class="w-full bg-[#0b0f1a] border border-white/10 rounded px-10 py-2 text-[11px] font-bold focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-wider"
            />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="bg-[#1e293b] border border-white/10 text-slate-300 font-bold text-[10px] px-3 py-1.5 rounded flex items-center gap-2 uppercase hover:bg-slate-700">
            <Filter class="w-3.5 h-3.5 text-amber-500" /> FILTER
          </button>
          <div class="flex gap-1">
             <button v-for="i in ['Σ', 'CALC', 'H', 'D', 'L']" :key="i" class="w-7 h-7 bg-[#0b0f1a] border border-white/5 rounded flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase font-mono">{{ i }}</button>
          </div>
        </div>
      </div>

      <!-- Advanced Filtering Section -->
      <div class="bg-[#121a2c]/50 p-3 border-b border-white/5 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span class="mr-2">Filters</span>
        <div class="flex items-center gap-2 bg-[#0b0f1a] border border-white/5 rounded px-2 py-1.5 mr-2">
          Adj TO % <ChevronDown class="w-3 h-3" />
        </div>
        <div class="flex items-center gap-2 bg-[#0b0f1a] border border-white/5 rounded px-2 py-1.5 mr-2">
          Greater Than <ChevronDown class="w-3 h-3" />
        </div>
        <span class="text-white">.01</span>
        <div class="flex-1"></div>
        <div class="flex gap-2">
          <button class="p-1 px-3 bg-white/5 rounded hover:bg-white/10"><Plus class="w-3 h-3" /></button>
          <button class="p-1 px-3 bg-white/5 rounded hover:bg-rose-900/20"><Trash2 class="w-3 h-3" /></button>
        </div>
      </div>

      <!-- Column View Tabs -->
      <div class="bg-[#121a2c]/30 px-4 border-b border-white/5 flex items-center gap-1">
        <button
          v-for="tab in [
            { key: 'daily',       label: 'Daily Changes', desc: 'CSE price data' },
            { key: 'overview',    label: 'Overview',      desc: 'Fundamentals' },
            { key: 'performance', label: 'Performance',   desc: 'TradingView returns' },
          ]"
          :key="tab.key"
          @click="activeColumnTab = tab.key; currentPage = 1"
          class="relative px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2"
          :class="activeColumnTab === tab.key
            ? 'text-amber-400 border-amber-400 bg-amber-500/5'
            : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/10'"
        >
          {{ tab.label }}
          <span v-if="activeColumnTab === tab.key" class="ml-2 text-[8px] text-amber-500/70 font-bold normal-case tracking-normal">{{ tab.desc }}</span>
        </button>
      </div>

      <!-- Table Content Area -->
      <div class="flex-1 overflow-x-auto custom-scrollbar bg-[#0c1221] relative min-h-[400px]">
        <!-- Loading State -->
        <div v-if="marketStore.isLoading" class="absolute inset-0 z-20 bg-[#0c1221]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div class="relative">
            <Loader2 class="w-12 h-12 text-indigo-500 animate-spin" />
            <div class="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
          </div>
          <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Syncing CSE + TradingView data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="marketStore.error" class="absolute inset-0 z-20 bg-[#0c1221]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center gap-3 max-w-md text-center">
            <Trash2 class="w-8 h-8 text-rose-500" />
            <p class="text-sm font-bold text-rose-400 uppercase tracking-tight">{{ marketStore.error }}</p>
            <button @click="marketStore.fetchFullMarket()" class="px-6 py-2 bg-rose-600 text-white text-xs font-black rounded-lg hover:bg-rose-500 transition-all">TRY AGAIN</button>
          </div>
        </div>

        <table class="w-full text-left border-collapse table-auto" :class="activeColumnTab === 'performance' ? 'min-w-[1400px]' : 'min-w-[1200px]'">
          <thead class="bg-[#162136] text-[9px] font-black text-slate-500 uppercase tracking-tighter sticky top-0 z-10 border-b border-white/10">
            <tr>
              <th
                v-for="col in activeColumns"
                :key="col.key"
                :class="[
                  col.px, 'py-3 border-r border-white/5',
                  col.last ? 'border-r-0' : '',
                  col.align,
                  col.highlight ? 'bg-white/5' : '',
                  'cursor-pointer select-none hover:bg-white/5 transition-colors group',
                  sortKey === col.key ? 'text-amber-400' : ''
                ]"
                @click="sortBy(col.key)"
              >
                <div
                  class="flex items-center gap-1"
                  :class="col.align === 'text-right' ? 'justify-end' : col.align === 'text-center' ? 'justify-center' : ''"
                >
                  <span>{{ col.label }}</span>
                  <span class="flex flex-col leading-[0] ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <ChevronUp  class="w-2.5 h-2.5" :class="sortKey === col.key && sortDir === 'asc'  ? 'text-amber-400 opacity-100' : 'text-slate-600'" />
                    <ChevronDown class="w-2.5 h-2.5" :class="sortKey === col.key && sortDir === 'desc' ? 'text-amber-400 opacity-100' : 'text-slate-600'" />
                  </span>
                </div>
              </th>
            </tr>
            <!-- Sub-header Filter Inputs -->
            <tr class="bg-[#121c33]/50 border-b border-white/5">
              <td v-for="col in activeColumns" :key="col.key" class="p-1 px-4 border-r border-white/5">
                <input placeholder="Filter..." class="w-full bg-transparent border-none focus:ring-0 text-[8px] font-bold uppercase p-1">
              </td>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-mono">
            <template v-if="paginatedStocks.length > 0">
              <tr
                v-for="stock in paginatedStocks"
                :key="stock.code"
                @click="router.push(`/stock/${stock.code}`)"
                class="hover:bg-indigo-600/5 group cursor-pointer transition-all text-xs font-bold leading-none border-b border-white/5"
              >
                <td
                  v-for="col in activeColumns"
                  :key="col.key"
                  :class="[
                    col.px, 'py-3 border-r border-white/5',
                    col.last ? 'border-r-0' : '',
                    col.highlight ? 'bg-white/5' : '',
                    col.align,
                    cellClass(col, stock)
                  ]"
                >
                  {{ cellValue(col, stock) }}
                </td>
              </tr>
            </template>
            <tr v-else-if="!marketStore.isLoading">
              <td colspan="18" class="p-20 text-center">
                <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching stocks found.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer / Info Bar -->
      <div class="h-10 bg-[#121a2c] border-t border-white/10 flex items-center justify-between px-6 shrink-0 text-[9px] font-bold uppercase tracking-widest text-slate-500">
        <div class="flex items-center gap-6">
           <div class="flex items-center gap-2">
              <span>SHOW:</span>
              <select 
                v-model="itemsPerPage"
                class="bg-slate-900 border border-white/10 rounded px-1 focus:ring-0 text-[10px] font-black text-amber-500 cursor-pointer"
              >
                <option :value="10">10 ROWS</option>
                <option :value="15">15 ROWS</option>
                <option :value="30">30 ROWS</option>
                <option :value="50">50 ROWS</option>
                <option :value="marketStore.allStocks.length">ALL DATA</option>
              </select>
           </div>
           <span>{{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredStocks.length) }} OF {{ filteredStocks.length }}</span>
        </div>
        <div class="flex items-center gap-4">
           <span class="text-amber-500 flex items-center gap-1"><div class="w-2.5 h-2.5 border border-amber-500/30 rounded"></div> SELECTED: 0</span>
           <div class="flex items-center gap-1">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="w-7 h-7 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                title="Previous Page"
              >
                &lsaquo;
              </button>
              
              <div class="flex">
                <button 
                  v-for="p in Math.min(totalPages, 5)" 
                  :key="p"
                  @click="setPage(p)"
                  class="w-7 h-7 flex items-center justify-center rounded text-[10px] font-black transition-all"
                  :class="currentPage === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:text-white'"
                >
                  {{ p }}
                </button>
                <span v-if="totalPages > 5" class="px-1 py-1">...</span>
                <button 
                  v-if="totalPages > 5"
                  @click="setPage(totalPages)"
                  class="w-7 h-7 flex items-center justify-center rounded text-[10px] font-black transition-all"
                  :class="currentPage === totalPages ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:text-white'"
                >
                  {{ totalPages }}
                </button>
              </div>

              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
                class="w-7 h-7 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                title="Next Page"
              >
                &rsaquo;
              </button>
           </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
