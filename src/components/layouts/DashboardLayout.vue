<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  BarChart3, 
  LayoutDashboard, 
  List, 
  Settings, 
  Bell, 
  Search, 
  User, 
  LogOut,
  ChevronRight,
  TrendingUp,
  PieChart
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const isSidebarExpanded = ref(true)

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Stock Lists', icon: List, path: '/stocks' },
  { name: 'Analytics', icon: TrendingUp, path: '#' },
  { name: 'Portfolio', icon: PieChart, path: '#' },
  { name: 'Settings', icon: Settings, path: '#' },
]

const handleLogout = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#0b0f1a] text-slate-200 flex overflow-hidden font-sans">
    
    <!-- Sidebar -->
    <aside 
      class="bg-[#0f172a] border-r border-white/5 flex flex-col transition-all duration-300 z-30 shadow-2xl"
      :class="isSidebarExpanded ? 'w-64' : 'w-20'"
    >
      <!-- Logo Area -->
      <div class="h-20 flex items-center px-6 border-b border-white/5 overflow-hidden">
        <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
          <BarChart3 class="text-white w-6 h-6" />
        </div>
        <span 
          v-if="isSidebarExpanded" 
          class="ml-3 font-bold text-xl tracking-tight text-white whitespace-nowrap"
        >
          CNLK <span class="text-indigo-400">LIVE</span>
        </span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <RouterLink 
          v-for="item in navItems" 
          :key="item.name"
          :to="item.path"
          class="flex items-center p-3 rounded-xl transition-all duration-200 group relative"
          :class="route.path === item.path ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
        >
          <component :is="item.icon" class="w-6 h-6 shrink-0" />
          <span 
            v-if="isSidebarExpanded" 
            class="ml-3 font-medium text-sm transition-opacity duration-300"
          >
            {{ item.name }}
          </span>
          
          <!-- Tooltip for collapsed sidebar -->
          <div 
            v-if="!isSidebarExpanded"
            class="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10"
          >
            {{ item.name }}
          </div>
        </RouterLink>
      </nav>

      <!-- Bottom Profile -->
      <div class="p-4 border-t border-white/5">
        <button 
          @click="handleLogout"
          class="w-full flex items-center p-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-colors group"
        >
          <LogOut class="w-6 h-6 shrink-0" />
          <span v-if="isSidebarExpanded" class="ml-3 text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      
      <!-- Top Bar -->
      <header class="h-20 bg-[#0f172a]/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-20">
        <div class="flex items-center">
          <button 
            @click="isSidebarExpanded = !isSidebarExpanded"
            class="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors mr-6"
          >
            <ChevronRight 
              class="w-5 h-5 transition-transform duration-300"
              :class="isSidebarExpanded ? 'rotate-180' : ''"
            />
          </button>
          
          <div class="relative hidden lg:block">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search symbols, company names..." 
              class="bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm w-80 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-200"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button class="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all relative">
            <Bell class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0f172a]"></span>
          </button>
          <div class="h-8 w-px bg-white/5 mx-2"></div>
          <div class="flex items-center gap-3 pl-2">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-bold text-white leading-none mb-1">Senior Trader</p>
              <p class="text-[10px] font-medium text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg shadow-indigo-500/20">
              <User class="text-white w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <!-- View Area -->
      <main class="flex-1 overflow-y-auto bg-[#0b0f1a] p-8 custom-scrollbar">
        <div class="max-w-[1600px] mx-auto">
          <slot />
        </div>
      </main>
    </div>
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
