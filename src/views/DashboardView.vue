<script setup>
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import DashboardLayout from '../components/layouts/DashboardLayout.vue'
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Clock, 
  RefreshCw, 
  Maximize2,
  Filter
} from 'lucide-vue-next'

const selectedInterval = ref('30m')
const selectedTime = ref('10:30-11:00')

const timeIntervals = [
  '09:30-10:00', '10:00-10:30', '10:30-11:00', '11:00-11:30', 
  '11:30-12:00', '12:00-12:30', '12:30-13:00', '13:00-13:30', '13:30-14:00'
]

const stats = [
  { label: 'Interval Turnover', value: '633,843,024.55', subValue: '15.3% of Daily Total', icon: RefreshCw },
  { label: 'ASPI', value: '176.7', subValue: '0.844%', icon: Activity },
  { label: 'ASPI Contribution', value: '121 / 41', subValue: 'Market Open', icon: Users },
  { label: 'Trades (Interval)', value: '6,602', subValue: 'Live', icon: Clock },
]

// Treemap Chart
const treemapOptions = {
  chart: { type: 'treemap', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  colors: ['#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b'],
  plotOptions: { treemap: { distributed: true, enableShades: false } },
  dataLabels: { enabled: true, style: { fontSize: '10px', fontWeight: 'bold' } },
  grid: { padding: { left: 0, right: 0 } }
}
const treemapSeries = [{
  data: [
    { x: 'SCAP.N0000', y: 125.1 }, { x: 'SHL.N0000', y: 81.1 }, { x: 'JKH.N0000', y: 39.0 },
    { x: 'SAMP.N0000', y: 35.5 }, { x: 'COMB.N0000', y: 33.4 }, { x: 'PLR.N0000', y: 24.5 },
    { x: 'HNB.N0000', y: 12.8 }, { x: 'CRL.N0000', y: 20.8 }
  ]
}]

// ASPI Movers
const horizontalBarOptions = {
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 2, barHeight: '70%' } },
  colors: ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#ef4444', '#ef4444', '#ef4444'],
  dataLabels: { enabled: true, formatter: (val) => val.toFixed(2), offsetX: 0, style: { fontSize: '10px' } },
  xaxis: { categories: ['DIAL.N', 'HNB.N', 'SUN.N', 'DOCK.N', 'SFCL.N', 'ATL.N', 'CFLB.N', 'HML.N'], labels: { show: false } },
  grid: { show: false }
}
const horizontalBarSeries = [{ data: [16.09, 12.54, 7.42, 7.27, 6.86, -3.13, -3.17, -3.32] }]

// T/O Divergence (Bar Chart)
const divergenceOptions = {
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  plotOptions: { bar: { colors: { ranges: [{ from: -200, to: 0, color: '#ef4444' }, { from: 1, to: 200, color: '#10b981' }] } } },
  xaxis: { categories: ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00'], labels: { style: { fontSize: '9px' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)' }
}
const divergenceSeries = [{ name: 'Divergence', data: [120, 20, 40, -100, -150, -50, -10, 80, 150, 40] }]

