<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useMarketStore } from '@/stores/marketStore'

const marketStore = useMarketStore()

const props = defineProps({
  paginatedHoldings: Array,
  totalPagesCount: Number,
  currentPage: Number,
  perPage: Number,
  totalItems: Number,
  sortKey: String,
  sortOrder: String
})

const emit = defineEmits(['toggleSort', 'prevPage', 'nextPage', 'setPage'])

const formatCurrency = (val) => marketStore.formatCurrency(val)
</script>

<template>
  <div class="bg-[#121a2c]/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
    <!-- Table Header -->
    <div class="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
      <h2 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
        <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
        Portfolio Performance Analysis
      </h2>
      <span class="text-[9px] font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 uppercase tracking-widest italic tracking-wider">LIVE SYSTEM MONITORING</span>
    </div>

    <!-- Table Content -->
    <div class="flex-1 overflow-x-auto custom-scrollbar">
      <table class="w-full text-left font-mono">
        <thead class="bg-indigo-950/20 text-[9px] font-black text-slate-500 uppercase border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
          <tr>
            <th @click="emit('toggleSort', 'ticker')" class="px-5 py-4 cursor-pointer hover:text-white transition-colors group">
               Stock <span v-if="sortKey === 'ticker'" class="text-indigo-400">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="emit('toggleSort', 'quantity')" class="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group">
               Holdings <span v-if="sortKey === 'quantity'" class="text-indigo-400">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="emit('toggleSort', 'avg_price')" class="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group">
               Avg Price <span v-if="sortKey === 'avg_price'" class="text-indigo-400">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="px-5 py-4 text-right opacity-40">Total Cost</th>
            <th class="px-5 py-4 text-right text-indigo-400">Market Price</th>
            <th @click="emit('toggleSort', 'profit')" class="px-5 py-4 text-right cursor-pointer hover:text-white transition-colors group">
               Gain/Loss <span v-if="sortKey === 'profit'" class="text-indigo-400">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5 font-mono">
          <tr v-for="h in paginatedHoldings" :key="h.id" class="hover:bg-white/5 transition-colors group cursor-pointer">
            <td class="px-5 py-4">
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-white uppercase group-hover:text-indigo-400 transition-colors">{{ h.liveStock?.ticker || h.liveStock?.code || h.stocks?.ticker }}</span>
                <span class="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{{ h.liveStock?.name || h.stocks?.name }}</span>
              </div>
            </td>
            <td class="px-5 py-4 text-right text-[11px] font-bold text-slate-400">{{ h.quantity }}</td>
            <td class="px-5 py-4 text-right text-[11px] font-bold text-slate-400">{{ formatCurrency(h.avg_price) }}</td>
            <td class="px-5 py-4 text-right text-[11px] font-bold text-slate-400">{{ formatCurrency(h.quantity * h.avg_price) }}</td>
            <td class="px-5 py-4 text-right text-[11px] font-black text-white hover:text-indigo-400 transition-colors">{{ formatCurrency(h.liveStock?.close || h.avg_price) }}</td>
            <td class="px-5 py-4 text-right">
               <div class="flex flex-col items-end">
                  <span class="text-[11px] font-black" :class="(h.liveProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ (h.liveProfit || 0) >= 0 ? '+' : '' }}{{ formatCurrency(h.liveProfit || 0) }}
                  </span>
                  <span class="text-[9px] font-bold" :class="(h.liveProfit || 0) >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'">
                    {{ (h.liveRoi || 0).toFixed(2) }}%
                  </span>
               </div>
            </td>
          </tr>
          <tr v-if="paginatedHoldings.length === 0">
            <td colspan="6" class="p-24 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest italic opacity-40">No active holdings found in local terminal.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div v-if="totalPagesCount > 1" class="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01] items-center">
      <div class="flex items-center gap-2">
         <button @click="emit('prevPage')" :disabled="currentPage === 1" 
            class="p-1 w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white disabled:opacity-10 transition-all active:scale-90"
         >
            <ChevronLeft class="w-4 h-4" />
         </button>
         <div class="flex items-center gap-1">
            <button v-for="p in totalPagesCount" :key="p" 
               @click="emit('setPage', p)"
               class="w-8 h-8 rounded-lg text-[10px] font-black border transition-all active:scale-95"
               :class="currentPage === p ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-white/[0.03] border-white/5 text-slate-500 hover:text-white hover:bg-white/5'"
            >
               {{ p }}
            </button>
         </div>
         <button @click="emit('nextPage')" :disabled="currentPage === totalPagesCount" 
            class="p-1 w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-slate-900/50 text-slate-400 hover:text-white disabled:opacity-10 transition-all active:scale-90"
         >
            <ChevronRight class="w-4 h-4" />
         </button>
      </div>
      <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">
         Displaying {{ (currentPage-1)*perPage + 1 }} - {{ Math.min(currentPage*perPage, totalItems) }} of {{ totalItems }} Positions
      </span>
    </div>
  </div>
</template>
