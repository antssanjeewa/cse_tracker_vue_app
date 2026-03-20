import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarketStore = defineStore('market', () => {
  const isLoading = ref(false)
  const error = ref(null)
  
  // CSE Data
  const stats = ref([
    { label: 'Market Turnover', value: '0.00', subValue: 'Loading...', icon: 'RefreshCw' },
    { label: 'ASPI', value: '0.00', subValue: '0.00%', icon: 'Activity' },
    { label: 'Listed Companies', value: '0', subValue: 'Market Stats', icon: 'Users' },
    { label: 'Market Trades', value: '0', subValue: 'Live', icon: 'Clock' },
  ])
  const gainers = ref([])
  const losers = ref([])
  const topTo = ref([])
  const allStocks = ref([])
  
  // Global Market (TradingView)
  const stockDetail = ref(null)

  const commonHeaders = { 
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  }

  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: commonHeaders,
        body: '',
        ...options
      })
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
      return await res.json()
    } catch (e) {
      console.warn(`API Error for ${url}:`, e)
      return null
    }
  }

  const fetchDashboardData = async () => {
    isLoading.value = true
    try {
      const [summaryData, gainData, loseData, toData] = await Promise.all([
        safeFetch('/api/dailyMarketSummery'),
        safeFetch('/api/topGainers'),
        safeFetch('/api/topLooses'),
        safeFetch('/api/mostActiveTrades')
      ])

      // 1. Process Summary
      if (summaryData && Array.isArray(summaryData) && summaryData[0]?.[0]) {
        const latest = summaryData[0][0]
        const prev = summaryData[1]?.[0] || latest
        const asiChange = latest.asi - prev.asi
        const asiChangePct = prev.asi !== 0 ? (asiChange / prev.asi) * 100 : 0

        stats.value[0].value = formatCurrency(latest.marketTurnover)
        stats.value[0].subValue = `${formatNumber(latest.volumeOfTurnOverNumber)} VOL`
        stats.value[1].value = formatNumber(latest.asi)
        stats.value[1].subValue = (asiChangePct >= 0 ? '+' : '') + asiChangePct.toFixed(2) + '%'
        stats.value[2].value = (latest.listedCompanyNumber || 0).toString()
        stats.value[2].subValue = `${latest.tradeCompanyNumber} Active`
        stats.value[3].value = formatNumber(latest.marketTrades)
        stats.value[3].subValue = 'Total Trades'
      }

      // 2. Process Lists
      if (gainData) gainers.value = Array.isArray(gainData) ? gainData : (gainData.reqTradeSummery || [])
      if (loseData) losers.value = Array.isArray(loseData) ? loseData : (loseData.reqTradeSummery || [])
      if (toData) topTo.value = Array.isArray(toData) ? toData : (toData.reqTradeSummery || [])

    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchFullMarket = async () => {
    isLoading.value = true
    try {
      const data = await safeFetch('/api/tradeSummary')
      if (data && data.reqTradeSummery) {
        allStocks.value = data.reqTradeSummery.map(item => ({
          code: item.symbol || 'N/A',
          name: item.name || item.symbol || 'N/A',
          sector: item.sector || 'N/A',
          type: item.type || 'Regular',
          prevClose: (item.previousClose || 0).toFixed(2),
          open: (item.open || 0).toFixed(2),
          high: (item.high || 0).toFixed(2),
          low: (item.low || 0).toFixed(2),
          close: (item.lastTradedPrice || item.price || 0).toFixed(2),
          change: (item.change || 0).toFixed(2),
          changePct: (item.changePercentage || 0).toFixed(2) + '%',
          range: `${(item.low || 0).toFixed(2)}-${(item.high || 0).toFixed(2)}`,
          vwap: (item.vwap || 0).toFixed(2),
          trades: (item.tradeCount || 0).toLocaleString(),
          volume: (item.tradeVolume || 0).toLocaleString(),
          to: formatTurnover(item.turnover || 0),
          adj: '0.00%',
          sp: 'All'
        }))
      }
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  const formatTurnover = (value) => {
    if (value >= 1000000000) return (value / 1000000000).toFixed(2) + 'B'
    if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M'
    return value.toLocaleString()
  }

  const fetchStockDetailFromTV = async (symbol) => {
    isLoading.value = true
    try {
      const response = await fetch('/tv-api/screener-facade/api/v1/screener-table/scan?table_id=stocks_market_movers.all_stocks&version=54&market=srilanka&columnset_id=overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symbols: {
            tickers: [`CSELK:${symbol}`],
            query: { types: [] }
          },
          columns: [
            "name", "close", "change", "volume", "market_cap_basic",
            "price_earnings_ttm", "earnings_per_share_basic_ttm",
            "dividend_yield_recent", "sector", "RSI", "EMA20",
            "description", "logoid", "open", "high", "low", "change_abs"
          ]
        })
      })

      if (!response.ok) throw new Error('TradingView API Error')
      
      const result = await response.json()
      if (result.data && result.data.length > 0) {
        const data = {}
        result.data.forEach((col) => {
          data[col.id] = col.rawValues[0]
        })
        
        stockDetail.value = {
          symbol: symbol,
          fullName: data.description || symbol,
          logo: data.logoid ? `https://s3-symbol-logo.tradingview.com/${data.logoid}.svg` : null,
          price: data.close || 0,
          change: data.change_abs || 0,
          changePercent: data.change || 0,
          high: data.high || 0,
          low: data.low || 0,
          open: data.open || 0,
          volume: data.volume || 0,
          marketCap: data.market_cap_basic || 0,
          peRatio: data.price_earnings_ttm || 'N/A',
          dividendYield: data.dividend_yield_recent ? data.dividend_yield_recent.toFixed(2) + '%' : 'N/A',
          sector: data.sector || 'Unknown',
          eps: data.earnings_per_share_basic_ttm || 0,
          rsi: data.RSI || 0,
          ema20: data.EMA20 || 0,
          recommendation: data['Recommend.All'] || 0
        }
      } else {
        stockDetail.value = null
      }
    } catch (err) {
      console.error('TV API Fetch error:', err)
      stockDetail.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Formatting Utils
  const formatCurrency = (val) => {
    if (typeof val === 'string') val = val.replace(/,/g, '')
    const num = parseFloat(val) || 0
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    return num.toLocaleString()
  }

  const formatNumber = (val) => {
    if (typeof val === 'string') val = val.replace(/,/g, '')
    return (parseFloat(val) || 0).toLocaleString()
  }

  return {
    isLoading,
    error,
    stats,
    gainers,
    losers,
    topTo,
    allStocks,
    stockDetail,
    fetchDashboardData,
    fetchFullMarket,
    fetchStockDetailFromTV,
    formatCurrency,
    formatNumber
  }
})
