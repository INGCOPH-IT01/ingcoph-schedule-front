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
    <v-row v-if="isAdmin" class="mb-6">
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
                <div class="d-flex align-center">
                  <v-avatar v-if="item.booking" size="24" color="primary" class="mr-2">
                    <span class="text-white text-caption">{{ getDisplayCustomerName(item).charAt(0).toUpperCase() }}</span>
                  </v-avatar>
                  <div>
                    <div>{{ getDisplayCustomerName(item) }}</div>
                    <div v-if="isBookingLinked(item) && isAdminCreatedBooking(item)" class="text-caption text-grey">
                      <v-icon size="x-small" class="mr-1">mdi-account-tie</v-icon>
                      Booked by: {{ item.user?.name || 'Admin' }}
                    </div>
                  </div>
                </div>
              </template>

              <template v-slot:[`item.payment_method`]="{ item }">
                <v-chip size="small" variant="outlined" :color="item.payment_method === 'cash' ? 'success' : 'info'">
                  {{ item.payment_method || 'N/A' }}
                </v-chip>
              </template>

              <template v-slot:[`item.payment_reference`]="{ item }">
                <span class="text-caption">{{ item.payment_reference || '-' }}</span>
              </template>

              <template v-slot:[`item.proof_of_payment`]="{ item }">
                <v-chip
                  v-if="item.proof_of_payment || (item.proof_of_payment_urls && item.proof_of_payment_urls.length > 0)"
                  size="small"
                  color="success"
                  variant="flat"
                  @click="viewProofOfPayment(item)"
                  class="clickable-chip"
                >
                  <v-icon size="small" start>mdi-file-image</v-icon>
                  View
                </v-chip>
                <v-chip
                  v-else
                  size="small"
                  color="grey"
                  variant="flat"
                >
                  No
                </v-chip>
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

    <!-- Proof of Payment Viewer Dialog -->
    <v-dialog v-model="proofDialog" max-width="900">
      <v-card v-if="viewingProofSale">
        <v-card-title class="d-flex align-center justify-space-between bg-primary">
          <span class="text-white">
            <v-icon class="mr-2" color="white">mdi-file-image</v-icon>
            Proof of Payment - {{ viewingProofSale.sale_number }}
          </span>
          <v-btn icon="mdi-close" variant="text" color="white" @click="proofDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <div v-if="proofImages.length === 0" class="text-center py-8 text-grey">
            <v-icon size="64" color="grey">mdi-image-off</v-icon>
            <p class="mt-2">No proof of payment images found</p>
          </div>

          <div v-else>
            <div class="text-caption text-grey mb-4">
              {{ proofImages.length }} image{{ proofImages.length !== 1 ? 's' : '' }} uploaded
            </div>

            <div class="proof-gallery">
              <v-card
                v-for="(image, index) in proofImages"
                :key="index"
                class="proof-card"
                @click="openProofImageViewer(index)"
              >
                <v-img
                  :src="image"
                  :aspect-ratio="1"
                  cover
                  class="proof-thumbnail"
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                    </v-row>
                  </template>
                  <template v-slot:error>
                    <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                      <v-icon size="48" color="grey">mdi-image-off</v-icon>
                    </div>
                  </template>
                </v-img>
                <v-overlay
                  :model-value="true"
                  contained
                  class="align-center justify-center"
                  scrim="rgba(0, 0, 0, 0.3)"
                >
                  <v-icon color="white" size="48">mdi-magnify-plus</v-icon>
                </v-overlay>
              </v-card>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="proofDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            v-if="viewingProofSale"
            color="primary"
            variant="elevated"
            @click="viewSale(viewingProofSale)"
          >
            <v-icon start>mdi-receipt-text</v-icon>
            View Full Sale Details
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Proof Image Viewer Dialog -->
    <v-dialog v-model="proofImageDialog" max-width="1000">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Image {{ proofImageIndex + 1 }} of {{ proofImages.length }}</span>
          <v-btn icon="mdi-close" variant="text" @click="proofImageDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img
            :src="proofImages[proofImageIndex]"
            contain
            max-height="75vh"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-card-text>
        <v-card-actions class="justify-space-between pa-4">
          <v-btn
            :disabled="proofImageIndex === 0"
            @click="proofImageIndex--"
            icon
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="downloadProofImage(proofImageIndex)"
          >
            <v-icon start>mdi-download</v-icon>
            Download
          </v-btn>
          <v-btn
            :disabled="proofImageIndex === proofImages.length - 1"
            @click="proofImageIndex++"
            icon
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { posService } from '../services/posService'
import { formatPrice, formatDate, formatDateToLocal } from '../utils/formatters'
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
    const proofDialog = ref(false)
    const viewingProofSale = ref(null)
    const proofImages = ref([])
    const proofImageDialog = ref(false)
    const proofImageIndex = ref(0)

    // Get user info for role-based permissions
    const user = ref(null)
    const isAdmin = ref(false)

    // Date filters - default to start and end of current month
    // Use local date formatting to avoid timezone offset issues
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const dateFrom = ref(formatDateToLocal(firstDay))
    const dateTo = ref(formatDateToLocal(lastDay))

    const snackbar = ref({ show: false, message: '', color: 'success' })

    // Dynamic headers based on user role
    const salesHeaders = computed(() => {
      const headers = [
        { title: 'Sale Number', key: 'sale_number' },
        { title: 'Date', key: 'sale_date' },
        { title: 'Customer', key: 'customer' },
        { title: 'Staff', key: 'user.name' },
        { title: 'Payment Method', key: 'payment_method' },
        { title: 'Payment Ref', key: 'payment_reference' },
        { title: 'Proof of Payment', key: 'proof_of_payment' },
        { title: 'Amount', key: 'total_amount' }
      ]

      // Only admins can see profit
      if (isAdmin.value) {
        headers.push({ title: 'Profit', key: 'profit' })
      }

      headers.push({ title: 'Status', key: 'status' })
      return headers
    })

    const productHeaders = computed(() => {
      const headers = [
        { title: 'Product', key: 'name' },
        { title: 'SKU', key: 'sku' },
        { title: 'Quantity Sold', key: 'total_quantity' },
        { title: 'Revenue', key: 'total_revenue' }
      ]

      // Only admins can see profit
      if (isAdmin.value) {
        headers.push({ title: 'Profit', key: 'total_profit' })
      }

      return headers
    })

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
        const salesData = await posService.getSalesReport(dateFrom.value, dateTo.value)

        // For sales with booking_id, fetch booking details to get proper customer display
        const salesWithBookings = await Promise.all(
          salesData.map(async (sale) => {
            if (sale.booking_id) {
              try {
                // Fetch full sale details which includes booking info
                const fullSale = await posService.getSale(sale.id)
                return fullSale
              } catch (error) {
                console.error(`Failed to load booking for sale ${sale.id}:`, error)
                return sale
              }
            }
            return sale
          })
        )

        sales.value = salesWithBookings
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

        // ===== Sales Summary Sheet =====
        const sheet = workbook.addWorksheet('Sales Summary')

        const columns = [
          { header: 'Sale Number', key: 'sale_number', width: 20 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Customer', key: 'customer', width: 25 },
          { header: 'Staff', key: 'staff', width: 25 },
          { header: 'Payment Method', key: 'payment_method', width: 15 },
          { header: 'Payment Ref', key: 'payment_ref', width: 20 },
          { header: 'Proof of Payment', key: 'proof_of_payment', width: 18 },
          { header: 'Amount', key: 'amount', width: 15 }
        ]

        // Only admins can see profit
        if (isAdmin.value) {
          columns.push({ header: 'Profit', key: 'profit', width: 15 })
        }

        columns.push({ header: 'Status', key: 'status', width: 15 })

        sheet.columns = columns

        // Style header
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' }
        }

        sales.value.forEach(sale => {
          const rowData = {
            sale_number: sale.sale_number,
            date: formatDate(sale.sale_date),
            customer: getDisplayCustomerName(sale),
            staff: sale.user?.name || 'N/A',
            payment_method: sale.payment_method || 'N/A',
            payment_ref: sale.payment_reference || '-',
            proof_of_payment: sale.proof_of_payment ? 'Yes' : 'No',
            amount: parseFloat(sale.total_amount),
            status: getSaleStatusText(sale.status)
          }

          // Only admins can see profit
          if (isAdmin.value) {
            rowData.profit = parseFloat(sale.profit || 0)
          }

          const row = sheet.addRow(rowData)

          row.getCell('amount').numFmt = '₱#,##0.00'
          if (isAdmin.value) {
            row.getCell('profit').numFmt = '₱#,##0.00'
          }
        })

        // ===== Detailed Items Sheet =====
        const detailedSheet = workbook.addWorksheet('Detailed')

        const detailedColumns = [
          { header: 'Sale Number', key: 'sale_number', width: 20 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Customer', key: 'customer', width: 25 },
          { header: 'Payment Method', key: 'payment_method', width: 15 },
          { header: 'Payment Ref', key: 'payment_ref', width: 20 },
          { header: 'Proof of Payment', key: 'proof_of_payment', width: 18 },
          { header: 'Product Name', key: 'product_name', width: 30 },
          { header: 'SKU', key: 'sku', width: 15 },
          { header: 'Quantity', key: 'quantity', width: 12 },
          { header: 'Unit Price', key: 'unit_price', width: 15 },
          { header: 'Discount', key: 'discount', width: 15 },
          { header: 'Subtotal', key: 'subtotal', width: 15 }
        ]

        // Only admins can see item profit
        if (isAdmin.value) {
          detailedColumns.push({ header: 'Item Profit', key: 'item_profit', width: 15 })
        }

        detailedSheet.columns = detailedColumns

        // Style detailed header
        detailedSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        detailedSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' }
        }

        // Add detailed rows for each sale item
        sales.value.forEach(sale => {
          if (sale.sale_items && sale.sale_items.length > 0) {
            sale.sale_items.forEach(item => {
              const detailedRowData = {
                sale_number: sale.sale_number,
                date: formatDate(sale.sale_date),
                customer: getDisplayCustomerName(sale),
                payment_method: sale.payment_method || 'N/A',
                payment_ref: sale.payment_reference || '-',
                proof_of_payment: sale.proof_of_payment ? 'Yes' : 'No',
                product_name: item.product?.name || 'N/A',
                sku: item.product?.sku || 'N/A',
                quantity: item.quantity,
                unit_price: parseFloat(item.unit_price),
                discount: parseFloat(item.discount || 0),
                subtotal: parseFloat(item.subtotal)
              }

              // Only admins can see item profit
              if (isAdmin.value) {
                detailedRowData.item_profit = parseFloat(item.item_profit || 0)
              }

              const detailedRow = detailedSheet.addRow(detailedRowData)

              // Format currency columns
              detailedRow.getCell('unit_price').numFmt = '₱#,##0.00'
              detailedRow.getCell('discount').numFmt = '₱#,##0.00'
              detailedRow.getCell('subtotal').numFmt = '₱#,##0.00'
              if (isAdmin.value) {
                detailedRow.getCell('item_profit').numFmt = '₱#,##0.00'
              }
            })
          }
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

        const columns = [
          { header: 'Product', key: 'name', width: 30 },
          { header: 'SKU', key: 'sku', width: 15 },
          { header: 'Quantity Sold', key: 'quantity', width: 15 },
          { header: 'Revenue', key: 'revenue', width: 15 }
        ]

        // Only admins can see profit
        if (isAdmin.value) {
          columns.push({ header: 'Profit', key: 'profit', width: 15 })
        }

        sheet.columns = columns

        // Style header
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF10B981' }
        }

        productSales.value.forEach(product => {
          const rowData = {
            name: product.name,
            sku: product.sku,
            quantity: product.total_quantity,
            revenue: parseFloat(product.total_revenue)
          }

          // Only admins can see profit
          if (isAdmin.value) {
            rowData.profit = parseFloat(product.total_profit)
          }

          const row = sheet.addRow(rowData)

          row.getCell('revenue').numFmt = '₱#,##0.00'
          if (isAdmin.value) {
            row.getCell('profit').numFmt = '₱#,##0.00'
          }
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

    // Helper functions for customer display (matching AdminDashboard logic)
    const isBookingLinked = (sale) => {
      return sale.booking_id && sale.booking
    }

    const isAdminCreatedBooking = (sale) => {
      // Check if the booking has cart items with booking_for_user_id or booking_for_user_name
      if (!sale.booking || !sale.booking.cart_items || sale.booking.cart_items.length === 0) {
        return false
      }
      const firstCartItem = sale.booking.cart_items[0]
      return firstCartItem && (firstCartItem.booking_for_user_id || firstCartItem.booking_for_user_name)
    }

    const getDisplayCustomerName = (sale) => {
      // If sale is linked to a booking, use AdminDashboard logic
      if (isBookingLinked(sale)) {
        const firstCartItem = sale.booking.cart_items?.[0]

        // If this is an admin booking, return the "booking for" user
        if (firstCartItem?.booking_for_user_name) {
          return firstCartItem.booking_for_user_name
        }

        // Otherwise, return the booking creator
        return sale.booking.user?.name || 'N/A'
      }

      // If not linked to booking, use customer_name or customer object
      if (sale.customer_name) {
        return sale.customer_name
      }

      if (sale.customer?.name) {
        return sale.customer.name
      }

      return 'Walk-in'
    }

    const parseProofOfPayment = (sale) => {
      // Use proof_of_payment_urls if available (new file-based approach)
      if (sale.proof_of_payment_urls && Array.isArray(sale.proof_of_payment_urls)) {
        return sale.proof_of_payment_urls
      }

      // Fallback to old base64 approach for backward compatibility
      const proofData = sale.proof_of_payment
      if (!proofData) return []

      try {
        // If it's already an array, return it
        if (Array.isArray(proofData)) {
          return proofData
        }

        // Try to parse as JSON
        const parsed = JSON.parse(proofData)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        // If parsing fails, try to use it as a single image
        if (typeof proofData === 'string' && proofData.startsWith('data:image')) {
          return [proofData]
        }
        return []
      }
    }

    const viewProofOfPayment = (sale) => {
      viewingProofSale.value = sale
      proofImages.value = parseProofOfPayment(sale)
      proofImageIndex.value = 0
      proofDialog.value = true
    }

    const openProofImageViewer = (index) => {
      proofImageIndex.value = index
      proofImageDialog.value = true
      proofDialog.value = false
    }

    const downloadProofImage = (index) => {
      const image = proofImages.value[index]
      if (!image) return

      // Create a temporary link element
      const link = document.createElement('a')
      link.href = image
      link.download = `proof-of-payment-${viewingProofSale.value?.sale_number || 'unknown'}-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Check user role
    const checkUserRole = () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          user.value = JSON.parse(storedUser)
          isAdmin.value = user.value?.role === 'admin'
        }
      } catch (error) {
        console.error('Failed to get user info:', error)
      }
    }

    // Listen for auth changes
    const handleAuthChange = (event) => {
      if (event.detail?.user) {
        user.value = event.detail.user
        isAdmin.value = user.value?.role === 'admin'
      }
    }

    onMounted(() => {
      checkUserRole()
      loadReports()
      window.addEventListener('auth-changed', handleAuthChange)
    })

    onUnmounted(() => {
      window.removeEventListener('auth-changed', handleAuthChange)
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
      proofDialog,
      viewingProofSale,
      proofImages,
      proofImageDialog,
      proofImageIndex,
      dateFrom,
      dateTo,
      snackbar,
      salesHeaders,
      productHeaders,
      isAdmin,
      loadReports,
      viewSale,
      exportSalesReport,
      exportProductReport,
      getSaleStatusColor,
      getSaleStatusText,
      formatPrice,
      formatDate,
      getDisplayCustomerName,
      isBookingLinked,
      isAdminCreatedBooking,
      viewProofOfPayment,
      openProofImageViewer,
      downloadProofImage
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

.clickable-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.proof-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.proof-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.proof-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.proof-thumbnail {
  border-radius: 8px;
}

.proof-card .v-overlay {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.proof-card:hover .v-overlay {
  opacity: 1;
}
</style>
