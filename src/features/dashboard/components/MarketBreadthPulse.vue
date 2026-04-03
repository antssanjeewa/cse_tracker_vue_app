<script setup>
import { Scale } from 'lucide-vue-next'
import { useMarketStore } from '@/stores/marketStore'

const marketStore = useMarketStore()
</script>

<template>
  <div class="bg-[#121a2c]/40 border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-40">
    <div class="flex items-center justify-between mb-4">
      <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Breadth Pulse</span>
      <Scale class="w-4 h-4 text-slate-500" />
    </div>
    
    <div class="flex items-end justify-between mb-2">
      <div class="flex flex-col">
        <span class="text-3xl font-black text-white italic tracking-tighter">{{ marketStore.breadthCount.advancers }}</span>
        <span class="text-[9px] font-black text-emerald-500 uppercase">Advancers</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-xl font-black text-slate-400 italic tracking-tighter">{{ marketStore.breadthCount.unchanged }}</span>
        <span class="text-[9px] font-black text-slate-500 uppercase">Unchanged</span>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-3xl font-black text-white italic tracking-tighter">{{ marketStore.breadthCount.decliners }}</span>
        <span class="text-[9px] font-black text-rose-500 uppercase">Decliners</span>
      </div>
    </div>

    <div class="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
      <div class="bg-emerald-500" :style="{ width: (marketStore.breadthCount.advancers / (marketStore.breadthCount.total || 1) * 100) + '%' }"></div>
      <div class="bg-slate-700" :style="{ width: (marketStore.breadthCount.unchanged / (marketStore.breadthCount.total || 1) * 100) + '%' }"></div>
      <div class="bg-rose-500" :style="{ width: (marketStore.breadthCount.decliners / (marketStore.breadthCount.total || 1) * 100) + '%' }"></div>
    </div>

    <p class="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-tight">
      Live Sentiment: {{ marketStore.breadthCount.advancers > marketStore.breadthCount.decliners ? 'BULLISH' : 'BEARISH' }}
    </p>
  </div>
</template>
