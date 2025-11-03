# Guide: Splitting Bookings.vue Component

The Bookings.vue file is currently **5,797 lines**, making it extremely difficult to maintain and impacting performance. This guide shows how to split it into manageable components.

## Current Problems

1. **Massive file size**: 5,797 lines in a single component
2. **Multiple responsibilities**: Filtering, display, export, editing, all in one place
3. **Hard to maintain**: Finding and fixing bugs is difficult
4. **Performance**: Large components take longer to compile and mount
5. **Code reuse**: Difficult to reuse parts of functionality

## Proposed Component Structure

```
src/views/
  └── Bookings.vue (main orchestrator, ~300 lines)

src/components/bookings/
  ├── BookingsHeader.vue (~100 lines)
  ├── BookingsFilters.vue (~200 lines)
  ├── BookingsStats.vue (~150 lines)
  ├── BookingsTable.vue (~400 lines)
  ├── BookingsCardView.vue (~400 lines)
  ├── BookingActions.vue (~200 lines)
  └── BookingsExport.vue (~300 lines)
```

## Step-by-Step Migration

### Step 1: Create the component directory

```bash
mkdir -p src/components/bookings
```

### Step 2: Extract the Header Component

**src/components/bookings/BookingsHeader.vue**

```vue
<template>
  <div class="bookings-header">
    <div class="header-content">
      <div class="header-badge">
        <v-icon color="#B71C1C" size="20" class="mr-2">mdi-receipt-text-check</v-icon>
        Transaction Management
      </div>
      <h1 class="header-title">
        <span class="title-gradient">My</span> Transactions
      </h1>
      <p class="header-subtitle">
        Track your booking transactions and approval status
      </p>
      <div class="header-actions">
        <v-btn
          v-if="showNewBookingButton"
          class="header-btn-primary"
          size="x-large"
          prepend-icon="mdi-calendar-plus"
          @click="$emit('open-booking-dialog')"
          elevation="8"
        >
          New Booking
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookingsHeader',
  props: {
    showNewBookingButton: {
      type: Boolean,
      default: false
    }
  },
  emits: ['open-booking-dialog']
}
</script>

<style scoped>
/* Move header-specific styles here */
.bookings-header {
  /* ... styles ... */
}
</style>
```

### Step 3: Extract the Filters Component

**src/components/bookings/BookingsFilters.vue**

```vue
<template>
  <div class="bookings-filters pa-4">
    <!-- Status Filter Chips -->
    <div class="mb-4">
      <div class="text-subtitle-2 mb-2 font-weight-bold">
        Approval Status
        <span v-if="modelValue.status.length > 0" class="text-caption text-grey ml-2">
          ({{ modelValue.status.length }} selected)
        </span>
      </div>
      <v-chip-group
        :model-value="modelValue.status"
        @update:model-value="updateStatus"
        multiple
        selected-class="text-primary"
      >
        <v-chip value="pending" variant="outlined" filter>
          <v-icon start>mdi-clock-alert</v-icon>
          Pending
        </v-chip>
        <v-chip value="approved" variant="outlined" filter>
          <v-icon start>mdi-check-circle</v-icon>
          Approved
        </v-chip>
        <v-chip value="rejected" variant="outlined" filter>
          <v-icon start>mdi-close-circle</v-icon>
          Rejected
        </v-chip>
        <v-chip value="pending_waitlist" variant="outlined" filter>
          <v-icon start>mdi-clock-check</v-icon>
          Waitlist Pending
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Payment Status Filter Chips -->
    <div class="mb-4">
      <div class="text-subtitle-2 mb-2 font-weight-bold">
        Payment Status
        <span v-if="modelValue.paymentStatus.length > 0" class="text-caption text-grey ml-2">
          ({{ modelValue.paymentStatus.length }} selected)
        </span>
      </div>
      <v-chip-group
        :model-value="modelValue.paymentStatus"
        @update:model-value="updatePaymentStatus"
        multiple
        selected-class="text-primary"
      >
        <v-chip value="complete" variant="outlined" filter>
          <v-icon start>mdi-check-circle</v-icon>
          Complete
        </v-chip>
        <v-chip value="missing_proof" variant="outlined" filter>
          <v-icon start>mdi-camera-off</v-icon>
          Missing Proof
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Additional Filters -->
    <v-row>
      <v-col cols="12" sm="6" md="2">
        <v-select
          :model-value="modelValue.sport"
          @update:model-value="updateSport"
          :items="sportOptions"
          label="Filter by Sport"
          prepend-inner-icon="mdi-basketball"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-text-field
          :model-value="modelValue.dateFrom"
          @update:model-value="updateDateFrom"
          label="Booking Date From"
          type="date"
          prepend-inner-icon="mdi-calendar-start"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-text-field
          :model-value="modelValue.dateTo"
          @update:model-value="updateDateTo"
          label="Booking Date To"
          type="date"
          prepend-inner-icon="mdi-calendar-end"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="12" md="2">
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-refresh"
          @click="$emit('refresh')"
          :loading="loading"
          block
        >
          Refresh
        </v-btn>
      </v-col>

      <v-col cols="12" sm="6" md="2">
        <v-btn
          v-if="hasActiveFilters"
          color="error"
          variant="outlined"
          prepend-icon="mdi-filter-remove"
          @click="$emit('clear-filters')"
          block
        >
          Clear Filters
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'BookingsFilters',
  props: {
    modelValue: {
      type: Object,
      required: true,
      default: () => ({
        status: [],
        paymentStatus: [],
        sport: null,
        dateFrom: '',
        dateTo: ''
      })
    },
    sportOptions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'refresh', 'clear-filters'],
  setup(props, { emit }) {
    const hasActiveFilters = computed(() => {
      return props.modelValue.status.length > 0 ||
             props.modelValue.paymentStatus.length > 0 ||
             props.modelValue.sport !== null ||
             props.modelValue.dateFrom !== '' ||
             props.modelValue.dateTo !== ''
    })

    const updateStatus = (value) => {
      emit('update:modelValue', { ...props.modelValue, status: value })
    }

    const updatePaymentStatus = (value) => {
      emit('update:modelValue', { ...props.modelValue, paymentStatus: value })
    }

    const updateSport = (value) => {
      emit('update:modelValue', { ...props.modelValue, sport: value })
    }

    const updateDateFrom = (value) => {
      emit('update:modelValue', { ...props.modelValue, dateFrom: value })
    }

    const updateDateTo = (value) => {
      emit('update:modelValue', { ...props.modelValue, dateTo: value })
    }

    return {
      hasActiveFilters,
      updateStatus,
      updatePaymentStatus,
      updateSport,
      updateDateFrom,
      updateDateTo
    }
  }
}
</script>

<style scoped>
.bookings-filters {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}
</style>
```

