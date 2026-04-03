import { ref, computed, watch } from 'vue'

export function useMarketTable(allStocks) {
  const searchQuery = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(15)
  const sortKey = ref('')
  const sortDir = ref('asc')
  const activeColumnTab = ref('daily')

  // Reset page when filtering or changing view/size
  watch([searchQuery, itemsPerPage, activeColumnTab], () => {
    currentPage.value = 1
  })

  const filteredStocks = computed(() => {
    if (!allStocks.value) return []
    const q = searchQuery.value.toLowerCase()
    return allStocks.value.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
  })

  const sortBy = (key) => {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'asc'
    }
    currentPage.value = 1
  }

  const sortedStocks = computed(() => {
    if (!sortKey.value) return filteredStocks.value
    const key = sortKey.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    return [...filteredStocks.value].sort((a, b) => {
      const na = parseFloat(String(a[key]).replace(/[,%BMK]/g, ''))
      const nb = parseFloat(String(b[key]).replace(/[,%BMK]/g, ''))
      if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir
      return String(a[key]).localeCompare(String(b[key])) * dir
    })
  })

  const totalPages = computed(() => Math.ceil(sortedStocks.value.length / itemsPerPage.value))

  const paginatedStocks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    return sortedStocks.value.slice(start, start + itemsPerPage.value)
  })

  const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
  const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
  const setPage = (p) => { currentPage.value = p }

  return {
    searchQuery,
    currentPage,
    itemsPerPage,
    sortKey,
    sortDir,
    activeColumnTab,
    filteredStocks,
    paginatedStocks,
    totalPages,
    sortBy,
    nextPage,
    prevPage,
    setPage
  }
}
