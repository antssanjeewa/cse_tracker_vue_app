<script setup>
const props = defineProps({
  itemsPerPage: Number,
  totalItems: Number,
  currentPage: Number,
  totalPages: Number,
  totalStocksCount: Number
})

const emit = defineEmits(['update:itemsPerPage', 'prevPage', 'nextPage', 'setPage'])

const onItemsPerPageChange = (event) => {
  emit('update:itemsPerPage', parseInt(event.target.value))
}
</script>

<template>
  <div class="h-10 bg-[#121a2c] border-t border-white/10 flex items-center justify-between px-6 shrink-0 text-[9px] font-bold uppercase tracking-widest text-slate-500">
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span>SHOW:</span>
        <select
          :value="itemsPerPage"
          @change="onItemsPerPageChange"
          class="bg-slate-900 border border-white/10 rounded px-1 focus:ring-0 text-[10px] font-black text-amber-500 cursor-pointer"
        >
          <option :value="10">10 ROWS</option>
          <option :value="15">15 ROWS</option>
          <option :value="30">30 ROWS</option>
          <option :value="50">50 ROWS</option>
          <option :value="totalStocksCount">ALL DATA</option>
        </select>
      </div>
      <span
        >{{ (currentPage - 1) * itemsPerPage + 1 }}-{{
          Math.min(currentPage * itemsPerPage, totalItems)
        }}
        OF {{ totalItems }}</span
      >
    </div>
    <div class="flex items-center gap-4">
      <span class="text-amber-500 flex items-center gap-1"
        ><div class="w-2.5 h-2.5 border border-amber-500/30 rounded"></div>
        SELECTED: 0</span
      >
      <div class="flex items-center gap-1">
        <button
          @click="emit('prevPage')"
          :disabled="currentPage === 1"
          class="w-7 h-7 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          title="Previous Page"
        >
          &lsaquo;
        </button>

        <div class="flex">
          <button
            v-for="p in Math.min(totalPages, 5)"
            :key="p"
            @click="emit('setPage', p)"
            class="w-7 h-7 flex items-center justify-center rounded text-[10px] font-black transition-all"
            :class="
              currentPage === p
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:text-white'
            "
          >
            {{ p }}
          </button>
          <span v-if="totalPages > 5" class="px-1 py-1">...</span>
          <button
            v-if="totalPages > 5"
            @click="emit('setPage', totalPages)"
            class="w-7 h-7 flex items-center justify-center rounded text-[10px] font-black transition-all"
            :class="
              currentPage === totalPages
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:text-white'
            "
          >
            {{ totalPages }}
          </button>
        </div>

        <button
          @click="emit('nextPage')"
          :disabled="currentPage === totalPages"
          class="w-7 h-7 flex items-center justify-center hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          title="Next Page"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  </div>
</template>
