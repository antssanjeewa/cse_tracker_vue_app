<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // 'primary', 'secondary', 'outline'
  },
  loading: Boolean
})
</script>

<template>
  <button
    class="relative flex items-center justify-center gap-2 px-6 py-3 font-semibold transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
    :class="{
      'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25 hover:shadow-lg': variant === 'primary',
      'bg-slate-800 text-slate-100 hover:bg-slate-700': variant === 'secondary',
      'border-2 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white': variant === 'outline',
    }"
  >
    <div v-if="loading" class="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
    <slot />
  </button>
</template>
