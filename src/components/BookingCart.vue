<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="1200px"
    scrollable
    class="responsive-dialog"
    :fullscreen="$vuetify.display.mobile"
    transition="dialog-bottom-transition"
  >
    <v-card class="cart-dialog">
      <v-card-title class="d-flex align-center justify-space-between pa-4 bg-primary">
        <div class="d-flex align-center">
          <v-icon class="mr-2" color="white">mdi-cart</v-icon>
          <span class="text-h5 text-white">Booking Cart</span>
        </div>
        <v-btn icon variant="text" @click="$emit('close')">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-grey">Loading your cart...</p>
        </div>

        <!-- Empty Cart -->
        <v-alert v-else-if="cartItems.length === 0" type="info" class="mb-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-cart-off</v-icon>
            <div>
              <div class="font-weight-bold">Your cart is empty</div>
              <div class="text-caption">Add some bookings to get started!</div>
            </div>
          </div>
        </v-alert>

        <!-- Cart Items -->
        <div v-else>
          <!-- Expiration Timer Warning -->
          <v-alert
            v-if="timeRemaining && cartTransaction"
            :type="expirationWarning ? 'warning' : 'info'"
            variant="tonal"
            class="mb-3"
            density="compact"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-2">{{ expirationWarning ? 'mdi-clock-alert' : 'mdi-clock-outline' }}</v-icon>
              <div>
                <strong>{{ expirationWarning ? 'Hurry up!' : 'Time remaining:' }}</strong>
                {{ timeRemaining }}
                <span class="text-caption ml-2">
                  (Items will be released after 1 hour without payment)
                </span>
              </div>
            </div>
          </v-alert>

          <!-- Select All / Deselect All -->
          <div class="mb-3 d-flex align-center justify-space-between">
            <div>
              <v-checkbox
                v-model="selectAll"
                @change="toggleSelectAll"
                label="Select All"
                hide-details
                density="compact"
                color="primary"
              ></v-checkbox>
            </div>
            <div class="text-caption text-grey">
              {{ selectedGroups.length }} of {{ groupedCartItems.length }} selected
            </div>
          </div>

          <!-- Cart Items (Grouped) -->
          <v-card
            v-for="group in groupedCartItems"
            :key="group.id"
            class="mb-3 cart-item"
            :class="{ 'selected-item': selectedGroups.includes(group.id) }"
            variant="outlined"
          >
            <v-card-text class="pa-3">
              <div class="d-flex justify-space-between align-start">
                <!-- Selection Checkbox -->
                <div class="mr-3">
                  <v-checkbox
                    v-model="selectedGroups"
                    :value="group.id"
                    hide-details
                    density="compact"
                    color="primary"
                  ></v-checkbox>
                </div>

                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-2">
                    <v-icon v-if="group.sport" class="mr-2" :color="sportService.getSportColor(group.sport.name)">
                      {{ sportService.getSportIcon(group.sport.name, group.sport.icon) }}
                    </v-icon>
                    <h4 v-if="group.sport" class="text-subtitle-1 font-weight-bold">{{ group.sport.name }}</h4>
                    <v-chip
                      v-if="group.slots && group.slots.length > 1"
                      size="x-small"
                      color="primary"
                      class="ml-2"
                    >
                      {{ group.slots.length }} slots
                    </v-chip>
                  </div>

                  <div v-if="group.court" class="text-body-2 mb-1">
                    <v-icon size="small" class="mr-1">mdi-stadium</v-icon>
                    <strong>Court:</strong> {{ group.court.name }}
                    <span v-if="group.court.surface_type" class="text-caption text-grey ml-1">
                      ({{ group.court.surface_type }})
                    </span>
                  </div>

                  <div v-if="group.date" class="text-body-2 mb-1">
                    <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                    <strong>Date:</strong> {{ formatDate(group.date) }}
                  </div>

                  <div v-if="group.startTime && group.endTime" class="text-body-2 mb-1">
                    <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
                    <strong>Time:</strong> {{ group.startTime }} - {{ group.endTime }}
                    <span v-if="group.slots && group.slots.length > 1" class="text-caption text-grey ml-1">
                      ({{ calculateDuration(group.startTime, group.endTime) }})
                    </span>
                  </div>

                  <div class="text-body-2 mb-1">
                    <v-icon size="small" class="mr-1">mdi-cash</v-icon>
                    <strong>Price:</strong> ₱{{ calculateGroupPrice(group) }}
                  </div>

                  <v-chip
                    v-if="group.paymentMethod === 'gcash'"
                    size="small"
                    color="success"
                    class="mt-2"
                  >
                    <v-icon start size="small">mdi-cellphone</v-icon>
                    GCash Payment
                  </v-chip>
                </div>

                <div class="d-flex gap-2">
                  <v-btn
                    v-if="!cartTransaction || cartTransaction.payment_status !== 'paid'"
                    icon
                    size="small"
                    color="error"
                    variant="text"
                    @click="removeGroup(group)"
                    title="Remove"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-chip
                    v-if="cartTransaction && cartTransaction.payment_status === 'paid'"
                    color="success"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon start size="small">mdi-lock</v-icon>
                    Paid - Cannot Edit
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Cart Summary -->
          <v-card variant="tonal" color="primary" class="mt-4">
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-1">Selected Bookings:</span>
                <span class="text-h6 font-weight-bold">{{ selectedGroups.length }} / {{ groupedCartItems.length }}</span>
              </div>
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-1">Selected Time Slots:</span>
                <span class="text-h6 font-weight-bold">{{ selectedSlotsCount }}</span>
              </div>
              <v-divider class="my-2"></v-divider>
              <div class="d-flex justify-space-between align-center">
                <span class="text-h6">Total Price:</span>
                <span class="text-h5 font-weight-bold text-success">₱{{ selectedTotalPrice }}</span>
              </div>
              <div v-if="selectedGroups.length < groupedCartItems.length" class="text-caption text-grey mt-2">
                Cart Total: ₱{{ totalPrice }}
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn
          v-if="cartItems.length > 0 && (!cartTransaction || cartTransaction.payment_status !== 'paid')"
          color="error"
          variant="outlined"
          @click="clearCart"
        >
          <v-icon start>mdi-delete-sweep</v-icon>
          Clear Cart
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="$emit('close')"
        >
          Close
        </v-btn>
        <v-btn
          v-if="cartItems.length > 0"
          color="success"
          @click="openPaymentDialog"
          :disabled="selectedGroups.length === 0"
        >
          <v-icon start>mdi-cash-multiple</v-icon>
          Proceed to Payment ({{ selectedGroups.length }})
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- GCash Payment Dialog -->
    <v-dialog
      v-model="paymentDialog"
      max-width="600px"
      persistent
      :fullscreen="$vuetify.display.mobile"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="text-h5 bg-success text-white pa-4">
          <v-icon class="mr-2" color="white">mdi-cellphone-check</v-icon>
          GCash Payment Required
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Payment Summary -->
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-h6 mb-2">Total Amount to Pay</div>
            <div class="text-h4 font-weight-bold text-success">₱{{ totalPrice }}</div>
            <div class="text-caption mt-2">{{ groupedCartItems.length }} booking(s) • {{ cartItems.length }} time slot(s)</div>
          </v-alert>

          <!-- GCash Instructions -->
          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <h3 class="text-h6 mb-3">
                <v-icon class="mr-2" color="success">mdi-information</v-icon>
                Payment Instructions
              </h3>
              <ol class="payment-instructions">
                <li>Send <strong>₱{{ totalPrice }}</strong> to our GCash number</li>
                <li>Take a screenshot of your payment receipt</li>
                <li>Upload the screenshot below</li>
                <li>Click "Complete Payment" to finish</li>
              </ol>
            </v-card-text>
          </v-card>

          <!-- GCash Details with QR Code -->
          <v-card variant="tonal" color="success" class="mb-4">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="7">
                  <div class="d-flex align-center mb-3">
                    <v-avatar size="48" color="white" class="mr-3">
                      <v-icon size="32" color="success">mdi-cellphone</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-caption text-grey-darken-1">Scan QR code to pay</div>
                    </div>
                  </div>
                  <v-alert type="info" density="compact" class="mt-2">
                    <div class="text-caption">
                      <strong>Scan QR code</strong> to complete your payment
                    </div>
                  </v-alert>
                </v-col>
                <v-col cols="12" md="5" class="d-flex justify-center align-center">
                  <div class="gcash-qr-container">
                    <div class="qr-label text-center mb-2">
                      <v-icon size="20" color="success">mdi-qrcode-scan</v-icon>
                      <span class="text-caption ml-1">Scan to Pay</span>
                    </div>
                    <!-- Custom QR Code Image or Generated Canvas -->
                    <v-img
                      v-if="paymentSettings.payment_qr_code_url"
                      :src="paymentSettings.payment_qr_code_url"
                      class="gcash-qr-code"
                      width="200"
                      height="200"
                    ></v-img>
                    <canvas v-else ref="gcashQrCanvas" class="gcash-qr-code"></canvas>
                    <div class="text-caption text-center mt-2 text-grey-darken-1">
                      GCash QR Code
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Proof of Payment Upload -->
          <v-file-input
            v-model="proofOfPayment"
            label="Upload Proof of Payment *"
            placeholder="Select image file"
            variant="outlined"
            prepend-icon="mdi-camera"
            accept="image/*"
            :rules="[v => !!v || 'Proof of payment is required']"
            show-size
            class="mb-2"
          >
            <template v-slot:selection="{ fileNames }">
              <v-chip
                v-for="fileName in fileNames"
                :key="fileName"
                color="success"
                size="small"
                class="me-2"
              >
                {{ fileName }}
              </v-chip>
            </template>
          </v-file-input>

          <!-- Image Preview -->
          <v-card v-if="proofPreview" variant="outlined" class="mb-4">
            <v-card-text class="pa-2">
              <div class="text-caption mb-2">Preview:</div>
              <v-img
                :src="proofPreview"
                max-height="300"
                contain
                class="rounded"
              ></v-img>
            </v-card-text>
          </v-card>

          <v-alert type="warning" density="compact" class="mb-0">
            <div class="text-caption">
              <strong>Note:</strong> Your booking will be confirmed after admin verifies your payment.
            </div>
            <div class="text-caption mt-2">
              <v-icon size="small" class="mr-1">mdi-clock-alert</v-icon>
              <strong>Please be aware:</strong> There may be a carry over delay in the confirmation of your booking during weekends and holidays.
            </div>
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn
            variant="text"
            @click="closePaymentDialog"
            :disabled="checkingOut"
          >
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            :loading="checkingOut"
            :disabled="!proofOfPayment"
            @click="completePayment"
          >
            <v-icon start>mdi-check-circle</v-icon>
            Complete Payment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { bookingService } from '../services/bookingService'
