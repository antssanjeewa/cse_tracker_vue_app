<script setup>
const props = defineProps({
  transactions: Array
})

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="bg-[#121a2c] border border-white/5 rounded-xl overflow-hidden">
    <div class="p-4 border-b border-white/5">
      <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
        <div class="w-1.5 h-4 bg-amber-500 rounded-full"></div>
        Recent Transactions
      </h3>
    </div>
    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-900/50 text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5">
          <tr>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Type</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3 text-right">Qty</th>
            <th class="px-4 py-3 text-right">Price</th>
            <th class="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5 font-mono">
          <tr v-for="t in transactions" :key="t.id" class="hover:bg-white/5 transition-colors">
            <td class="px-4 py-3 text-[10px] font-bold text-slate-400">{{ formatDate(t.date) }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase" :class="{
                'bg-emerald-500/10 text-emerald-500': t.type === 'BUY',
                'bg-rose-500/10 text-rose-500': t.type === 'SELL',
                'bg-indigo-500/10 text-indigo-500': t.type === 'DIVIDEND'
              }">{{ t.type }}</span>
            </td>
            <td class="px-4 py-3 text-[10px] font-black text-white uppercase">{{ t.stocks?.ticker }}</td>
            <td class="px-4 py-3 text-right text-[10px] font-bold text-slate-400">{{ t.qty }}</td>
            <td class="px-4 py-3 text-right text-[10px] font-bold text-slate-400">{{ formatCurrency(t.unit_price) }}</td>
            <td class="px-4 py-3 text-right text-[10px] font-black text-white">{{ formatCurrency(t.total_price) }}</td>
          </tr>
          <tr v-if="transactions.length === 0">
            <td colspan="6" class="p-12 text-center text-slate-500 uppercase font-bold text-[10px] tracking-widest">
              No transactions recorded yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
