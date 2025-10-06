<template>
  <div class="excel-container">
    <!-- Badminton Background -->
    <div class="badminton-background">
      <div class="badminton-overlay"></div>
    </div>
    
    <!-- Excel-like Header -->
    <div class="excel-header">
      <div class="excel-title-section">
        <h1 class="excel-title">Recurring Schedules</h1>
        <p class="excel-subtitle">Set up regular badminton court bookings for the whole year</p>
      </div>
      <div class="excel-actions">
        <v-btn
          color="primary"
          size="large"
          prepend-icon="mdi-calendar-plus"
          @click="openCreateDialog"
          class="excel-add-btn"
        >
          Create Recurring Schedule
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="excel-loading">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="excel-loading-text">Loading recurring schedules...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="excel-error">
      <v-alert type="error" variant="tonal">
        {{ error }}
      </v-alert>
    </div>

    <!-- Schedules Table -->
    <div v-else class="excel-table-container">
      <v-data-table
        :headers="headers"
        :items="schedules"
        :loading="loading"
        :items-per-page="15"
        class="excel-data-table"
        no-data-text="No recurring schedules found"
        loading-text="Loading schedules..."
      >
        <!-- Title Column -->
        <template v-slot:[`item.title`]="{ item }">
          <div class="excel-cell-content">
            <div class="excel-cell-icon">🔄</div>
            <div class="excel-cell-text">
              <div class="excel-cell-title">{{ item.title }}</div>
              <div class="excel-cell-subtitle">{{ item.description || 'No description' }}</div>
            </div>
          </div>
        </template>

        <!-- Court Column -->
        <template v-slot:[`item.court.name`]="{ item }">
          <div class="excel-cell-content">
            <div class="excel-cell-icon">🏟️</div>
            <div class="excel-cell-text">
              <div class="excel-cell-title">{{ item.court.name }}</div>
              <div class="excel-cell-subtitle">{{ item.court.sport.name }}</div>
            </div>
          </div>
        </template>

        <!-- Time Column -->
        <template v-slot:[`item.start_time`]="{ item }">
          <div class="excel-time-info">
            <div class="excel-time">{{ formatTime(item.start_time) }} - {{ formatTime(item.end_time) }}</div>
            <div class="excel-duration">{{ item.duration_hours }}h</div>
          </div>
        </template>

        <!-- Recurrence Column -->
        <template v-slot:[`item.recurrence_type`]="{ item }">
          <div class="excel-recurrence">
            <v-chip
              :color="getRecurrenceColor(item.recurrence_type)"
              variant="tonal"
              size="small"
              class="excel-recurrence-chip"
            >
              {{ formatRecurrence(item) }}
            </v-chip>
          </div>
        </template>

        <!-- Status Column -->
        <template v-slot:[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            variant="tonal"
            size="small"
            class="excel-status-chip"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="excel-actions-cell">
            <v-btn
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-eye"
              @click="viewSchedule(item)"
              class="excel-action-btn"
            >
              View
            </v-btn>
            <v-btn
              color="warning"
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil"
              @click="editSchedule(item)"
              class="excel-action-btn"
            >
              Edit
            </v-btn>
            <v-btn
              color="success"
              variant="tonal"
              size="small"
              prepend-icon="mdi-calendar-plus"
              @click="generateBookings(item)"
              class="excel-action-btn"
            >
              Generate
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              size="small"
              prepend-icon="mdi-delete"
              @click="deleteSchedule(item)"
              class="excel-action-btn"
            >
              Delete
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Create/Edit Dialog -->
    <RecurringScheduleDialog
      :is-open="dialogOpen"
      :schedule="selectedSchedule"
      :courts="courts"
      @close="closeDialog"
      @saved="handleScheduleSaved"
      @update:is-open="dialogOpen = $event"
    />

    <!-- View Dialog -->
    <RecurringScheduleViewDialog
      :is-open="viewDialogOpen"
      :schedule="selectedSchedule"
      @close="closeViewDialog"
      @update:is-open="viewDialogOpen = $event"
    />

    <!-- Generate Bookings Dialog -->
    <v-dialog v-model="generateDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">
          <v-icon class="mr-2" color="success">mdi-calendar-plus</v-icon>
          Generate Bookings
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-4">
            Generate bookings for "{{ selectedSchedule?.title }}" for the next few months:
          </p>
          <v-select
            v-model="generateMonths"
            :items="monthOptions"
            label="Number of months"
            variant="outlined"
            prepend-inner-icon="mdi-calendar-range"
          ></v-select>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="generateDialogOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            @click="confirmGenerateBookings"
            :loading="generating"
          >
            Generate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { recurringScheduleService } from '../services/recurringScheduleService'
import { courtService } from '../services/courtService'
import RecurringScheduleDialog from '../components/RecurringScheduleDialog.vue'
import RecurringScheduleViewDialog from '../components/RecurringScheduleViewDialog.vue'

export default {
  name: 'RecurringSchedules',
  components: {
    RecurringScheduleDialog,
    RecurringScheduleViewDialog
  },
  setup() {
    const schedules = ref([])
    const courts = ref([])
    const loading = ref(false)
    const error = ref(null)
    const dialogOpen = ref(false)
    const viewDialogOpen = ref(false)
    const generateDialogOpen = ref(false)
    const selectedSchedule = ref(null)
    const generating = ref(false)
    const generateMonths = ref(3)

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const headers = [
      { title: 'Title', key: 'title', sortable: true, width: '25%' },
      { title: 'Court', key: 'court.name', sortable: true, width: '20%' },
      { title: 'Time', key: 'start_time', sortable: true, width: '15%' },
      { title: 'Recurrence', key: 'recurrence_type', sortable: true, width: '15%' },
      { title: 'Status', key: 'is_active', sortable: true, width: '10%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '15%' }
    ]

    const monthOptions = [
      { title: '1 month', value: 1 },
      { title: '2 months', value: 2 },
      { title: '3 months', value: 3 },
      { title: '6 months', value: 6 },
      { title: '12 months', value: 12 }
    ]

    const fetchData = async () => {
      try {
        loading.value = true
        const [schedulesData, courtsData] = await Promise.all([
          recurringScheduleService.getRecurringSchedules(),
          courtService.getCourts()
        ])
        schedules.value = schedulesData.data
        courts.value = courtsData
      } catch (err) {
        error.value = err.message
        showSnackbar('Failed to load recurring schedules', 'error')
      } finally {
        loading.value = false
      }
    }

    const openCreateDialog = () => {
      selectedSchedule.value = null
      dialogOpen.value = true
    }

    const editSchedule = (schedule) => {
      selectedSchedule.value = schedule
      dialogOpen.value = true
    }

    const viewSchedule = (schedule) => {
      selectedSchedule.value = schedule
      viewDialogOpen.value = true
    }

    const generateBookings = (schedule) => {
      selectedSchedule.value = schedule
      generateDialogOpen.value = true
    }

    const confirmGenerateBookings = async () => {
      try {
        generating.value = true
        await recurringScheduleService.generateBookings(selectedSchedule.value.id, generateMonths.value)
        showSnackbar(`Generated bookings for the next ${generateMonths.value} months`, 'success')
        generateDialogOpen.value = false
        await fetchData()
      } catch (err) {
        showSnackbar('Failed to generate bookings', 'error')
      } finally {
        generating.value = false
      }
    }

    const deleteSchedule = async (schedule) => {
      if (confirm(`Are you sure you want to delete "${schedule.title}"? This will also cancel all future bookings from this schedule.`)) {
        try {
          await recurringScheduleService.deleteRecurringSchedule(schedule.id)
          showSnackbar('Recurring schedule deleted successfully', 'success')
          await fetchData()
        } catch (err) {
          showSnackbar('Failed to delete recurring schedule', 'error')
        }
      }
    }

    const closeDialog = () => {
      dialogOpen.value = false
      selectedSchedule.value = null
    }

    const closeViewDialog = () => {
      viewDialogOpen.value = false
      selectedSchedule.value = null
    }

    const handleScheduleSaved = () => {
      showSnackbar('Recurring schedule saved successfully', 'success')
      closeDialog()
      fetchData()
    }

    const formatTime = (timeString) => {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const formatRecurrence = (schedule) => {
      return recurringScheduleService.formatRecurrenceDays(
        schedule.recurrence_days, 
        schedule.recurrence_type
      )
    }

    const getRecurrenceColor = (type) => {
      const colors = {
        daily: 'blue',
        weekly: 'green',
        monthly: 'orange',
        yearly: 'purple'
      }
      return colors[type] || 'grey'
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    onMounted(() => {
      fetchData()
    })

    return {
      schedules,
      courts,
      loading,
      error,
      dialogOpen,
      viewDialogOpen,
      generateDialogOpen,
      selectedSchedule,
      generating,
      generateMonths,
      snackbar,
      headers,
      monthOptions,
      fetchData,
      openCreateDialog,
      editSchedule,
      viewSchedule,
      generateBookings,
      confirmGenerateBookings,
      deleteSchedule,
      closeDialog,
      closeViewDialog,
      handleScheduleSaved,
      formatTime,
      formatRecurrence,
      getRecurrenceColor,
      showSnackbar
    }
  }
}
</script>

<style scoped>
.excel-container {
  background: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
  position: relative;
}

.badminton-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: -2;
}

.badminton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(240, 249, 255, 0.85);
  z-index: -1;
}

.excel-header {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px 8px 0 0;
  padding: 20px 24px;
  margin-bottom: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.excel-title-section {
  flex: 1;
}

.excel-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.excel-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.excel-actions {
  display: flex;
  gap: 12px;
}

.excel-add-btn {
  font-size: 14px !important;
  text-transform: none !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
}

.excel-loading {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  padding: 60px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-loading-text {
  margin-top: 16px;
  color: #6b7280;
  font-size: 16px;
}

.excel-error {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-table-container {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-data-table {
  border: none !important;
}

.excel-cell-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.excel-cell-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 6px;
}

.excel-cell-text {
  flex: 1;
}

.excel-cell-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.excel-cell-subtitle {
  color: #6b7280;
  font-size: 12px;
  margin-top: 2px;
}

.excel-time-info {
  text-align: center;
}

.excel-time {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.excel-duration {
  color: #6b7280;
  font-size: 12px;
  margin-top: 2px;
}

.excel-recurrence {
  text-align: center;
}

.excel-recurrence-chip {
  font-size: 12px !important;
}

.excel-status-chip {
  font-size: 12px !important;
}

.excel-actions-cell {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.excel-action-btn {
  font-size: 12px !important;
  text-transform: none !important;
  min-width: auto !important;
  padding: 0 8px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .excel-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .excel-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .excel-actions-cell {
    flex-direction: column;
  }
}
</style>
