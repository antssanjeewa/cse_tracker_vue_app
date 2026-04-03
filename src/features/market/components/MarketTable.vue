<script setup>
import { ChevronUp, ChevronDown, Loader2, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  columns: Array,
  stocks: Array,
  sortKey: String,
  sortDir: String,
  isLoading: Boolean,
  error: String,
  activeTab: String
})

const emit = defineEmits(['sort', 'refresh', 'rowClick'])

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
  if (col.color === 'rose') return 'text-rose-500'
  if (col.key === 'code') return 'text-amber-500'
  if (col.key === 'name') return 'text-slate-300 uppercase'
  if (col.key === 'close') return 'text-white font-black'
  if (col.key === 'to') return 'text-amber-500'
  return 'text-slate-400'
}

// returns formatted display value for a cell
const cellValue = (col, stock) => {
  const val = stock[col.key]
  if (col.signal) {
    const n = Number(val)
    if (n > 0.5) return 'Strong Buy'
    if (n > 0.1) return 'Buy'
    if (n < -0.5) return 'Strong Sell'
    if (n < -0.1) return 'Sell'
    return 'Neutral'
  }
  if (col.rsi) return val ? Number(val).toFixed(1) : 'N/A'
  return val ?? 'N/A'
}
</script>

<template>
  <div class="flex-1 overflow-x-auto custom-scrollbar bg-[#0c1221] relative min-h-[400px]">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="absolute inset-0 z-20 bg-[#0c1221]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
    >
      <div class="relative">
        <Loader2 class="w-12 h-12 text-indigo-500 animate-spin" />
        <div class="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
      </div>
      <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
        Syncing CSE + TradingView data...
      </p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="absolute inset-0 z-20 bg-[#0c1221]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
    >
      <div
        class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center gap-3 max-w-md text-center"
      >
        <Trash2 class="w-8 h-8 text-rose-500" />
        <p class="text-sm font-bold text-rose-400 uppercase tracking-tight">
          {{ error }}
        </p>
        <button
          @click="emit('refresh')"
          class="px-6 py-2 bg-rose-600 text-white text-xs font-black rounded-lg hover:bg-rose-500 transition-all"
        >
          TRY AGAIN
        </button>
      </div>
    </div>

    <table
      class="w-full text-left border-collapse table-fixed"
      :class="activeTab === 'performance' ? 'min-w-[1400px]' : 'min-w-[1200px]'"
    >
      <thead
        class="bg-[#162136] text-[9px] font-black text-slate-500 uppercase tracking-tighter sticky top-0 z-10 border-b border-white/10"
      >
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              col.px,
              'py-3 border-r border-white/5',
              col.last ? 'border-r-0' : '',
              col.align,
              col.highlight ? 'bg-white/5' : '',
              col.width,
              'cursor-pointer select-none hover:bg-white/5 transition-colors group',
              sortKey === col.key ? 'text-amber-400' : '',
            ]"
            @click="emit('sort', col.key)"
          >
            <div
              class="flex items-center gap-1"
              :class="
                col.align === 'text-right'
                  ? 'justify-end'
                  : col.align === 'text-center'
                    ? 'justify-center'
                    : ''
              "
            >
              <span>{{ col.label }}</span>
              <span
                class="flex flex-col leading-[0] ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <ChevronUp
                  class="w-2.5 h-2.5"
                  :class="
                    sortKey === col.key && sortDir === 'asc'
                      ? 'text-amber-400 opacity-100'
                      : 'text-slate-600'
                  "
                />
                <ChevronDown
                  class="w-2.5 h-2.5"
                  :class="
                    sortKey === col.key && sortDir === 'desc'
                      ? 'text-amber-400 opacity-100'
                      : 'text-slate-600'
                  "
                />
              </span>
            </div>
          </th>
        </tr>
        <!-- Sub-header Filter Inputs -->
        <tr class="bg-[#121c33]/50 border-b border-white/5">
          <td
            v-for="col in columns"
            :key="col.key"
            :class="['p-1 px-4 border-r border-white/5', col.width]"
          >
            <input
              placeholder="Filter..."
              class="w-full bg-transparent border-none focus:ring-0 text-[8px] font-bold uppercase p-1"
            />
          </td>
        </tr>
      </thead>
      <tbody class="divide-y divide-white/5 font-mono">
        <template v-if="stocks.length > 0">
          <tr
            v-for="stock in stocks"
            :key="stock.code"
            @click="emit('rowClick', stock.code)"
            class="hover:bg-indigo-600/5 group cursor-pointer transition-all text-xs font-bold leading-none border-b border-white/5"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                col.px,
                'py-3 border-r border-white/5 whitespace-nowrap',
                col.last ? 'border-r-0' : '',
                col.highlight ? 'bg-white/5' : '',
                col.align,
                col.width,
                cellClass(col, stock),
              ]"
            >
              {{ cellValue(col, stock) }}
            </td>
          </tr>
        </template>
        <tr v-else-if="!isLoading">
          <td :colspan="columns.length" class="p-20 text-center">
            <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">
              No matching stocks found.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
