<script setup>
import { ref } from 'vue'
import { useMarketStore } from '@/stores/marketStore'
import MiniStockTable from './MiniStockTable.vue'

const marketStore = useMarketStore()
const activeTab = ref('gain')
</script>

<template>
  <div class="bg-[#121a2c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
    <!-- Terminal Tabs -->
    <div class="p-2 border-b border-white/5 flex items-center gap-1 bg-white/[0.02]">
       <button v-for="tab in ['gain', 'loss', 'turnover']" :key="tab"
          @click="activeTab = tab"
          class="flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl active:scale-95"
          :class="activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:bg-white/5'"
       >
          {{ tab === 'turnover' ? 'Vol' : tab + 's' }}
       </button>
    </div>

    <!-- Scrollable Stock List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
       <transition name="fade-slide" mode="out-in">
          <div :key="activeTab">
             <MiniStockTable 
                v-if="activeTab === 'gain'" 
                :stocks="marketStore.gainers.slice(0, 10)" 
                type="gain" 
             />
             <MiniStockTable 
                v-if="activeTab === 'loss'" 
                :stocks="marketStore.losers.slice(0, 10)" 
                type="loss" 
             />
             <MiniStockTable 
                v-if="activeTab === 'turnover'" 
                :stocks="marketStore.topTo.slice(0, 10)" 
                type="default" 
             />
          </div>
       </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
