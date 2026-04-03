import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─── TradingView column definitions ────────────────────────────────────────────
const TV_OVERVIEW_COLS = [
  'name', 'close', 'change', 'chp', 'volume', 'market_cap_basic',
  'pe_ratio', 'dividend_yield_recent', 'sector', 'description', 'logoid'
]

const TV_PERFORMANCE_COLS = [
  'name', 'perf_1w', 'perf_1m', 'perf_3m', 'perf_6m',
  'perf_ytd', 'perf_1y', 'RSI', 'EMA20', 'Recommend.All'
]

const TV_BASE_PAYLOAD = {
  lang: 'en',
  range: [0, 300],
  sort: {
    sortBy: { id: 'TickerUniversal', params: {} },
    sortOrder: 'asc',
    nullsFirst: false
  },
  scanner_product_label: 'markets-screener'
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
  const tvOverview = ref({})
  const tvPerformance = ref({})

  // Merged, enriched stock list exposed to all views
  const allStocks = computed(() =>
    cseStocks.value.map(s => {
      const ov = tvOverview.value[s.code] || {}
      const perf = tvPerformance.value[s.code] || {}
      return {
        ...s,
        // TradingView overview enrichment (prefer CSE price but fill gaps)
        tvClose: ov.close ?? null,
        tvChange: ov.change ?? null,
        tvChp: ov.chp ?? null,
        tvVolume: ov.volume ?? null,
        tvMktCap: ov.market_cap_basic ?? null,
        peRatio: ov.pe_ratio ?? 'N/A',
        divYield: ov.dividend_yield_recent != null
          ? ov.dividend_yield_recent.toFixed(2) + '%'
          : 'N/A',
        sector: s.sector !== 'N/A' ? s.sector : (ov.sector ?? 'N/A'),
        description: ov.description ?? s.name,
        logo: ov.logoid
          ? `https://s3-symbol-logo.tradingview.com/${ov.logoid}.svg`
          : null,
        // TradingView performance enrichment
        perf1w: perf.perf_1w != null ? perf.perf_1w.toFixed(2) + '%' : 'N/A',
        perf1m: perf.perf_1m != null ? perf.perf_1m.toFixed(2) + '%' : 'N/A',
        perf3m: perf.perf_3m != null ? perf.perf_3m.toFixed(2) + '%' : 'N/A',
        perf6m: perf.perf_6m != null ? perf.perf_6m.toFixed(2) + '%' : 'N/A',
        perfYtd: perf.perf_ytd != null ? perf.perf_ytd.toFixed(2) + '%' : 'N/A',
        perf1y: perf.perf_1y != null ? perf.perf_1y.toFixed(2) + '%' : 'N/A',
        rsi: perf.RSI ?? 0,
        ema20: perf.EMA20 ?? 0,
        recommendation: perf['Recommend.All'] ?? 0,
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
        `/tv-api/screener-facade/api/v1/screener-table/scan?table_id=stocks_market_movers.all_stocks&version=54&columnset_id=${columnsetId}&market=srilanka`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...TV_BASE_PAYLOAD, columns })
        }
      )
      if (!res.ok) throw new Error(`TV API ${columnsetId} ${res.status}`)
      const result = await res.json()

      // Build symbol → object map
      const map = {}
      if (Array.isArray(result.data)) {
        result.data.forEach(row => {
          // row.s = "CSELK:ABAN.N0000", row.d = [val0, val1, ...]
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
  const mapCseItem = (item) => ({
    code: item.symbol || 'N/A',
    name: item.name || item.symbol || 'N/A',
    sector: item.sector || 'N/A',
    type: item.type || 'Regular',
    prevClose: (item.previousClose || 0).toFixed(2),
    open: (item.open || 0).toFixed(2),
    high: (item.high || 0).toFixed(2),
    low: (item.low || 0).toFixed(2),
    close: (item.price || item.closingPrice || 0).toFixed(2),
    change: (item.change || 0).toFixed(2),
    changePct: (item.percentageChange || 0).toFixed(2) + '%',
    range: `${(item.low || 0).toFixed(2)} - ${(item.high || 0).toFixed(2)}`,
    trades: (item.tradevolume || 0).toLocaleString(),
    volume: (item.sharevolume || 0).toLocaleString(),
    to: formatTurnover(item.turnover || 0),
    mktCap: formatTurnover(item.marketCap || 0),
    sp: 'All'
  })

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

      if (gainData) gainers.value = Array.isArray(gainData) ? gainData : (gainData.reqTradeSummery || [])
      if (loseData) losers.value = Array.isArray(loseData) ? loseData : (loseData.reqTradeSummery || [])
      if (toData) topTo.value = Array.isArray(toData) ? toData : (toData.reqTradeSummery || [])
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
      const [cseData, ovMap, perfMap] = await Promise.all([
        cseFetch('/api/tradeSummary'),
        fetchTVScreener('overview', TV_OVERVIEW_COLS),
        fetchTVScreener('performance', TV_PERFORMANCE_COLS)
      ])

      // Store TV maps so the `allStocks` computed can merge them
      tvOverview.value = ovMap
      tvPerformance.value = perfMap

      console.log('Sample TV Overview data:', Object.keys(ovMap).slice(0, 3).map(k => ({ code: k, data: ovMap[k] })))
      console.log('Sample TV Performance data:', Object.keys(perfMap).slice(0, 3).map(k => ({ code: k, data: perfMap[k] })))

      // Store raw CSE list; allStocks computed does the merge automatically
      if (cseData?.reqTradeSummery) {
        cseStocks.value = cseData.reqTradeSummery.map(mapCseItem)
        console.log(`Fetched ${cseStocks.value.length} stocks from CSE`)
        console.log(`TV Overview data for ${Object.keys(ovMap).length} stocks`)
        console.log(`TV Performance data for ${Object.keys(perfMap).length} stocks`)
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
        '/tv-api/screener-facade/api/v1/screener-table/scan?table_id=stocks_market_movers.all_stocks&version=54&market=srilanka&columnset_id=overview',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbols: { tickers: [`CSELK:${symbol}`], query: { types: [] } },
            columns: [
              'name', 'close', 'change', 'chp', 'volume', 'market_cap_basic',
              'price_earnings_ttm', 'earnings_per_share_basic_ttm',
              'dividend_yield_recent', 'sector', 'RSI', 'EMA20',
              'description', 'logoid', 'open', 'high', 'low', 'change_abs',
              'perf_1w', 'perf_1m', 'perf_3m', 'Recommend.All'
            ]
          })
        }
      )
      if (!res.ok) throw new Error(`TV:${res.status}`)

      const result = await res.json()
      if (result.data?.length > 0) {
        const d = {}
        result.data.forEach(col => { d[col.id] = col.rawValues[0] })

        stockDetail.value = {
          symbol,
          fullName: d.description || symbol,
          logo: d.logoid ? `https://s3-symbol-logo.tradingview.com/${d.logoid}.svg` : null,
          price: d.close || 0,
          change: d.change_abs || 0,
          changePercent: d.chp || 0,
          high: d.high || 0,
          low: d.low || 0,
          open: d.open || 0,
          volume: d.volume || 0,
          marketCap: d.market_cap_basic || 0,
          peRatio: d.price_earnings_ttm ?? 'N/A',
          dividendYield: d.dividend_yield_recent != null
            ? d.dividend_yield_recent.toFixed(2) + '%' : 'N/A',
          sector: d.sector || 'Unknown',
          eps: d.earnings_per_share_basic_ttm || 0,
          rsi: d.RSI || 0,
          ema20: d.EMA20 || 0,
          recommendation: d['Recommend.All'] || 0,
          perf1w: d.perf_1w != null ? d.perf_1w.toFixed(2) + '%' : 'N/A',
          perf1m: d.perf_1m != null ? d.perf_1m.toFixed(2) + '%' : 'N/A',
          perf3m: d.perf_3m != null ? d.perf_3m.toFixed(2) + '%' : 'N/A',
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
    tvOverview,
    tvPerformance,
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