### Step 4: Extract Stats Component

**src/components/bookings/BookingsStats.vue**

```vue
<template>
  <v-row v-if="stats" class="mb-4">
    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2">
        <v-card-text>
          <div class="d-flex align-center">
            <v-icon color="warning" size="40" class="mr-3">mdi-clock-alert</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.pending }}</div>
              <div class="text-caption text-grey">Pending</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2">
        <v-card-text>
          <div class="d-flex align-center">
            <v-icon color="success" size="40" class="mr-3">mdi-check-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.approved }}</div>
              <div class="text-caption text-grey">Approved</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2">
        <v-card-text>
          <div class="d-flex align-center">
            <v-icon color="error" size="40" class="mr-3">mdi-close-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.rejected }}</div>
              <div class="text-caption text-grey">Rejected</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card elevation="2">
        <v-card-text>
          <div class="d-flex align-center">
            <v-icon color="primary" size="40" class="mr-3">mdi-currency-php</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ formatCurrency(stats.totalAmount) }}</div>
              <div class="text-caption text-grey">Total Amount</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'BookingsStats',
  props: {
    stats: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount || 0)
    }
  }
}
</script>
```

### Step 5: Update Main Bookings.vue

**src/views/Bookings.vue** (Simplified)

```vue
<template>
  <div class="bookings-container">
    <!-- Header -->
    <BookingsHeader
      :show-new-booking-button="isAdmin || canUsersBook"
      @open-booking-dialog="openBookingDialog"
    />

    <!-- Authentication Check -->
    <div v-if="authLoading" class="auth-section">
      <!-- ... loading state ... -->
    </div>

    <div v-else-if="!isAuthenticated" class="auth-section">
      <!-- ... not authenticated state ... -->
    </div>

    <!-- Main Content -->
    <div v-if="isAuthenticated">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-receipt-text</v-icon>
              My Transactions
            </div>
            <v-chip-group
              v-model="viewMode"
              mandatory
              selected-class="text-primary"
            >
              <v-chip value="cards" variant="outlined" filter>
                <v-icon start>mdi-view-grid-outline</v-icon>
                Cards
              </v-chip>
              <v-chip value="table" variant="outlined" filter>
                <v-icon start>mdi-table</v-icon>
                Data Table
              </v-chip>
            </v-chip-group>
          </div>
        </v-card-title>
        <v-divider></v-divider>

        <!-- Filters Component -->
        <BookingsFilters
          v-model="filters"
          :sport-options="sportOptions"
          :loading="loading"
          @refresh="fetchBookings"
          @clear-filters="clearFilters"
        />

        <!-- Stats Component -->
        <BookingsStats :stats="bookingStats" />

        <!-- Table or Card View -->
        <BookingsTable
          v-if="viewMode === 'table'"
          :bookings="filteredBookings"
          :loading="loading"
          @edit="openEditDialog"
          @view-details="openDetailsDialog"
          @cancel="cancelBooking"
        />

        <BookingsCardView
          v-else
          :bookings="filteredBookings"
          :loading="loading"
          @edit="openEditDialog"
          @view-details="openDetailsDialog"
          @cancel="cancelBooking"
        />
      </v-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { authService } from '../services/authService'
import { bookingService } from '../services/bookingService'
import { companySettingService } from '../services/companySettingService'
import BookingsHeader from '../components/bookings/BookingsHeader.vue'
import BookingsFilters from '../components/bookings/BookingsFilters.vue'
import BookingsStats from '../components/bookings/BookingsStats.vue'
import BookingsTable from '../components/bookings/BookingsTable.vue'
import BookingsCardView from '../components/bookings/BookingsCardView.vue'
import { debounce } from '../utils/debounce'

export default {
  name: 'Bookings',
  components: {
    BookingsHeader,
    BookingsFilters,
    BookingsStats,
    BookingsTable,
    BookingsCardView
  },
  setup() {
    // State
    const user = ref(null)
    const bookings = ref([])
    const loading = ref(false)
    const authLoading = ref(true)
    const viewMode = ref('cards')

    const filters = ref({
      status: ['pending', 'approved'],
      paymentStatus: [],
      sport: null,
      dateFrom: '',
      dateTo: ''
    })

    // Computed
    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const canUsersBook = computed(() => {
      // ... logic
    })

    const filteredBookings = computed(() => {
      // ... filtering logic
    })

    const bookingStats = computed(() => {
      // ... stats calculation
    })

    // Methods
    const fetchBookings = async () => {
      loading.value = true
      try {
        const params = {
          status: filters.value.status,
          payment_status: filters.value.paymentStatus,
          sport_id: filters.value.sport,
          date_from: filters.value.dateFrom,
          date_to: filters.value.dateTo
        }
        const data = await bookingService.getBookings(params)
        bookings.value = data
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
      } finally {
        loading.value = false
      }
    }

    const debouncedFetchBookings = debounce(fetchBookings, 300)

    const clearFilters = () => {
      filters.value = {
        status: ['pending', 'approved'],
        paymentStatus: [],
        sport: null,
        dateFrom: '',
        dateTo: ''
      }
    }

    // Watch filters
    watch(filters, () => {
      debouncedFetchBookings()
    }, { deep: true })

    // Lifecycle
    onMounted(async () => {
      // ... initialization
      await fetchBookings()
    })

    onUnmounted(() => {
      // ... cleanup
    })

    return {
      user,
      bookings,
      loading,
      authLoading,
      viewMode,
      filters,
      isAuthenticated,
      isAdmin,
      canUsersBook,
      filteredBookings,
      bookingStats,
      fetchBookings,
      clearFilters
    }
  }
}
</script>
```

