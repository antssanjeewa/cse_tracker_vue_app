<script setup>
import { ref, computed, watch } from 'vue'
import { X, Search, DollarSign, Briefcase, Calendar, Info, Loader2, TrendingUp, TrendingDown, Layers } from 'lucide-vue-next'
import { useMarketStore } from '@/stores/marketStore'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'save'])

const marketStore = useMarketStore()
const searchQuery = ref('')
const selectedStock = ref(null)
const quantity = ref('')
const price = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const type = ref('BUY') // BUY, SELL

const filteredStocks = computed(() => {
  if (searchQuery.value.length < 2) return []
  const query = searchQuery.value.toLowerCase()
  return marketStore.allStocks
    .filter(s => (s.code || '').toLowerCase().includes(query) || (s.name || '').toLowerCase().includes(query))
    .slice(0, 5)
})

const selectStock = (stock) => {
  selectedStock.value = stock
  searchQuery.value = stock.code
  price.value = stock.price
}

// Reset if search query is cleared but a stock was selected
watch(searchQuery, (newVal) => {
  if (selectedStock.value && newVal !== selectedStock.value.code) {
    selectedStock.value = null
  }
})

const totalValue = computed(() => {
  const q = parseFloat(quantity.value) || 0
  const p = parseFloat(price.value) || 0
  return (q * p).toFixed(2)
})

const handleSave = () => {
  if (!selectedStock.value || !quantity.value || !price.value) return
  
  emit('save', {
    stock_id: selectedStock.value.id,
    ticker: selectedStock.value.code,
    quantity: parseFloat(quantity.value),
    price: parseFloat(price.value),
    date: date.value,
    type: type.value
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-[#020617]/90 backdrop-blur-md animate-in fade-in duration-300" 
        @click="emit('close')"
      ></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-xl bg-[#0c1221] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(79,70,229,0.15)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <!-- Header -->
        <div class="p-8 border-b border-white/5 flex items-center justify-between bg-indigo-500/[0.03]">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
              <Plus class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-xl font-black text-white uppercase tracking-tighter italic">Execute Trade</h2>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Order Entry / CSE Portal</p>
            </div>
          </div>
          <button @click="emit('close')" class="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-90">
            <X class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-8 space-y-8">
          <!-- Selection Row -->
          <div class="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
             <button 
              @click="type = 'BUY'"
              :class="type === 'BUY' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'"
              class="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
             >
                <TrendingUp class="w-3.5 h-3.5 mx-auto mb-1" v-if="type === 'BUY'" />
                Buy Position
             </button>
             <button 
              @click="type = 'SELL'"
              :class="type === 'SELL' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'"
              class="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
             >
                <TrendingDown class="w-3.5 h-3.5 mx-auto mb-1" v-if="type === 'SELL'" />
                Sell Position
             </button>
          </div>

          <!-- Stock Search -->
          <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Search Equity Trading Symbol</label>
              <span v-if="selectedStock" class="text-[9px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded">Verified Trading Code</span>
            </div>
            <div class="relative group">
              <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="ENTER TICKER (E.G. COMB, HNB)..."
                class="w-full bg-[#0b0f1a] border-2 border-white/5 rounded-[1.5rem] px-14 py-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/30 transition-all uppercase tracking-wider"
              />
              
              <!-- Search Results Dropdown -->
              <div v-if="filteredStocks.length > 0 && !selectedStock" class="absolute left-0 right-0 top-full mt-3 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 divide-y divide-white/5">
                <button 
                  v-for="stock in filteredStocks" 
                  :key="stock.code"
                  @click="selectStock(stock)"
                  class="w-full px-6 py-4 text-left hover:bg-indigo-600/20 flex items-center justify-between group transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-indigo-500 border border-white/10 group-hover:border-indigo-500/30">
                       {{ stock.code.charAt(0) }}
                    </div>
                    <div>
                      <span class="block text-[11px] font-black text-indigo-400 group-hover:text-white uppercase">{{ stock.code.split('.')[0] }}</span>
                      <span class="block text-[10px] font-bold text-slate-500 truncate max-w-[200px]">{{ stock.name }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="block text-xs font-mono font-black text-white px-3 py-1.5 bg-white/5 rounded-xl group-hover:bg-indigo-500/30">LKR {{ (stock.price || 0).toFixed(2) }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity & Price -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Share Quantity</label>
              <div class="relative">
                <Layers class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  v-model="quantity"
                  type="number"
                  placeholder="0.00"
                  class="w-full bg-[#0b0f1a] border-2 border-white/5 rounded-2xl px-12 py-4 text-sm font-black text-white focus:outline-none focus:border-indigo-500/30 transition-all font-mono"
                />
              </div>
            </div>
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Unit Price (LKR)</label>
              <div class="relative">
                <DollarSign class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  v-model="price"
                  type="number"
                  step="0.10"
                  placeholder="0.00"
                  class="w-full bg-[#0b0f1a] border-2 border-white/5 rounded-2xl px-12 py-4 text-sm font-black text-white focus:outline-none focus:border-indigo-500/30 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Date -->
          <div class="space-y-3">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Transaction Settlement Date</label>
            <div class="relative">
              <Calendar class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input 
                v-model="date"
                type="date"
                class="w-full bg-[#0b0f1a] border-2 border-white/5 rounded-2xl px-12 py-4 text-sm font-black text-white focus:outline-none focus:border-indigo-500/30 transition-all uppercase tracking-widest appearance-none"
              />
            </div>
          </div>

          <!-- Total Calculation -->
          <div class="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div class="flex items-center gap-3">
                <div class="p-2 bg-indigo-500/20 rounded-lg">
                   <Info class="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                   <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estimated Commitment</p>
                   <p class="text-xs font-bold text-slate-300">Excluding brokerage & levies</p>
                </div>
             </div>
             <div class="text-right">
                <span class="text-[10px] font-bold text-indigo-400 uppercase block mb-0.5">Total Value</span>
                <span class="text-xl font-black text-white font-mono">LKR {{ totalValue }}</span>
             </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="p-8 bg-black/20 flex flex-col sm:flex-row items-center gap-3">
          <button 
            @click="emit('close')"
            class="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Cancel Order
          </button>
          <button 
            @click="handleSave"
            :disabled="!selectedStock || !quantity || !price"
            class="flex-1 w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:translate-y-1"
          >
            Confirm & Log Transaction
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.5;
  cursor: pointer;
}
</style>
