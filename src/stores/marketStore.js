import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─── TradingView column definitions ────────────────────────────────────────────
const TV_ALL_COLS = [
  'ticker-view',
  'close',
  'change',
  'volume',
  'relative_volume_10d_calc',
  'market_cap_basic',
  'fundamental_currency_code',
  'price_earnings_ttm',
  'earnings_per_share_diluted_ttm',
  'earnings_per_share_diluted_yoy_growth_ttm',
  'dividends_yield_current',
  'sector.tr',
  'sector',
  'AnalystRating',
  'AnalystRating.tr',
  'Perf.W',
  'Perf.1M',
  'Perf.3M',
  'Perf.6M',
  'Perf.YTD',
  'Perf.Y',
  'Perf.5Y',
  'Perf.10Y',
  'Perf.All',
  'Volatility.W',
  'Volatility.M',
  'RSI',
  'Recommend.All'
]

const TV_BASE_PAYLOAD = {
  filter: [{ left: 'is_primary', operation: 'equal', right: true }],
  options: { lang: 'en' },
  markets: ['srilanka'],
  range: [0, 350],
  sort: { sortBy: 'name', sortOrder: 'asc' },
  symbols: {}
}

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useMarketStore = defineStore('market', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const isLoading = ref(false)
  const isStockLoading = ref(false)
  const error = ref(null)

  // Dashboard summary cards
  const stats = ref([
    { label: 'Market Turnover', value: '0.00', subValue: 'Loading...', icon: 'RefreshCw' },
    { label: 'ASPI', value: '0.00', subValue: '0.00%', icon: 'Activity' },
    { label: 'Listed Companies', value: '0', subValue: 'Market Stats', icon: 'Users' },
    { label: 'Market Trades', value: '0', subValue: 'Live', icon: 'Clock' },
  ])

  // CSE market lists
  const gainers = ref([])
  const losers = ref([])
  const topTo = ref([])

  // Raw CSE stock list (from /api/tradeSummary)
  const cseStocks = ref([])

  // TradingView enriched maps  →  { "ABAN.N0000": { close, change, ... } }
  const tvData = ref({})
 
   // Merged, enriched stock list exposed to all views
   const allStocks = computed(() =>
     cseStocks.value.map(s => {
       const tv = tvData.value[s.code] || {}
 
       // Prefer TradingView for fundamental data if CSE is missing/zero
       const mktCap = s.mktCap && s.mktCap !== '0' && s.mktCap !== '0.00' 
         ? s.mktCap 
         : (tv.market_cap_basic ? formatCurrency(tv.market_cap_basic) : 'N/A')
 
       const divYieldRaw = tv.dividends_yield_current ?? tv.dividend_yield_recent
 
       return {
         ...s,
         mktCap,
         // TradingView overview enrichment
         peRatio: tv.price_earnings_ttm != null ? tv.price_earnings_ttm.toFixed(2) : (tv.pe_ratio != null ? tv.pe_ratio.toFixed(2) : 'N/A'),
         divYield: divYieldRaw != null
           ? divYieldRaw.toFixed(2) + '%'
           : 'N/A',
         sector: s.sector !== 'N/A' && s.sector ? s.sector : (tv['sector.tr'] ?? tv.sector ?? 'N/A'),
         description: tv['ticker-view']?.description ?? tv.description ?? s.name,
         logo: tv['ticker-view']?.logoid
           ? `https://s3-symbol-logo.tradingview.com/${tv['ticker-view'].logoid}.svg`
           : null,
         // TradingView performance metrics
         perf1w: tv['Perf.W'] != null ? tv['Perf.W'].toFixed(2) + '%' : 'N/A',
         perf1m: tv['Perf.1M'] != null ? tv['Perf.1M'].toFixed(2) + '%' : 'N/A',
         perf3m: tv['Perf.3M'] != null ? tv['Perf.3M'].toFixed(2) + '%' : 'N/A',
         perf6m: tv['Perf.6M'] != null ? tv['Perf.6M'].toFixed(2) + '%' : 'N/A',
         perfYtd: tv['Perf.YTD'] != null ? tv['Perf.YTD'].toFixed(2) + '%' : 'N/A',
         perf1y: tv['Perf.Y'] != null ? tv['Perf.Y'].toFixed(2) + '%' : 'N/A',
         // Technical indicators
         rsi: tv.RSI ?? 0,
         ema20: tv.EMA20 ?? 0,
         recommendation: tv['Recommend.All'] ?? tv.AnalystRating ?? 0,
       }
     })
   )

  // Stock detail page data
  const stockDetail = ref(null)

  // ── Internal helpers ────────────────────────────────────────────────────────
  const cseFetch = async (url) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: '',
        credentials: 'omit'
      })
      if (!res.ok) throw new Error(`CSE API ${res.status}`)
      return await res.json()
    } catch (e) {
      console.warn(`[CSE] ${url}:`, e.message)
      return null
    }
  }

  /**
   * Fetch TradingView screener for the whole Sri Lanka market.
   * Returns a map keyed by short symbol: { "ABAN.N0000": { col: value, ... } }
   */
  const fetchTVScreener = async (columnsetId, columns) => {
    try {
      const res = await fetch(
        `/tv-api/srilanka/scan?label-product=screener-stock`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...TV_BASE_PAYLOAD, columns })
        }
      )
      if (!res.ok) throw new Error(`TV API ${columnsetId} ${res.status}`)
      const result = await res.json()
      const map = {}
      if (Array.isArray(result.data)) {
        result.data.forEach(row => {
          if (row.s && typeof row.s === 'string') {
            const shortSym = row.s.replace('CSELK:', '')
            const obj = {}
            columns.forEach((col, idx) => { obj[col] = row.d[idx] })
            map[shortSym] = obj
          }
        })
      }
      return map
    } catch (e) {
      console.warn(`[TV:${columnsetId}]`, e.message)
      return {}
    }
  }

  /** Map a CSE tradeSummary item to a flat stock object */
  const mapCseItem = (item) => {
    if (!item) return { code: 'N/A', symbol: 'N/A', name: 'N/A', price: '0.00', changePct: '0%' }
    return {
      code: item.symbol || 'N/A',
      symbol: item.symbol || 'N/A',
      name: item.name || item.symbol || 'N/A',
      sector: item.sector || 'N/A',
      type: item.type || 'Regular',
      prevClose: (item.previousClose || 0).toFixed(2),
      open: (item.open || 0).toFixed(2),
      high: (item.high || 0).toFixed(2),
      low: (item.low || 0).toFixed(2),
      close: (item.price || item.closingPrice || 0).toFixed(2),
      price: (item.price || item.closingPrice || 0).toFixed(2),
      change: (item.change || 0).toFixed(2),
      changePct: (item.percentageChange || 0).toFixed(2) + '%',
      percentageChange: (item.percentageChange || 0).toFixed(2) + '%',
      range: `${(item.low || 0).toFixed(2)} - ${(item.high || 0).toFixed(2)}`,
      trades: (item.tradevolume || 0).toLocaleString(),
      volume: (item.sharevolume || 0).toLocaleString(),
      to: formatTurnover(item.turnover || 0),
      turnover: formatTurnover(item.turnover || 0),
      mktCap: formatTurnover(item.marketCap || 0),
      sp: 'All'
    }
  }

  // ── Public Actions ──────────────────────────────────────────────────────────

  /**
   * Load dashboard widgets: summary stats + top movers lists.
   * Lightweight — does NOT load the full stock list.
   */
  const fetchDashboardData = async () => {
    isLoading.value = true
    try {
      const [summaryData, gainData, loseData, toData] = await Promise.all([
        cseFetch('/api/dailyMarketSummery'),
        cseFetch('/api/topGainers'),
        cseFetch('/api/topLooses'),
        cseFetch('/api/mostActiveTrades')
      ])

      if (summaryData && Array.isArray(summaryData) && summaryData[0]?.[0]) {
        const latest = summaryData[0][0]
        const prev = summaryData[1]?.[0] || latest
        const asiPct = prev.asi !== 0 ? ((latest.asi - prev.asi) / prev.asi) * 100 : 0

        stats.value[0].value = formatCurrency(latest.marketTurnover)
        stats.value[0].subValue = `${formatNumber(latest.volumeOfTurnOverNumber)} VOL`
        stats.value[1].value = formatNumber(latest.asi)
        stats.value[1].subValue = (asiPct >= 0 ? '+' : '') + asiPct.toFixed(2) + '%'
        stats.value[2].value = (latest.listedCompanyNumber || 0).toString()
        stats.value[2].subValue = `${latest.tradeCompanyNumber} Active`
        stats.value[3].value = formatNumber(latest.marketTrades)
        stats.value[3].subValue = 'Total Trades'
      }

      if (gainData) {
        const raw = Array.isArray(gainData) ? gainData : (gainData.reqTradeSummery || [])
        gainers.value = raw.map(mapCseItem)
      }
      if (loseData) {
        const raw = Array.isArray(loseData) ? loseData : (loseData.reqTradeSummery || [])
        losers.value = raw.map(mapCseItem)
      }
      if (toData) {
        const raw = Array.isArray(toData) ? toData : (toData.reqTradeSummery || [])
        topTo.value = raw.map(mapCseItem)
      }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load the full market stock list.
   * Calls CSE + TradingView Overview + TradingView Performance in parallel,
   * then merges everything into `allStocks`.
   */
  const fetchFullMarket = async () => {
    isLoading.value = true
    error.value = null
    try {
      const [cseData, tvMap] = await Promise.all([
        cseFetch('/api/tradeSummary'),
        fetchTVScreener('all_columns', TV_ALL_COLS)
      ])

      // Store TV map so the allStocks computed can merge it
      tvData.value = tvMap

      // Store raw CSE list
      if (cseData?.reqTradeSummery) {
        cseStocks.value = cseData.reqTradeSummery.map(mapCseItem)
        console.log(`Fetched ${cseStocks.value.length} stocks from CSE`)
        console.log(`TV data merged for ${Object.keys(tvMap).length} stocks`)
      }
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch detailed data for a single stock (for the details page).
   * Uses both overview + performance TV columns for one symbol.
   */
  const fetchStockDetailFromTV = async (symbol) => {
    isStockLoading.value = true
    stockDetail.value = null
    try {
      const res = await fetch(
        '/tv-api/srilanka/scan?label-product=screener-stock',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbols: { tickers: [`CSELK:${symbol}`], query: { types: [] } },
            columns: [
              'ticker-view', 'close', 'change', 'chp', 'volume', 'market_cap_basic',
              'price_earnings_ttm', 'earnings_per_share_basic_ttm',
              'dividend_yield_recent', 'sector', 'RSI', 'EMA20',
              'description', 'logoid', 'open', 'high', 'low', 'change_abs',
              'Perf.W', 'Perf.1M', 'Perf.3M', 'Recommend.All'
            ]
          })
        }
      )
      if (!res.ok) throw new Error(`TV:${res.status}`)

      const result = await res.json()
      if (result.data?.length > 0) {
        const row = result.data[0]
        const colMap = {}
        // The result columns are in the same order as in the request
        const requestedCols = [
          'ticker-view', 'close', 'change', 'volume', 'market_cap_basic',
          'price_earnings_ttm', 'earnings_per_share_basic_ttm',
          'dividend_yield_recent', 'sector', 'RSI', 'EMA20',
          'description', 'logoid', 'open', 'high', 'low', 'change_abs',
          'Perf.W', 'Perf.1M', 'Perf.3M', 'Recommend.All'
        ]
        requestedCols.forEach((col, idx) => { colMap[col] = row.d[idx] })

        const tvDescription = colMap['ticker-view']?.description || colMap.description

        stockDetail.value = {
          symbol,
          fullName: tvDescription || symbol,
          logo: colMap.logoid ? `https://s3-symbol-logo.tradingview.com/${colMap.logoid}.svg` : null,
          price: colMap.close || 0,
          change: colMap.change_abs || colMap.change || 0,
          changePercent: colMap.change || 0, // Fallback if change is percentage
          high: colMap.high || 0,
          low: colMap.low || 0,
          open: colMap.open || 0,
          volume: colMap.volume || 0,
          marketCap: colMap.market_cap_basic || 0,
          peRatio: colMap.price_earnings_ttm ?? 'N/A',
          dividendYield: colMap.dividend_yield_recent != null
            ? colMap.dividend_yield_recent.toFixed(2) + '%' : 'N/A',
          sector: colMap.sector || 'Unknown',
          eps: colMap.earnings_per_share_basic_ttm || 0,
          rsi: colMap.RSI || 0,
          ema20: colMap.EMA20 || 0,
          recommendation: colMap['Recommend.All'] || 0,
          perf1w: colMap['Perf.W'] != null ? colMap['Perf.W'].toFixed(2) + '%' : 'N/A',
          perf1m: colMap['Perf.1M'] != null ? colMap['Perf.1M'].toFixed(2) + '%' : 'N/A',
          perf3m: colMap['Perf.3M'] != null ? colMap['Perf.3M'].toFixed(2) + '%' : 'N/A',
        }
      } else {
        error.value = 'Stock not found in TradingView database.'
      }
    } catch (err) {
      console.error('[TV:detail]', err)
    } finally {
      isStockLoading.value = false
    }
  }

  // ── Formatting Utils ────────────────────────────────────────────────────────
  const formatCurrency = (val) => {
    if (typeof val === 'string') val = val.replace(/,/g, '')
    const num = parseFloat(val) || 0
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K'
    return num.toLocaleString()
  }

  const formatTurnover = (value) => {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B'
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M'
    return value.toLocaleString()
  }

  const formatNumber = (val) => {
    if (typeof val === 'string') val = val.replace(/,/g, '')
    return (parseFloat(val) || 0).toLocaleString()
  }

  // ── Exports ─────────────────────────────────────────────────────────────────
  return {
    // State
    isLoading,
    isStockLoading,
    error,
    stats,
    gainers,
    losers,
    topTo,
    allStocks,
    stockDetail,
    // Actions
    fetchDashboardData,
    fetchFullMarket,
    fetchStockDetailFromTV,
    // Utils
    formatCurrency,
    formatTurnover,
    formatNumber
  }
})
