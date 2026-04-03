<script setup>
import { Activity, ExternalLink } from 'lucide-vue-next'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useMarketStore } from '@/stores/marketStore'

const portfolioStore = usePortfolioStore()
const marketStore = useMarketStore()

const props = defineProps({
  totalLiveProfit: Number,
  totalLiveRoi: Number
})

const formatCurrency = (val) => marketStore.formatCurrency(val)
</script>

<template>
  <div class="bg-[#1a2133] border border-white/5 p-6 rounded-3xl text-white relative shadow-2xl overflow-hidden group h-40">
    <div class="flex items-center justify-between mb-4 relative z-10">
      <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Portfolio Net Worth</span>
      <ExternalLink class="w-4 h-4 text-slate-500" />
    </div>

    <div class="flex flex-col relative z-10">
      <h3 class="text-3xl font-black italic tracking-tighter text-white drop-shadow-sm">{{ formatCurrency(portfolioStore.netWorth) }}</h3>
      
      <div class="grid grid-cols-2 gap-4 mt-3">
        <div class="flex flex-col">
          <span class="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-0.5">Live Profit</span>
          <span class="text-sm font-black" :class="totalLiveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
            {{ (totalLiveProfit >= 0 ? '+' : '') }}{{ formatCurrency(totalLiveProfit) }}
          </span>
        </div>
        <div class="flex flex-col text-right border-l border-white/5 pl-4">
          <span class="text-[8px] font-black text-slate-500 uppercase tracking-tight mb-0.5">ROI Margin</span>
          <span class="text-sm font-black" :class="totalLiveRoi >= 0 ? 'text-emerald-400' : 'text-rose-400'">
            {{ totalLiveRoi.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
    
    <!-- Background Activity Visualization -->
    <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform active:scale-95 cursor-pointer">
      <Activity class="w-24 h-24 text-indigo-500" />
    </div>
  </div>
</template>
