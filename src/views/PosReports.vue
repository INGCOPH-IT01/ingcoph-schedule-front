<template>
  <div class="pos-reports">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#1e293b" size="20" class="mr-2">mdi-chart-bar</v-icon>
          Sales & Inventory Reports
        </div>
        <h1 class="header-title">
          <span class="title-gradient">POS</span> Reports
        </h1>
        <p class="header-subtitle">
          View sales performance, inventory levels, and generate reports
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">Total Sales</div>
                <div class="text-h5 text-primary">{{ stats.total_sales || 0 }}</div>
              </div>
              <v-icon size="48" color="primary">mdi-receipt-text</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">Total Revenue</div>
                <div class="text-h5 text-success">{{ formatPrice(stats.total_revenue || 0) }}</div>
              </div>
              <v-icon size="48" color="success">mdi-cash-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">Total Profit</div>
                <div class="text-h5 text-info">{{ formatPrice(stats.total_profit || 0) }}</div>
              </div>
              <v-icon size="48" color="info">mdi-trending-up</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">Today's Sales</div>
                <div class="text-h5 text-warning">{{ stats.today_sales || 0 }}</div>
              </div>
              <v-icon size="48" color="warning">mdi-calendar-today</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Date Filter -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="dateFrom"
              label="Date From"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="dateTo"
              label="Date To"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn color="primary" block @click="loadReports" :loading="loading">
              <v-icon start>mdi-refresh</v-icon>
              Update Reports
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs for Different Reports -->
    <v-card>
      <v-tabs v-model="activeTab" bg-color="primary">
        <v-tab value="sales">Sales History</v-tab>
        <v-tab value="products">Product Performance</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <!-- Sales History Tab -->
          <v-window-item value="sales">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3>Sales Transactions</h3>
              <v-btn color="success" variant="outlined" @click="exportSalesReport" :loading="exporting">
                <v-icon start>mdi-file-excel</v-icon>
                Export to Excel
              </v-btn>
            </div>

            <v-data-table
              :headers="salesHeaders"
              :items="sales"
              :loading="loading"
              density="comfortable"
            >
              <template v-slot:[`item.sale_number`]="{ item }">
                <v-chip size="small" variant="outlined" @click="viewSale(item)">
                  {{ item.sale_number }}
                </v-chip>
              </template>

              <template v-slot:[`item.sale_date`]="{ item }">
                {{ formatDate(item.sale_date) }}
              </template>

              <template v-slot:[`item.customer`]="{ item }">
                {{ item.customer?.name || item.customer_name || 'Walk-in' }}
              </template>

              <template v-slot:[`item.total_amount`]="{ item }">
                <span class="font-weight-bold">{{ formatPrice(item.total_amount) }}</span>
              </template>

              <template v-slot:[`item.profit`]="{ item }">
                <span class="text-success font-weight-bold">{{ formatPrice(item.profit || 0) }}</span>
              </template>

              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  :color="getSaleStatusColor(item.status)"
                  size="small"
                  variant="tonal"
                >
                  {{ getSaleStatusText(item.status) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- Product Performance Tab -->
          <v-window-item value="products">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3>Product Sales Summary</h3>
              <v-btn color="success" variant="outlined" @click="exportProductReport" :loading="exporting">
                <v-icon start>mdi-file-excel</v-icon>
                Export to Excel
              </v-btn>
            </div>

            <v-data-table
              :headers="productHeaders"
              :items="productSales"
              :loading="loading"
              density="comfortable"
            >
              <template v-slot:[`item.total_quantity`]="{ item }">
                <span class="font-weight-medium">{{ item.total_quantity }}</span>
              </template>

              <template v-slot:[`item.total_revenue`]="{ item }">
                <span class="font-weight-bold text-success">{{ formatPrice(item.total_revenue) }}</span>
              </template>

              <template v-slot:[`item.total_profit`]="{ item }">
                <span class="font-weight-bold text-info">{{ formatPrice(item.total_profit) }}</span>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Sale Details Dialog -->
    <PosSaleDialog
      :is-open="saleDialog"
      @update:is-open="saleDialog = $event"
      :sale="selectedSale"
      :show-admin-actions="true"
      @updated="loadReports"
    />

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { posService } from '../services/posService'
import { formatPrice, formatDate } from '../utils/formatters'
import PosSaleDialog from '../components/PosSaleDialog.vue'
import ExcelJS from 'exceljs'

export default {
  name: 'PosReports',
  components: {
    PosSaleDialog
  },
  setup() {
    const activeTab = ref('sales')
    const stats = ref({})
    const sales = ref([])
    const productSales = ref([])
    const loading = ref(false)
    const exporting = ref(false)
    const saleDialog = ref(false)
    const selectedSale = ref(null)

    // Date filters
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const dateFrom = ref(firstDay.toISOString().split('T')[0])
    const dateTo = ref(today.toISOString().split('T')[0])

    const snackbar = ref({ show: false, message: '', color: 'success' })

    const salesHeaders = [
      { title: 'Sale Number', key: 'sale_number' },
      { title: 'Date', key: 'sale_date' },
      { title: 'Customer', key: 'customer' },
      { title: 'Staff', key: 'user.name' },
      { title: 'Amount', key: 'total_amount' },
      { title: 'Profit', key: 'profit' },
      { title: 'Status', key: 'status' }
    ]

    const productHeaders = [
      { title: 'Product', key: 'name' },
      { title: 'SKU', key: 'sku' },
      { title: 'Quantity Sold', key: 'total_quantity' },
      { title: 'Revenue', key: 'total_revenue' },
      { title: 'Profit', key: 'total_profit' }
    ]

    const loadReports = async () => {
      await Promise.all([
        loadStats(),
        loadSales(),
        loadProductSales()
      ])
    }

    const loadStats = async () => {
      try {
        stats.value = await posService.getStatistics(dateFrom.value, dateTo.value)
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    const loadSales = async () => {
      try {
        loading.value = true
        sales.value = await posService.getSalesReport(dateFrom.value, dateTo.value)
      } catch (error) {
        showSnackbar('Failed to load sales', 'error')
      } finally {
        loading.value = false
      }
    }

    const loadProductSales = async () => {
      try {
        loading.value = true
        productSales.value = await posService.getProductSalesSummary(dateFrom.value, dateTo.value)
      } catch (error) {
        showSnackbar('Failed to load product sales', 'error')
      } finally {
        loading.value = false
      }
    }

    const viewSale = async (sale) => {
      try {
        selectedSale.value = await posService.getSale(sale.id)
        saleDialog.value = true
      } catch (error) {
        showSnackbar('Failed to load sale details', 'error')
      }
    }

    const exportSalesReport = async () => {
      try {
        exporting.value = true
        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet('Sales Report')

        sheet.columns = [
          { header: 'Sale Number', key: 'sale_number', width: 20 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Customer', key: 'customer', width: 25 },
          { header: 'Staff', key: 'staff', width: 25 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Profit', key: 'profit', width: 15 },
          { header: 'Status', key: 'status', width: 15 }
        ]

        // Style header
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' }
        }

        sales.value.forEach(sale => {
          const row = sheet.addRow({
            sale_number: sale.sale_number,
            date: formatDate(sale.sale_date),
            customer: sale.customer?.name || sale.customer_name || 'Walk-in',
            staff: sale.user?.name || 'N/A',
            amount: parseFloat(sale.total_amount),
            profit: parseFloat(sale.profit || 0),
            status: getSaleStatusText(sale.status)
          })

          row.getCell('amount').numFmt = '₱#,##0.00'
          row.getCell('profit').numFmt = '₱#,##0.00'
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sales-report-${dateFrom.value}-to-${dateTo.value}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)

        showSnackbar('Sales report exported successfully', 'success')
      } catch (error) {
        console.error('Export error:', error)
        showSnackbar('Failed to export report', 'error')
      } finally {
        exporting.value = false
      }
    }

    const exportProductReport = async () => {
      try {
        exporting.value = true
        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet('Product Sales')

        sheet.columns = [
          { header: 'Product', key: 'name', width: 30 },
          { header: 'SKU', key: 'sku', width: 15 },
          { header: 'Quantity Sold', key: 'quantity', width: 15 },
          { header: 'Revenue', key: 'revenue', width: 15 },
          { header: 'Profit', key: 'profit', width: 15 }
        ]

        // Style header
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' }
        }

        productSales.value.forEach(product => {
          const row = sheet.addRow({
            name: product.name,
            sku: product.sku,
            quantity: product.total_quantity,
            revenue: parseFloat(product.total_revenue),
            profit: parseFloat(product.total_profit)
          })

          row.getCell('revenue').numFmt = '₱#,##0.00'
          row.getCell('profit').numFmt = '₱#,##0.00'
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `product-sales-${dateFrom.value}-to-${dateTo.value}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)

        showSnackbar('Product report exported successfully', 'success')
      } catch (error) {
        console.error('Export error:', error)
        showSnackbar('Failed to export report', 'error')
      } finally {
        exporting.value = false
      }
    }

    const getSaleStatusColor = (status) => {
      return posService.getSaleStatusColor(status)
    }

    const getSaleStatusText = (status) => {
      return posService.getSaleStatusText(status)
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = { show: true, message, color }
    }

    onMounted(() => {
      loadReports()
    })

    return {
      activeTab,
      stats,
      sales,
      productSales,
      loading,
      exporting,
      saleDialog,
      selectedSale,
      dateFrom,
      dateTo,
      snackbar,
      salesHeaders,
      productHeaders,
      loadReports,
      viewSale,
      exportSalesReport,
      exportProductReport,
      getSaleStatusColor,
      getSaleStatusText,
      formatPrice,
      formatDate
    }
  }
}
</script>

<style scoped>
.pos-reports {
  padding: 32px;
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 0;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #1e293b;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: #475569;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
</style>

