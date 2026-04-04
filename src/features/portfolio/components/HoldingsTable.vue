<script setup>
import { ref, computed } from 'vue'
import { Search as SearchIcon, ArrowUpDown, ChevronUp, ChevronDown, FileDown, Plus } from 'lucide-vue-next'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  holdings: { type: Array, default: () => [] },
  view: { type: String, default: 'current' }
})

const emit = defineEmits(['addTransaction', 'update:view'])

const searchQuery = ref('')
const sortKey = ref('stocks.ticker')
const sortOrder = ref('asc')

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-LK', { style: 'decimal', minimumFractionDigits: 2 }).format(val)
}

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const filteredAndSortedHoldings = computed(() => {
  let result = [...props.holdings]

  // Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(h =>
      h.stocks?.ticker?.toLowerCase().includes(query) ||
      h.stocks?.name?.toLowerCase().includes(query)
    )
  }

  // Sort
  result.sort((a, b) => {
    let valA, valB

    // Handle nested keys like 'stocks.ticker'
    if (sortKey.value.includes('.')) {
      const keys = sortKey.value.split('.')
      valA = a[keys[0]]?.[keys[1]]
      valB = b[keys[0]]?.[keys[1]]
    } else {
      valA = a[sortKey.value]
      valB = b[sortKey.value]
    }

    if (valA === valB) return 0
    const modifier = sortOrder.value === 'asc' ? 1 : -1
    return valA > valB ? modifier : -modifier
  })

  return result
})

const downloadPDF = () => {
  const doc = new jsPDF()
  const dateStr = new Date().toLocaleDateString()
  const timeStr = new Date().toLocaleTimeString()


  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('CSE PORTFOLIO SUMMARY', 15, 12)


  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(`GENERATED: ${dateStr} ${timeStr}`, 160, 12)

  // 2. Executive Summary Cards (Hyper-Compact)
  const totalCost = props.holdings.reduce((sum, h) => sum + (h.quantity * h.avg_price), 0)
  const totalMarket = props.holdings.reduce((sum, h) => sum + (h.quantity * (h.market_price || h.avg_price)), 0)
  const totalDivs = props.holdings.reduce((sum, h) => sum + (parseFloat(h.dividend) || 0), 0)
  const totalProfits = props.holdings.reduce((sum, h) => sum + (parseFloat(h.profit) || 0), 0)
  const capGl = totalMarket - totalCost

  const stats = [
    { label: 'INVESTMENT', value: `LKR ${formatCurrency(totalCost)}`, bgColor: [219, 234, 254], textColor: [30, 58, 138] }, // Light Blue bg, Dark Blue text
    { label: 'DIVIDENDS', value: `LKR ${formatCurrency(totalDivs)}`, bgColor: [241, 245, 249], textColor: [30, 41, 59] },
    {
      label: 'TOTAL G/L', value: `LKR ${formatCurrency(totalProfits)}`,
      bgColor: totalProfits >= 0 ? [209, 250, 229] : [254, 226, 226], // Light Green or Light Red bg
      textColor: totalProfits >= 0 ? [6, 78, 59] : [153, 27, 27]    // Dark Green or Dark Red text
    },
    {
      label: 'CURRENT G/L', value: `LKR ${formatCurrency(capGl)}`,
      bgColor: capGl >= 0 ? [209, 250, 229] : [254, 226, 226],
      textColor: capGl >= 0 ? [5, 150, 105] : [185, 28, 28]
    }
  ]

  let startX = 15
  const cardWidth = 43
  const cardHeight = 15

  stats.forEach((stat, i) => {
    const x = startX + (i * (cardWidth + 2))
    const y = 22

    // Card Background
    doc.setFillColor(...stat.bgColor)
    doc.roundedRect(x, y, cardWidth, cardHeight, 1, 1, 'F')

    // Label
    doc.setTextColor(...stat.textColor)
    doc.setFontSize(5)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.label, x + 2.5, y + 5)

    // Value
    doc.setFontSize(6.5)
    doc.text(stat.value, x + 2.5, y + 11)
  })

  // 3. Table Data Preparation
  const tableData = filteredAndSortedHoldings.value.map(h => [
    h.stocks?.ticker || 'N/A',
    formatCurrency(h.market_price || h.avg_price),
    h.quantity.toLocaleString(),
    formatCurrency(h.avg_price),
    formatCurrency(h.quantity * h.avg_price),
    formatCurrency(h.dividend || 0),
    formatCurrency(h.profit || 0),
    formatCurrency(h.liveProfit || 0)
  ])

  autoTable(doc, {
    startY: 40,
    head: [['STOCK', 'PRICE', 'QTY', 'AVG', 'COST', 'DIVS', 'PROFIT', 'CAPITAL G/L']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1,
      font: 'courier',
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      textColor: [0, 0, 0], // Table cell font black
      fontStyle: 'bold' // Table cell font bold
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [67, 56, 202] },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' }
    },
    margin: { top: 5, bottom: 5 },
    didParseCell: (data) => {
      // Highlight row if quantity > 0 (Active Positions)
      const qtyContent = data.row.cells[2].text[0]
      const qty = parseFloat(qtyContent.replace(/,/g, '')) || 0

      if (qty > 0 && data.section === 'body') {
        data.cell.styles.fillColor = [215, 218, 255]
      }

      // Dynamic Color for Profit (Index 6) and Capital G/L (Index 7)
      if (data.section === 'body' && data.column.index === 7) {
        const valText = data.cell.text[0]
        const val = parseFloat(valText.replace(/,/g, '')) || 0
        if (val > 0) {
          data.cell.styles.textColor = [16, 185, 129] // Emerald Green
        } else if (val < 0) {
          data.cell.styles.textColor = [239, 68, 68] // Rose Red
        }
      }
    },
    didDrawPage: () => {
      doc.setFontSize(5)
      doc.setTextColor(148, 163, 184)
      doc.text('CONFIDENTIAL ASSET REPORT - GENERATED VIA CSE TRACKER', 15, doc.internal.pageSize.height - 5)
    }
  })

  doc.save(`Portfolio_Full_Report_${new Date().getTime()}.pdf`)
}
</script>

