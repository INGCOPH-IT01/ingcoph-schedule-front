<template>
  <div class="pos-system">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#1e293b" size="20" class="mr-2">mdi-cash-register</v-icon>
          Point of Sale
        </div>
        <h1 class="header-title">
          <span class="title-gradient">POS</span> System
        </h1>
        <p class="header-subtitle">
          Process sales, manage inventory, and track transactions
        </p>
      </div>
    </div>

    <v-row>
      <!-- Products Section -->
      <v-col cols="12" md="8">
        <v-card class="products-section">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>
              <v-icon class="mr-2" color="primary">mdi-package-variant</v-icon>
              Products
            </span>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="$router.push('/admin/products')"
            >
              <v-icon start>mdi-cog</v-icon>
              Manage Products
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text>
            <!-- Search and Filter -->
            <v-row class="mb-4">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="search"
                  label="Search products"
                  placeholder="Search by name, SKU, or scan barcode"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                >
                  <template v-slot:append-inner>
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon v-bind="props" size="small" color="primary">
                          mdi-barcode-scan
                        </v-icon>
                      </template>
                      Scan or type barcode to auto-add to cart
                    </v-tooltip>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedCategory"
                  :items="categoryOptions"
                  label="Category"
                  prepend-inner-icon="mdi-tag"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
            </v-row>

            <!-- Products Grid -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <div v-else-if="filteredProducts.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey">mdi-package-variant</v-icon>
              <p class="text-grey mt-2">No products available</p>
            </div>

            <v-row v-else>
              <v-col
                v-for="product in filteredProducts"
                :key="product.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="product-card"
                  @click="addToCart(product)"
                  hover
                >
                  <div class="product-image">
                    <v-img
                      v-if="product.image_url || product.image"
                      :src="product.image_url || getProductImageUrl(product.image)"
                      height="120"
                      cover
                    >
                      <template v-slot:error>
                        <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                          <v-icon size="48" color="grey">mdi-image-off</v-icon>
                        </div>
                      </template>
                    </v-img>
                    <div v-else class="d-flex align-center justify-center bg-grey-lighten-3" style="height: 120px;">
                      <v-icon size="48" color="grey">mdi-package-variant</v-icon>
                    </div>

                    <!-- Stock Badge -->
                    <v-chip
                      v-if="product.track_inventory"
                      :color="getStockColor(product)"
                      size="x-small"
                      class="stock-badge"
                    >
                      {{ product.stock_quantity }} in stock
                    </v-chip>
                  </div>

                  <v-card-text>
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-price">{{ formatPrice(product.price) }}</div>
                    <div v-if="product.sku" class="text-caption text-grey">
                      SKU: {{ product.sku }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cart Section -->
      <v-col cols="12" md="4">
        <div class="sticky-cart">
          <PosCart
            :items="cartItems"
            :discount="discount"
            :tax="tax"
            :show-discount-tax="true"
            @update:items="cartItems = $event"
            @update:discount="discount = $event"
            @update:tax="tax = $event"
            @clear="clearCart"
          />

          <!-- Checkout Section -->
          <v-card class="mt-4">
            <v-card-text>
              <!-- Link to Booking Section -->
              <v-expansion-panels class="mb-3">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2" color="primary">mdi-link-variant</v-icon>
                    Link to Booking (Optional)
                    <v-chip v-if="bookingId" color="success" size="x-small" class="ml-2">
                      Linked
                    </v-chip>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <!-- Booking Search Filters -->
                    <v-text-field
                      v-model="bookingSearch.date"
                      label="Booking Date"
                      type="date"
                      prepend-inner-icon="mdi-calendar"
                      variant="outlined"
                      density="compact"
                      hide-details
                      :disabled="!!customerName"
                      class="mb-2"
                    ></v-text-field>

                    <v-text-field
                      v-model="bookingSearch.userName"
                      label="User Name"
                      prepend-inner-icon="mdi-account-search"
                      variant="outlined"
                      density="compact"
                      hide-details
                      :disabled="!!customerName"
                      class="mb-2"
                      @input="searchBookings"
                    ></v-text-field>

                    <v-btn
                      color="primary"
                      variant="outlined"
                      size="small"
                      block
                      :disabled="!!customerName"
                      :loading="searchingBookings"
                      @click="searchBookings"
                      class="mb-3"
                    >
                      <v-icon start>mdi-magnify</v-icon>
                      Search Bookings
                    </v-btn>

                    <!-- Search Results -->
                    <div v-if="searchedBookings.length > 0" class="mb-2">
                      <div class="text-caption mb-2 px-2" style="color: #475569;">
                        {{ searchedBookings.length }} booking{{ searchedBookings.length !== 1 ? 's' : '' }} found
                      </div>
                      <v-list density="compact" class="booking-results">
                        <v-list-item
                          v-for="booking in searchedBookings"
                          :key="booking.id"
                          @click="selectBooking(booking)"
                          :active="bookingId === booking.id"
                          :disabled="!!customerName"
                          class="booking-result-item"
                        >
                          <template v-slot:prepend>
                            <v-avatar size="36" color="primary" class="mr-3">
                              <span class="text-white text-caption font-weight-bold">
                                {{ getDisplayUserName(booking).charAt(0).toUpperCase() }}
                              </span>
                            </v-avatar>
                          </template>

                          <v-list-item-title class="d-flex align-center flex-wrap mb-1">
                            <span class="font-weight-bold mr-2">#{{ booking.id }}</span>
                            <span class="mr-2">{{ getDisplayUserName(booking) }}</span>
                            <v-chip
                              v-if="isAdminBooking(booking)"
                              size="x-small"
                              color="purple"
                              variant="tonal"
                              class="mr-2"
                            >
                              <v-icon size="x-small" class="mr-1">mdi-shield-crown</v-icon>
                              Admin Booking
                            </v-chip>
                          </v-list-item-title>

                          <v-list-item-subtitle class="booking-details">
                            <div class="d-flex flex-wrap gap-2 mt-1">
                              <!-- Date & Time -->
                              <div class="detail-chip">
                                <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
                                {{ formatDate(booking.cart_items?.[0]?.booking_date) }}
                              </div>
                              <div v-if="booking.cart_items?.[0]?.start_time" class="detail-chip">
                                <v-icon size="x-small" class="mr-1">mdi-clock-outline</v-icon>
                                {{ booking.cart_items[0].start_time }}
                              </div>

                              <!-- Sports -->
                              <div v-if="getUniqueSports(booking).length > 0" class="detail-chip">
                                <v-icon size="x-small" class="mr-1">mdi-basketball</v-icon>
                                {{ getUniqueSports(booking).map(s => s.name).join(', ') }}
                              </div>

                              <!-- Total Price -->
                              <div class="detail-chip price-chip">
                                <v-icon size="x-small" class="mr-1">mdi-cash</v-icon>
                                {{ formatPrice(booking.total_price) }}
                              </div>

                              <!-- Payment Status -->
                              <v-chip
                                :color="getPaymentStatusColor(booking)"
                                size="x-small"
                                variant="tonal"
                              >
                                {{ getPaymentStatusText(booking) }}
                              </v-chip>

                              <!-- Approval Status -->
                              <v-chip
                                :color="getApprovalStatusColor(booking.approval_status)"
                                size="x-small"
                                variant="tonal"
                              >
                                {{ getApprovalStatusText(booking.approval_status) }}
                              </v-chip>
                            </div>

                            <!-- Notes Preview -->
                            <div v-if="booking.cart_items?.[0]?.admin_notes || booking.cart_items?.[0]?.notes" class="mt-2">
                              <div v-if="booking.cart_items[0].admin_notes" class="notes-preview admin-notes">
                                <v-icon size="x-small" class="mr-1" color="info">mdi-shield-account</v-icon>
                                <strong>Admin:</strong> {{ booking.cart_items[0].admin_notes }}
                              </div>
                              <div v-if="booking.cart_items[0].notes" class="notes-preview client-notes">
                                <v-icon size="x-small" class="mr-1" color="warning">mdi-message-text</v-icon>
                                <strong>Client:</strong> {{ booking.cart_items[0].notes }}
                              </div>
                            </div>
                          </v-list-item-subtitle>

                          <template v-slot:append>
                            <v-icon v-if="bookingId === booking.id" color="success">
                              mdi-check-circle
                            </v-icon>
                            <v-icon v-else color="grey-lighten-1">
                              mdi-chevron-right
                            </v-icon>
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>

                    <div v-else-if="hasSearched && searchedBookings.length === 0" class="text-center text-grey py-2">
                      <v-icon>mdi-alert-circle-outline</v-icon>
                      No bookings found
                    </div>

                    <!-- Selected Booking Display -->
                    <v-alert
                      v-if="selectedBookingDetails"
                      type="success"
                      density="compact"
                      variant="tonal"
                      class="mt-2"
                    >
                      <div class="selected-booking-summary">
                        <div class="d-flex align-center mb-2">
                          <v-avatar size="32" color="primary" class="mr-2">
                            <span class="text-white text-caption font-weight-bold">
                              {{ getDisplayUserName(selectedBookingDetails).charAt(0).toUpperCase() }}
                            </span>
                          </v-avatar>
                          <div>
                            <div class="font-weight-bold">
                              #{{ selectedBookingDetails.id }} - {{ getDisplayUserName(selectedBookingDetails) }}
                            </div>
                            <div class="text-caption">
                              {{ formatDate(selectedBookingDetails.cart_items?.[0]?.booking_date) }}
                              <span v-if="selectedBookingDetails.cart_items?.[0]?.start_time">
                                at {{ selectedBookingDetails.cart_items[0].start_time }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="d-flex flex-wrap gap-1 mb-2">
                          <v-chip
                            v-if="getUniqueSports(selectedBookingDetails).length > 0"
                            size="x-small"
                            variant="tonal"
                            color="primary"
                          >
                            <v-icon size="x-small" class="mr-1">mdi-basketball</v-icon>
                            {{ getUniqueSports(selectedBookingDetails).map(s => s.name).join(', ') }}
                          </v-chip>
                          <v-chip size="x-small" variant="tonal" color="success">
                            {{ formatPrice(selectedBookingDetails.total_price) }}
                          </v-chip>
                          <v-chip
                            :color="getApprovalStatusColor(selectedBookingDetails.approval_status)"
                            size="x-small"
                            variant="tonal"
                          >
                            {{ getApprovalStatusText(selectedBookingDetails.approval_status) }}
                          </v-chip>
                        </div>

                        <div v-if="selectedBookingDetails.cart_items?.[0]?.admin_notes" class="text-caption mb-1">
                          <v-icon size="x-small" color="info" class="mr-1">mdi-shield-account</v-icon>
                          <strong>Admin Notes:</strong> {{ selectedBookingDetails.cart_items[0].admin_notes }}
                        </div>
                        <div v-if="selectedBookingDetails.cart_items?.[0]?.notes" class="text-caption">
                          <v-icon size="x-small" color="warning" class="mr-1">mdi-message-text</v-icon>
                          <strong>Client Notes:</strong> {{ selectedBookingDetails.cart_items[0].notes }}
                        </div>
                      </div>
                      <template v-slot:append>
                        <v-btn
                          icon="mdi-close"
                          size="x-small"
                          variant="text"
                          @click="clearBookingSelection"
                        ></v-btn>
                      </template>
                    </v-alert>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-text-field
                v-model="customerName"
                label="Customer Name (Optional)"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="compact"
                hide-details
                :disabled="!!bookingId"
                class="mb-3"
              >
                <template v-slot:append-inner>
                  <v-tooltip v-if="bookingId" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" size="small" color="warning">
                        mdi-lock
                      </v-icon>
                    </template>
                    Clear booking selection to enable
                  </v-tooltip>
                </template>
              </v-text-field>

              <v-select
                v-model="paymentMethod"
                :items="paymentMethods"
                label="Payment Method"
                prepend-inner-icon="mdi-credit-card"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
              ></v-select>

              <!-- Proof of Payment Upload -->
              <ProofOfPaymentUpload
                v-model="proofOfPaymentFiles"
                v-model:reference-number="paymentReference"
                reference-label="Payment Reference (Optional)"
                reference-placeholder="Enter payment reference number"
                reference-hint="Optional: Enter the reference number from your payment"
                label="Upload Proof of Payment (Optional)"
                placeholder="Select image file(s)"
                hint="Upload screenshots of your payment receipts (max 5MB each)"
                density="compact"
                :persistent-hint="false"
                :multiple="true"
                class="mb-3"
              />

              <v-textarea
                v-model="notes"
                label="Notes (Optional)"
                variant="outlined"
                density="compact"
                rows="2"
                hide-details
                class="mb-3"
              ></v-textarea>

              <v-btn
                color="success"
                size="x-large"
                block
                @click="processSale"
                :loading="processing"
                :disabled="cartItems.length === 0"
                class="mt-2"
              >
                <v-icon start>mdi-check-circle</v-icon>
                Complete Sale - {{ formatPrice(total) }}
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>

    <!-- Sale Details Dialog -->
    <PosSaleDialog
      :is-open="saleDialog"
      @update:is-open="saleDialog = $event"
      :sale="completedSale"
      :show-admin-actions="false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { productService } from '../services/productService'
import { posService } from '../services/posService'
import { cartService } from '../services/cartService'
import {
  formatPrice,
  formatDate,
  getPaymentStatusColor,
  getPaymentStatusText,
  getApprovalStatusColor,
  formatApprovalStatus
} from '../utils/formatters'
import PosCart from '../components/PosCart.vue'
import PosSaleDialog from '../components/PosSaleDialog.vue'
import ProofOfPaymentUpload from '../components/ProofOfPaymentUpload.vue'

export default {
  name: 'PosSystem',
  components: {
    PosCart,
    PosSaleDialog,
    ProofOfPaymentUpload
  },
  setup() {
    const products = ref([])
    const categories = ref([])
    const loading = ref(false)
    const search = ref('')
    const selectedCategory = ref(null)
    const cartItems = ref([])
    const discount = ref(0)
    const tax = ref(0)
    const bookingId = ref(null)
    const customerName = ref('')
    const paymentMethod = ref('cash')
    const paymentReference = ref('')
    const proofOfPaymentFiles = ref(null)
    const notes = ref('')
    const processing = ref(false)
    const recentBookings = ref([])
    const saleDialog = ref(false)
    const completedSale = ref(null)

    // Booking search
    const bookingSearch = ref({
      date: '',
      userName: ''
    })
    const searchedBookings = ref([])
    const searchingBookings = ref(false)
    const hasSearched = ref(false)
    const selectedBookingDetails = ref(null)

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const paymentMethods = [
      { title: 'Cash', value: 'cash' },
      { title: 'GCash', value: 'gcash' },
    ]

    const categoryOptions = computed(() => {
      return ['All Categories', ...categories.value.map(c => c.name)]
    })

    const filteredProducts = computed(() => {
      let filtered = products.value

      // Filter by search
      if (search.value) {
        const searchLower = search.value.toLowerCase()
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
          (p.barcode && p.barcode.toLowerCase().includes(searchLower))
        )
      }

      // Filter by category
      if (selectedCategory.value && selectedCategory.value !== 'All Categories') {
        filtered = filtered.filter(p => p.category?.name === selectedCategory.value)
      }

      return filtered
    })

    const total = computed(() => {
      const subtotal = cartItems.value.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
      }, 0)
      return subtotal - discount.value + tax.value
    })

    const loadProducts = async () => {
      try {
        loading.value = true
        products.value = await productService.getProducts({ active_only: true })
      } catch (error) {
        showSnackbar('Failed to load products', 'error')
      } finally {
        loading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        categories.value = await productService.getCategories(true, false)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    const searchBookings = async () => {
      try {
        searchingBookings.value = true
        hasSearched.value = true

        // Build filters
        const filters = {
          status: 'approved'
        }

        // Add date filter if provided
        if (bookingSearch.value.date) {
          filters.date_from = bookingSearch.value.date
          filters.date_to = bookingSearch.value.date
        } else {
          // Default to last 30 days if no date specified
          filters.date_from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          filters.date_to = new Date().toISOString().split('T')[0]
        }

        // Add user name filter if provided
        if (bookingSearch.value.userName) {
          filters.user_name = bookingSearch.value.userName
        }

        const transactions = await cartService.getAllTransactions(filters)

        // Filter by user name on client side if needed (more flexible search)
        let results = transactions
        if (bookingSearch.value.userName) {
          const searchTerm = bookingSearch.value.userName.toLowerCase()
          results = transactions.filter(t =>
            t.user?.name?.toLowerCase().includes(searchTerm) ||
            t.admin_notes?.toLowerCase().includes(searchTerm) ||
            t.client_notes?.toLowerCase().includes(searchTerm)
          )
        }

        searchedBookings.value = results
      } catch (error) {
        console.error('Failed to search bookings:', error)
        showSnackbar('Failed to search bookings', 'error')
      } finally {
        searchingBookings.value = false
      }
    }

    const selectBooking = (booking) => {
      bookingId.value = booking.id
      selectedBookingDetails.value = booking
      showSnackbar(`Linked to booking #${booking.id}`, 'success')
    }

    const clearBookingSelection = () => {
      bookingId.value = null
      selectedBookingDetails.value = null
      searchedBookings.value = []
      hasSearched.value = false
      bookingSearch.value.date = ''
      bookingSearch.value.userName = ''
    }

    const getStockColor = (product) => {
      if (!product.track_inventory) return 'grey'
      if (product.stock_quantity <= 0) return 'error'
      if (product.stock_quantity <= product.low_stock_threshold) return 'warning'
      return 'success'
    }

    const addToCart = (product, isBarcodeScan = false) => {
      // Check stock
      if (product.track_inventory && product.stock_quantity <= 0) {
        showSnackbar('Product is out of stock', 'error')
        return
      }

      // Check if product already in cart
      const existingItem = cartItems.value.find(item => item.product.id === product.id)
      if (existingItem) {
        // Check stock limit
        if (product.track_inventory && existingItem.quantity >= product.stock_quantity) {
          showSnackbar('Cannot add more than available stock', 'error')
          return
        }
        existingItem.quantity++
      } else {
        cartItems.value.push({
          product: product,
          quantity: 1,
          unit_price: product.price,
          discount: 0
        })
      }

      const message = isBarcodeScan
        ? `🔍 Barcode scanned: ${product.name} added to cart`
        : `Added ${product.name} to cart`
      showSnackbar(message, 'success')
    }

    const clearCart = () => {
      if (confirm('Are you sure you want to clear the cart?')) {
        cartItems.value = []
        discount.value = 0
        tax.value = 0
        bookingId.value = null
        selectedBookingDetails.value = null
        searchedBookings.value = []
        hasSearched.value = false
        bookingSearch.value.date = ''
        bookingSearch.value.userName = ''
        customerName.value = ''
        paymentReference.value = ''
        proofOfPaymentFiles.value = null
        notes.value = ''
      }
    }

    const processSale = async () => {
      if (cartItems.value.length === 0) {
        showSnackbar('Cart is empty', 'error')
        return
      }

      try {
        processing.value = true

        // Prepare sale data
        const saleData = {
          items: cartItems.value.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            discount: item.discount || 0
          })),
          discount: discount.value,
          tax: tax.value,
          payment_method: paymentMethod.value,
          payment_reference: paymentReference.value || null,
          notes: notes.value || null,
          customer_name: customerName.value || null,
          booking_id: bookingId.value || null,
          status: 'completed'
        }

        // Create sale with proof of payment files
        const sale = await posService.createSale(saleData, proofOfPaymentFiles.value)
        completedSale.value = sale
        showSnackbar('Sale completed successfully!', 'success')

        // Automatically clear all transaction information without confirmation
        cartItems.value = []
        discount.value = 0
        tax.value = 0
        bookingId.value = null
        selectedBookingDetails.value = null
        searchedBookings.value = []
        hasSearched.value = false
        bookingSearch.value.date = ''
        bookingSearch.value.userName = ''
        customerName.value = ''
        paymentMethod.value = 'cash'
        paymentReference.value = ''
        proofOfPaymentFiles.value = null
        notes.value = ''

        // Reload products to update stock
        await loadProducts()

        // Show sale details
        saleDialog.value = true

        // Dispatch event to refresh other components
        window.dispatchEvent(new CustomEvent('pos-sale-completed'))
      } catch (error) {
        console.error('Failed to process sale:', error)
        showSnackbar(error.response?.data?.message || 'Failed to process sale', 'error')
      } finally {
        processing.value = false
      }
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    const getProductImageUrl = (imagePath) => {
      return productService.getProductImageUrl(imagePath)
    }

    // Helper functions for booking display (matching AdminDashboard)
    const getUniqueSports = (booking) => {
      if (!booking.cart_items || booking.cart_items.length === 0) {
        return []
      }

      // Extract all sports from cart items
      const sportsMap = new Map()
      booking.cart_items.forEach(item => {
        const sport = item.sport
        if (sport && sport.name) {
          if (!sportsMap.has(sport.name)) {
            sportsMap.set(sport.name, {
              name: sport.name,
              icon: sport.icon
            })
          }
        }
      })

      return Array.from(sportsMap.values())
    }

    const isAdminBooking = (booking) => {
      const firstCartItem = booking.cart_items?.[0]
      return firstCartItem && (firstCartItem.booking_for_user_id || firstCartItem.booking_for_user_name)
    }

    const getDisplayUserName = (booking) => {
      const firstCartItem = booking.cart_items?.[0]

      // If this is an admin booking, return the "booking for" user
      if (firstCartItem?.booking_for_user_name) {
        return firstCartItem.booking_for_user_name
      }

      // Otherwise, return the transaction creator
      return booking.user?.name || 'N/A'
    }

    const getApprovalStatusText = formatApprovalStatus

    // Watch for barcode search and auto-add to cart
    watch(search, (newValue) => {
      if (!newValue || newValue.length < 3) return

      // Check for exact barcode match
      const barcodeMatch = products.value.find(p =>
        p.barcode && p.barcode.toLowerCase() === newValue.toLowerCase()
      )

      if (barcodeMatch) {
        // Automatically add to cart with barcode scan flag
        addToCart(barcodeMatch, true)
        // Clear search field
        search.value = ''
      }
    })

    onMounted(() => {
      loadProducts()
      loadCategories()
    })

    return {
      products,
      categories,
      loading,
      search,
      selectedCategory,
      cartItems,
      discount,
      tax,
      bookingId,
      customerName,
      paymentMethod,
      paymentReference,
      proofOfPaymentFiles,
      notes,
      processing,
      recentBookings,
      saleDialog,
      completedSale,
      snackbar,
      paymentMethods,
      categoryOptions,
      filteredProducts,
      total,
      bookingSearch,
      searchedBookings,
      searchingBookings,
      hasSearched,
      selectedBookingDetails,
      getStockColor,
      addToCart,
      clearCart,
      processSale,
      searchBookings,
      selectBooking,
      clearBookingSelection,
      getProductImageUrl,
      formatPrice,
      formatDate,
      getUniqueSports,
      isAdminBooking,
      getDisplayUserName,
      getPaymentStatusColor,
      getPaymentStatusText,
      getApprovalStatusColor,
      getApprovalStatusText
    }
  }
}
</script>

