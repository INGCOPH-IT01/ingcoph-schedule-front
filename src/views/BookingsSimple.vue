<template>
  <div class="bookings-container">
    <!-- Header -->
    <div class="bookings-header">
      <div class="header-content">
        <h1 class="header-title">
          <v-icon color="primary" class="mr-3">mdi-receipt-text-check</v-icon>
          My Transactions
        </h1>
        <p class="header-subtitle">Track your booking transactions and approval status</p>
      </div>
    </div>

    <!-- Main Content -->
    <v-container fluid class="pa-6">
      <!-- Toolbar -->
      <v-card class="mb-4" elevation="2">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                placeholder="Search transactions..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="statusFilter"
                :items="statusOptions"
                item-title="title"
                item-value="value"
                placeholder="All Status"
                variant="outlined"
                density="compact"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="5" class="text-right">
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                @click="fetchTransactions"
                :loading="loading"
                class="mr-2"
              >
                Refresh
              </v-btn>
              <v-btn
                color="success"
                prepend-icon="mdi-calendar-plus"
                @click="$router.push('/bookings')"
              >
                New Booking
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-grey">Loading transactions...</p>
      </div>

      <!-- No Transactions -->
      <v-card v-else-if="filteredTransactions.length === 0" class="text-center py-12" elevation="2">
        <v-icon size="80" color="grey-lighten-1">mdi-receipt-text-remove</v-icon>
        <h3 class="mt-4">No transactions found</h3>
        <p class="text-grey">Your booking transactions will appear here after checkout</p>
      </v-card>

      <!-- Transactions List -->
      <div v-else>
        <v-card
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          class="mb-4 transaction-card"
          :class="{
            'border-warning': transaction.approval_status === 'pending',
            'border-success': transaction.approval_status === 'approved',
            'border-error': transaction.approval_status === 'rejected'
          }"
          elevation="3"
        >
          <!-- Status Banner -->
          <div
            class="status-banner"
            :class="{
              'bg-warning': transaction.approval_status === 'pending',
              'bg-success': transaction.approval_status === 'approved',
              'bg-error': transaction.approval_status === 'rejected'
            }"
          >
            <v-icon size="small" class="mr-2">
              {{ transaction.approval_status === 'approved' ? 'mdi-check-circle' :
                 transaction.approval_status === 'rejected' ? 'mdi-close-circle' : 'mdi-clock-alert' }}
            </v-icon>
            {{ transaction.approval_status.toUpperCase() }}
          </div>

          <v-card-text class="pa-6">
            <!-- Transaction Header -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <h2 class="transaction-title">
                  <v-icon color="primary" class="mr-2">mdi-receipt-text</v-icon>
                  Transaction #{{ transaction.id }}
                </h2>
                <p class="text-caption text-grey mt-1">
                  Created: {{ formatDateTime(transaction.created_at) }}
                </p>
              </v-col>
              <v-col cols="12" md="6" class="text-md-right">
                <v-chip
                  :color="transaction.payment_status === 'paid' ? 'success' : 'warning'"
                  size="large"
                  class="font-weight-bold"
                >
                  <v-icon start>mdi-credit-card-check</v-icon>
                  {{ transaction.payment_status === 'paid' ? 'PAID' : 'UNPAID' }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Transaction Details -->
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <div class="detail-box">
                  <v-icon color="primary" class="mb-2">mdi-account</v-icon>
                  <div class="detail-label">Booked By</div>
                  <div class="detail-value">{{ transaction.user?.name || 'Unknown' }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="detail-box">
                  <v-icon color="success" class="mb-2">mdi-cash</v-icon>
                  <div class="detail-label">Total Amount</div>
                  <div class="detail-value">₱{{ parseFloat(transaction.total_price).toFixed(2) }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="detail-box">
                  <v-icon color="info" class="mb-2">mdi-calendar-clock</v-icon>
                  <div class="detail-label">Total Items</div>
                  <div class="detail-value">{{ transaction.cart_items?.length || 0 }} slots</div>
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="detail-box">
                  <v-icon color="warning" class="mb-2">mdi-cellphone</v-icon>
                  <div class="detail-label">Payment Method</div>
                  <div class="detail-value">{{ transaction.payment_method || 'N/A' }}</div>
                </div>
              </v-col>
            </v-row>

            <!-- Approval Info -->
            <v-row v-if="transaction.approver" class="mb-4">
              <v-col cols="12">
                <v-alert
                  :type="transaction.approval_status === 'approved' ? 'success' : 'error'"
                  variant="tonal"
                  density="compact"
                >
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-account-check</v-icon>
                    <div>
                      <strong>{{ transaction.approval_status === 'approved' ? 'Approved' : 'Rejected' }} by:</strong>
                      {{ transaction.approver.name }}
                      <span class="ml-2 text-caption">
                        on {{ formatDateTime(transaction.approved_at) }}
                      </span>
                    </div>
                  </div>
                  <div v-if="transaction.rejection_reason" class="mt-2">
                    <strong>Reason:</strong> {{ transaction.rejection_reason }}
                  </div>
                </v-alert>
              </v-col>
            </v-row>

            <!-- Cart Items Section -->
            <v-divider class="my-4"></v-divider>

            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-h6">
                <v-icon color="primary" class="mr-2">mdi-cart</v-icon>
                Booking Items
              </h3>
              <v-btn
                variant="text"
                color="primary"
                @click="toggleTransactionDetails(transaction.id)"
              >
                {{ expandedTransactions.includes(transaction.id) ? 'Hide' : 'View' }} Details
                <v-icon end>
                  {{ expandedTransactions.includes(transaction.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
              </v-btn>
            </div>

            <!-- Expanded Cart Items -->
            <v-expand-transition>
              <div v-if="expandedTransactions.includes(transaction.id)">
                <v-card variant="tonal" color="blue-lighten-5" class="mt-3">
                  <v-card-text>
                    <v-list density="compact">
                      <v-list-item
                        v-for="item in transaction.cart_items"
                        :key="item.id"
                        class="cart-item-row"
                      >
                        <template v-slot:prepend>
                          <v-icon :color="getSportColor(item.court?.sport?.name)">
                            {{ getSportIcon(item.court?.sport?.name, item.court?.sport?.icon) }}
                          </v-icon>
                        </template>
                        <v-list-item-title>
                          <strong>{{ item.court?.name }}</strong> - {{ item.court?.sport?.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          📅 {{ formatDate(item.booking_date) }} |
                          🕐 {{ item.start_time }} - {{ item.end_time }} |
                          💰 ₱{{ parseFloat(item.price).toFixed(2) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'BookingsSimple',
  setup() {
    const transactions = ref([])
    const expandedTransactions = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const loading = ref(true)

    const statusOptions = [
      { title: 'All Status', value: '' },
      { title: 'Pending Approval', value: 'pending' },
      { title: 'Approved', value: 'approved' },
      { title: 'Rejected', value: 'rejected' }
    ]

    const filteredTransactions = computed(() => {
      let filtered = transactions.value

      if (statusFilter.value) {
        filtered = filtered.filter(t => t.approval_status === statusFilter.value)
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(t =>
          t.user?.name?.toLowerCase().includes(query) ||
          t.user?.email?.toLowerCase().includes(query) ||
          t.id.toString().includes(query) ||
          t.cart_items?.some(item =>
            item.court?.name?.toLowerCase().includes(query) ||
            item.court?.sport?.name?.toLowerCase().includes(query)
          )
        )
      }

      return filtered
    })

    const fetchTransactions = async () => {
      try {
        loading.value = true
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart-transactions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          transactions.value = await response.json()
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        loading.value = false
      }
    }

    const toggleTransactionDetails = (transactionId) => {
      const index = expandedTransactions.value.indexOf(transactionId)
      if (index > -1) {
        expandedTransactions.value.splice(index, 1)
      } else {
        expandedTransactions.value.push(transactionId)
      }
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return 'N/A'
      return new Date(dateTime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getSportColor = (sportName) => {
      const colors = {
        'Basketball': 'orange',
        'Badminton': 'green',
        'Tennis': 'blue',
        'Volleyball': 'red',
        'Table Tennis': 'teal',
        'Squash': 'indigo'
      }
      return colors[sportName] || 'primary'
    }

    const getSportIcon = (sportName, sportIcon = null) => {
      // Return the icon from Sport model if available
      if (sportIcon) {
        return sportIcon
      }

      // Fallback MDI icons if Sport model doesn't have an icon
      const icons = {
        'Basketball': 'mdi-basketball',
        'Badminton': 'mdi-badminton',
        'Tennis': 'mdi-tennis',
        'Volleyball': 'mdi-volleyball',
        'Table Tennis': 'mdi-table-tennis',
        'Squash': 'mdi-racquetball'
      }
      return icons[sportName] || 'mdi-trophy'
    }

    onMounted(() => {
      fetchTransactions()
    })

    return {
      transactions,
      expandedTransactions,
      searchQuery,
      statusFilter,
      loading,
      statusOptions,
      filteredTransactions,
      fetchTransactions,
      toggleTransactionDetails,
      formatDateTime,
      formatDate,
      getSportColor,
      getSportIcon
    }
  }
}
</script>

<style scoped>
.bookings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.bookings-header {
  background: white;
  padding: 40px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 1.1rem;
  color: #718096;
}

.transaction-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}

.transaction-card:hover {
  transform: translateY(-2px);
}

.transaction-card.border-warning {
  border-left: 5px solid #fb8c00;
}

.transaction-card.border-success {
  border-left: 5px solid #4caf50;
}

.transaction-card.border-error {
  border-left: 5px solid #f44336;
}

.status-banner {
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
}

.transaction-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
}

.detail-box {
  text-align: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.detail-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
}

.cart-item-row {
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 0;
}

.cart-item-row:last-child {
  border-bottom: none;
}
</style>