<template>
  <div class="bg-[#121a2c] border border-white/5 rounded-2xl overflow-hidden mb-6 shadow-2xl">
    <div class="p-5 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/[0.02]">
      <div class="flex items-center justify-between w-full lg:w-auto gap-4">
        <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
          <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
          Strategic Positions
        </h3>

        <!-- View Toggle inside header -->
        <div class="flex items-center p-0.5 bg-black/20 rounded-lg border border-white/5 mx-2">
          <button @click="emit('update:view', 'current')" :class="view === 'current' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'" class="px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all">Current</button>
          <button @click="emit('update:view', 'all')" :class="view === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'" class="px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all">All</button>
        </div>

        <!-- Mobile Quick Actions -->
        <div class="flex items-center gap-2 lg:hidden">
          <button @click="downloadPDF" class="p-2 bg-white/5 text-slate-400 rounded-lg active:scale-95 transition-transform hover:text-white">
            <FileDown class="w-4 h-4" />
          </button>
          <button @click="$emit('addTransaction')" class="p-2 bg-indigo-600 text-white rounded-lg active:scale-95 transition-transform shadow-lg shadow-indigo-600/20">
            <Plus class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        <!-- Search Input -->
        <div class="relative group w-full lg:min-w-[300px]">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          <input v-model="searchQuery" type="text" placeholder="FILTER HOLDINGS..." class="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-10 py-2.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 transition-all text-white" />
        </div>

        <!-- Desktop Actions -->
        <div class="hidden lg:flex items-center gap-2">
          <button @click="downloadPDF" class="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all border border-white/5">
            <FileDown class="w-3.5 h-3.5" />
          </button>
          <!-- <button @click="$emit('addTransaction')" class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg shadow-indigo-600/20">
            <Plus class="w-3.5 h-3.5" /> New Position
          </button> -->
        </div>
      </div>
    </div>

    <div class="overflow-x-auto custom-scrollbar">
      <table class="w-full text-left border-collapse font-mono">
        <thead class="bg-slate-900/50 text-[9px] font-black text-slate-500 uppercase tracking-tighter border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
          <tr>
            <th @click="toggleSort('stocks.ticker')" class="px-5 py-4 border-r border-white/5 cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center gap-2">
                Stock
                <ArrowUpDown v-if="sortKey !== 'stocks.ticker'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </th>
            <th @click="toggleSort('market_price')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center justify-end gap-2">
                Market Price
                <ArrowUpDown v-if="sortKey !== 'market_price'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </th>
            <th @click="toggleSort('quantity')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center justify-end gap-2">
                Quantity
                <ArrowUpDown v-if="sortKey !== 'quantity'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </th>
            <th @click="toggleSort('avg_price')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center justify-end gap-2">
                Avg Price
                <ArrowUpDown v-if="sortKey !== 'avg_price'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </th>

            <th class="px-5 py-4 border-r border-white/5 text-right opacity-50">Total Cost</th>
            <th class="px-5 py-4 border-r border-white/5 text-right opacity-50">Dividends</th>
            <th @click="toggleSort('profit')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center justify-end gap-2">
                Profit
                <ArrowUpDown v-if="sortKey !== 'profit'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </th>
            <th @click="toggleSort('weight')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center justify-end gap-2">
                Weight
                <ArrowUpDown v-if="sortKey !== 'weight'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </th>
            <th @click="toggleSort('liveProfit')" class="px-5 py-4 border-r border-white/5 text-right cursor-pointer hover:text-white transition-colors group">
              <div class="flex items-center justify-end gap-2">
                Capital G/L
                <ArrowUpDown v-if="sortKey !== 'liveProfit'" class="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" />
                <ChevronUp v-else-if="sortOrder === 'asc'" class="w-2.5 h-2.5 text-indigo-400" />
                <ChevronDown v-else class="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="holding in filteredAndSortedHoldings" :key="holding.id" class="hover:bg-white/5 transition-colors group cursor-pointer">
            <td class="px-5 py-4 border-r border-white/5">
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-indigo-400 uppercase group-hover:text-amber-500 transition-colors">{{ holding.stocks?.ticker || 'N/A' }}</span>
                <span class="text-[9px] font-bold text-slate-500 truncate max-w-[120px]">{{ holding.stocks?.name }}</span>
              </div>
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-black text-indigo-400">
              {{ formatCurrency(holding.market_price || holding.avg_price) }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-white">
              {{ holding.quantity }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.avg_price) }}
            </td>

            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.quantity * holding.avg_price) }}
            </td>

            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-bold text-slate-400">
              {{ formatCurrency(holding.dividend || 0) }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right text-[11px] font-black" :class="(holding.profit || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'">
              {{ ((holding.profit || 0) >= 0 ? '+' : '') }}{{ formatCurrency(holding.profit || 0) }}
            </td>
            <td class="px-5 py-4 border-r border-white/5 text-right">
              <div class="flex flex-col items-end">
                <span class="text-[10px] font-black text-white">{{ (holding.weight || 0).toFixed(1) }}%</span>
                <div class="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div class="h-full bg-indigo-500" :style="{ width: (holding.weight || 0) + '%' }"></div>
                </div>
              </div>
            </td>
            <td class="px-5 py-4 text-right">
              <div class="flex flex-col items-end">
                <span class="text-[11px] font-black" :class="(holding.liveProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ (holding.liveProfit || 0) >= 0 ? '+' : '' }}{{ formatCurrency(holding.liveProfit || 0) }}
                </span>
                <span class="text-[9px] font-bold" :class="(holding.profit || 0) >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50'">
                  {{ (holding.quantity * holding.avg_price) > 0
                    ? (((holding.profit || 0) / (holding.quantity * holding.avg_price)) * 100).toFixed(2)
                    : '0.00' }}%
                </span>
              </div>
            </td>

          </tr>
          <tr v-if="filteredAndSortedHoldings.length === 0">
            <td colspan="9" class="p-16 text-center text-slate-600 uppercase font-black text-[10px] tracking-[0.3em] italic">
              No matching strategic positions found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
