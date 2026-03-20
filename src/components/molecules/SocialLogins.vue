<script setup>
import { Github, Chrome } from 'lucide-vue-next'
import BaseButton from '../atoms/BaseButton.vue'

defineProps({
  loading: Boolean
})
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <BaseButton variant="outline" class="w-full flex items-center justify-center gap-2">
      <Chrome class="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
      <span class="text-sm font-semibold">Google</span>
    </BaseButton>
    
    <BaseButton variant="outline" class="w-full flex items-center justify-center gap-2">
      <Github class="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
      <span class="text-sm font-semibold">GitHub</span>
    </BaseButton>
  </div>
</template>
