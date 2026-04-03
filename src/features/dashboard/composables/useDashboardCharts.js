import { computed } from 'vue'

export function useDashboardCharts(marketStore) {
  const treemapSeries = computed(() => {
    if (marketStore.topTo.length === 0) return [{ name: 'Turnover', data: [] }]
    return [{
      name: 'Market Turnover',
      data: marketStore.topTo.slice(0, 12).map(item => ({
        x: (item.symbol || '').split('.')[0],
        y: parseFloat(String(item.turnover || 0).replace(/,/g, '')) || 0
      }))
    }]
  })

  const treemapOptions = {
    chart: { type: 'treemap', toolbar: { show: false }, background: 'transparent' },
    theme: { mode: 'dark' },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'],
    plotOptions: { treemap: { distributed: true, enableShades: false } },
    dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 'bold' } },
    tooltip: { theme: 'dark', y: { formatter: (val) => marketStore.formatCurrency(val) } }
  }

  const horizontalBarSeries = computed(() => {
    const topG = marketStore.gainers.slice(0, 5)
    const topL = marketStore.losers.slice(0, 3)
    return [{
      data: [...topG.map(i => i.changePercentage || 0), ...topL.map(i => i.changePercentage || 0)]
    }]
  })

  const horizontalBarOptions = computed(() => {
    const topG = marketStore.gainers.slice(0, 5)
    const topL = marketStore.losers.slice(0, 3)
    return {
      chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
      theme: { mode: 'dark' },
      plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 2, barHeight: '70%' } },
      colors: ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#ef4444', '#ef4444', '#ef4444'],
      xaxis: { categories: [...topG.map(i => i.symbol.split('.')[0]), ...topL.map(i => i.symbol.split('.')[0])], labels: { show: false } },
      grid: { show: false }
    }
  })

  return {
    treemapSeries,
    treemapOptions,
    horizontalBarSeries,
    horizontalBarOptions
  }
}
