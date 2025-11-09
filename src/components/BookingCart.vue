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
          <!-- Rejection Warning -->
          <v-alert
            v-if="cartTransaction && cartTransaction.approval_status === 'rejected'"
            type="error"
            variant="tonal"
            class="mb-3"
            density="compact"
            prominent
          >
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-alert-circle</v-icon>
              <div>
                <strong>Booking Rejected</strong>
                <p class="mb-0 mt-1">
                  This booking has been rejected by the admin and cannot be processed.
                  <span v-if="cartTransaction.rejection_reason" class="d-block mt-1">
                    <strong>Reason:</strong> {{ cartTransaction.rejection_reason }}
                  </span>
                </p>
                <p class="text-caption mb-0 mt-2">
                  Please create a new booking or contact support.
                </p>
              </div>
            </div>
          </v-alert>

          <!-- Expiration Timer Warning -->
          <v-alert
            v-if="timeRemaining && cartTransaction && cartTransaction.approval_status !== 'rejected'"
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

          <!-- Cart Items (Grouped by Court) -->
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
                  <!-- Court Header -->
                  <div class="d-flex align-center mb-2">
                    <v-icon v-if="group.sport" class="mr-2" :color="sportService.getSportColor(group.sport.name)">
                      {{ sportService.getSportIcon(group.sport.name, group.sport.icon) }}
                    </v-icon>
                    <h4 v-if="group.sport" class="text-subtitle-1 font-weight-bold">{{ group.sport.name }}</h4>
                    <v-chip
                      v-if="group.originalItems && group.originalItems.length > 1"
                      size="x-small"
                      color="primary"
                      class="ml-2"
                    >
                      {{ group.originalItems.length }} slots
                    </v-chip>
                  </div>

                  <div v-if="group.court" class="text-body-2 mb-2">
                    <v-icon size="small" class="mr-1">mdi-stadium</v-icon>
                    <strong>Court:</strong> {{ group.court.name }}
                    <span v-if="group.court.surface_type" class="text-caption text-grey ml-1">
                      ({{ group.court.surface_type }})
                    </span>
                  </div>

                  <!-- Time Slots List -->
                  <div v-if="group.timeSlots && group.timeSlots.length > 0" class="time-slots-list">
                    <div class="text-caption text-grey mb-1">
                      <v-icon size="small" class="mr-1">mdi-calendar-clock</v-icon>
                      <strong>Booked Time Slots:</strong>
                    </div>
                    <div
                      v-for="(slot, index) in group.timeSlots"
                      :key="index"
                      class="time-slot-item mb-1 pl-4"
                    >
                      <v-chip
                        size="small"
                        color="info"
                        variant="tonal"
                        class="mr-2"
                      >
                        <v-icon start size="small">mdi-calendar</v-icon>
                        {{ formatDate(slot.date) }}
                      </v-chip>
                      <v-chip
                        size="small"
                        color="primary"
                        variant="tonal"
                      >
                        <v-icon start size="small">mdi-clock-outline</v-icon>
                        {{ slot.startTime }} - {{ slot.endTime }}
                        <span class="text-caption ml-1">
                          ({{ calculateDuration(slot.startTime, slot.endTime) }})
                        </span>
                      </v-chip>
                    </div>
                  </div>

                  <div class="text-body-2 mt-2">
                    <v-icon size="small" class="mr-1">mdi-cash</v-icon>
                    <strong>Total Price:</strong> ₱{{ calculateGroupPrice(group) }}
                  </div>

                  <v-chip
                    v-if="group.paymentMethod === 'gcash'"
                    size="small"
                    color="success"
                    class="mt-2"
                  >
                    <v-icon start size="small">mdi-cellphone</v-icon>
                    Payment
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
          :disabled="selectedGroups.length === 0 || (cartTransaction && cartTransaction.approval_status === 'rejected')"
        >
          <v-icon start>mdi-cash-multiple</v-icon>
          Proceed to Payment ({{ selectedGroups.length }})
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Payment Dialog -->
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
          Payment Required
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Payment Summary -->
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-h6 mb-2">Total Amount to Pay</div>
            <div class="text-h4 font-weight-bold text-success">₱{{ selectedTotalPrice }}</div>
            <div class="text-caption mt-2">{{ selectedGroups.length }} court(s) • {{ selectedSlotsCount }} time slot(s)</div>
          </v-alert>

          <!-- Instructions -->
          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <h3 class="text-h6 mb-3">
                <v-icon class="mr-2" color="success">mdi-information</v-icon>
                Payment Instructions
              </h3>
              <ol class="payment-instructions">
                <li>Send <strong>₱{{ selectedTotalPrice }}</strong> to our GCash number</li>
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
                      QR Code
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
                class="rounded proof-preview-clickable"
                @click="openPreviewDialog"
                style="cursor: pointer;"
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

  <!-- Preview Upload Dialog -->
  <v-dialog
    v-model="previewUploadDialog"
    max-width="800"
    :fullscreen="$vuetify.display.mobile"
  >
    <v-card>
      <v-card-title class="text-h5 dialog-title">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-image</v-icon>
          Preview Image
        </div>
        <v-btn icon="mdi-close" variant="text" @click="previewUploadDialog = false"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <div class="text-center">
          <img
            :src="proofPreview"
            alt="Preview"
            style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
          />
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="outlined"
          @click="previewUploadDialog = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { bookingService } from '../services/bookingService'
