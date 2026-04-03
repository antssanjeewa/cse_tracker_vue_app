import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/stocks',
      name: 'stocks',
      component: () => import('../views/StocksListView.vue'),
    },
    {
      path: '/stock/:symbol',
      name: 'stock-details',
      component: () => import('../views/StockDetailsView.vue'),
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
    },
  ],
})

export default router
