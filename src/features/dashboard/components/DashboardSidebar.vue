<script setup>
const props = defineProps({
  selectedInterval: String,
  selectedTime: String,
  timeIntervals: Array
})

const emit = defineEmits(['update:selectedInterval', 'update:selectedTime', 'refresh'])
</script>

<template>
  <aside class="w-64 bg-[#0f172a] border-r border-white/10 flex flex-col p-4 shrink-0 overflow-y-auto hidden md:flex">
    <div class="mb-6">
      <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Interval Selection</p>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="int in ['15m', '30m']" :key="int" @click="emit('update:selectedInterval', int)" 
          class="py-2 text-[10px] font-bold rounded-lg border border-white/5 transition-all text-center"
          :class="selectedInterval === int ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'">{{ int }}</button>
      </div>
      <button @click="emit('refresh')" class="w-full mt-2 py-2.5 bg-amber-600/20 text-amber-500 text-[10px] font-black rounded-lg border border-amber-500/20 uppercase tracking-widest">LOAD DATA</button>
    </div>

    <div class="flex-1">
      <p class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest text-center">Trading Periods</p>
      <div class="space-y-1">
        <button v-for="time in timeIntervals" :key="time" @click="emit('update:selectedTime', time)"
          class="w-full py-2.5 px-3 rounded-lg text-left text-[11px] font-bold border transition-all"
          :class="selectedTime === time ? 'bg-amber-600/10 border-amber-500/30 text-amber-500' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'">
          {{ time }}
        </button>
      </div>
    </div>
  </aside>
</template>
