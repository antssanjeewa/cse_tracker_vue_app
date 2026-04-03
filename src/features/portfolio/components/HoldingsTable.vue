<script setup>
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps({
  holdings: Array
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val)
}
</script>

<template>
  <div class="bg-[#121a2c] border border-white/5 rounded-xl overflow-hidden mb-6">
    <div class="p-4 border-b border-white/5 flex items-center justify-between">
      <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
        <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
        Current Holdings
      </h3>
    </div>
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-900/50 text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5">
          <tr>
            <th class="px-4 py-3 border-r border-white/5">Stock</th>
            <th class="px-4 py-3 border-r border-white/5 text-right">Quantity</th>
            <th class="px-4 py-3 border-r border-white/5 text-right">Avg Price</th>
            <th class="px-4 py-3 border-r border-white/5 text-right">Total Cost</th>
            <th class="px-4 py-3 border-r border-white/5 text-right">Current Value</th>
            <th class="px-4 py-3 border-r border-white/5 text-right">Dividend</th>
            <th class="px-4 py-3 border-r border-white/5 text-right">Capital G/L</th>
            <th class="px-4 py-3 border-r border-white/5 text-right">Weight</th>
            <th class="px-4 py-3 text-right">G/L %</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5 font-mono">
          <tr v-for="holding in holdings" :key="holding.id" class="hover:bg-white/5 transition-colors group cursor-pointer">
            <td class="px-4 py-3 border-r border-white/5">
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-amber-500 uppercase">{{ holding.stocks?.ticker || 'N/A' }}</span>
                <span class="text-[9px] font-bold text-slate-500 truncate max-w-[120px]">{{ holding.stocks?.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 border-r border-white/5 text-right text-[11px] font-bold text-white">
              {{ holding.quantity }}
            </td>
            <td class="px-4 py-3 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.avg_price) }}
            </td>
            <td class="px-4 py-3 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.total_price || (holding.quantity * holding.avg_price)) }}
            </td>
            <td class="px-4 py-3 border-r border-white/5 text-right text-[11px] font-black text-white">
              {{ formatCurrency(holding.quantity * (holding.stocks?.last_price || holding.avg_price)) }}
            </td>
            <td class="px-4 py-3 border-r border-white/5 text-right text-[11px] font-black text-indigo-400">
              {{ formatCurrency(holding.dividend || 0) }}
            </td>
            <td class="px-4 py-3 border-r border-white/5 text-right text-[11px] font-black" :class="holding.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'">
              {{ (holding.profit >= 0 ? '+' : '') }}{{ formatCurrency(holding.profit) }}
            </td>
            <td class="px-4 py-3 border-r border-white/5 text-right">
              <div class="flex flex-col items-end">
                <span class="text-[10px] font-black text-white">{{ holding.weight.toFixed(1) }}%</span>
                <div class="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div class="h-full bg-indigo-500" :style="{ width: holding.weight + '%' }"></div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1 text-[10px] font-black" :class="holding.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'">
                <TrendingUp v-if="holding.profit >= 0" class="w-3 h-3" />
                <TrendingDown v-else class="w-3 h-3" />
                {{ (holding.quantity * holding.avg_price) > 0 
                    ? ((holding.profit / (holding.quantity * holding.avg_price)) * 100).toFixed(2) 
                    : '0.00' }}%
              </div>
            </td>
          </tr>
          <tr v-if="holdings.length === 0">
            <td colspan="7" class="p-12 text-center text-slate-500 uppercase font-bold text-[10px] tracking-widest">
              No active holdings found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
