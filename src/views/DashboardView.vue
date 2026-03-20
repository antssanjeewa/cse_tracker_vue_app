<script setup>
import { defineComponent, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Clock } from 'lucide-vue-next'

const stats = [
  { label: 'Interval Turnover', value: '633,843,024.55', change: '+15.3%', isPositive: true, icon: DollarSign },
  { label: 'ASPI', value: '176.7', change: '0.844%', isPositive: true, icon: Activity },
  { label: 'ASPI Contribution', value: '121 / 41', change: 'Market Open', isPositive: true, icon: Users },
  { label: 'Trades (Interval)', value: '6,602', change: 'Last 15m', isPositive: true, icon: Clock },
]

const treemapOptions = {
  chart: { type: 'treemap', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  colors: ['#f59e0b', '#6366f1', '#10b981'],
  plotOptions: {
    treemap: {
      distributed: true,
      enableShades: false
    }
  },
  dataLabels: { enabled: true, style: { fontSize: '12px' } }
}

const treemapSeries = [{
  data: [
    { x: 'SCAP.N0000', y: 125.1 },
    { x: 'SHL.N0000', y: 81.1 },
    { x: 'JKH.N0000', y: 39.0 },
    { x: 'SAMP.N0000', y: 35.5 },
    { x: 'COMB.N0000', y: 33.4 },
    { x: 'PLR.N0000', y: 24.5 },
    { x: 'HAYL.N0000', y: 15.3 },
    { x: 'CRL.N0000', y: 20.8 },
  ]
}]

const barOptions = {
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  plotOptions: {
    bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '60%' }
  },
  colors: ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#ef4444', '#ef4444', '#ef4444'],
  xaxis: { categories: ['DIAL.N', 'HNB.N', 'SUN.N', 'DOCK.N', 'SFCL.N', 'TJL.N', 'MELS.N', 'PARA.N'] },
  grid: { borderColor: 'rgba(255,255,255,0.05)' }
}

const barSeries = [{
  data: [16.09, 12.54, 7.42, 7.27, 6.86, -3.13, -3.17, -3.32]
}]

const lineOptions = {
  chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  stroke: { curve: 'smooth', width: 3, colors: ['#6366f1'] },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
  dataLabels: { enabled: false },
  grid: { borderColor: 'rgba(255,255,255,0.05)' },
  xaxis: { categories: ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'] }
}

const lineSeries = [{
  name: 'ASPI',
  data: [20.4, 20.6, 21.0, 21.2, 21.0, 20.8, 20.6, 20.5, 20.4, 20.4]
}]

const activeTab = ref('T/O')
const stockLists = {
  'T/O': [
    { code: 'SCAP.N0000', ltp: '14.20', to: '125.1M', change: '+10.08%' },
    { code: 'SHL.N0000', ltp: '12.40', to: '81.1M', change: '+4.20%' },
    { code: 'JKH.N0000', ltp: '19.10', to: '39.0M', change: '+0.52%' },
    { code: 'SAMP.N0000', ltp: '151.00', to: '35.5M', change: '+0.67%' },
    { code: 'COMB.N0000', ltp: '198.00', to: '33.4M', change: '+0.51%' },
    { code: 'PLR.N0000', ltp: '47.50', to: '24.5M', change: '+2.15%' },
  ]
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="flex items-end justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">Market Overview</h1>
          <p class="text-slate-400">Track and analyze stock performance in real-time.</p>
        </div>
        <div class="flex gap-3">
          <div class="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2 text-sm font-medium text-slate-400">
            Selected Date: <span class="text-white">2026-03-20</span>
          </div>
          <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
            REFRESH DATA
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="stat in stats" 
          :key="stat.label"
          class="bg-[#0f172a]/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
        >
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <component :is="stat.icon" class="w-12 h-12 text-indigo-400" />
          </div>
          <p class="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">{{ stat.label }}</p>
          <div class="flex items-baseline gap-2 mb-2">
            <h3 class="text-2xl font-black text-white leading-none tracking-tight">{{ stat.value }}</h3>
            <span v-if="stat.change" class="text-xs font-bold text-emerald-400">{{ stat.change }}</span>
          </div>
          <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
            <div class="bg-indigo-500 h-full w-2/3 group-hover:w-full transition-all duration-1000"></div>
          </div>
        </div>
      </div>

      <!-- Main Grid Sections -->
      <div class="grid grid-cols-12 gap-8">
        
        <!-- Turnover Heatmap -->
        <div class="col-span-12 lg:col-span-8 bg-[#0f172a]/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <TrendingUp class="w-5 h-5 text-amber-500" />
              </div>
              <h2 class="text-xl font-bold text-white tracking-tight">TURNOVER (TOP 10)</h2>
            </div>
            <div class="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button class="px-4 py-1.5 text-xs font-bold rounded-lg bg-white/10 text-white">TreeMap</button>
              <button class="px-4 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:text-white transition-colors">List</button>
            </div>
          </div>
          <div class="h-[400px]">
            <VueApexCharts :options="treemapOptions" :series="treemapSeries" height="100%" />
          </div>
        </div>

        <!-- Sidebar List / Right -->
        <div class="col-span-12 lg:col-span-4 bg-[#0f172a]/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <div class="flex mb-8 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button 
              v-for="tab in ['TOP T/O', 'GAINERS', 'LOSERS']" 
              :key="tab"
              @click="activeTab = tab"
              class="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200"
              :class="activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'"
            >
              {{ tab }}
            </button>
          </div>
          
          <div class="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            <div 
              v-for="stock in stockLists['T/O']" 
              :key="stock.code"
              class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer"
            >
              <div>
                <p class="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{{ stock.code }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ stock.to }} TO</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-white">{{ stock.ltp }}</p>
                <p class="text-xs font-bold text-emerald-400">{{ stock.change }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row Charts -->
        <div class="col-span-12 lg:col-span-6 bg-[#0f172a]/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
           <h2 class="text-xl font-bold text-white mb-8 flex items-center gap-3">
             <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
               <TrendingUp class="w-5 h-5 text-indigo-500" />
             </div>
             ASPI MOVERS (PTS)
           </h2>
           <div class="h-[300px]">
             <VueApexCharts :options="barOptions" :series="barSeries" height="100%" />
           </div>
        </div>

        <div class="col-span-12 lg:col-span-6 bg-[#0f172a]/40 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
           <h2 class="text-xl font-bold text-white mb-8 flex items-center gap-3">
             <div class="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
               <Activity class="w-5 h-5 text-purple-500" />
             </div>
             ASPI MOVEMENT
           </h2>
           <div class="h-[300px]">
             <VueApexCharts :options="lineOptions" :series="lineSeries" height="100%" />
           </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
:deep(.apexcharts-tooltip) {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
  border-radius: 12px !important;
}

:deep(.apexcharts-tooltip-title) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  font-weight: 700 !important;
}
</style>
