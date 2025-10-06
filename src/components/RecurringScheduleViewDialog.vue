<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('update:isOpen', $event)"
    max-width="800px"
    persistent
  >
    <v-card class="schedule-view-dialog-card">
      <div class="dialog-header">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-calendar-repeat</v-icon>
          Schedule Details
        </div>
        <h2 class="dialog-title">
          <span class="title-gradient">Recurring</span> Schedule Details
        </h2>
        <p class="dialog-subtitle">
          View comprehensive information about your recurring booking schedule
        </p>
      </div>
      <v-divider class="dialog-divider"></v-divider>

      <v-card-text v-if="booking" class="pa-6 pt-0">
        <!-- Basic Information -->
        <v-row class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Basic Information</h3>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Schedule Name</v-list-item-title>
                <v-list-item-subtitle>{{ booking.recurring_schedule }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Court</v-list-item-title>
                <v-list-item-subtitle>{{ booking.court?.name || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Period</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(booking.start_time) }} - {{ formatDate(booking.end_time) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="booking.notes">
                <v-list-item-title>Notes</v-list-item-title>
                <v-list-item-subtitle>{{ booking.notes }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <!-- Recurring Schedule Configuration -->
        <v-row v-if="booking.recurring_schedule_data" class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Recurring Configuration</h3>
            <v-card variant="outlined">
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="mb-2">
                      <strong>Recurrence Type:</strong>
                      <v-chip 
                        :color="getRecurrenceTypeColor(booking.recurring_schedule_data.recurrence_type)"
                        variant="tonal"
                        size="small"
                        class="ml-2"
                      >
                        {{ formatRecurrenceType(booking.recurring_schedule_data.recurrence_type) }}
                      </v-chip>
                    </div>
                    <div class="mb-2">
                      <strong>Interval:</strong> Every {{ booking.recurring_schedule_data.recurrence_interval || 1 }} 
                      {{ getIntervalSuffix(booking.recurring_schedule_data.recurrence_type) }}
                    </div>
                    <div class="mb-2">
                      <strong>Auto Approve:</strong>
                      <v-chip 
                        :color="booking.recurring_schedule_data.auto_approve ? 'success' : 'warning'"
                        variant="tonal"
                        size="small"
                        class="ml-2"
                      >
                        {{ booking.recurring_schedule_data.auto_approve ? 'Yes' : 'No' }}
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="mb-2">
                      <strong>Start Date:</strong> {{ formatDate(booking.recurring_schedule_data.start_date) }}
                    </div>
                    <div class="mb-2">
                      <strong>End Date:</strong> {{ formatDate(booking.recurring_schedule_data.end_date) || 'No end date' }}
                    </div>
                    <div class="mb-2" v-if="booking.recurring_schedule_data.max_occurrences">
                      <strong>Max Occurrences:</strong> {{ booking.recurring_schedule_data.max_occurrences }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Day-Specific Times -->
        <v-row v-if="hasDaySpecificTimes" class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Schedule Times for Each Day</h3>
            <v-card variant="outlined">
              <v-card-text>
                <v-list density="compact">
                  <v-list-item
                    v-for="(dayTime, index) in booking.recurring_schedule_data.day_specific_times"
                    :key="index"
                    class="mb-2"
                  >
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-calendar-clock</v-icon>
                    </template>
                    <v-list-item-title>
                      {{ getDayName(dayTime.day) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ dayTime.start_time }} - {{ dayTime.end_time }}
                      ({{ calculateDuration(dayTime.start_time, dayTime.end_time) }}h)
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Regular Recurrence Days -->
        <v-row v-else-if="hasRecurrenceDays" class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Recurring Days</h3>
            <v-card variant="outlined">
              <v-card-text>
                <div class="mb-2">
                  <strong>Days of Week:</strong>
                  <v-chip
                    v-for="day in booking.recurring_schedule_data.recurrence_days"
                    :key="day"
                    color="primary"
                    variant="tonal"
                    size="small"
                    class="ml-2"
                  >
                    {{ getDayName(day) }}
                  </v-chip>
                </div>
                <div v-if="booking.recurring_schedule_data.start_time && booking.recurring_schedule_data.end_time">
                  <strong>Time:</strong> {{ booking.recurring_schedule_data.start_time }} - {{ booking.recurring_schedule_data.end_time }}
                  ({{ calculateDuration(booking.recurring_schedule_data.start_time, booking.recurring_schedule_data.end_time) }}h)
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Summary -->
        <v-row>
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Summary</h3>
            <v-alert
              type="info"
              variant="tonal"
              class="mb-0"
            >
              <v-icon class="mr-2">mdi-information</v-icon>
              This recurring schedule will create individual bookings for each occurrence based on the configuration above.
              {{ getSummaryText() }}
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="elevated"
          @click="closeDialog"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'RecurringScheduleViewDialog',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    booking: {
      type: Object,
      default: null
    }
  },
  emits: ['update:isOpen'],
  setup(props, { emit }) {
    const closeDialog = () => {
      emit('update:isOpen', false)
    }

    const hasDaySpecificTimes = computed(() => {
      return props.booking?.recurring_schedule_data?.day_specific_times?.length > 0
    })

    const hasRecurrenceDays = computed(() => {
      return props.booking?.recurring_schedule_data?.recurrence_days?.length > 0
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatRecurrenceType = (type) => {
      const types = {
        daily: 'Daily',
        weekly: 'Weekly',
        weekly_multiple_times: 'Weekly (Multiple Times)',
        monthly: 'Monthly',
        yearly: 'Yearly',
        yearly_multiple_times: 'Yearly (Multiple Times)'
      }
      return types[type] || type
    }

    const getRecurrenceTypeColor = (type) => {
      const colors = {
        daily: 'blue',
        weekly: 'green',
        weekly_multiple_times: 'purple',
        monthly: 'orange',
        yearly: 'red',
        yearly_multiple_times: 'deep-purple'
      }
      return colors[type] || 'grey'
    }

    const getIntervalSuffix = (type) => {
      const suffixes = {
        daily: 'day(s)',
        weekly: 'week(s)',
        weekly_multiple_times: 'week(s)',
        monthly: 'month(s)',
        yearly: 'year(s)',
        yearly_multiple_times: 'year(s)'
      }
      return suffixes[type] || 'time(s)'
    }

    const getDayName = (dayNumber) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[dayNumber] || 'Unknown'
    }

    const calculateDuration = (startTime, endTime) => {
      if (!startTime || !endTime) return 0
      const start = new Date(`2000-01-01 ${startTime}`)
      const end = new Date(`2000-01-01 ${endTime}`)
      const diffMs = end - start
      const diffHours = diffMs / (1000 * 60 * 60)
      return diffHours.toFixed(1)
    }

    const getSummaryText = () => {
      if (!props.booking?.recurring_schedule_data) return ''
      
      const data = props.booking.recurring_schedule_data
      const type = data.recurrence_type
      
      if (['weekly_multiple_times', 'yearly_multiple_times'].includes(type) && data.day_specific_times) {
        const totalHours = data.day_specific_times.reduce((total, dayTime) => {
          return total + parseFloat(calculateDuration(dayTime.start_time, dayTime.end_time))
        }, 0)
        return `Total of ${data.day_specific_times.length} different time slots per ${type.includes('weekly') ? 'week' : 'year'}, totaling ${totalHours.toFixed(1)} hours.`
      } else if (data.recurrence_days && data.recurrence_days.length > 0) {
        const dayNames = data.recurrence_days.map(day => getDayName(day)).join(', ')
        return `Scheduled for ${dayNames}${data.start_time && data.end_time ? ` at ${data.start_time}-${data.end_time}` : ''}.`
      } else {
        return `Scheduled ${type}${data.start_time && data.end_time ? ` at ${data.start_time}-${data.end_time}` : ''}.`
      }
    }

    return {
      closeDialog,
      hasDaySpecificTimes,
      hasRecurrenceDays,
      formatDate,
      formatRecurrenceType,
      getRecurrenceTypeColor,
      getIntervalSuffix,
      getDayName,
      calculateDuration,
      getSummaryText
    }
  }
}
</script>

<style scoped>
/* Modern Sports Schedule View Dialog Theme */
.schedule-view-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}

.dialog-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 32px;
  text-align: center;
  position: relative;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
  z-index: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 16px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

.dialog-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  color: white;
  position: relative;
  z-index: 2;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dialog-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}

.dialog-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
  margin: 0 !important;
}

.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>