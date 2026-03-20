<script setup>
import { Check } from 'lucide-vue-next'

defineProps({
  modelValue: Boolean,
  label: String,
  id: String
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center gap-2 group cursor-pointer" @click="$emit('update:modelValue', !modelValue)">
    <div
      class="relative flex items-center justify-center w-5 h-5 border-2 rounded-md transition-all duration-300 group-hover:border-indigo-500/50"
      :class="{
        'bg-indigo-600 border-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.3)]': modelValue,
        'bg-slate-900/50 border-slate-700': !modelValue
      }"
    >
      <Check v-if="modelValue" class="w-3.5 h-3.5 text-white stroke-[3px]" />
    </div>
    
    <span class="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors select-none">
      {{ label }}
    </span>
  </div>
</template>
