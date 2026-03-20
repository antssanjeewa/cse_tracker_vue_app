<script setup>
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Clock, 
  RefreshCw 
} from 'lucide-vue-next'

const props = defineProps({
  label: String,
  value: [String, Number],
  subValue: String,
  iconName: String
})

const icons = {
  TrendingUp,
  Activity,
  Users,
  Clock,
  RefreshCw
}
</script>

<template>
  <div class="bg-[#151c2c] border border-white/5 p-4 rounded-xl relative hover:border-white/10 transition-colors">
    <p class="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-tighter">{{ label }}</p>
    <div class="flex items-baseline gap-2">
      <h3 class="text-lg font-black text-white font-mono">{{ value }}</h3>
      <span 
        class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5" 
        :class="String(subValue).includes('-') ? 'text-rose-500' : 'text-emerald-500'"
      >
        {{ subValue }}
      </span>
    </div>
    <div class="absolute top-2 right-2 p-1.5 opacity-10">
      <component :is="icons[iconName]" class="w-4 h-4 text-white" />
    </div>
  </div>
</template>
