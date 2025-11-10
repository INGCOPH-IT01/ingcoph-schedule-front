<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon left>mdi-package-variant</v-icon>
            Inventory Management - Receiving Reports
            <v-spacer></v-spacer>

          </v-card-title>

          <!-- Statistics Cards -->
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-card color="primary" theme="dark" class="stat-card">
                  <v-card-text class="pb-2">
                    <div class="stat-label">Total Reports</div>
                    <div class="stat-value">{{ statistics.total_reports || 0 }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="warning" theme="dark" class="stat-card">
                  <v-card-text class="pb-2">
                    <div class="stat-label">Pending</div>
                    <div class="stat-value">{{ statistics.pending_reports || 0 }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="success" theme="dark" class="stat-card">
                  <v-card-text class="pb-2">
                    <div class="stat-label">Confirmed</div>
                    <div class="stat-value">{{ statistics.confirmed_reports || 0 }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Filters and Search -->
          <v-card-text>
            <v-row>
              <v-col cols="12" class="d-flex justify-space-between">
                <v-btn color="primary" @click="openCreateDialog">
                  <v-icon left>mdi-plus</v-icon>
                  New Receiving Report
                </v-btn>
                <v-btn color="success" @click="exportToExcel" :loading="exporting">
                  <v-icon left>mdi-microsoft-excel</v-icon>
                  Export to Excel
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="productSearch"
                  label="Quick Add Product"
                  placeholder="Scan barcode, SKU, or name + Enter"
                  prepend-inner-icon="mdi-package-variant-closed"
                  clearable
                  variant="outlined"
                  density="compact"
                  hide-details
                  @keyup.enter="handleQuickProductSearch"
                >
                  <template v-slot:append-inner>
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon v-bind="props" size="small" color="primary">
                          mdi-barcode-scan
                        </v-icon>
                      </template>
                      Press Enter to open new report with product
                    </v-tooltip>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="search"
                  label="Search Reports"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  @input="debouncedSearch"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="filters.status"
                  :items="statusOptions"
                  label="Status"
                  clearable
                  @update:modelValue="loadReports"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="filters.start_date"
                  label="Start Date"
                  type="date"
                  clearable
                  @change="loadReports"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="filters.end_date"
                  label="End Date"
                  type="date"
                  clearable
                  @change="loadReports"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- Reports Table -->
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="reports"
              :loading="loading"
              :items-length="totalItems"
              v-model:options="options"
              @update:options="loadReports"
              class="elevation-1"
            >
              <template v-slot:item.report_number="{ item }">
                <v-chip color="primary" size="small">{{ item.report_number }}</v-chip>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ item.status.toUpperCase() }}
                </v-chip>
              </template>

              <template v-slot:item.created_at="{ item }">
                {{ formatDateTime(item.created_at) }}
              </template>

              <template v-slot:item.confirmed_at="{ item }">
                <span v-if="item.confirmed_at">{{ formatDateTime(item.confirmed_at) }}</span>
                <span v-else class="text-grey">-</span>
              </template>

              <template v-slot:item.user="{ item }">
                {{ item.user ? item.user.name : 'N/A' }}
              </template>

              <template v-slot:item.items_count="{ item }">
                <v-chip size="small">{{ item.items_count }} items</v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      @click="viewReport(item)"
                      prepend-icon="mdi-eye"
                      title="View"
                    ></v-list-item>

                    <v-list-item
                      v-if="item.status === 'draft' || item.status === 'pending'"
                      @click="editReport(item)"
                      prepend-icon="mdi-pencil"
                      title="Edit"
                    ></v-list-item>

                    <v-list-item
                      v-if="item.status === 'draft'"
                      @click="submitReport(item)"
                      prepend-icon="mdi-send"
                      title="Submit for Confirmation"
                    ></v-list-item>

                    <v-list-item
                      v-if="item.status === 'pending'"
                      @click="confirmReport(item)"
                      prepend-icon="mdi-check-circle"
                      title="Confirm & Adjust Stock"
                    ></v-list-item>

                    <v-list-item
                      v-if="item.status === 'draft' || item.status === 'pending'"
                      @click="cancelReport(item)"
                      prepend-icon="mdi-cancel"
                      title="Cancel"
                    ></v-list-item>

                    <v-list-item
                      v-if="item.status === 'draft' || item.status === 'cancelled'"
                      @click="deleteReport(item)"
                      prepend-icon="mdi-delete"
                      title="Delete"
                    ></v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Receiving Report Dialog -->
    <ReceivingReportDialog
      v-model="dialog"
      :report="selectedReport"
      :mode="dialogMode"
      @saved="handleReportSaved"
      @closed="handleDialogClosed"
    />

    <!-- View Report Dialog -->
    <ReceivingReportViewDialog
      v-model="viewDialog"
      :report="selectedReport"
      @closed="handleViewDialogClosed"
    />

    <!-- Confirm Dialog -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          {{ confirmAction.title }}
        </v-card-title>
        <v-card-text>
          {{ confirmAction.message }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="confirmDialog = false">Cancel</v-btn>
          <v-btn
            :color="confirmAction.color"
            text
            @click="executeConfirmAction"
            :loading="confirmAction.loading"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import inventoryService from '@/services/inventoryService';
import { productService } from '@/services/productService';
import ReceivingReportDialog from '@/components/ReceivingReportDialog.vue';
import ReceivingReportViewDialog from '@/components/ReceivingReportViewDialog.vue';
import { debounce } from '@/utils/debounce';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export default {
  name: 'InventoryManagement',
  components: {
    ReceivingReportDialog,
    ReceivingReportViewDialog,
  },
  data() {
    return {
      loading: false,
      exporting: false,
      reports: [],
      statistics: {},
      products: [],
      productSearch: '',
      search: '',
      filters: {
        status: null,
        start_date: null,
        end_date: null,
      },
      statusOptions: [
        { title: 'All', value: null },
        { title: 'Draft', value: 'draft' },
        { title: 'Pending', value: 'pending' },
        { title: 'Confirmed', value: 'confirmed' },
        { title: 'Cancelled', value: 'cancelled' },
      ],
      headers: [
        { title: 'Report Number', key: 'report_number' },
        { title: 'Date', key: 'created_at' },
        { title: 'Receiving Date', key: 'confirmed_at' },
        { title: 'Created By', key: 'user' },
        { title: 'Status', key: 'status' },
        { title: 'Items', key: 'items_count' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      options: {},
      totalItems: 0,
      dialog: false,
      viewDialog: false,
      dialogMode: 'create', // 'create', 'edit', 'view'
      selectedReport: null,
      confirmDialog: false,
      confirmAction: {
        title: '',
        message: '',
        color: 'primary',
        action: null,
        loading: false,
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
    };
  },
  created() {
    this.debouncedSearch = debounce(this.loadReports, 500);
    this.loadStatistics();
    this.loadProducts();
  },
  methods: {
    async loadReports() {
      this.loading = true;
      try {
        const { page, itemsPerPage, sortBy } = this.options;

        // In Vuetify 3, sortBy is an array of objects like [{ key: 'name', order: 'asc' }]
        const sortColumn = sortBy && sortBy.length > 0 ? sortBy[0].key : 'created_at';
        const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : 'desc';

        const params = {
          page,
          per_page: itemsPerPage,
          sort_by: sortColumn,
          sort_order: sortOrder,
          search: this.search || undefined,
          status: this.filters.status || undefined,
          start_date: this.filters.start_date || undefined,
          end_date: this.filters.end_date || undefined,
        };

        const response = await inventoryService.getReceivingReports(params);
        this.reports = response.data.data;
        this.totalItems = response.data.total;
      } catch (error) {
        console.error('Error loading reports:', error);
        this.showSnackbar('Error loading receiving reports', 'error');
      } finally {
        this.loading = false;
      }
    },

    async loadStatistics() {
      try {
        const response = await inventoryService.getStatistics();
        this.statistics = response.data;
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    },

    async loadProducts() {
      try {
        this.products = await productService.getProducts({ active_only: true });
      } catch (error) {
        console.error('Error loading products:', error);
        this.showSnackbar('Failed to load products', 'error');
      }
    },

    async exportToExcel() {
      this.exporting = true;
      try {
        const params = {
          status: this.filters.status || undefined,
          start_date: this.filters.start_date || undefined,
          end_date: this.filters.end_date || undefined,
        };

        const response = await inventoryService.exportReceivingReports(params);
        const { reports, exported_at } = response.data;

        // Dynamically import ExcelJS
        const ExcelJS = (await import('exceljs')).default;

        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Inventory Management System';
        workbook.created = new Date();

        // Create Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary');

        // Add title
        summarySheet.mergeCells('A1:G1');
        summarySheet.getCell('A1').value = 'Receiving Reports Summary';
        summarySheet.getCell('A1').font = { size: 16, bold: true };
        summarySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        // Add export info
        summarySheet.getCell('A2').value = `Exported: ${exported_at}`;
        summarySheet.getCell('A2').font = { italic: true };

        // Add headers
        summarySheet.addRow([]);
        const headerRow = summarySheet.addRow([
          'Report Number',
          'Date',
          'Receiving Date',
          'Created By',
          'Status',
          'Total Items',
          'Notes'
        ]);

        // Style headers
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4CAF50' }
          };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Add data
        reports.forEach(report => {
          summarySheet.addRow([
            report.report_number,
            this.formatDateTime(report.created_at),
            report.confirmed_at ? this.formatDateTime(report.confirmed_at) : '-',
            report.user?.name || 'N/A',
            report.status.toUpperCase(),
            report.items?.length || 0,
            report.notes || '-'
          ]);
        });

        // Auto-fit columns
        summarySheet.columns.forEach((column, index) => {
          let maxLength = 10;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, cellValue.length);
          });
          column.width = Math.min(maxLength + 2, 50);
        });

        // Create Detailed Sheet
        const detailSheet = workbook.addWorksheet('Detailed');

        // Add title
        detailSheet.mergeCells('A1:G1');
        detailSheet.getCell('A1').value = 'Receiving Reports - Detailed View';
        detailSheet.getCell('A1').font = { size: 16, bold: true };
        detailSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        detailSheet.addRow([]);

        // Add detailed data for each report
        reports.forEach((report, index) => {
          if (index > 0) {
            detailSheet.addRow([]); // Add spacing between reports
          }

          // Report header
          const reportHeaderRow = detailSheet.addRow([
            `Report: ${report.report_number}`,
            '',
            `Status: ${report.status.toUpperCase()}`,
            '',
            `Created: ${this.formatDateTime(report.created_at)}`,
          ]);
          reportHeaderRow.font = { bold: true };
          reportHeaderRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE3F2FD' }
          };

          // Item headers
          const itemHeaderRow = detailSheet.addRow([
            'Product SKU',
            'Product Name',
            'Quantity',
            'Notes'
          ]);
          itemHeaderRow.font = { bold: true };
          itemHeaderRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFBBDEFB' }
            };
          });

          // Add items
          if (report.items && report.items.length > 0) {
            report.items.forEach(item => {
              detailSheet.addRow([
                item.product?.sku || 'N/A',
                item.product?.name || 'N/A',
                item.quantity,
                item.notes || '-'
              ]);
            });
          } else {
            detailSheet.addRow(['No items', '', '', '']);
          }
        });

        // Auto-fit columns for detail sheet
        detailSheet.columns.forEach((column) => {
          let maxLength = 10;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, cellValue.length);
          });
          column.width = Math.min(maxLength + 2, 50);
        });

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receiving-reports-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.showSnackbar('Reports exported successfully', 'success');
      } catch (error) {
        console.error('Error exporting reports:', error);
        this.showSnackbar('Error exporting reports', 'error');
      } finally {
        this.exporting = false;
      }
    },

    openCreateDialog() {
      this.dialogMode = 'create';
      this.selectedReport = null;
      this.dialog = true;
    },

    handleQuickProductSearch() {
      if (!this.productSearch || !this.productSearch.trim()) {
        // If empty, just open the dialog
        this.openCreateDialog();
        return;
      }

      const searchTerm = this.productSearch.trim().toLowerCase();

      // Search for product by barcode, SKU, or name
      const product = this.products.find(p =>
        (p.barcode && p.barcode.toLowerCase() === searchTerm) ||
        (p.sku && p.sku.toLowerCase() === searchTerm) ||
        (p.name && p.name.toLowerCase().includes(searchTerm))
      );

      if (product) {
        this.openCreateDialogWithProduct(product);
      } else {
        this.showSnackbar(`Product "${this.productSearch}" not found`, 'warning');
        // Still open dialog to allow manual entry
        this.openCreateDialog();
      }

      // Clear search field
      this.productSearch = '';
    },

    openCreateDialogWithProduct(product) {
      this.dialogMode = 'create';
      this.selectedReport = {
        preselectedProduct: product
      };
      this.dialog = true;
      this.showSnackbar(`Opening new report with ${product.name}`, 'info');
    },

    viewReport(report) {
      this.selectedReport = report;
      this.viewDialog = true;
    },

    editReport(report) {
      this.dialogMode = 'edit';
      this.selectedReport = report;
      this.dialog = true;
    },

    submitReport(report) {
      this.confirmAction = {
        title: 'Submit Receiving Report?',
        message: `Are you sure you want to submit report ${report.report_number} for confirmation?`,
        color: 'primary',
        action: async () => {
          await inventoryService.submitReceivingReport(report.id);
          this.showSnackbar('Report submitted successfully', 'success');
          this.loadReports();
          this.loadStatistics();
        },
        loading: false,
      };
      this.confirmDialog = true;
    },

    confirmReport(report) {
      this.confirmAction = {
        title: 'Confirm Receiving Report?',
        message: `Are you sure you want to confirm report ${report.report_number}? This will adjust the product stock quantities and cannot be undone.`,
        color: 'success',
        action: async () => {
          await inventoryService.confirmReceivingReport(report.id);
          this.showSnackbar('Report confirmed and stock adjusted successfully', 'success');
          this.loadReports();
          this.loadStatistics();
        },
        loading: false,
      };
      this.confirmDialog = true;
    },

    cancelReport(report) {
      this.confirmAction = {
        title: 'Cancel Receiving Report?',
        message: `Are you sure you want to cancel report ${report.report_number}?`,
        color: 'warning',
        action: async () => {
          await inventoryService.cancelReceivingReport(report.id);
          this.showSnackbar('Report cancelled successfully', 'success');
          this.loadReports();
          this.loadStatistics();
        },
        loading: false,
      };
      this.confirmDialog = true;
    },

    deleteReport(report) {
      this.confirmAction = {
        title: 'Delete Receiving Report?',
        message: `Are you sure you want to delete report ${report.report_number}? This action cannot be undone.`,
        color: 'error',
        action: async () => {
          await inventoryService.deleteReceivingReport(report.id);
          this.showSnackbar('Report deleted successfully', 'success');
          this.loadReports();
          this.loadStatistics();
        },
        loading: false,
      };
      this.confirmDialog = true;
    },

    async executeConfirmAction() {
      this.confirmAction.loading = true;
      try {
        await this.confirmAction.action();
        this.confirmDialog = false;
      } catch (error) {
        console.error('Error executing action:', error);
        this.showSnackbar(error.response?.data?.message || 'An error occurred', 'error');
      } finally {
        this.confirmAction.loading = false;
      }
    },

    handleReportSaved() {
      this.dialog = false;
      this.loadReports();
      this.loadStatistics();
      this.showSnackbar(
        this.dialogMode === 'create'
          ? 'Receiving report created successfully'
          : 'Receiving report updated successfully',
        'success'
      );
    },

    handleDialogClosed() {
      this.selectedReport = null;
    },

    handleViewDialogClosed() {
      this.selectedReport = null;
    },

    getStatusColor(status) {
      const colors = {
        draft: 'grey',
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'error',
      };
      return colors[status] || 'grey';
    },

    showSnackbar(message, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    formatCurrency,
    formatDateTime,
  },
};
</script>

<style scoped>
.v-data-table {
  background-color: transparent;
}

/* Statistics Cards Styling */
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-label {
  color: rgba(0, 0, 0, 0.7) !important;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.stat-value {
  color: #000000 !important;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}
</style>
