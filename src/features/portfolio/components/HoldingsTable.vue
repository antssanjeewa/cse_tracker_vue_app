<script setup>
import { ref, computed } from 'vue'
import { TrendingUp, TrendingDown, Search as SearchIcon, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  holdings: { type: Array, default: () => [] }
})

const searchQuery = ref('')
const sortKey = ref('stocks.ticker')
const sortOrder = ref('asc')

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-LK', { style: 'decimal', minimumFractionDigits: 2 }).format(val)
}

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const filteredAndSortedHoldings = computed(() => {
  let result = [...props.holdings]

  // Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(h => 
      h.stocks?.ticker?.toLowerCase().includes(query) || 
      h.stocks?.name?.toLowerCase().includes(query)
    )
  }

  // Sort
  result.sort((a, b) => {
    let valA, valB
    
    // Handle nested keys like 'stocks.ticker'
    if (sortKey.value.includes('.')) {
      const keys = sortKey.value.split('.')
      valA = a[keys[0]]?.[keys[1]]
      valB = b[keys[0]]?.[keys[1]]
    } else {
      valA = a[sortKey.value]
      valB = b[sortKey.value]
    }

    if (valA === valB) return 0
    const modifier = sortOrder.value === 'asc' ? 1 : -1
    return valA > valB ? modifier : -modifier
  })

  return result
})
</script>

<template>
  <div class="bg-[#121a2c] border border-white/5 rounded-2xl overflow-hidden mb-6 shadow-2xl">
    <div class="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
      <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
        <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
        Current Strategic Positions
      </h3>
      
      <!-- Search Input -->
      <div class="relative group max-w-xs w-full">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="SEARCH HOLDINGS..."
          class="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-10 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </div>
    </div>

    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse font-mono">
        <thead class="bg-slate-900/50 text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
          <tr>
            <th @click="toggleSort('stocks.ticker')" class="px-5 py-4 border-r border-white/5 cursor-pointer hover:text-white transition-colors group">
               <div class="flex items-center gap-2">
                 Stock 
                 <ArrowUpDown v-if="sortKey !== 'stocks.ticker'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                 <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                 <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
               </div>
            </th>
            <th @click="toggleSort('quantity')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
               <div class="flex items-center justify-end gap-2">
                 Quantity
                 <ArrowUpDown v-if="sortKey !== 'quantity'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                 <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                 <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
               </div>
            </th>
            <th @click="toggleSort('avg_price')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
               <div class="flex items-center justify-end gap-2">
                 Avg Price
                 <ArrowUpDown v-if="sortKey !== 'avg_price'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                 <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                 <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
               </div>
            </th>
            <th @click="toggleSort('market_price')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
               <div class="flex items-center justify-end gap-2">
                 Market Price
                 <ArrowUpDown v-if="sortKey !== 'market_price'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                 <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                 <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
               </div>
            </th>
            <th class="px-5 py-4 border-r border-white/5 text-right opacity-50">Total Cost</th>
            <th class="px-5 py-4 border-r border-white/5 text-right opacity-50">Dividends</th>
            <th @click="toggleSort('profit')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
               <div class="flex items-center justify-end gap-2">
                 Profit
                 <ArrowUpDown v-if="sortKey !== 'profit'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                 <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                 <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
               </div>
            </th>
            <th @click="toggleSort('weight')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
               <div class="flex items-center justify-end gap-2">
                 Weight
                 <ArrowUpDown v-if="sortKey !== 'weight'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                 <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                 <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
               </div>
            </th>
            <th @click="toggleSort('liveProfit')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center justify-end gap-2">
                 Capital G/L
                 <ArrowUpDown v-if="sortKey !== 'liveProfit'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                 <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                 <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
               </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="holding in filteredAndSortedHoldings" :key="holding.id" class="hover:bg-white/5 transition-colors group cursor-pointer">
            <td class="px-5 py-4 border-r border-white/5">
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-indigo-400 uppercase group-hover:text-amber-500 transition-colors">{{ holding.stocks?.ticker || 'N/A' }}</span>
                <span class="text-[9px] font-bold text-slate-500 truncate max-w-[120px]">{{ holding.stocks?.name }}</span>
              </div>
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-white">
              {{ holding.quantity }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.avg_price) }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-black text-indigo-400">
              {{ formatCurrency(holding.market_price || holding.avg_price) }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.quantity * holding.avg_price) }}
            </td>
           
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.dividend || 0) }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-black" :class="(holding.profit || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'">
              {{ ((holding.profit || 0) >= 0 ? '+' : '') }}{{ formatCurrency(holding.profit || 0) }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right">
              <div class="flex flex-col items-end">
                <span class="text-[10px] font-black text-white">{{ (holding.weight || 0).toFixed(1) }}%</span>
                <div class="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div class="h-full bg-indigo-500" :style="{ width: (holding.weight || 0) + '%' }"></div>
                </div>
              </div>
            </td>
             <td class="px-5 py-4 text-right">
               <div class="flex flex-col items-end">
                  <span class="text-[11px] font-black" :class="(holding.liveProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ (holding.liveProfit || 0) >= 0 ? '+' : '' }}{{ formatCurrency(holding.liveProfit || 0) }}
                  </span>
                  <span class="text-[9px] font-bold" :class="(holding.profit || 0) >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'">
                     {{ (holding.quantity * holding.avg_price) > 0 
                    ? (((holding.profit || 0) / (holding.quantity * holding.avg_price)) * 100).toFixed(2) 
                    : '0.00' }}%
                  </span>
               </div>
            </td>
           
          </tr>
          <tr v-if="filteredAndSortedHoldings.length === 0">
            <td colspan="8" class="p-16 text-center text-slate-600 uppercase font-black text-[10px] tracking-[0.3em] italic">
              No matching strategic positions found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
