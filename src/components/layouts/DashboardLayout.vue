<script setup>
import { 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  User, 
  LogOut,
  Download,
  Calendar,
  Layers,
  LayoutGrid
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#0b0f1a] text-slate-200 flex flex-col font-sans">
    
    <!-- Top Navigation Bar -->
    <header class="h-16 bg-[#0f172a] border-b border-white/10 flex items-center justify-between px-6 z-40 shrink-0">
      <!-- Left: Logo -->
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <BarChart3 class="text-white w-5 h-5" />
        </div>
        <span class="font-bold text-lg tracking-tight text-white uppercase">
          CNLK <span class="text-slate-400">LIVE</span>
        </span>
      </div>

      <!-- Right: Navigation & Tools -->
      <div class="flex items-center gap-6">
        <nav class="hidden md:flex items-center gap-4 border-r border-white/10 pr-6 mr-1">
          <RouterLink to="/dashboard" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors" active-class="text-indigo-400">Dashboard</RouterLink>
          <RouterLink to="/stocks" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors" active-class="text-indigo-400">Stocks</RouterLink>
          <RouterLink to="/portfolio" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors" active-class="text-indigo-400">Portfolio</RouterLink>
        </nav>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <span class="uppercase">Time Frame</span>
            <div class="h-3 w-px bg-white/10"></div>
            <select class="bg-transparent border-none focus:ring-0 p-0 text-white cursor-pointer uppercase">
              <option>1D</option>
              <option>1W</option>
              <option>1M</option>
            </select>
          </div>
          
          <div class="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
            <button class="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"><Layers class="w-4 h-4" /></button>
            <button class="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"><LayoutGrid class="w-4 h-4" /></button>
            <button class="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"><Download class="w-4 h-4" /></button>
          </div>

          <div class="h-6 w-px bg-white/10 mx-1"></div>

          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
              <User class="text-slate-400 w-4 h-4" />
            </div>
            <button @click="handleLogout" class="p-2 text-slate-500 hover:text-rose-400 transition-colors">
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-[#0b0f1a] custom-scrollbar">
      <div class="w-full">
        <slot />
      </div>
    </main>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
