<script setup>
import { Search, Filter, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  searchQuery: String,
  isLoading: Boolean
})

const emit = defineEmits(['update:searchQuery', 'refresh'])

const onSearchInput = (event) => {
  emit('update:searchQuery', event.target.value)
}

const onRefresh = () => {
  emit('refresh')
}
</script>

<template>
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
      @click="onRefresh"
      :disabled="isLoading"
      class="bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] px-3 py-1.5 rounded flex items-center gap-2 uppercase transition-all shadow-lg active:scale-95 disabled:opacity-50"
    >
      <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': isLoading }" />
      {{ isLoading ? 'LOADING...' : 'LOAD' }}
    </button>

    <div class="flex-1 flex justify-center">
      <div class="relative group max-w-lg w-full">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-amber-500 transition-colors"
        />
        <input
          :value="searchQuery"
          @input="onSearchInput"
          placeholder="GLOBAL SEARCH (COMPANIES, SECTORS...)"
          class="w-full bg-[#0b0f1a] border border-white/10 rounded px-10 py-2 text-[11px] font-bold focus:outline-none focus:border-amber-500/50 transition-all uppercase tracking-wider"
        />
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        class="bg-[#1e293b] border border-white/10 text-slate-300 font-bold text-[10px] px-3 py-1.5 rounded flex items-center gap-2 uppercase hover:bg-slate-700"
      >
        <Filter class="w-3.5 h-3.5 text-amber-500" /> FILTER
      </button>
      <div class="flex gap-1">
        <button
          v-for="i in ['Σ', 'CALC', 'H', 'D', 'L']"
          :key="i"
          class="w-7 h-7 bg-[#0b0f1a] border border-white/5 rounded flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase font-mono"
        >
          {{ i }}
        </button>
      </div>
    </div>
  </div>
</template>
