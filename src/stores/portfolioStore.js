import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const usePortfolioStore = defineStore('portfolio', () => {
  const holdings = ref([])
  const transactions = ref([])
  const cashTransactions = ref([])
  const profile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      if (err) console.warn('Profile fetch error:', err.message)
      profile.value = data
    }
  }

  const fetchPortfolio = async () => {
    isLoading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const [holdingsRes, transRes, cashRes] = await Promise.all([
        supabase
          .from('holdings')
          .select('*, stocks(*)')
          .eq('user_id', user.id),
        supabase
          .from('transactions')
          .select('*, stocks(*)')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('cash_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (holdingsRes.error) throw holdingsRes.error
      if (transRes.error) throw transRes.error
      if (cashRes.error) throw cashRes.error

      holdings.value = holdingsRes.data
      transactions.value = transRes.data
      cashTransactions.value = cashRes.data
    } catch (err) {
      error.value = err.message
      console.error('Portfolio Fetch Error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const totalEquity = computed(() => {
    return holdings.value.reduce((sum, h) => sum + (parseFloat(h.quantity) * parseFloat(h.avg_price)), 0)
  })

  const totalProfit = computed(() => {
    return holdings.value.reduce((sum, h) => sum + parseFloat(h.profit || 0), 0)
  })

  const totalDividends = computed(() => {
    return holdings.value.reduce((sum, h) => sum + parseFloat(h.dividend || 0), 0)
  })

  const cashBalance = computed(() => {
    return cashTransactions.value.reduce((sum, t) => {
      if (t.type === 'DEPOSIT' || t.type === 'SELL') return sum + parseFloat(t.amount)
      if (t.type === 'WITHDRAWAL' || t.type === 'BUY') return sum - parseFloat(t.amount)
      return sum
    }, 0)
  })

  const enrichedHoldings = computed(() => {
    const total = totalEquity.value
    return holdings.value.map(h => {
      const currentPrice = h.stocks?.last_price || h.avg_price
      const marketValue = parseFloat(h.quantity) * parseFloat(currentPrice)
      return {
        ...h,
        marketValue,
        weight: total > 0 ? (marketValue / total) * 100 : 0
      }
    })
  })

  const netWorth = computed(() => {
    return totalEquity.value + cashBalance.value
  })

  return {
    holdings: enrichedHoldings,
    transactions,
    cashTransactions,
    profile,
    isLoading,
    error,
    totalEquity,
    totalProfit,
    totalDividends,
    cashBalance,
    netWorth,
    fetchProfile,
    fetchPortfolio
  }
})