// ASPI Movement (Line Chart)
const lineOptions = {
  chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  stroke: { curve: 'smooth', width: 2, colors: ['#ef4444'] },
  xaxis: { categories: ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30'], labels: { style: { fontSize: '9px' } } },
  markers: { size: 4, colors: ['#ef4444'], strokeColors: '#0b0f1a', strokeWidth: 2 },
  grid: { borderColor: 'rgba(255,255,255,0.05)' }
}
const lineSeries = [{ name: 'ASPI', data: [21.1, 20.9, 21.2, 20.8, 20.6, 20.4] }]

// Session Turnover (Bar Chart)
const sessionOptions = {
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  theme: { mode: 'dark' },
  colors: ['rgba(255,255,255,0.2)'],
  plotOptions: { bar: { borderRadius: 2, columnWidth: '60%' } },
  xaxis: { categories: ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30'], labels: { style: { fontSize: '9px' } } },
  grid: { borderColor: 'rgba(255,255,255,0.05)' }
}
const sessionSeries = [{ name: 'Turnover', data: [580, 250, 280, 320, 380, 480] }]

const activeTab = ref('TOP T/O')
const stockData = [
  { code: 'SCAP.N0000', ltp: '14.20', to: '125.1M', chg: '10.08%' },
  { code: 'SHL.N0000', ltp: '12.40', to: '81.1M', chg: '4.20%' },
  { code: 'JKH.N0000', ltp: '19.10', to: '39.0M', chg: '0.52%' },
  { code: 'SAMP.N0000', ltp: '151.00', to: '35.5M', chg: '0.67%' },
  { code: 'COMB.N0000', ltp: '198.00', to: '33.4M', chg: '0.51%' },
  { code: 'PLR.N0000', ltp: '47.10', to: '24.5M', chg: '2.15%' }
]
</script>

<template>
  <DashboardLayout>
    <div class="flex h-[calc(100vh-64px)] overflow-hidden">
      
      <!-- Dashboard Sidebar: Time Selection -->
      <aside class="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col p-4 shrink-0 overflow-y-auto custom-scrollbar">
        <div class="mb-6">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">Date</p>
          <div class="bg-slate-900 border border-white/5 p-2 rounded-lg flex items-center justify-between cursor-pointer">
            <span class="text-xs font-bold font-mono">2026-03-20</span>
            <RefreshCw class="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        <div class="mb-6">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Interval Turnover</p>
          <div class="grid grid-cols-2 gap-2">
            <button 
              @click="selectedInterval = '15m'"
              class="py-2 text-[10px] font-bold rounded-lg border border-white/5 transition-all"
              :class="selectedInterval === '15m' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'"
            >15m</button>
            <button 
              @click="selectedInterval = '30m'"
              class="py-2 text-[10px] font-bold rounded-lg border border-white/5 transition-all"
              :class="selectedInterval === '30m' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'"
            >30m</button>
          </div>
          <button class="w-full mt-2 py-2.5 bg-amber-600/20 text-amber-500 text-[10px] font-black rounded-lg border border-amber-500/20 uppercase tracking-widest hover:bg-amber-600/30 transition-all">
            LOAD DATA
          </button>
        </div>

        <div class="flex-1">
          <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Periods</p>
          <div class="space-y-1">
            <button 
              v-for="time in timeIntervals" 
              :key="time"
              @click="selectedTime = time"
              class="w-full py-2.5 px-3 rounded-lg text-left text-[11px] font-bold border transition-all"
              :class="selectedTime === time 
                ? 'bg-amber-600/10 border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/5' 
                : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'"
            >
              {{ time }}
            </button>
          </div>
        </div>
      </aside>

      <!-- Dashboard Main Area -->
      <div class="flex-1 bg-[#0b0f1a] p-4 overflow-y-auto custom-scrollbar">
        
        <!-- Summary Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div v-for="stat in stats" :key="stat.label" class="bg-[#151c2c] border border-white/5 p-4 rounded-xl relative">
            <p class="text-[10px] uppercase font-bold text-slate-500 mb-1">{{ stat.label }}</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-lg font-black text-white font-mono">{{ stat.value }}</h3>
              <span class="text-[10px] font-bold" :class="stat.subValue.includes('Daily') ? 'text-slate-500' : 'text-emerald-500'">
                {{ stat.subValue }}
              </span>
            </div>
            <div class="absolute top-2 right-2 p-1.5 opacity-10">
              <component :is="stat.icon" class="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-12 gap-4">
          
          <!-- Turnover Treemap -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <TrendingUp class="w-3.5 h-3.5 text-amber-500" />
                <h2 class="text-xs font-black text-white uppercase">Turnover (Top 10)</h2>
              </div>
              <div class="flex gap-1 shrink-0">
                <button class="p-1 px-2 text-[10px] bg-indigo-600 rounded text-white"><LayoutGrid class="w-3 h-3"/></button>
                <button class="p-1 px-2 text-[10px] bg-white/5 rounded text-slate-500"><Maximize2 class="w-3 h-3"/></button>
              </div>
            </div>
            <div class="h-64">
              <VueApexCharts :options="treemapOptions" :series="treemapSeries" height="100%" />
            </div>
          </div>

          <!-- ASPI Movers -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xs font-black text-white uppercase">ASPI Movers (pts)</h2>
              <div class="flex gap-1 shrink-0">
                <button class="p-1 px-2 text-[10px] bg-white/5 rounded text-slate-500"><Maximize2 class="w-3 h-3"/></button>
              </div>
            </div>
            <div class="h-64">
              <VueApexCharts :options="horizontalBarOptions" :series="horizontalBarSeries" height="100%" />
            </div>
          </div>

          <!-- Stock Lists side table -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 rounded-xl flex flex-col overflow-hidden">
            <div class="flex border-b border-white/5 bg-slate-900/50 p-1">
              <button 
                v-for="tab in ['TOP T/O', 'GAINERS', 'LOSERS']" 
                :key="tab"
                @click="activeTab = tab"
                class="flex-1 py-1.5 text-[9px] font-black rounded transition-all"
                :class="activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'"
              >{{ tab }}</button>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar">
              <table class="w-full text-left">
                <thead class="bg-slate-900/30 text-[9px] font-bold text-slate-500 sticky top-0">
                  <tr>
                    <th class="p-2">CODE</th>
                    <th class="p-2 text-right">LTP</th>
                    <th class="p-2 text-right">T/O</th>
                    <th class="p-2 text-right">CHG%</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr v-for="stock in stockData" :key="stock.code" class="hover:bg-white/5 transition-colors">
                    <td class="p-2 text-[10px] font-bold text-white">{{ stock.code.split('.')[0] }}</td>
                    <td class="p-2 text-[10px] font-bold text-right font-mono">{{ stock.ltp }}</td>
                    <td class="p-2 text-[10px] font-bold text-right text-slate-400 font-mono">{{ stock.to }}</td>
                    <td class="p-2 text-[10px] font-bold text-right text-emerald-500 font-mono">{{ stock.chg }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bottom Row: T/O Divergence, ASPI Movement, Session Turnover -->
          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <h2 class="text-[10px] font-black text-white uppercase mb-4 flex items-center justify-between">
               T/O Divergence (Avg) - Avg 415.6M
               <Maximize2 class="w-3 h-3 text-slate-500" />
             </h2>
             <div class="h-48">
               <VueApexCharts :options="divergenceOptions" :series="divergenceSeries" height="100%" />
             </div>
          </div>

          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <h2 class="text-[10px] font-black text-white uppercase mb-4 flex items-center justify-between">
               ASPI Movement
               <Maximize2 class="w-3 h-3 text-slate-500" />
             </h2>
             <div class="h-48">
               <VueApexCharts :options="lineOptions" :series="lineSeries" height="100%" />
             </div>
          </div>

          <div class="col-span-12 lg:col-span-4 bg-[#151c2c] border border-white/5 p-4 rounded-xl">
             <h2 class="text-[10px] font-black text-white uppercase mb-4 flex items-center justify-between">
               Session Turnover
               <Maximize2 class="w-3 h-3 text-slate-500" />
             </h2>
             <div class="h-48">
               <VueApexCharts :options="sessionOptions" :series="sessionSeries" height="100%" />
             </div>
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
  border-radius: 8px !important;
}
:deep(.apexcharts-tooltip-title) {
  background: rgba(255, 255, 255, 0.05) !important;
  font-size: 10px !important;
  padding: 4px 8px !important;
}
:deep(.apexcharts-text) {
  fill: #94a3b8 !important;
}
</style>
