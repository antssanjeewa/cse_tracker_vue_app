<script setup>
import LoginForm from '../components/organisms/LoginForm.vue'
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-950 font-sans">
    
    <!-- Background Gradient and Glows -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 -z-30"></div>
    <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(99,102,241,0.15),_transparent_40%)] -z-20"></div>
    <div class="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(99,102,241,0.15),_transparent_40%)] -z-20"></div>
    
    <!-- Animated Glow Circles -->
    <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
    <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow animation-delay-2000"></div>

    <!-- Login Card -->
    <LoginForm />
    
    <!-- Footer/Disclaimer -->
    <div class="absolute bottom-6 inset-x-0 text-center">
      <p class="text-xs text-slate-500 font-medium tracking-tight">
        &copy; 2024 Your App &bull; Crafted with <span class="text-rose-500/60 animate-pulse">❤</span> by Your Company
      </p>
    </div>
  </div>
</template>

<style>
@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.animate-pulse-slow {
  animation: pulse-slow 10s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