<style scoped>
.pos-system {
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
  letter-spacing: 0.5px;
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

.products-section {
  height: 100%;
}

.sticky-cart {
  position: sticky;
  top: 20px;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
}

.stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.product-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  font-size: 1.1rem;
}

@media (max-width: 960px) {
  .sticky-cart {
    position: relative;
    top: 0;
  }
}

.booking-results {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.booking-result-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 12px 8px !important;
  min-height: auto !important;
}

.booking-result-item:last-child {
  border-bottom: none;
}

.booking-result-item:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.booking-result-item.v-list-item--active {
  background-color: rgba(16, 185, 129, 0.1);
  border-left: 3px solid rgb(16, 185, 129);
}

.booking-details {
  opacity: 1 !important;
}

.detail-chip {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.75rem;
  color: #475569;
  white-space: nowrap;
}

.price-chip {
  background: rgba(16, 185, 129, 0.1);
  color: rgb(16, 185, 129);
  font-weight: 600;
}

.notes-preview {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: flex-start;
  margin-top: 4px;
}

.admin-notes {
  color: #3b82f6;
}

.client-notes {
  color: #f59e0b;
}

.gap-2 {
  gap: 8px;
}

.gap-1 {
  gap: 4px;
}

.selected-booking-summary {
  font-size: 0.875rem;
}

.selected-booking-summary .text-caption {
  font-size: 0.75rem;
  line-height: 1.4;
}
</style>
