<script setup>
const props = defineProps({
  stocks: Array,
  activeTab: String
})
</script>

<template>
  <div class="flex-1 overflow-y-auto custom-scrollbar">
    <table class="w-full text-left">
      <thead class="bg-slate-900/30 text-[9px] font-bold text-slate-500 sticky top-0 uppercase">
        <tr>
          <th class="p-2">CODE</th>
          <th class="p-2 text-right">PRICE</th>
          <th class="p-2 text-right">T/O</th>
          <th class="p-2 text-right">CHG / TRADES</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-white/5 font-mono">
        <tr v-for="stock in stocks" :key="stock.code" class="hover:bg-white/5 transition-colors">
          <td class="p-2 text-[10px] font-bold text-amber-500 uppercase">{{ stock.code.split('.')[0] }}</td>
          <td class="p-2 text-[10px] font-black text-right text-slate-100">{{ stock.ltp }}</td>
          <td class="p-2 text-[10px] font-bold text-right text-slate-400 font-mono">{{ stock.to }}</td>
          <td class="p-2 text-[10px] font-bold text-right" :class="stock.chg.includes('-') ? 'text-rose-500' : 'text-emerald-500'">{{ stock.chg }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
