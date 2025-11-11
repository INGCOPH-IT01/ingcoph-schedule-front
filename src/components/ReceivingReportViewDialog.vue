<template>
  <v-dialog v-model="show" max-width="1000px" scrollable>
    <v-card>
      <v-card-title class="text-h5">
        Receiving Report Details
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" size="small" @click="close"></v-btn>
      </v-card-title>

      <v-card-text v-if="reportData">
        <v-row>
          <v-col cols="12" md="6">
            <v-list density="compact">
              <v-list-item>
                <v-list-item-subtitle>Report Number</v-list-item-subtitle>
                <v-list-item-title>
                  <v-chip color="primary">{{ reportData.report_number }}</v-chip>
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle>Status</v-list-item-subtitle>
                <v-list-item-title>
                  <v-chip :color="getStatusColor(reportData.status)" dark>
                    {{ reportData.status.toUpperCase() }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle>Created By</v-list-item-subtitle>
                <v-list-item-title>{{ reportData.user?.name || 'N/A' }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle>Created At</v-list-item-subtitle>
                <v-list-item-title>{{ formatDateTime(reportData.created_at) }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <v-list density="compact">
              <v-list-item v-if="reportData.confirmed_by">
                <v-list-item-subtitle>Confirmed By</v-list-item-subtitle>
                <v-list-item-title>{{ reportData.confirmed_by?.name || 'N/A' }}</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="reportData.confirmed_at">
                <v-list-item-subtitle>Confirmed At</v-list-item-subtitle>
                <v-list-item-title>{{ formatDateTime(reportData.confirmed_at) }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-subtitle>Total Items</v-list-item-subtitle>
                <v-list-item-title>{{ reportData.total_items }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <v-row v-if="reportData.notes">
          <v-col cols="12">
            <v-alert type="info" text>
              <strong>Notes:</strong> {{ reportData.notes }}
            </v-alert>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card outlined>
              <v-card-title class="subtitle-1">Items</v-card-title>
              <v-card-text>
                <v-table>
                    <thead>
                      <tr>
                        <th>Product SKU</th>
                        <th>Product Name</th>
                        <th class="text-right">Quantity</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in reportData.items" :key="item.id">
                        <td>{{ item.product?.sku || 'N/A' }}</td>
                        <td>{{ item.product?.name || 'N/A' }}</td>
                        <td class="text-right">{{ item.quantity }}</td>
                        <td>{{ item.notes || '-' }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="text-right"><strong>{{ totalQuantity }}</strong></td>
                        <td></td>
                      </tr>
                    </tfoot>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-text v-else>
        <v-progress-linear indeterminate></v-progress-linear>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import inventoryService from '@/services/inventoryService';
import { formatDateTime } from '@/utils/formatters';

export default {
  name: 'ReceivingReportViewDialog',
  props: {
    modelValue: Boolean,
    report: Object,
  },
  data() {
    return {
      reportData: null,
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    totalQuantity() {
      if (!this.reportData?.items) return 0;
      return this.reportData.items.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    },
  },
  watch: {
    show(val) {
      if (val && this.report) {
        this.loadReportDetails();
      }
    },
  },
  methods: {
    async loadReportDetails() {
      try {
        const response = await inventoryService.getReceivingReport(this.report.id);
        this.reportData = response.data;
      } catch (error) {
        console.error('Error loading report details:', error);
      }
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

    close() {
      this.show = false;
      this.$emit('closed');
      this.reportData = null;
    },

    formatDateTime,
  },
};
</script>
