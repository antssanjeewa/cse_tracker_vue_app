<script setup>
import { ref, computed } from 'vue'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { Filter, Search, ChevronDown, Download, Grid, List as ListIcon } from 'lucide-vue-next'

const stocks = ref([
  { code: 'SCAP.N0000', name: 'SOFTLOGIC CAPITAL PLC', sector: 'Insurance', type: 'Regular', prevClose: '12.70', open: '12.90', high: '14.30', low: '11.60', close: '12.20', change: '-0.50', changePct: '-3.94%', vol: '24,146,759', to: '323.04M' },
  { code: 'ACL.N0000', name: 'ACL CABLES PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '87.50', open: '88.00', high: '89.40', low: '81.80', close: '82.80', change: '-4.70', changePct: '-5.37%', vol: '2,403,988', to: '204.62M' },
  { code: 'PLR.N0000', name: 'PRIME LANDS RESIDENCIES PLC', sector: 'Real Estate Management', type: 'Regular', prevClose: '46.90', open: '46.50', high: '49.00', low: '42.00', close: '43.00', change: '-3.90', changePct: '-8.32%', vol: '4,033,738', to: '185.20M' },
  { code: 'SAMP.N0000', name: 'SAMPATH BANK PLC', sector: 'Banks', type: 'Regular', prevClose: '150.00', open: '150.00', high: '152.50', low: '149.00', close: '149.50', change: '-0.50', changePct: '-0.33%', vol: '1,148,198', to: '171.16M' },
  { code: 'JKH.N0000', name: 'JOHN KEELLS HOLDINGS PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '19.30', open: '19.20', high: '19.30', low: '18.90', close: '18.90', change: '-0.40', changePct: '-2.07%', vol: '8,856,912', to: '169.03M' },
  { code: 'SHL.N0000', name: 'SOFTLOGIC HOLDINGS PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '11.70', open: '11.90', high: '12.80', low: '10.40', close: '10.40', change: '-1.30', changePct: '-11.11%', vol: '13,219,762', to: '159.74M' },
  { code: 'AEL.N0000', name: 'ACCESS ENGINEERING PLC', sector: 'Capital Goods', type: 'Regular', prevClose: '69.50', open: '68.70', high: '70.00', low: '64.50', close: '64.90', change: '-4.60', changePct: '-6.62%', vol: '1,982,116', to: '133.84M' },
  { code: 'COMB.N0000', name: 'COMMERCIAL BANK OF CEYLON PLC', sector: 'Banks', type: 'Regular', prevClose: '196.75', open: '196.75', high: '200.00', low: '191.00', close: '192.50', change: '-4.25', changePct: '-2.16%', vol: '671,752', to: '131.91M' },
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
    <div class="space-y-6">
      <!-- Breadcrumb & Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight leading-none mb-2">Market Watch</h1>
          <p class="text-slate-400 font-medium">Browse and filter all listed companies</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex bg-white/5 border border-white/5 p-1 rounded-2xl">
            <button class="p-2 text-indigo-400 bg-indigo-500/10 rounded-xl shadow-lg shadow-indigo-500/10">
              <ListIcon class="w-5 h-5" />
            </button>
            <button class="p-2 text-slate-500 hover:text-white transition-colors rounded-xl">
              <Grid class="w-5 h-5" />
            </button>
          </div>
          <button class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
            <Download class="w-4 h-4" />
            EXPORT TO CSV
          </button>
        </div>
      </div>

      <!-- Filters Surface -->
      <div class="bg-[#0f172a]/40 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] shadow-xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="relative group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by code or name..." 
              class="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-100 placeholder:text-slate-600 shadow-inner"
            />
          </div>
          
          <div class="relative">
            <select class="w-full appearance-none bg-slate-900 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40 transition-all cursor-pointer">
              <option>All Sectors</option>
              <option>Finance</option>
              <option>Capital Goods</option>
              <option>Insurance</option>
            </select>
            <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <div class="relative">
             <select class="w-full appearance-none bg-slate-900 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40 transition-all cursor-pointer">
              <option>Change %: Any</option>
              <option>Positive Only</option>
              <option>Negative Only</option>
            </select>
            <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <button class="bg-[#1e293b] hover:bg-slate-700 text-slate-200 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all border border-white/5 flex items-center justify-center gap-2 group">
            <Filter class="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
            ADVANCED FILTERS
          </button>
        </div>
      </div>

      <!-- Table Content -->
      <div class="bg-[#0f172a]/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr class="border-b border-white/5 bg-white/5 uppercase tracking-widest text-[10px] font-black text-slate-500">
                <th class="px-8 py-5">Company</th>
                <th class="px-6 py-5">Name</th>
                <th class="px-6 py-5">Sector</th>
                <th class="px-6 py-5 text-right">Prev Close</th>
                <th class="px-6 py-5 text-right">Open</th>
                <th class="px-6 py-5 text-right">High</th>
                <th class="px-6 py-5 text-right">Low</th>
                <th class="px-6 py-5 text-right">Close</th>
                <th class="px-6 py-5 text-right">Change</th>
                <th class="px-6 py-5 text-center">Change %</th>
                <th class="px-8 py-5 text-right">TO</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr 
                v-for="stock in filteredStocks" 
                :key="stock.code"
                class="hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <td class="px-8 py-4">
                  <span class="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{{ stock.code }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-bold text-slate-400 group-hover:text-white transition-colors truncate max-w-[200px] block">{{ stock.name }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{{ stock.sector }}</span>
                </td>
                <td class="px-6 py-4 text-right text-xs font-semibold text-slate-300 font-mono">{{ stock.prevClose }}</td>
                <td class="px-6 py-4 text-right text-xs font-semibold text-slate-300 font-mono">{{ stock.open }}</td>
                <td class="px-6 py-4 text-right text-xs font-semibold text-emerald-500 font-mono">{{ stock.high }}</td>
                <td class="px-6 py-4 text-right text-xs font-semibold text-rose-500 font-mono">{{ stock.low }}</td>
                <td class="px-6 py-4 text-right text-xs font-bold text-white font-mono bg-white/5">{{ stock.close }}</td>
                <td class="px-6 py-4 text-right text-xs font-bold" :class="stock.change.startsWith('-') ? 'text-rose-500' : 'text-emerald-500'">
                  {{ stock.change }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="px-3 py-1.5 rounded-xl text-xs font-black shadow-lg"
                    :class="stock.changePct.startsWith('-') ? 'bg-rose-500/10 text-rose-500 shadow-rose-500/5' : 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5'"
                  >
                    {{ stock.changePct }}
                  </span>
                </td>
                <td class="px-8 py-4 text-right">
                  <span class="text-sm font-black text-white">{{ stock.to }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <p class="text-xs font-bold text-slate-500">SHOWING <span class="text-white">10</span> ROWS (1-8 OF 218)</p>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">PREV</button>
            <div class="flex items-center gap-1">
              <button class="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold">1</button>
              <button class="w-8 h-8 rounded-lg bg-white/5 text-slate-500 text-xs font-bold hover:text-white">2</button>
              <button class="w-8 h-8 rounded-lg bg-white/5 text-slate-500 text-xs font-bold hover:text-white">3</button>
              <span class="text-slate-700 px-1">...</span>
              <button class="w-8 h-8 rounded-lg bg-white/5 text-slate-500 text-xs font-bold hover:text-white">11</button>
            </div>
            <button class="px-4 py-2 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">NEXT</button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
