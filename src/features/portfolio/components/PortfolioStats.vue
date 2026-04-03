<script setup>
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'

const props = defineProps({
  equity: Number,
  profit: Number,
  cash: Number,
  totalDividends: Number,
  netWorth: Number
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val)
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
    <!-- Net Worth Card -->
    <div class="bg-indigo-600 border border-white/10 p-5 rounded-2xl relative overflow-hidden group shadow-2xl shadow-indigo-600/30 col-span-1 md:col-span-1">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Total Net Worth</span>
        <Wallet class="w-4 h-4 text-white/50" />
      </div>
      <h3 class="text-2xl font-black text-white leading-tight">
        {{ formatCurrency(netWorth) }}
      </h3>
      <div class="mt-2 flex items-center gap-2">
        <div class="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
          <div class="h-full bg-white w-2/3"></div>
        </div>
        <span class="text-[9px] font-bold text-white/70 uppercase">High Conviction</span>
      </div>
    </div>

    <!-- Equity Card -->
    <div class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portfolio Equity</span>
        <TrendingUp class="w-4 h-4 text-emerald-400" />
      </div>
      <h3 class="text-xl font-black text-white">
        {{ formatCurrency(equity) }}
      </h3>
      <div class="flex items-center gap-1 mt-2 text-[10px] font-bold p-1 px-2 border border-emerald-500/20 bg-emerald-500/10 rounded-lg w-fit text-emerald-400">
        {{ equity > 0 ? ((profit / (equity - profit)) * 100).toFixed(2) : '0' }}% All-time ROI
      </div>
    </div>

    <!-- Profit Card -->
    <div class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unrealized P/L</span>
        <div class="p-1 px-2 bg-emerald-500/10 rounded text-[9px] font-black text-emerald-500">PROFITABLE</div>
      </div>
      <h3 class="text-xl font-black" :class="profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
        {{ (profit >= 0 ? '+' : '') }}{{ formatCurrency(profit) }}
      </h3>
      <p class="text-[9px] font-bold text-slate-600 mt-2 uppercase tracking-tighter italic">excluding realized trades</p>
    </div>

    <!-- Cash Balance -->
    <div class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Purchasing Power</span>
        <DollarSign class="w-4 h-4 text-amber-500" />
      </div>
      <h3 class="text-xl font-black text-white">
        {{ formatCurrency(cash) }}
      </h3>
      <p class="text-[9px] font-bold text-amber-500/60 mt-2 uppercase tracking-tighter">Settled Balance</p>
    </div>

    <!-- Dividend Card -->
    <div class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl relative overflow-hidden group">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dividend Income</span>
        <ArrowUpRight class="w-4 h-4 text-indigo-400" />
      </div>
      <h3 class="text-xl font-black text-white">
        {{ formatCurrency(totalDividends) }}
      </h3>
      <p class="text-[9px] font-bold text-indigo-500/60 mt-2 uppercase tracking-tighter">Passive Gains</p>
    </div>
  </div>
</template>
