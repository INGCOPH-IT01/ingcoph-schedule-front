<template>
  <div class="holiday-management">
    <!-- Header -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-calendar-star</v-icon>
          Business Hours Configuration
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Holiday</span> Management
        </h1>
        <p class="header-subtitle">
          Manage holidays that affect booking expiration times
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <v-row class="justify-center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="settings-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon class="mr-2" color="primary">mdi-calendar-star</v-icon>
              Holidays
            </div>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon class="mr-2">mdi-plus</v-icon>
              Add Holiday
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Info Alert -->
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-4">
              <div class="d-flex align-start">
                <v-icon class="mr-3">mdi-information</v-icon>
                <div>
                  <div class="font-weight-bold mb-1">Business Hours Expiration</div>
                  <div class="text-body-2">
                    Holidays affect booking expiration timers. Bookings created after 5pm or on holidays/Sundays
                    will start their 1-hour expiration timer at 8am on the next working day.
                  </div>
                </div>
              </div>
            </v-alert>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-4 text-grey">Loading holidays...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="holidays.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
              <p class="mt-4 text-grey">No holidays configured</p>
              <p class="text-grey-lighten-1">Add holidays to affect expiration timing</p>
            </div>

            <!-- Holidays List -->
            <div v-else>
              <v-list>
                <v-list-item
                  v-for="holiday in holidays"
                  :key="holiday.id"
                  class="holiday-item"
                >
                  <template v-slot:prepend>
                    <v-icon :color="holiday.is_recurring ? 'warning' : 'primary'" class="mr-3">
                      {{ holiday.is_recurring ? 'mdi-calendar-repeat' : 'mdi-calendar-check' }}
                    </v-icon>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ holiday.name }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ formatDate(holiday.date) }}
                    <v-chip
                      v-if="holiday.is_recurring"
                      size="x-small"
                      color="warning"
                      variant="flat"
                      class="ml-2"
                    >
                      Recurring
                    </v-chip>
                    <v-chip
                      v-if="holiday.no_business_operations"
                      size="x-small"
                      color="error"
                      variant="flat"
                      class="ml-2"
                    >
                      No Operations
                    </v-chip>
                    <v-chip
                      v-else-if="holiday.sport_pricing && holiday.sport_pricing.length > 0"
                      size="x-small"
                      color="success"
                      variant="flat"
                      class="ml-2"
                    >
                      {{ holiday.sport_pricing.length }} sport price{{ holiday.sport_pricing.length > 1 ? 's' : '' }} set
                    </v-chip>
                  </v-list-item-subtitle>

                  <v-list-item-subtitle v-if="holiday.description" class="mt-1">
                    {{ holiday.description }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn
                      v-if="!holiday.no_business_operations"
                      icon="mdi-currency-usd"
                      size="small"
                      variant="text"
                      color="success"
                      title="Set Holiday Pricing"
                      @click="openPricingDialog(holiday)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="openEditDialog(holiday)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="confirmDelete(holiday)"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="600px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">{{ editingHoliday ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingHoliday ? 'Edit Holiday' : 'Add Holiday' }}
        </v-card-title>

        <v-card-text class="pt-6">
          <v-form ref="holidayForm" v-model="formValid">
            <v-text-field
              v-model="formData.name"
              label="Holiday Name"
              :rules="[v => !!v || 'Name is required']"
              required
              variant="outlined"
            ></v-text-field>

            <v-text-field
              v-model="formData.date"
              label="Date"
              type="date"
              :rules="[v => !!v || 'Date is required']"
              required
              variant="outlined"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              label="Description (Optional)"
              rows="3"
              variant="outlined"
            ></v-textarea>

            <v-checkbox
              v-model="formData.is_recurring"
              label="Recurring Holiday (repeats every year)"
              color="primary"
            ></v-checkbox>

            <v-alert v-if="formData.is_recurring" type="info" variant="tonal" density="compact">
              This holiday will automatically apply to the same date every year
            </v-alert>

            <v-checkbox
              v-model="formData.no_business_operations"
              label="No Business Operations"
              color="error"
              class="mt-2"
            ></v-checkbox>

            <v-alert v-if="formData.no_business_operations" type="warning" variant="tonal" density="compact">
              The business will be completely closed on this date with no operations
            </v-alert>
          </v-form>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
            {{ errorMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!formValid"
            @click="saveHoliday"
          >
            {{ editingHoliday ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Holiday Sport Pricing Dialog -->
    <v-dialog v-model="pricingDialogOpen" max-width="640px">
      <v-card>
        <v-card-title class="bg-success text-white">
          <v-icon class="mr-2">mdi-currency-usd</v-icon>
          Holiday Pricing — {{ pricingHoliday?.name }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            Set special pricing per sport for <strong>{{ pricingHoliday ? formatDate(pricingHoliday.date) : '' }}</strong>.
            Leave a field blank to use the sport's regular pricing on this day.
          </v-alert>

          <div v-if="pricingLoading" class="text-center py-6">
            <v-progress-circular indeterminate color="success"></v-progress-circular>
          </div>

          <v-table v-else density="comfortable">
            <thead>
              <tr>
                <th>Sport</th>
                <th>Holiday Price / hr</th>
                <th class="text-caption text-grey">Regular Price / hr</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pricingRows" :key="row.sport_id">
                <td>
                  <div class="d-flex align-center">
                    <v-icon size="18" class="mr-2" color="primary">mdi-stadium</v-icon>
                    {{ row.sport_name }}
                  </div>
                </td>
                <td style="width: 180px">
                  <v-text-field
                    v-model="row.price_per_hour"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Use default"
                    prefix="₱"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="my-1"
                  ></v-text-field>
                </td>
                <td class="text-grey text-caption">
                  ₱{{ Number(row.default_price).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-alert v-if="pricingError" type="error" variant="tonal" class="mt-4">
            {{ pricingError }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="pricingDialogOpen = false">Cancel</v-btn>
          <v-btn
            color="success"
            :loading="pricingSaving"
            @click="savePricing"
          >
            Save Pricing
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ deleteTarget?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteHoliday">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="successSnackbar" color="success" timeout="3000">
      {{ successMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { courtService } from '../services/courtService'

const holidays = ref([])
const loading = ref(false)
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingHoliday = ref(null)
const deleteTarget = ref(null)
const saving = ref(false)
const deleting = ref(false)
const formValid = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const successSnackbar = ref(false)
const holidayForm = ref(null)

const formData = ref({
  name: '',
  date: '',
  description: '',
  is_recurring: false,
  no_business_operations: false
})

// Pricing dialog state
const pricingDialogOpen = ref(false)
const pricingHoliday = ref(null)
const pricingRows = ref([])
const pricingLoading = ref(false)
const pricingSaving = ref(false)
const pricingError = ref('')

// Load holidays
const loadHolidays = async () => {
  loading.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/holidays`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      holidays.value = data.data || []
    } else {
      errorMessage.value = 'Failed to load holidays'
    }
  } catch (error) {
    errorMessage.value = 'Error loading holidays'
  } finally {
    loading.value = false
  }
}

// Open create dialog
const openCreateDialog = () => {
  editingHoliday.value = null
  formData.value = {
    name: '',
    date: '',
    description: '',
    is_recurring: false,
    no_business_operations: false
  }
  errorMessage.value = ''
  dialogOpen.value = true
}

// Open edit dialog
const openEditDialog = (holiday) => {
  editingHoliday.value = holiday
  formData.value = {
    name: holiday.name,
    date: holiday.date,
    description: holiday.description || '',
    is_recurring: holiday.is_recurring,
    no_business_operations: holiday.no_business_operations || false
  }
  errorMessage.value = ''
  dialogOpen.value = true
}

// Close dialog
const closeDialog = () => {
  dialogOpen.value = false
  editingHoliday.value = null
  formData.value = {
    name: '',
    date: '',
    description: '',
    is_recurring: false,
    no_business_operations: false
  }
  errorMessage.value = ''
}

// Save holiday
const saveHoliday = async () => {
  if (!formValid.value) return

  saving.value = true
  errorMessage.value = ''

  try {
    const url = editingHoliday.value
      ? `${import.meta.env.VITE_API_URL}/api/admin/holidays/${editingHoliday.value.id}`
      : `${import.meta.env.VITE_API_URL}/api/admin/holidays`

    const method = editingHoliday.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = editingHoliday.value ? 'Holiday updated successfully' : 'Holiday created successfully'
      successSnackbar.value = true
      closeDialog()
      loadHolidays()
    } else {
      errorMessage.value = data.message || 'Failed to save holiday'
    }
  } catch (error) {
    errorMessage.value = 'Error saving holiday'
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (holiday) => {
  deleteTarget.value = holiday
  deleteDialogOpen.value = true
}

// Delete holiday
const deleteHoliday = async () => {
  if (!deleteTarget.value) return

  deleting.value = true

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/holidays/${deleteTarget.value.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      }
    )

    if (response.ok) {
      successMessage.value = 'Holiday deleted successfully'
      successSnackbar.value = true
      deleteDialogOpen.value = false
      deleteTarget.value = null
      loadHolidays()
    } else {
      const data = await response.json()
      errorMessage.value = data.message || 'Failed to delete holiday'
    }
  } catch (error) {
    errorMessage.value = 'Error deleting holiday'
  } finally {
    deleting.value = false
  }
}

// Open pricing dialog — load all sports, pre-fill any existing overrides
const openPricingDialog = async (holiday) => {
  pricingHoliday.value = holiday
  pricingDialogOpen.value = true
  pricingLoading.value = true
  pricingError.value = ''
  pricingRows.value = []

  try {
    const [sports, existingRes] = await Promise.all([
      courtService.getSports(),
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/holidays/${holiday.id}/sport-pricing`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      })
    ])

    const existingData = await existingRes.json()
    const existing = existingData.success ? existingData.data : []

    pricingRows.value = sports.map(sport => {
      const override = existing.find(e => e.sport_id === sport.id)
      return {
        sport_id: sport.id,
        sport_name: sport.name,
        default_price: sport.price_per_hour,
        price_per_hour: override ? String(override.price_per_hour) : ''
      }
    })
  } catch (err) {
    pricingError.value = 'Failed to load pricing data'
  } finally {
    pricingLoading.value = false
  }
}

// Save holiday sport pricing
const savePricing = async () => {
  pricingSaving.value = true
  pricingError.value = ''

  try {
    const payload = pricingRows.value.map(row => ({
      sport_id: row.sport_id,
      price_per_hour: row.price_per_hour === '' ? null : parseFloat(row.price_per_hour)
    }))

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/holidays/${pricingHoliday.value.id}/sport-pricing`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ pricing: payload })
      }
    )

    const data = await response.json()

    if (response.ok) {
      successMessage.value = 'Holiday pricing saved successfully'
      successSnackbar.value = true
      pricingDialogOpen.value = false
      loadHolidays()
    } else {
      pricingError.value = data.message || 'Failed to save pricing'
    }
  } catch (err) {
    pricingError.value = 'Error saving pricing'
  } finally {
    pricingSaving.value = false
  }
}

// Format date
const formatDate = (date) => {
  if (!date) return ''

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/
  let d
  if (dateOnlyPattern.test(date)) {
    const [year, month, day] = date.split('-').map(Number)
    d = new Date(year, month - 1, day)
  } else {
    d = new Date(date)
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadHolidays()
})
</script>

<style scoped>
.holiday-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.5rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.header-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.title-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.settings-card {
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.holiday-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1rem;
}

.holiday-item:last-child {
  border-bottom: none;
}
</style>
