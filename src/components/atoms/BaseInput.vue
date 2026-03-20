<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  error: String,
  success: Boolean,
  icon: Object
})

const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)
const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="space-y-1.5 w-full group">
    <label v-if="label" class="block text-sm font-medium text-slate-300 transition-colors group-focus-within:text-indigo-400">
      {{ label }}
    </label>
    
    <div class="relative flex items-center">
      <div v-if="icon" class="absolute left-3.5 text-slate-400 transition-colors group-focus-within:text-indigo-500">
        <component :is="icon" class="w-5 h-5" />
      </div>
      
      <input
        :type="inputType"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
        class="w-full h-12 bg-slate-900/50 border border-slate-700 rounded-xl px-4 text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
        :class="{
          'pl-11': !!icon,
          'pr-11': type === 'password',
          'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10 focus:shadow-rose-500/15': !!error,
          'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/10': success
        }"
        :placeholder="placeholder"
      />
      
      <button
        v-if="type === 'password'"
        type="button"
        @click="togglePassword"
        class="absolute right-3.5 p-1 text-slate-400 hover:text-slate-100 transition-colors"
      >
        <EyeOff v-if="showPassword" class="w-5 h-5" />
        <Eye v-else class="w-5 h-5" />
      </button>
    </div>
    
    <p v-if="error" class="text-xs font-medium text-rose-500/90 ml-1">
      {{ error }}
    </p>
  </div>
</template>
