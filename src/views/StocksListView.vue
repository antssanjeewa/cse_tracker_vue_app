<script setup>
import { ref, computed } from 'vue'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Filter, Search, ChevronDown, Download, Grid, List as ListIcon, RefreshCw, Calculator, LayoutPanelTop, LayoutGrid, Trash2, Plus } from 'lucide-vue-next'

const stocks = ref([
  { code: 'SCAP.N0000', name: 'SOFTLOGIC CAPITAL PLC', sector: 'Insurance', type: 'Regular', prevClose: '12.70', open: '12.90', high: '14.30', low: '11.60', close: '12.20', change: '-0.50', changePct: '-3.94%', range: '11.60-14.30', vwap: '13.38', trades: '1,737', volume: '24,146,759', to: '323.04M', adj: '7.77%', sp: 'All' },
  { code: 'ACL.N0000', name: 'ACL CABLES PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '87.50', open: '88.00', high: '89.40', low: '81.80', close: '82.80', change: '-4.70', changePct: '-5.37%', range: '81.80-89.40', vwap: '85.12', trades: '909', volume: '2,403,988', to: '204.62M', adj: '4.92%', sp: 'All' },
  { code: 'PLR.N0000', name: 'PRIME LANDS RESIDENCIES PLC', sector: 'Real Estate Management...', type: 'Regular', prevClose: '46.90', open: '46.50', high: '49.00', low: '42.00', close: '43.00', change: '-3.90', changePct: '-8.32%', range: '42.00-49.00', vwap: '45.91', trades: '1,544', volume: '4,033,738', to: '185.20M', adj: '4.46%', sp: 'All' },
  { code: 'SAMP.N0000', name: 'SAMPATH BANK PLC', sector: 'Banks', type: 'Regular', prevClose: '150.00', open: '150.00', high: '152.50', low: '149.00', close: '149.50', change: '-0.50', changePct: '-0.33%', range: '149.00-152.50', vwap: '150.12', trades: '1,488', volume: '1,148,198', to: '171.16M', adj: '4.12%', sp: 'All' },
  { code: 'JKH.N0000', name: 'JOHN KEELLS HOLDINGS PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '19.30', open: '19.20', high: '19.30', low: '18.90', close: '18.90', change: '-0.40', changePct: '-2.07%', range: '18.90-19.30', vwap: '19.08', trades: '2,041', volume: '8,856,912', to: '169.03M', adj: '4.07%', sp: 'All' },
  { code: 'SHL.N0000', name: 'SOFTLOGIC HOLDINGS PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '11.70', open: '11.90', high: '12.80', low: '10.40', close: '10.40', change: '-1.30', changePct: '-11.11%', range: '10.40-12.80', vwap: '12.08', trades: '1,189', volume: '13,219,762', to: '159.74M', adj: '3.84%', sp: 'All' },
  { code: 'AEL.N0000', name: 'ACCESS ENGINEERING PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '69.50', open: '68.70', high: '70.00', low: '64.50', close: '64.90', change: '-4.60', changePct: '-6.62%', range: '64.50-70.00', vwap: '67.53', trades: '770', volume: '1,982,116', to: '133.84M', adj: '3.22%', sp: 'All' },
  { code: 'COMB.N0000', name: 'COMMERCIAL BANK OF CEYLON PLC', sector: 'Banks', type: 'Regular', prevClose: '196.75', open: '196.75', high: '200.00', low: '191.00', close: '192.50', change: '-4.25', changePct: '-2.16%', range: '191.00-200.00', vwap: '196.37', trades: '1,433', volume: '671,752', to: '131.91M', adj: '3.17%', sp: 'All' },
])

const searchQuery = ref('')
const filteredStocks = computed(() => {
  return stocks.value.filter(s => 
    s.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
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
        <button class="bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] px-3 py-1.5 rounded flex items-center gap-2 uppercase transition-all shadow-lg active:scale-95">
          <RefreshCw class="w-3 h-3" /> LOAD
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

      <!-- Sorting Bar -->
      <div class="bg-[#121a2c]/30 p-3 border-b border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth">
         <span class="text-[10px] font-black text-slate-500 uppercase mr-2 shrink-0">Sort</span>
         <div class="flex gap-1 shrink-0">
           <button v-for="s in ['Company', 'Company Name', 'Sector', 'Type', 'Prev Close', 'Open', 'High', 'Low', 'Close', 'Change', 'Change %', 'Range', 'VWAP', 'Trades', 'Volume']" :key="s" class="px-3 py-1 bg-white/5 rounded text-[9px] font-bold text-slate-400 hover:text-white border border-white/5 uppercase transition-all whitespace-nowrap">{{ s }}</button>
         </div>
      </div>

      <!-- Table Content Area -->
      <div class="flex-1 overflow-x-auto custom-scrollbar bg-[#0c1221]">
        <table class="w-full text-left border-collapse table-auto min-w-[1800px]">
          <thead class="bg-[#162136] text-[9px] font-black text-slate-500 uppercase tracking-tighter sticky top-0 z-10 border-b border-white/10">
            <tr>
              <th class="px-4 py-4 border-r border-white/5">Company</th>
              <th class="px-4 py-4 border-r border-white/5">Company Name</th>
              <th class="px-4 py-4 border-r border-white/5">Sector</th>
              <th class="px-4 py-4 border-r border-white/5">Type</th>
              <th class="px-4 py-4 border-r border-white/5 text-right">Prev Close</th>
              <th class="px-2 py-4 border-r border-white/5 text-right">Open</th>
              <th class="px-2 py-4 border-r border-white/5 text-right">High</th>
              <th class="px-2 py-4 border-r border-white/5 text-right">Low</th>
              <th class="px-2 py-4 border-r border-white/5 text-right">Close</th>
              <th class="px-4 py-4 border-r border-white/5 text-right bg-white/5">Change</th>
              <th class="px-4 py-4 border-r border-white/5 text-center">Change %</th>
              <th class="px-4 py-4 border-r border-white/5">Range</th>
              <th class="px-4 py-4 border-r border-white/5 text-right">VWAP</th>
              <th class="px-4 py-4 border-r border-white/5 text-right">Trades</th>
              <th class="px-4 py-4 border-r border-white/5 text-right">Volume</th>
              <th class="px-4 py-4 border-r border-white/5 text-right">TO</th>
              <th class="px-4 py-4 border-r border-white/5 text-right">Adj T..</th>
              <th class="px-4 py-4">S&P</th>
            </tr>
            <!-- Sub-header Filter Inputs -->
            <tr class="bg-[#121c33]/50 border-b border-white/5">
              <td v-for="i in 18" :key="i" class="p-1 px-4 border-r border-white/5">
                <input placeholder="Filter..." class="w-full bg-transparent border-none focus:ring-0 text-[8px] font-bold uppercase p-1">
              </td>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5 font-mono">
            <tr v-for="stock in filteredStocks" :key="stock.code" class="hover:bg-white/5 transition-colors group cursor-pointer text-xs font-bold leading-none">
              <td class="px-4 py-3 border-r border-white/5 text-amber-500">{{ stock.code }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-slate-300 uppercase overflow-hidden whitespace-nowrap">{{ stock.name }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-slate-500">{{ stock.sector }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-slate-500 uppercase">{{ stock.type }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-right text-slate-400">{{ stock.prevClose }}</td>
              <td class="px-2 py-3 border-r border-white/5 text-right text-slate-400">{{ stock.open }}</td>
              <td class="px-2 py-3 border-r border-white/5 text-right text-emerald-500">{{ stock.high }}</td>
              <td class="px-2 py-3 border-r border-white/5 text-right text-rose-500">{{ stock.low }}</td>
              <td class="px-2 py-3 border-r border-white/5 text-right">{{ stock.close }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-right bg-rose-900/10 text-rose-500">{{ stock.change }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-center text-rose-500 border-b-2 border-amber-900/30">{{ stock.changePct }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-slate-400 whitespace-nowrap">{{ stock.range }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-right text-slate-400">{{ stock.vwap }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-right text-slate-300">{{ stock.trades }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-right text-slate-300">{{ stock.volume }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-right text-amber-500">{{ stock.to }}</td>
              <td class="px-4 py-3 border-r border-white/5 text-right text-slate-400">{{ stock.adj }}</td>
              <td class="px-4 py-3 text-slate-500">{{ stock.sp }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer / Info Bar -->
      <div class="h-10 bg-[#121a2c] border-t border-white/10 flex items-center justify-between px-6 shrink-0 text-[9px] font-bold uppercase tracking-widest text-slate-500">
        <div class="flex items-center gap-6">
           <span>SHOW: 10 ROWS</span>
           <span>1-20 OF 218</span>
        </div>
        <div class="flex items-center gap-4">
           <span class="text-amber-500 flex items-center gap-1"><div class="w-3 h-3 border border-amber-500/30 rounded"></div> SELECTED: COUNT: 12</span>
           <span class="text-white">Sum: -38.50</span>
           <div class="flex">
              <button class="w-8 h-8 bg-indigo-600 text-white rounded">1</button>
              <button class="w-8 h-8 hover:text-white transition-colors">2</button>
              <button class="w-8 h-8 hover:text-white transition-colors">3</button>
              <span class="px-2">...</span>
              <button class="w-8 h-8 hover:text-white transition-colors">11</button>
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