import { courtService } from '../services/courtService'
import { cartService } from '../services/cartService'
import { sportService } from '../services/sportService'
import { paymentSettingService } from '../services/paymentSettingService'
import Swal from 'sweetalert2'
import QRCode from 'qrcode'

export default {
  name: 'BookingCart',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'checkout-complete'],
  setup(props, { emit }) {
    const cartItems = ref([])
    const cartTransaction = ref(null)
    const loading = ref(false)
    const checkingOut = ref(false)
    const paymentDialog = ref(false)
    const proofOfPayment = ref(null)
    const proofPreview = ref(null)
    const gcashQrCanvas = ref(null)
    const timeRemaining = ref('')
    const expirationWarning = ref(false)

    // Payment settings
    const paymentSettings = ref({
      payment_gcash_number: '0917-123-4567',
      payment_gcash_name: 'Company Name',
      payment_instructions: 'Please send payment to our GCash number and upload proof of payment.'
    })

    // Selection state
    const selectedGroups = ref([])
    const selectAll = ref(false)

    // Edit dialog state
    const updating = ref(false)
    const courts = ref([])

    const loadCart = async () => {
      loading.value = true
      try {
        const previousItemCount = cartItems.value.length
        const response = await cartService.getCartTransaction()
        const items = response.cart_items || []
        cartTransaction.value = response.cart_transaction

        // Check if items were expired (cart had items before but now has fewer or none)
        if (previousItemCount > 0 && items.length < previousItemCount) {
          const expiredCount = previousItemCount - items.length
          showAlert({
            icon: 'warning',
            title: 'Cart Items Expired',
            html: `<p>${expiredCount} item${expiredCount > 1 ? 's have' : ' has'} been removed from your cart.</p>
                   <p class="text-caption mt-2">Items are automatically removed after 1 hour without payment to free up availability for other users.</p>`,
            confirmButtonText: 'OK',
            confirmButtonColor: '#1976d2'
          })
        }

        // All items should now be in the pending cart transaction
        cartItems.value = items

        // Start expiration timer if we have a transaction
        if (cartTransaction.value) {
          updateExpirationTimer()
        }

      } catch (error) {
        console.error('❌ Failed to load cart:', error)
        console.error('Error details:', error.response?.data || error.message)
        cartItems.value = []
        cartTransaction.value = null
      } finally {
        loading.value = false
      }
    }

    // Update expiration timer
    const updateExpirationTimer = () => {
      if (!cartTransaction.value || !cartTransaction.value.created_at) {
        timeRemaining.value = ''
        expirationWarning.value = false
        return
      }

      const createdAt = new Date(cartTransaction.value.created_at)
      const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000) // 1 hour later
      const now = new Date()
      const diff = expiresAt - now

      if (diff <= 0) {
        timeRemaining.value = 'Expired'
        expirationWarning.value = true
        // Reload cart to remove expired items
        loadCart()
        return
      }

      const minutes = Math.floor(diff / 1000 / 60)
      const seconds = Math.floor((diff / 1000) % 60)
      timeRemaining.value = `${minutes}m ${seconds}s`
      expirationWarning.value = minutes < 10 // Show warning if less than 10 minutes remaining

      // Update every second
      setTimeout(updateExpirationTimer, 1000)
    }

    // Group consecutive time slots for the same court and date
    const groupedCartItems = computed(() => {
      if (!cartItems.value || cartItems.value.length === 0) {
        return []
      }

      const groups = []
      const itemsCopy = [...cartItems.value]

      // Sort by court, date, and start time
      itemsCopy.sort((a, b) => {
        if (!a.court || !b.court) return 0
        if (a.court.id !== b.court.id) return a.court.id - b.court.id
        const dateA = a.booking_date || a.date
        const dateB = b.booking_date || b.date
        if (dateA !== dateB) return dateA.localeCompare(dateB)
        return a.start_time.localeCompare(b.start_time)
      })

      let currentGroup = null
      let groupIdCounter = 0

      itemsCopy.forEach((item, index) => {
        if (!item || !item.court) {
          return // Skip invalid items
        }

        const itemDate = item.booking_date || item.date
        const itemStartTime = item.start_time
        const itemEndTime = item.end_time

        if (!currentGroup) {
          // Start a new group
          currentGroup = {
            id: `group-${groupIdCounter++}-${item.court.id}-${itemDate}-${itemStartTime}`,
            sport: item.sport || item.court.sport,
            court: item.court,
            date: itemDate,
            originalItems: [item],
            startTime: itemStartTime,
            endTime: itemEndTime
          }
        } else {
          // Check if this item is consecutive to the current group
          const isSameCourt = item.court.id === currentGroup.court.id
          const isSameDate = itemDate === currentGroup.date
          const isConsecutive = itemStartTime === currentGroup.endTime

          if (isSameCourt && isSameDate && isConsecutive) {
            // Add to current group
            currentGroup.originalItems.push(item)
            currentGroup.endTime = itemEndTime
          } else {
            // Save current group and start a new one
            groups.push(currentGroup)
            currentGroup = {
              id: `group-${groupIdCounter++}-${item.court.id}-${itemDate}-${itemStartTime}`,
              sport: item.sport || item.court.sport,
              court: item.court,
              date: itemDate,
              originalItems: [item],
              startTime: itemStartTime,
              endTime: itemEndTime
            }
          }
        }

        // Add the last group
        if (index === itemsCopy.length - 1 && currentGroup) {
          groups.push(currentGroup)
        }
      })

      return groups
    })

    const totalPrice = computed(() => {
      return cartItems.value.reduce((sum, item) => {
        const price = item.price || 0
        return sum + parseFloat(price)
      }, 0).toFixed(2)
    })

    // Computed properties for selected items
    const selectedTotalPrice = computed(() => {
      const selectedItems = groupedCartItems.value.filter(group =>
        selectedGroups.value.includes(group.id)
      )
      return selectedItems.reduce((sum, group) => {
        return sum + parseFloat(calculateGroupPrice(group))
      }, 0).toFixed(2)
    })

    const selectedSlotsCount = computed(() => {
      const selectedItems = groupedCartItems.value.filter(group =>
        selectedGroups.value.includes(group.id)
      )
      return selectedItems.reduce((sum, group) => {
        return sum + (group.originalItems?.length || 0)
      }, 0)
    })

    // Toggle select all
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedGroups.value = groupedCartItems.value.map(group => group.id)
      } else {
        selectedGroups.value = []
      }
    }

    // Watch for changes in selectedGroups to update selectAll
    watch(selectedGroups, (newVal) => {
      selectAll.value = newVal.length === groupedCartItems.value.length && newVal.length > 0
    })

    // Auto-select all items when cart loads
    watch(groupedCartItems, (newVal) => {
      if (newVal.length > 0 && selectedGroups.value.length === 0) {
        selectedGroups.value = newVal.map(group => group.id)
        selectAll.value = true
      }
    })

    const calculateGroupPrice = (group) => {
      if (!group || !group.originalItems || !Array.isArray(group.originalItems)) {
        return '0.00'
      }
      return group.originalItems.reduce((sum, item) => {
        const price = item.price || 0
        return sum + parseFloat(price)
      }, 0).toFixed(2)
    }

    const calculateDuration = (startTime, endTime) => {
      if (!startTime || !endTime) {
        return '0 hours'
      }
      try {
        const start = startTime.split(':')
        const end = endTime.split(':')
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1] || 0)
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1] || 0)
        const durationMinutes = endMinutes - startMinutes
        const hours = Math.floor(durationMinutes / 60)
        const minutes = durationMinutes % 60

        if (minutes === 0) {
          return `${hours} hour${hours !== 1 ? 's' : ''}`
        }
        return `${hours}h ${minutes}m`
      } catch (error) {
        console.error('Error calculating duration:', error)
        return '0 hours'
      }
    }

    // SweetAlert wrapper with high z-index for dialogs
    const showAlert = (options) => {
      return Swal.fire({
        ...options,
        customClass: {
          container: 'swal2-container-high-z'
        },
        didOpen: () => {
          const container = document.querySelector('.swal2-container')
          if (container) {
            container.style.zIndex = '99999'
          }
          const popup = document.querySelector('.swal2-popup')
          if (popup) {
            popup.style.zIndex = '99999'
          }
        }
      })
    }

    const removeGroup = async (group) => {
      const itemCount = group.originalItems.length
      const result = await showAlert({
        title: 'Remove Booking?',
        text: `Are you sure you want to remove ${itemCount > 1 ? `these ${itemCount}` : 'this'} item(s) from your cart?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, remove it!'
      })

      if (result.isConfirmed) {
        try {
          // Remove all original items that belong to this group
          for (const originalItem of group.originalItems) {
            await cartService.removeFromCart(originalItem.id)
          }

          // Reload cart
          await loadCart()
          window.dispatchEvent(new CustomEvent('cart-updated'))
          showAlert('Removed!', 'The booking has been removed from your cart.', 'success')
        } catch (error) {
          console.error('Failed to remove items:', error)
          showAlert('Error', 'Failed to remove items from cart', 'error')
        }
      }
    }

    const clearCart = async () => {
      const result = await showAlert({
        title: 'Clear Cart?',
        text: 'Are you sure you want to remove all items from your cart?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, clear it!'
      })

      if (result.isConfirmed) {
        try {
          await cartService.clearCart()
          cartItems.value = []
          window.dispatchEvent(new CustomEvent('cart-updated'))
          showAlert('Cleared!', 'Your cart has been cleared.', 'success')
        } catch (error) {
          console.error('Failed to clear cart:', error)
          showAlert('Error', 'Failed to clear cart', 'error')
        }
      }
    }

    /**
     * Generate or load GCash QR code
     * This function retrieves all payment details from the Payment Settings module
     * and either displays the uploaded custom QR code or generates a dynamic one
     */
    const generateGCashQR = async () => {
      try {
        // Step 1: Load all payment settings from Payment Details module
        const settings = await paymentSettingService.getPaymentSettings()
        paymentSettings.value = settings

        console.log('Payment settings loaded:', settings)

        // Step 2: Check if custom QR code exists
        if (settings.payment_qr_code_url) {
          // Custom QR code uploaded by admin - use it
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          paymentSettings.value.payment_qr_code_url = `${apiUrl}${settings.payment_qr_code_url}`

          console.log('Using custom uploaded QR code:', paymentSettings.value.payment_qr_code_url)

          // No need to generate canvas, v-img will display the uploaded QR
          return
        }

        // Step 3: No custom QR code - generate dynamic QR using payment settings
        await nextTick()

        if (gcashQrCanvas.value) {
          // Use all details from Payment Settings module
          const gcashNumber = settings.payment_gcash_number.replace(/-/g, '')
          const accountName = settings.payment_gcash_name.replace(/\s+/g, '')
          const amount = totalPrice.value

          console.log('Generating dynamic QR code with:', {
            number: gcashNumber,
            name: accountName,
            amount: amount
          })

          // Generate QR code with GCash payment link format
          const qrData = `gcash://pay?number=${gcashNumber}&amount=${amount}&name=${accountName}`

          await QRCode.toCanvas(gcashQrCanvas.value, qrData, {
            width: 200,
            margin: 2,
            color: {
              dark: '#2e7d32',  // Green color for GCash
              light: '#ffffff'
            }
          })

          console.log('Dynamic QR code generated successfully')
        }
      } catch (error) {
        console.error('Failed to load payment settings or generate QR code:', error)
        // Keep default values if loading fails
      }
    }

    const openPaymentDialog = async () => {
      if (!groupedCartItems.value || groupedCartItems.value.length === 0) {
        showAlert({
          icon: 'warning',
          title: 'Empty Cart',
          text: 'Your cart is empty. Please add some bookings first.'
        })
        return
      }
      paymentDialog.value = true
      // Generate QR code after dialog opens with longer delay
      await nextTick()
      setTimeout(() => {
        generateGCashQR()
      }, 150)
    }

    const closePaymentDialog = () => {
      paymentDialog.value = false
      proofOfPayment.value = null
      proofPreview.value = null
    }

    // Edit functions
    const fetchCourts = async () => {
      try {
        const data = await courtService.getCourts()
        courts.value = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error fetching courts:', error)
        courts.value = []
      }
    }


    const completePayment = async () => {
      if (!proofOfPayment.value) {
        showAlert({
          icon: 'warning',
          title: 'Incomplete Payment',
          text: 'Please upload proof of payment to complete your booking.'
        })
        return
      }

      if (selectedGroups.value.length === 0) {
        showAlert({
          icon: 'warning',
          title: 'No Items Selected',
          text: 'Please select at least one booking to proceed with payment.'
        })
        return
      }

      checkingOut.value = true
      try {
        // Get only selected cart items
        const selectedItems = groupedCartItems.value
          .filter(group => selectedGroups.value.includes(group.id))
          .flatMap(group => group.originalItems)

        // Convert proof of payment to base64
        const file = Array.isArray(proofOfPayment.value) ? proofOfPayment.value[0] : proofOfPayment.value
        const reader = new FileReader()

        const proofBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        // Checkout via cart API with selected items only
        const response = await cartService.checkout({
          payment_method: 'gcash',
          proof_of_payment: proofBase64,
          selected_items: selectedItems.map(item => item.id)
        })

        showAlert({
          icon: 'success',
          title: 'Payment Submitted!',
          html: `
            <p>Successfully submitted <strong>${response.bookings.length}</strong> booking(s) with payment!</p>
            <p class="text-muted">Total: <strong>₱${totalPrice.value}</strong></p>
            <div class="mt-3 text-info">
              <small>Your bookings will be confirmed after admin verifies your payment.</small>
            </div>
          `,
          confirmButtonText: 'OK'
        })

        // Clear cart and close dialogs
        cartItems.value = []
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Dispatch event to refresh bookings list with updated payment status
        window.dispatchEvent(new CustomEvent('booking-created'))

        closePaymentDialog()
        emit('checkout-complete')
        emit('close')
      } catch (error) {
        console.error('Failed to complete payment:', error)
        console.error('Error response:', error.response)
        console.error('Error data:', error.response?.data)

        let errorMessage = 'Failed to process payment. Please try again.'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }

        showAlert({
          icon: 'error',
          title: 'Payment Failed',
          html: `<p>${errorMessage}</p>${error.response?.data?.trace ? '<pre style="text-align: left; font-size: 10px; max-height: 200px; overflow: auto;">' + error.response.data.trace + '</pre>' : ''}`
        })
      } finally {
        checkingOut.value = false
      }
    }

    const formatTimeSlot = (time) => {
      if (!time) return ''
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }

    const formatDate = (date) => {
      if (!date) {
        return 'Invalid Date'
      }
      try {
        return new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        console.error('Error formatting date:', error)
        return date
      }
    }

    // Watch for proof of payment file change
    watch(proofOfPayment, (newFile) => {
      if (newFile && newFile.length > 0) {
        const file = Array.isArray(newFile) ? newFile[0] : newFile
        const reader = new FileReader()
        reader.onload = (e) => {
          proofPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        proofPreview.value = null
      }
    })

    // Watch for dialog open/close
    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        loadCart()
        fetchCourts()
      }
    })

    // Watch for payment dialog open to load payment details and generate/display QR code
    watch(paymentDialog, async (newVal) => {
      if (newVal) {
        // Generate/load QR code when payment dialog opens
        // This function handles everything: loading payment settings, checking for custom QR, and generating dynamic QR if needed
        await nextTick()
        setTimeout(() => {
          generateGCashQR()
        }, 150)
      }
    })

    return {
      cartItems,
      loading,
      groupedCartItems,
      checkingOut,
      paymentDialog,
      proofOfPayment,
      proofPreview,
      gcashQrCanvas,
      totalPrice,
      selectedTotalPrice,
      selectedSlotsCount,
      selectedGroups,
      selectAll,
      toggleSelectAll,
      calculateGroupPrice,
      calculateDuration,
      removeGroup,
      clearCart,
      generateGCashQR,
      openPaymentDialog,
      closePaymentDialog,
      completePayment,
      formatDate,
      formatTimeSlot,
      updating,
      courts,
      // Services
      sportService,
      // Payment settings
      paymentSettings
    }
  }
}
</script>

