<script setup>
import { computed } from 'vue'
import { PieChart } from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useMarketStore } from '@/stores/marketStore'

const portfolioStore = usePortfolioStore()
const marketStore = useMarketStore()

const formatCurrency = (val) => marketStore.formatCurrency(val)

const chartOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: portfolioStore.holdings.map(h => h.stocks?.ticker || 'N/A'),
  theme: { mode: 'dark' },
  stroke: { show: false },
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      expandOnClick: true,
      donut: { 
        size: '75%', 
        labels: { 
          show: true, 
          total: { 
            show: true, 
            label: 'TOTAL VALUE', 
            color: '#64748b', 
            fontSize: '9px', 
            fontWeight: 'bold',
            formatter: () => formatCurrency(portfolioStore.totalEquity)
          },
          value: {
            show: true,
            fontSize: '14px',
            fontWeight: '900',
            color: '#fff',
            formatter: (val) => formatCurrency(val)
          }
        } 
      }
    }
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val) => formatCurrency(val) }
  }
}))

const chartSeries = computed(() => portfolioStore.holdings.map(h => parseFloat(h.marketValue || 0)))
</script>

<template>
  <div class="bg-[#121a2c] border border-white/5 p-6 rounded-3xl overflow-hidden min-h-[300px]">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
        <PieChart class="w-4 h-4 text-indigo-400" />
        Diversification Index
      </h2>
      <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Asset Exposure</span>
    </div>

    <!-- Chart Visualization -->
    <div class="flex items-center justify-center h-52 relative">
      <div class="w-full">
        <VueApexCharts v-if="portfolioStore.holdings.length > 0" type="donut" height="220" :options="chartOptions" :series="chartSeries" />
        <div v-else class="h-full flex items-center justify-center opacity-10 flex-col gap-2">
           <PieChart class="w-12 h-12" />
           <span class="text-[10px] font-black uppercase">No active exposure</span>
        </div>
      </div>
    </div>
  </div>
</template>