## Migration Checklist

1. **Create component directory**
   - [ ] Create `src/components/bookings/` folder

2. **Extract components one by one**
   - [ ] BookingsHeader.vue
   - [ ] BookingsFilters.vue
   - [ ] BookingsStats.vue
   - [ ] BookingsTable.vue
   - [ ] BookingsCardView.vue
   - [ ] BookingActions.vue
   - [ ] BookingsExport.vue

3. **Test after each extraction**
   - [ ] Component renders correctly
   - [ ] Props work as expected
   - [ ] Events are emitted properly
   - [ ] Styles are applied

4. **Update imports in main Bookings.vue**
   - [ ] Import new components
   - [ ] Replace template sections
   - [ ] Update script logic

5. **Cleanup**
   - [ ] Remove unused code
   - [ ] Update styles
   - [ ] Test entire flow

## Benefits After Splitting

1. **Smaller components**: Each < 500 lines
2. **Easier maintenance**: Clear responsibilities
3. **Better performance**: Faster compilation and mounting
4. **Reusability**: Components can be used elsewhere
5. **Better testing**: Easier to write unit tests
6. **Clearer structure**: Easier for new developers

## Testing Strategy

After splitting:

```bash
# 1. Test the bookings page loads
npm run dev

# 2. Test all functionality works:
- Filters apply correctly
- Table/Card view toggle
- Booking actions (edit, cancel, view)
- Export functionality

# 3. Check for regressions:
- All event handlers work
- Styles are applied correctly
- No console errors
```

## Estimated Time

- **Initial setup**: 1 hour
- **Extract 1 component**: 2-3 hours
- **Test and refine**: 1 hour per component
- **Total for all components**: 2-3 days

## Pro Tips

1. **Start with the easiest**: Header component first
2. **Test frequently**: After each component extraction
3. **Use props validation**: Helps catch errors early
4. **Keep styles scoped**: Prevents conflicts
5. **Document props**: Makes components easier to use
