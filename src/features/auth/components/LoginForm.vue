<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, LogIn } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCheckbox from '@/components/atoms/BaseCheckbox.vue'
import SocialLogins from '@/components/molecules/SocialLogins.vue'

const router = useRouter()

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const isLoading = ref(false)

const handleLogin = async () => {
  // Clear errors
  errors.email = ''
  errors.password = ''
  errors.general = ''
  
  // Basic validation
  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!formData.password) {
    errors.password = 'Password is required'
  }
  
  if (errors.email || errors.password) return
  
  isLoading.value = true
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    })

    if (error) {
      errors.general = error.message
      return
    }

    if (data.user) {
      console.log('Login successful! Redirecting...')
      router.push('/dashboard')
    }
  } catch (err) {
    errors.general = 'An unexpected error occurred. Please try again.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-lg p-8 md:p-12 relative overflow-hidden">
    <!-- Glassmorphism Card Backdrop -->
    <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-2xl border border-white/10 rounded-3xl -z-10 shadow-2xl"></div>
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    
    <div class="flex flex-col items-center gap-2 mb-10">
      <div class="w-16 h-16 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
        <LogIn class="w-8 h-8 text-indigo-400" />
      </div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
      <p class="text-slate-400 font-medium">Please enter your details to sign in</p>
    </div>

    <!-- Error Alert -->
    <div v-if="errors.general" class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
      <div class="p-1.5 bg-rose-500/20 rounded-lg">
        <svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p class="text-xs font-bold text-rose-400 uppercase tracking-tight">{{ errors.general }}</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <BaseInput
        v-model="formData.email"
        label="Email address"
        type="email"
        placeholder="name@company.com"
        :error="errors.email"
        :icon="Mail"
      />
      
      <div class="space-y-1">
        <BaseInput
          v-model="formData.password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          :icon="Lock"
        />
        <div class="flex items-center justify-between mt-4">
          <BaseCheckbox v-model="formData.rememberMe" label="Remember me" />
          <a href="#" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
            Forgot Password?
          </a>
        </div>
      </div>
      
      <BaseButton type="submit" variant="primary" :loading="isLoading" class="w-full h-14 text-lg">
        Sign in to your account
      </BaseButton>
    </form>
    
    <div class="relative my-10 flex items-center justify-center">
      <div class="absolute inset-x-0 h-px bg-white/5"></div>
      <span class="relative px-4 bg-slate-900/45 backdrop-blur-xl text-xs font-bold text-slate-500 uppercase tracking-widest">
        Or continue with
      </span>
    </div>
    
    <SocialLogins :loading="isLoading" />
    
    <p class="text-center mt-10 text-slate-400 font-medium text-sm">
      Don't have an account? 
      <a href="#" class="text-indigo-400 font-bold hover:text-indigo-300 transition-all border-b border-indigo-500/30 hover:border-indigo-400">
        Create one for free
      </a>
    </p>
  </div>
</template>