import { courtService } from '../services/courtService'
import { cartService } from '../services/cartService'
import { sportService } from '../services/sportService'
import { paymentSettingService } from '../services/paymentSettingService'
import { authService } from '../services/authService'
import { formatDateLong } from '../utils/formatters'
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
    const previewUploadDialog = ref(false)
    const gcashQrCanvas = ref(null)
    const timeRemaining = ref('')
    const expirationWarning = ref(false)
    const currentUser = ref(null)

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
        // First, validate cart items availability
        try {
          const validationResult = await cartService.validateCartItems()

          // If there are unavailable items, show alert to user
          if (validationResult.has_unavailable_items && validationResult.unavailable_items.length > 0) {
            const unavailableList = validationResult.unavailable_items
              .map(item => {
                const formattedDate = formatDateLong(item.booking_date) || item.booking_date
                return `• ${item.court_name} - ${formattedDate} ${item.start_time} - ${item.end_time}`
              })
              .join('<br>')

            showAlert({
              icon: 'warning',
              title: 'Cart Items No Longer Available',
              html: `<p><strong>${validationResult.removed_count} item${validationResult.removed_count > 1 ? 's have' : ' has'} been removed from your cart because ${validationResult.removed_count > 1 ? 'they are' : 'it is'} no longer available:</strong></p>
                     <div class="text-left mt-2 mb-2" style="font-size: 0.9em;">${unavailableList}</div>
                     <p class="text-caption mt-3">These time slots may have been booked by other users or are no longer available.</p>`,
              confirmButtonText: 'OK',
              confirmButtonColor: '#1976d2'
            })

            // Dispatch cart update event so cart count badge updates
            window.dispatchEvent(new CustomEvent('cart-updated'))
          }
        } catch (validationError) {
          // Continue loading cart even if validation fails
          console.error('Cart validation error:', validationError)
        }

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
        cartItems.value = []
        cartTransaction.value = null
      } finally {
        loading.value = false
      }
    }

    // Update expiration timer using business hours logic from backend
    const updateExpirationTimer = async () => {
      if (!cartTransaction.value || !cartTransaction.value.created_at) {
        timeRemaining.value = ''
        expirationWarning.value = false
        return
      }

      // Admin bookings should not expire - no timer needed
      if (currentUser.value && currentUser.value.role === 'admin') {
        timeRemaining.value = 'No expiration (Admin)'
        expirationWarning.value = false
        return
      }

      try {
        // Fetch expiration info from backend (includes business hours logic)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/expiration-info`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (!data.has_transaction) {
          timeRemaining.value = ''
          expirationWarning.value = false
          return
        }

        if (data.is_admin) {
          timeRemaining.value = 'No expiration (Admin)'
          expirationWarning.value = false
          return
        }

        if (data.is_expired) {
          timeRemaining.value = 'Expired'
          expirationWarning.value = true
          // Reload cart to remove expired items
          loadCart()
          return
        }

        // Use the formatted time from backend
        timeRemaining.value = data.time_remaining_formatted

        // Show warning if less than 10 minutes (600 seconds) remaining
        expirationWarning.value = data.time_remaining_seconds < 600 && data.time_remaining_seconds > 0

        // Update every second
        setTimeout(updateExpirationTimer, 1000)
      } catch (error) {
        // Fallback to empty timer on error
        timeRemaining.value = ''
        expirationWarning.value = false
      }
    }

    // Group cart items by court, then merge adjacent time slots within each date
    const groupedCartItems = computed(() => {
      if (!cartItems.value || cartItems.value.length === 0) {
        return []
      }

      // Sort items by court, date, and start time
      const itemsCopy = [...cartItems.value].sort((a, b) => {
        if (!a.court || !b.court) return 0
        if (a.court.id !== b.court.id) return a.court.id - b.court.id
        const dateA = a.booking_date || a.date
        const dateB = b.booking_date || b.date
        if (dateA !== dateB) return dateA.localeCompare(dateB)
        return a.start_time.localeCompare(b.start_time)
      })

      // Group by court first
      const courtGroups = new Map()

      itemsCopy.forEach(item => {
        if (!item || !item.court) return

        const courtId = item.court.id
        if (!courtGroups.has(courtId)) {
          courtGroups.set(courtId, {
            court: item.court,
            sport: item.sport || item.court.sport,
            items: []
          })
        }
        courtGroups.get(courtId).items.push(item)
      })

      // Process each court group to merge adjacent time slots
      const groups = []
      let groupIdCounter = 0

      courtGroups.forEach(courtGroup => {
        // Group by date and merge adjacent time slots
        const dateSlots = new Map()

        courtGroup.items.forEach(item => {
          const itemDate = item.booking_date || item.date

          if (!dateSlots.has(itemDate)) {
            dateSlots.set(itemDate, [])
          }
          dateSlots.get(itemDate).push(item)
        })

        // Merge adjacent time slots within each date
        const timeSlotGroups = []

        dateSlots.forEach((items, date) => {
          let currentSlot = null

          items.forEach(item => {
            if (!currentSlot) {
              currentSlot = {
                date: date,
                startTime: item.start_time,
                endTime: item.end_time,
                items: [item]
              }
            } else {
              // Check if this slot is adjacent to the current one
              if (item.start_time === currentSlot.endTime) {
                // Merge adjacent slots
                currentSlot.endTime = item.end_time
                currentSlot.items.push(item)
              } else {
                // Non-adjacent, save current and start new
                timeSlotGroups.push(currentSlot)
                currentSlot = {
                  date: date,
                  startTime: item.start_time,
                  endTime: item.end_time,
                  items: [item]
                }
              }
            }
          })

          // Add the last slot for this date
          if (currentSlot) {
            timeSlotGroups.push(currentSlot)
          }
        })

        // Create a group for each court with its time slots
        groups.push({
          id: `court-${courtGroup.court.id}-${groupIdCounter++}`,
          court: courtGroup.court,
          sport: courtGroup.sport,
          timeSlots: timeSlotGroups,
          originalItems: courtGroup.items
        })
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


        // Step 2: Check if custom QR code exists
        if (settings.payment_qr_code_url) {
          // Custom QR code uploaded by admin - use it
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          paymentSettings.value.payment_qr_code_url = `${apiUrl}${settings.payment_qr_code_url}`


          // No need to generate canvas, v-img will display the uploaded QR
          return
        }

        // Step 3: No custom QR code - generate dynamic QR using payment settings
        await nextTick()

        if (gcashQrCanvas.value) {
          // Use all details from Payment Settings module
          const gcashNumber = settings.payment_gcash_number.replace(/-/g, '')
          const accountName = settings.payment_gcash_name.replace(/\s+/g, '')
          const amount = selectedTotalPrice.value

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

        }
      } catch (error) {
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
        courts.value = []
      }
    }

    // Open preview dialog to show larger image
    const openPreviewDialog = () => {
      previewUploadDialog.value = true
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

      // Validate that transaction hasn't been rejected
      if (cartTransaction.value && cartTransaction.value.approval_status === 'rejected') {
        showAlert({
          icon: 'error',
          title: 'Booking Rejected',
          html: `<p>This booking has been rejected by the admin and cannot be processed.</p>
                 ${cartTransaction.value.rejection_reason ? `<p class="mt-2"><strong>Reason:</strong> ${cartTransaction.value.rejection_reason}</p>` : ''}
                 <p class="mt-2 text-caption">Please create a new booking or contact support.</p>`,
          confirmButtonText: 'OK'
        })
        // Refresh the cart to remove rejected items
        await loadCart()
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
            <p class="text-muted">Total: <strong>₱${selectedTotalPrice.value}</strong></p>
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

        let errorMessage = 'Failed to process payment. Please try again.'
        let errorTitle = 'Payment Failed'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }

        // Special handling for rejected transactions
        if (error.response?.data?.error === 'TRANSACTION_REJECTED') {
          errorTitle = 'Booking Rejected'
          if (error.response?.data?.rejection_reason) {
            errorMessage += `<br><br><strong>Reason:</strong> ${error.response.data.rejection_reason}`
          }
          errorMessage += '<br><br><small>Please create a new booking or contact support.</small>'

          // Refresh cart to remove rejected items
          await loadCart()
        }

        showAlert({
          icon: 'error',
          title: errorTitle,
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
        // Use timezone-aware formatter from utils/formatters.js
        const formatted = formatDateLong(date)
        return formatted || 'Invalid Date'
      } catch (error) {
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

    // Load current user on mount
    onMounted(async () => {
      try {
        currentUser.value = await authService.getUser()
      } catch (error) {
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
      previewUploadDialog,
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
      openPreviewDialog,
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

/* Time Slots List */
.time-slots-list {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px;
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.time-slot-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
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

  .time-slot-item {
    flex-direction: column;
    align-items: flex-start !important;
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
