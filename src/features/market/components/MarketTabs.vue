<script setup>
const props = defineProps({
  activeTab: String,
  tabs: Array
})

const emit = defineEmits(['update:activeTab'])

const setTab = (key) => {
  emit('update:activeTab', key)
}
</script>

<template>
  <div class="bg-[#121a2c]/30 px-4 border-b border-white/5 flex items-center gap-1 shrink-0">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="setTab(tab.key)"
      class="relative px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2"
      :class="
        activeTab === tab.key
          ? 'text-amber-400 border-amber-400 bg-amber-500/5'
          : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-white/10'
      "
    >
      {{ tab.label }}
      <span
        v-if="activeTab === tab.key"
        class="ml-2 text-[8px] text-amber-500/70 font-bold normal-case tracking-normal"
        >{{ tab.desc }}</span
      >
    </button>
  </div>
</template>
