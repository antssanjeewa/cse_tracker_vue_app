<script setup>
import { Activity } from 'lucide-vue-next'
import { useMarketStore } from '@/stores/marketStore'

const marketStore = useMarketStore()
</script>

<template>
  <div class="bg-[#121a2c]/40 border border-white/5 p-6 rounded-3xl h-40 group">
    <div class="flex items-center justify-between mb-4">
      <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Index Performance</span>
      <Activity class="w-4 h-4 text-indigo-500" />
    </div>

    <div class="space-y-4">
      <div v-for="stat in marketStore.stats.slice(0, 2)" :key="stat.label" class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-tight">{{ stat.label }}</span>
        <div class="text-right">
          <p class="text-xl font-black text-white italic tracking-tighter leading-none">{{ stat.value }}</p>
          <div class="flex items-center justify-end gap-1 mt-1">
             <div class="w-1 h-1 rounded-full animate-pulse" :class="stat.subValue.includes('+') ? 'bg-emerald-500' : 'bg-rose-500'"></div>
             <p class="text-[9px] font-black" :class="stat.subValue.includes('+') ? 'text-emerald-500' : 'text-rose-500'">{{ stat.subValue }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
