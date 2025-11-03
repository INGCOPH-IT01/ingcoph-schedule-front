<template>
  <v-dialog :model-value="isOpen" @update:model-value="$emit('update:isOpen', $event)" max-width="800">
    <v-card v-if="sale">
      <v-card-title class="d-flex align-center justify-space-between bg-primary">
        <span class="text-white">
          <v-icon class="mr-2" color="white">mdi-receipt-text</v-icon>
          Sale Details - {{ sale.sale_number }}
        </span>
        <v-btn icon="mdi-close" variant="text" color="white" @click="$emit('update:isOpen', false)"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Sale Info -->
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-4">
              <div class="text-caption text-grey">Sale Number</div>
              <div class="text-h6">{{ sale.sale_number }}</div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-grey">Date</div>
              <div>{{ formatDate(sale.sale_date) }}</div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-grey">Status</div>
              <v-chip
                :color="getSaleStatusColor(sale.status)"
                variant="tonal"
                size="small"
              >
                <v-icon start size="small">{{ getSaleStatusIcon(sale.status) }}</v-icon>
                {{ getSaleStatusText(sale.status) }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="mb-4">
              <div class="text-caption text-grey">Processed By</div>
              <div>{{ sale.user?.name || 'N/A' }}</div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-grey">Customer</div>
              <div>{{ sale.customer?.name || sale.customer_name || 'Walk-in' }}</div>
            </div>

            <div v-if="sale.booking" class="mb-4">
              <div class="text-caption text-grey">Related Booking</div>
              <v-chip
                size="small"
                variant="outlined"
                @click="viewBooking"
              >
                <v-icon start size="small">mdi-calendar</v-icon>
                Booking #{{ sale.booking_id }}
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Sale Items -->
        <h3 class="mb-3">Items</h3>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>Product</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sale.sale_items" :key="item.id">
              <td>
                <div class="d-flex align-center">
                  <v-avatar v-if="item.product?.image_url || item.product?.image" size="32" class="mr-2" rounded>
                    <v-img :src="item.product.image_url || getProductImageUrl(item.product.image)">
                      <template v-slot:error>
                        <v-icon size="small">mdi-package-variant</v-icon>
                      </template>
                    </v-img>
                  </v-avatar>
                  <span>{{ item.product?.name || 'N/A' }}</span>
                </div>
              </td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-right">{{ formatPrice(item.unit_price) }}</td>
              <td class="text-right">{{ formatPrice(item.discount) }}</td>
              <td class="text-right font-weight-bold">{{ formatPrice(item.subtotal) }}</td>
            </tr>
          </tbody>
        </v-table>

        <v-divider class="my-4"></v-divider>

        <!-- Totals -->
        <div class="totals-section">
          <v-row>
            <v-col cols="12" md="6">
              <div v-if="sale.payment_method" class="mb-2">
                <div class="text-caption text-grey">Payment Method</div>
                <v-chip size="small" variant="tonal">
                  {{ sale.payment_method }}
                </v-chip>
              </div>

              <div v-if="sale.payment_reference" class="mb-2">
                <div class="text-caption text-grey">Payment Reference</div>
                <div>{{ sale.payment_reference }}</div>
              </div>

              <div v-if="sale.notes" class="mb-2">
                <div class="text-caption text-grey">Notes</div>
                <div>{{ sale.notes }}</div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="totals-box pa-4 bg-grey-lighten-4 rounded">
                <div class="d-flex justify-space-between mb-2">
                  <span>Subtotal:</span>
                  <span class="font-weight-medium">{{ formatPrice(sale.subtotal) }}</span>
                </div>
                <div v-if="sale.discount > 0" class="d-flex justify-space-between mb-2">
                  <span>Discount:</span>
                  <span class="text-error">-{{ formatPrice(sale.discount) }}</span>
                </div>
                <div v-if="sale.tax > 0" class="d-flex justify-space-between mb-2">
                  <span>Tax:</span>
                  <span>{{ formatPrice(sale.tax) }}</span>
                </div>
                <v-divider class="my-2"></v-divider>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-h6">Total:</span>
                  <span class="text-h5 text-primary font-weight-bold">
                    {{ formatPrice(sale.total_amount) }}
                  </span>
                </div>
                <div v-if="sale.profit !== undefined" class="d-flex justify-space-between mt-2 pt-2" style="border-top: 1px dashed rgba(0,0,0,0.2)">
                  <span class="text-caption">Estimated Profit:</span>
                  <span class="text-caption font-weight-bold text-success">
                    {{ formatPrice(sale.profit) }}
                  </span>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Status Change (Admin Only) -->
        <div v-if="showAdminActions && sale.status !== 'completed'" class="mt-4">
          <v-divider class="mb-4"></v-divider>
          <h4 class="mb-3">Admin Actions</h4>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="newStatus"
                :items="statusOptions"
                label="Change Status"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn
                color="primary"
                @click="updateStatus"
                :loading="updating"
                :disabled="!newStatus || newStatus === sale.status"
                block
              >
                Update Status
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="$emit('update:isOpen', false)"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-printer"
          @click="printReceipt"
        >
          Print Receipt
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { productService } from '../services/productService'
import { posService } from '../services/posService'
import { formatPrice, formatDate } from '../utils/formatters'

export default {
  name: 'PosSaleDialog',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    sale: {
      type: Object,
      default: null
    },
    showAdminActions: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:isOpen', 'updated'],
  setup(props, { emit }) {
    const newStatus = ref(null)
    const updating = ref(false)

    const statusOptions = [
      { title: 'Completed', value: 'completed' },
      { title: 'Pending', value: 'pending' },
      { title: 'Cancelled', value: 'cancelled' },
      { title: 'Refunded', value: 'refunded' }
    ]

    watch(() => props.sale, (newSale) => {
      if (newSale) {
        newStatus.value = newSale.status
      }
    }, { immediate: true })

    const getSaleStatusColor = (status) => {
      return posService.getSaleStatusColor(status)
    }

    const getSaleStatusText = (status) => {
      return posService.getSaleStatusText(status)
    }

    const getSaleStatusIcon = (status) => {
      return posService.getSaleStatusIcon(status)
    }

    const getProductImageUrl = (imagePath) => {
      return productService.getProductImageUrl(imagePath)
    }

    const updateStatus = async () => {
      try {
        updating.value = true
        await posService.updateSaleStatus(props.sale.id, newStatus.value)
        emit('updated')
        emit('update:isOpen', false)
      } catch (error) {
        console.error('Failed to update status:', error)
        alert('Failed to update sale status')
      } finally {
        updating.value = false
      }
    }

    const viewBooking = () => {
      // Emit event to parent to handle booking view
      emit('view-booking', props.sale.booking_id)
    }

    const printReceipt = () => {
      // Simple print implementation
      window.print()
    }

    return {
      newStatus,
      updating,
      statusOptions,
      getSaleStatusColor,
      getSaleStatusText,
      getSaleStatusIcon,
      getProductImageUrl,
      updateStatus,
      viewBooking,
      printReceipt,
      formatPrice,
      formatDate
    }
  }
}
</script>

<style scoped>
.totals-section {
  margin-top: 16px;
}

.totals-box {
  border: 2px solid rgb(var(--v-theme-primary));
}

@media print {
  .v-card-actions {
    display: none !important;
  }
}
</style>
