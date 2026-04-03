<script setup>
import { onMounted } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import DashboardLayout from '@/components/layouts/DashboardLayout.vue'
import { BarChart3, TrendingUp, TrendingDown, Users, Activity, Clock, Zap } from 'lucide-vue-next'
import MiniStockTable from '@/features/dashboard/components/MiniStockTable.vue'

const marketStore = useMarketStore()

onMounted(() => {
  marketStore.fetchDashboardData()
})

const formatCurrency = (val) => marketStore.formatCurrency(val)
const formatNumber = (val) => marketStore.formatNumber(val)
</script>

<template>
  <DashboardLayout>
    <div class="p-6 max-w-[1600px] mx-auto min-h-screen bg-[#0c1221]">
      <!-- Title & Live Indicator -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex flex-col">
          <h1 class="text-3xl font-black text-white flex items-center gap-3 tracking-tighter italic uppercase">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center not-italic rotate-3">
               <Zap class="w-6 h-6 text-white" />
            </div>
            Market Terminal
          </h1>
          <div class="flex items-center gap-2 mt-2">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live Market Feed — Colombo Stock Exchange</span>
          </div>
        </div>
        <div class="hidden md:flex flex-col items-end">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Last Synced</span>
          <span class="text-xs font-mono text-white/70">{{ new Date().toLocaleTimeString() }}</span>
        </div>
      </div>

      <!-- High-Impact Summary Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div v-for="stat in marketStore.stats" :key="stat.label" 
             class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div class="flex items-center justify-between mb-3">
             <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{{ stat.label }}</span>
             <Activity class="w-4 h-4 text-slate-500" />
          </div>
          <div class="flex flex-col">
             <h3 class="text-2xl font-black text-white tracking-tight">{{ stat.value }}</h3>
             <div class="flex items-center gap-1.5 mt-2">
                <span class="text-[10px] font-bold p-1 px-2 rounded-lg" 
                      :class="stat.subValue.includes('+') || stat.subValue.includes('VOL') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'">
                  {{ stat.subValue }}
                </span>
             </div>
          </div>
          <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform"><Zap class="w-32 h-32 text-indigo-500" /></div>
        </div>
      </div>

      <!-- Main Market Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Center Piece: Gainers & Losers -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 xl:col-span-2">
          
          <!-- Top Gainers -->
          <div class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div class="p-5 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
               <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div class="p-1 px-2 rounded bg-emerald-500 text-[10px] text-emerald-950">BULLS</div>
                  High Relative Strength
               </h3>
               <TrendingUp class="w-4 h-4 text-emerald-500" />
            </div>
            <MiniStockTable :stocks="marketStore.gainers.slice(0, 5)" type="gain" />
          </div>

          <!-- Top Losers -->
          <div class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div class="p-5 border-b border-white/5 flex items-center justify-between bg-rose-500/5">
                <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div class="p-1 px-2 rounded bg-rose-500 text-[10px] text-rose-950">BEARS</div>
                  Selling Pressure
               </h3>
               <TrendingDown class="w-4 h-4 text-rose-500" />
            </div>
            <MiniStockTable :stocks="marketStore.losers.slice(0, 5)" type="loss" />
          </div>
        </div>

        <!-- Sidebar: Market Breadth & High Active -->
        <div class="flex flex-col gap-6">
           <!-- Market Breadth Card -->
           <div class="bg-indigo-600 border border-indigo-500 p-6 rounded-3xl shadow-2xl shadow-indigo-600/20 text-white relative overflow-hidden">
              <div class="flex items-center justify-between mb-6">
                 <h2 class="text-xs font-black uppercase tracking-widest">Market Breadth</h2>
                 <Users class="w-4 h-4 text-white/50" />
              </div>
              <div class="flex items-end gap-3 mb-6">
                 <div class="text-4xl font-black italic">64 <span class="text-lg opacity-50 not-italic">/ 12</span></div>
                 <span class="text-[9px] font-black uppercase mb-1 bg-white/20 px-2 py-0.5 rounded">Bull Intensity</span>
              </div>
              <div class="h-3 bg-white/10 rounded-full flex overflow-hidden border border-white/10">
                 <div class="h-full bg-emerald-400 w-3/4 shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                 <div class="h-full bg-rose-400 w-1/4"></div>
              </div>
              <div class="flex items-center justify-between mt-3">
                 <span class="text-[9px] font-black text-white/60">ADVANCERS</span>
                 <span class="text-[9px] font-black text-white/60 text-right">DECLINERS</span>
              </div>
           </div>

           <!-- High Turnover Section -->
           <div class="bg-[#121a2c]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
              <div class="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 class="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div class="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                  High Liquidity Stocks
                </h3>
                <Clock class="w-3.5 h-3.5 text-slate-500" />
              </div>
              <MiniStockTable :stocks="marketStore.topTo.slice(0, 5)" type="default" />
           </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