<style scoped>
.cart-item {
  transition: all 0.3s ease;
}

.cart-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.selected-item {
  border: 2px solid #3b82f6 !important;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
}

/* Payment Instructions */
.payment-instructions {
  padding-left: 20px;
  margin: 0;
}

.payment-instructions li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.payment-instructions strong {
  color: #2e7d32;
}

/* GCash QR Code */
.gcash-qr-container {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: inline-block;
}

.gcash-qr-code {
  display: block;
  border-radius: 8px;
  border: 3px solid #2e7d32;
}

.qr-label {
  font-weight: 600;
  color: #2e7d32;
}

/* Time Slots Arrangement */
.time-slots-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.time-slot-chip {
  cursor: pointer;
  transition: all 0.3s ease;
  height: auto !important;
  padding: 12px 16px !important;
  border-radius: 10px !important;
  font-weight: 500;
}

.time-slot-chip:not([disabled]):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.time-slot-chip[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-slot-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.time-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.price-text {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.85;
}

/* Fixed Header and Footer */
.cart-dialog {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.cart-dialog > .v-card-title {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cart-dialog > .v-card-text {
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 140px);
}

.cart-dialog > .v-card-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: white;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

/* Scrollbar styling */
.time-slots-container::-webkit-scrollbar {
  width: 8px;
}

.time-slots-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.time-slots-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.time-slots-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 1280px) {
  .v-dialog.responsive-dialog {
    margin: 0 !important;
  }

  .cart-dialog {
    max-height: 100vh;
    height: 100vh;
  }
}

@media (max-width: 960px) {
  .v-card-title {
    flex-direction: row !important;
    align-items: center !important;
    padding: 16px !important;
    flex-wrap: nowrap;
  }

  .v-card-title > div:first-child {
    margin-bottom: 0;
  }

  .v-card-title .text-h5 {
    font-size: 1.15rem !important;
  }

  .cart-group-header {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }

  /* Touch-friendly buttons */
  .v-btn {
    min-height: 44px;
  }

  /* Better spacing for mobile */
  .mb-3 {
    margin-bottom: 12px;
  }

  .pa-3 {
    padding: 12px !important;
  }

  .pa-4 {
    padding: 14px !important;
  }
}

@media (max-width: 768px) {
  .v-card-text {
    padding: 12px !important;
  }

  .v-card-title {
    padding: 12px 16px !important;
  }

  .v-card-title .text-h5 {
    font-size: 1.1rem !important;
  }

  .v-card-actions {
    padding: 12px 16px !important;
    flex-wrap: wrap;
    gap: 8px;
  }

  .v-card-actions .v-btn {
    min-height: 48px;
    font-size: 14px;
  }

  .cart-item {
    padding: 12px !important;
    margin-bottom: 12px !important;
  }

  .cart-item .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .cart-item .d-flex.gap-2 {
    flex-direction: row !important;
    margin-top: 8px;
    align-self: flex-end;
  }

  .cart-item .text-body-2 {
    font-size: 13px;
    line-height: 1.6;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 6px;
  }

  .time-slot-chip {
    padding: 8px 10px !important;
  }

  .time-text {
    font-size: 12px;
  }

  .price-text {
    font-size: 11px;
  }

  .cart-total {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }

  .cart-total .v-btn {
    width: 100% !important;
  }

  /* GCash payment dialog mobile */
  .gcash-qr-container {
    padding: 12px;
  }

  .gcash-qr-code {
    width: 180px !important;
    height: 180px !important;
  }

  .payment-instructions {
    font-size: 14px;
  }

  .payment-instructions li {
    margin-bottom: 10px;
  }
}

@media (max-width: 600px) {
  .v-card-title .text-h5 {
    font-size: 1rem !important;
  }

  .cart-group-header h4 {
    font-size: 0.95rem !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .time-slot-chip {
    padding: 8px 10px !important;
    font-size: 12px;
  }

  .time-text {
    font-size: 11px;
  }

  .price-text {
    font-size: 10px;
  }

  .v-chip {
    font-size: 0.75rem !important;
    height: auto !important;
    padding: 4px 8px !important;
  }

  .cart-actions {
    flex-direction: column;
    width: 100% !important;
  }

  .cart-actions .v-btn {
    width: 100% !important;
    margin-bottom: 8px !important;
  }

  .v-card-actions {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .v-card-actions .v-btn {
    width: 100% !important;
    margin-bottom: 8px !important;
  }

  .v-card-actions .v-spacer {
    display: none;
  }

  /* Cart item improvements */
  .cart-item .flex-grow-1 {
    width: 100%;
  }

  .cart-item .d-flex.justify-space-between {
    flex-direction: column;
  }

  .cart-item .mr-3 {
    margin-right: 0 !important;
    margin-bottom: 8px;
  }

  /* Better checkbox sizing */
  .v-checkbox {
    transform: scale(1.1);
  }

  /* Text sizing improvements */
  .text-subtitle-1 {
    font-size: 0.95rem !important;
  }

  .text-body-2 {
    font-size: 0.8rem !important;
  }

  .text-h6 {
    font-size: 1rem !important;
  }

  .text-h5 {
    font-size: 1.1rem !important;
  }

  /* Payment dialog improvements */
  .v-file-input {
    font-size: 14px;
  }

  .gcash-qr-container {
    padding: 10px;
  }

  .gcash-qr-code {
    width: 160px !important;
    height: 160px !important;
  }

  .payment-instructions {
    padding-left: 16px;
    font-size: 13px;
  }

  .payment-instructions li {
    margin-bottom: 8px;
  }
}

@media (max-width: 400px) {
  .v-card-text {
    padding: 8px !important;
  }

  .v-card-title {
    padding: 10px 12px !important;
  }

  .v-card-title .text-h5 {
    font-size: 0.95rem !important;
  }

  .v-card-actions {
    padding: 8px 12px !important;
  }

  .cart-item {
    padding: 10px !important;
  }

  .cart-item .text-subtitle-1 {
    font-size: 0.9rem !important;
  }

  .cart-item .text-body-2 {
    font-size: 0.75rem !important;
  }

  .time-slots-grid {
    grid-template-columns: 1fr;
  }

  .time-slot-chip {
    padding: 10px !important;
    width: 100%;
  }

  .v-chip {
    font-size: 0.7rem !important;
  }

  .gcash-qr-code {
    width: 140px !important;
    height: 140px !important;
  }

  .payment-instructions {
    font-size: 12px;
  }
}

/* Landscape mobile optimization */
@media (max-width: 960px) and (orientation: landscape) {
  .cart-dialog > .v-card-text {
    max-height: calc(100vh - 100px);
  }
}

/* iOS safe area support */
@supports (padding: env(safe-area-inset-bottom)) {
  @media (max-width: 768px) {
    .v-card-actions {
      padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important;
    }
  }
}

/* SweetAlert z-index fix for dialogs */
:deep(.swal2-container) {
  z-index: 99999 !important;
}

:deep(.swal2-popup) {
  z-index: 99999 !important;
}

:deep(.swal2-container-high-z) {
  z-index: 99999 !important;
}

:deep(.swal2-backdrop-show) {
  z-index: 99998 !important;
}
</style>
