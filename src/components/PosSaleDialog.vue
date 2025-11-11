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

              <div v-if="hasProofOfPayment" class="mb-2">
                <div class="text-caption text-grey mb-2">Proof of Payment</div>
                <div class="proof-of-payment-gallery">
                  <v-img
                    v-for="(image, index) in proofOfPaymentImages"
                    :key="index"
                    :src="image"
                    :aspect-ratio="1"
                    cover
                    class="proof-image"
                    @click="openImageViewer(index)"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                    <template v-slot:error>
                      <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                        <v-icon size="32" color="grey">mdi-image-off</v-icon>
                      </div>
                    </template>
                  </v-img>
                </div>
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
                <!-- Only admins can see profit data -->
                <div v-if="isAdmin && sale.profit !== undefined" class="d-flex justify-space-between mt-2 pt-2" style="border-top: 1px dashed rgba(0,0,0,0.2)">
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

    <!-- Image Viewer Dialog -->
    <v-dialog v-model="imageViewerDialog" max-width="900">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Proof of Payment {{ imageViewerIndex + 1 }} of {{ proofOfPaymentImages.length }}</span>
          <v-btn icon="mdi-close" variant="text" @click="imageViewerDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img
            :src="proofOfPaymentImages[imageViewerIndex]"
            contain
            max-height="70vh"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn
            :disabled="imageViewerIndex === 0"
            @click="imageViewerIndex--"
            icon
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="downloadImage(imageViewerIndex)"
          >
            <v-icon start>mdi-download</v-icon>
            Download
          </v-btn>
          <v-btn
            :disabled="imageViewerIndex === proofOfPaymentImages.length - 1"
            @click="imageViewerIndex++"
            icon
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue'
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
    const imageViewerDialog = ref(false)
    const imageViewerIndex = ref(0)

    // Check if user is admin
    const isAdmin = computed(() => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          return user?.role === 'admin'
        }
      } catch (error) {
        console.error('Failed to get user info:', error)
      }
      return false
    })

    const statusOptions = [
      { title: 'Completed', value: 'completed' },
      { title: 'Pending', value: 'pending' },
      { title: 'Cancelled', value: 'cancelled' },
      { title: 'Refunded', value: 'refunded' }
    ]

    // Parse proof of payment images
    const proofOfPaymentImages = computed(() => {
      if (!props.sale) {
        return []
      }

      // Use proof_of_payment_urls if available (new file-based approach)
      if (props.sale.proof_of_payment_urls && Array.isArray(props.sale.proof_of_payment_urls)) {
        return props.sale.proof_of_payment_urls
      }

      // Fallback to old base64 approach for backward compatibility
      if (!props.sale.proof_of_payment) {
        return []
      }

      try {
        // If it's already an array, return it
        if (Array.isArray(props.sale.proof_of_payment)) {
          return props.sale.proof_of_payment
        }

        // Try to parse as JSON
        const parsed = JSON.parse(props.sale.proof_of_payment)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        // If parsing fails, try to use it as a single image
        if (typeof props.sale.proof_of_payment === 'string' &&
            props.sale.proof_of_payment.startsWith('data:image')) {
          return [props.sale.proof_of_payment]
        }
        return []
      }
    })

    const hasProofOfPayment = computed(() => {
      return proofOfPaymentImages.value.length > 0
    })

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
      // Close the dialog after print dialog is opened
      // Small delay to ensure print dialog is shown first
      setTimeout(() => {
        emit('update:isOpen', false)
      }, 100)
    }

    const openImageViewer = (index) => {
      imageViewerIndex.value = index
      imageViewerDialog.value = true
    }

    const downloadImage = (index) => {
      const image = proofOfPaymentImages.value[index]
      if (!image) return

      // Create a temporary link element
      const link = document.createElement('a')
      link.href = image
      link.download = `proof-of-payment-${props.sale.sale_number}-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return {
      newStatus,
      updating,
      statusOptions,
      isAdmin,
      imageViewerDialog,
      imageViewerIndex,
      proofOfPaymentImages,
      hasProofOfPayment,
      getSaleStatusColor,
      getSaleStatusText,
      getSaleStatusIcon,
      getProductImageUrl,
      updateStatus,
      viewBooking,
      printReceipt,
      openImageViewer,
      downloadImage,
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

.proof-of-payment-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  max-width: 100%;
}

.proof-image {
  cursor: pointer;
  border-radius: 4px;
  border: 2px solid #e0e0e0;
  transition: all 0.2s ease;
  max-height: 120px;
}

.proof-image:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media print {
  .v-card-actions {
    display: none !important;
  }
}
</style>
