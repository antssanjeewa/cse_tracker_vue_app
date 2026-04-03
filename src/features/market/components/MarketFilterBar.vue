<script setup>
import { ChevronDown, Plus, Trash2 } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-[#121a2c]/50 p-3 border-b border-white/5 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0">
    <span class="mr-2">Filters</span>
    <div class="flex items-center gap-2 bg-[#0b0f1a] border border-white/5 rounded px-2 py-1.5 mr-2">
      Adj TO % <ChevronDown class="w-3 h-3" />
    </div>
    <div class="flex items-center gap-2 bg-[#0b0f1a] border border-white/5 rounded px-2 py-1.5 mr-2">
      Greater Than <ChevronDown class="w-3 h-3" />
    </div>
    <span class="text-white">.01</span>
    <div class="flex-1"></div>
    <div class="flex gap-2">
      <button class="p-1 px-3 bg-white/5 rounded hover:bg-white/10">
        <Plus class="w-3 h-3" />
      </button>
      <button class="p-1 px-3 bg-white/5 rounded hover:bg-rose-900/20">
        <Trash2 class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>
