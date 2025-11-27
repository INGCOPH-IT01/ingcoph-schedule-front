<template>
  <v-dialog :model-value="isOpen" @update:model-value="$emit('update:isOpen', $event)" max-width="800" persistent fullscreen-on-mobile>
    <v-card class="recurring-dialog-card">
      <div class="dialog-header">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-calendar-repeat</v-icon>
          {{ isEditing ? 'Schedule Management' : 'New Schedule' }}
        </div>
        <h2 class="dialog-title">
          <span class="title-gradient">{{ isEditing ? 'Edit' : 'Create' }}</span> Recurring Schedule
        </h2>
        <p class="dialog-subtitle">
          {{ isEditing ? 'Update your recurring booking schedule' : 'Set up automated recurring bookings for your court sessions' }}
        </p>
      </div>
      <v-divider class="dialog-divider"></v-divider>

      <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <v-row>
            <!-- Title -->
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                label="Schedule Title"
                placeholder="e.g., Weekly Sports Practice"
                variant="outlined"
                prepend-inner-icon="mdi-format-title"
                :rules="[v => !!v || 'Title is required']"
                required
              ></v-text-field>
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description (Optional)"
                placeholder="Describe your recurring schedule..."
                variant="outlined"
                prepend-inner-icon="mdi-text"
                rows="3"
              ></v-textarea>
            </v-col>

            <!-- Court Selection -->
            <v-col cols="12">
              <v-select
                v-model="form.court_id"
                :items="courts"
                item-title="name"
                item-value="id"
                label="Select Court"
                variant="outlined"
                prepend-inner-icon="mdi-racquetball"
                :rules="[v => !!v || 'Court is required']"
                required
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>🏟️</v-icon>
                    </template>
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.sport.name }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Time Selection (for non-multiple times types) -->
            <v-col v-if="!['weekly_multiple_times', 'yearly_multiple_times'].includes(form.recurrence_type)" cols="6">
              <v-text-field
                v-model="form.start_time"
                label="Start Time"
                type="time"
                variant="outlined"
                prepend-inner-icon="mdi-clock-start"
                :rules="[v => !!v || 'Start time is required']"
                required
              ></v-text-field>
            </v-col>

            <v-col v-if="!['weekly_multiple_times', 'yearly_multiple_times'].includes(form.recurrence_type)" cols="6">
              <v-text-field
                v-model="form.end_time"
                label="End Time"
                type="time"
                variant="outlined"
                prepend-inner-icon="mdi-clock-end"
                :rules="[
                  v => !!v || 'End time is required',
                  v => v > form.start_time || 'End time must be after start time'
                ]"
                required
              ></v-text-field>
            </v-col>

            <!-- Recurrence Type -->
            <v-col cols="12">
              <v-select
                v-model="form.recurrence_type"
                :items="recurrenceTypeOptions"
                label="Recurrence Type"
                variant="outlined"
                prepend-inner-icon="mdi-repeat"
                :rules="[v => !!v || 'Recurrence type is required']"
                required
                item-title="label"
                item-value="value"
                clearable
                @update:model-value="handleRecurrenceTypeChange"
              >
                <template v-slot:append>
                  <v-btn
                    icon="mdi-refresh"
                    variant="text"
                    size="small"
                    @click="resetRecurrenceType"
                    title="Reset Recurrence Type"
                  ></v-btn>
                </template>
              </v-select>
            </v-col>

            <!-- Days of Week (for weekly) -->
            <v-col v-if="form.recurrence_type === 'weekly'" cols="12">
              <v-autocomplete
                v-model="form.recurrence_days"
                :items="dayOfWeekOptions"
                label="Days of Week"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-week"
                multiple
                chips
                :rules="[v => v && v.length > 0 || 'Select at least one day']"
                required
                item-title="label"
                item-value="value"
              ></v-autocomplete>
            </v-col>

            <!-- Day-Specific Times (for weekly_multiple_times) -->
            <v-col v-if="['yearly_multiple_times','weekly_multiple_times'].includes(form.recurrence_type)" cols="12">
              <div class="mb-4">
                <h3 class="text-h6 mb-3">Schedule Different Times for Each Day</h3>
                <p class="text-body-2 text-grey-darken-1 mb-4">
                  Select days and set specific times for each day (e.g., Sunday 8-10 AM, Tuesday 2-4 PM, Friday 6-8 PM)
                </p>

                <div v-for="(dayTime, index) in form.day_specific_times" :key="`day-${index}`" class="mb-4">
                  <v-card variant="outlined" class="pa-4">
                    <v-row>
                        <v-col cols="12" md="3">
                          <v-autocomplete
                            v-model="dayTime.day"
                            :items="dayOfWeekOptions"
                            label="Day"
                            variant="outlined"
                            prepend-inner-icon="mdi-calendar"
                            :rules="[v => v !== null || 'Select a day']"
                            required
                            item-title="label"
                            item-value="value"
                          ></v-autocomplete>
                        </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field
                          v-model="dayTime.start_time"
                          label="Start Time"
                          type="time"
                          variant="outlined"
                          prepend-inner-icon="mdi-clock-start"
                          :rules="[
                            v => !!v || 'Start time is required',
                            v => !dayTime.end_time || v < dayTime.end_time || 'Start time must be before end time'
                          ]"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3">
                        <v-text-field
                          v-model="dayTime.end_time"
                          label="End Time"
                          type="time"
                          variant="outlined"
                          prepend-inner-icon="mdi-clock-end"
                          :rules="[
                            v => !!v || 'End time is required',
                            v => !dayTime.start_time || v > dayTime.start_time || 'End time must be after start time'
                          ]"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" md="3" class="d-flex align-center">
                        <v-btn
                          color="error"
                          variant="tonal"
                          icon="mdi-delete"
                          @click="removeDayTime(index)"
                          :disabled="form.day_specific_times.length <= 1"
                        ></v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </div>

                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-plus"
                  @click="addDayTime"
                  class="mt-2"
                >
                  Add Another Day
                </v-btn>
              </div>
            </v-col>

            <!-- Recurrence Interval -->
            <v-col v-if="form.recurrence_type !== 'daily'" cols="6">
              <v-text-field
                v-model.number="form.recurrence_interval"
                label="Every (interval)"
                type="number"
                min="1"
                max="52"
                variant="outlined"
                prepend-inner-icon="mdi-numeric"
                :suffix="getIntervalSuffix()"
                :rules="[v => v > 0 || 'Interval must be greater than 0']"
                required
              ></v-text-field>
            </v-col>

            <!-- Date Range -->
            <v-col cols="6">
              <v-text-field
                v-model="form.start_date"
                label="Start Date"
                type="date"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-start"
                :rules="[v => !!v || 'Start date is required']"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.end_date"
                label="End Date (Optional)"
                type="date"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-end"
                :min="form.start_date"
              ></v-text-field>
            </v-col>

            <!-- Max Occurrences -->
            <v-col cols="6">
              <v-text-field
                v-model.number="form.max_occurrences"
                label="Max Occurrences (Optional)"
                type="number"
                min="1"
                max="365"
                variant="outlined"
                prepend-inner-icon="mdi-counter"
                hint="Leave empty for unlimited"
                persistent-hint
              ></v-text-field>
            </v-col>

            <!-- Auto Approve -->
            <v-col cols="6">
              <v-switch
                v-model="form.auto_approve"
                label="Auto Approve Bookings"
                color="success"
                prepend-icon="mdi-check-circle"
                hint="Automatically approve generated bookings"
                persistent-hint
              ></v-switch>
            </v-col>

            <!-- Notes -->
            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="Notes (Optional)"
                placeholder="Additional notes for this schedule..."
                variant="outlined"
                prepend-inner-icon="mdi-note-text"
                rows="2"
              ></v-textarea>
            </v-col>
          </v-row>

          <!-- Recurring Schedule Info Alert -->
          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
          >
            <v-icon class="mr-2">mdi-information</v-icon>
            <strong>How it works:</strong> This will create individual bookings for each occurrence (e.g., every Monday and Thursday for the whole year). Each booking will appear in your "My Bookings" list just like regular bookings.
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            type="submit"
            :loading="loading"
            :disabled="!valid"
          >
            {{ isEditing ? 'Update' : 'Create' }} Schedule
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { recurringScheduleService } from '../services/recurringScheduleService'

export default {
  name: 'RecurringScheduleDialog',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    schedule: {
      type: Object,
      default: null
    },
    courts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'saved', 'update:isOpen'],
  setup(props, { emit }) {
    // Create a stable form object that won't be reassigned
    const form = ref({
      title: '',
      description: '',
      court_id: null,
      start_time: '',
      end_time: '',
      recurrence_type: '',
      recurrence_days: [],
      day_specific_times: [],
      recurrence_interval: 1,
      start_date: '',
      end_date: '',
      max_occurrences: null,
      auto_approve: false,
      notes: ''
    })

    // Track if form has been initialized to prevent multiple resets
    const formInitialized = ref(false)

    const valid = ref(false)
    const loading = ref(false)

    const isEditing = computed(() => !!props.schedule)

    // Direct control for recurrence type
    const recurrenceTypeRef = ref(null)

    const recurrenceTypeOptions = recurringScheduleService.getRecurrenceTypeOptions()
    const dayOfWeekOptions = recurringScheduleService.getDayOfWeekOptions()

    const handleRecurrenceTypeChange = (newType) => {
      // Only process if the type actually changed
      if (form.value.recurrence_type === newType) {
        return
      }

      // Only reset related fields if they're not compatible with the new type
      if (form.value.recurrence_type) {
        form.value.recurrence_days = []
        form.value.day_specific_times = []

        // Only reset start/end times for non-multiple times types
        if (!['weekly_multiple_times', 'yearly_multiple_times'].includes(newType)) {
          form.value.start_time = ''
          form.value.end_time = ''
        }
      }

      // Add default day time for weekly_multiple_times and yearly_multiple_times
      if (['weekly_multiple_times', 'yearly_multiple_times'].includes(newType) && form.value.day_specific_times.length === 0) {
        addDayTime()
      }
    }


    const addDayTime = () => {
      form.value.day_specific_times.push({
        day: null,
        start_time: '',
        end_time: ''
      })
    }

    const resetRecurrenceType = () => {
      form.value.recurrence_type = ''
      form.value.recurrence_days = []
      form.value.day_specific_times = []
      form.value.start_time = ''
      form.value.end_time = ''
    }

    const removeDayTime = (index) => {
      if (form.value.day_specific_times.length > 1) {
        form.value.day_specific_times.splice(index, 1)
      }
    }

    const calculateDuration = (startTime, endTime) => {
      if (!startTime || !endTime) return 0
      const start = new Date(`2000-01-01T${startTime}`)
      const end = new Date(`2000-01-01T${endTime}`)
      const diffMs = end - start
      return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10 // Round to 1 decimal place
    }

    const getIntervalSuffix = () => {
      const suffixes = {
        daily: 'day(s)',
        weekly: 'week(s)',
        weekly_multiple_times: 'week(s)',
        monthly: 'month(s)',
        yearly: 'year(s)',
        yearly_multiple_times: 'year(s)'
      }
      return suffixes[form.value.recurrence_type] || ''
    }

    const resetForm = () => {
      // Update individual properties instead of reassigning the entire object
      form.value.title = ''
      form.value.description = ''
      form.value.court_id = null
      form.value.start_time = ''
      form.value.end_time = ''
      form.value.recurrence_type = ''
      form.value.recurrence_days = []
      form.value.day_specific_times = []
      form.value.recurrence_interval = 1
      // Use local timezone for today's date
      const today = new Date()
      form.value.start_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      form.value.end_date = ''
      form.value.max_occurrences = null
      form.value.auto_approve = false
      form.value.notes = ''
      formInitialized.value = true
    }

    const populateForm = (schedule) => {
      // Update individual properties instead of reassigning the entire object
      form.value.title = schedule.title || ''
      form.value.description = schedule.description || ''
      form.value.court_id = schedule.court_id || null
      form.value.start_time = schedule.start_time || ''
      form.value.end_time = schedule.end_time || ''
      form.value.recurrence_type = schedule.recurrence_type || ''
      form.value.recurrence_days = schedule.recurrence_days || []
      form.value.day_specific_times = schedule.day_specific_times || []
      form.value.recurrence_interval = schedule.recurrence_interval || 1
      form.value.start_date = schedule.start_date || ''
      form.value.end_date = schedule.end_date || ''
      form.value.max_occurrences = schedule.max_occurrences || null
      form.value.auto_approve = schedule.auto_approve || false
      form.value.notes = schedule.notes || ''
      formInitialized.value = true

      // If editing a weekly_multiple_times or yearly_multiple_times schedule and no day_specific_times, add one
      if (['weekly_multiple_times', 'yearly_multiple_times'].includes(schedule.recurrence_type) && (!schedule.day_specific_times || schedule.day_specific_times.length === 0)) {
        addDayTime()
      }
    }

    const handleSubmit = async () => {
      if (!valid.value) {
        return
      }

      // Additional validation for weekly_multiple_times and yearly_multiple_times
      if (['weekly_multiple_times', 'yearly_multiple_times'].includes(form.value.recurrence_type)) {
        if (!form.value.day_specific_times || form.value.day_specific_times.length === 0) {
          alert('Please add at least one day with specific times')
          return
        }

        // Validate each day time entry
        for (let i = 0; i < form.value.day_specific_times.length; i++) {
          const dayTime = form.value.day_specific_times[i]
          if (!dayTime.day && dayTime.day !== 0) {
            alert(`Please select a day for entry ${i + 1}`)
            return
          }
          if (!dayTime.start_time) {
            alert(`Please enter start time for entry ${i + 1}`)
            return
          }
          if (!dayTime.end_time) {
            alert(`Please enter end time for entry ${i + 1}`)
            return
          }
          if (dayTime.start_time >= dayTime.end_time) {
            alert(`End time must be after start time for entry ${i + 1}`)
            return
          }
        }
      }

      // Validate regular time fields for non-multiple times types
      if (!['weekly_multiple_times', 'yearly_multiple_times'].includes(form.value.recurrence_type)) {
        if (!form.value.start_time) {
          alert('Please enter start time')
          return
        }
        if (!form.value.end_time) {
          alert('Please enter end time')
          return
        }
        if (form.value.start_time >= form.value.end_time) {
          alert('End time must be after start time')
          return
        }
      }

      try {
        loading.value = true

        const scheduleData = {
          ...form.value,
          duration_hours: ['weekly_multiple_times', 'yearly_multiple_times'].includes(form.value.recurrence_type)
            ? 0 // Will be calculated per day
            : calculateDuration(form.value.start_time, form.value.end_time)
        }

        if (isEditing.value) {
          await recurringScheduleService.updateRecurringSchedule(props.schedule.id, scheduleData)
        } else {
          await recurringScheduleService.createRecurringSchedule(scheduleData)
        }

        emit('saved')
        closeDialog()
      } catch (error) {
        alert(`Error saving schedule: ${error.response?.data?.message || error.message || 'Unknown error'}`)
      } finally {
        loading.value = false
      }
    }

    const closeDialog = () => {
      resetForm()
      emit('update:isOpen', false)
      emit('close')
    }

    // Only populate form when dialog opens - prevent multiple initializations
    watch(() => props.isOpen, (isOpen, wasOpen) => {
      if (isOpen && !wasOpen && !formInitialized.value) {
        // Only populate/reset when dialog first opens and form hasn't been initialized
        if (props.schedule) {
          populateForm(props.schedule)
        } else {
          resetForm()
        }
      } else if (!isOpen) {
        // Reset initialization flag when dialog closes
        formInitialized.value = false
      }
    })

    // Watch for recurrence type changes - disabled to avoid conflicts
    // watch(() => form.value.recurrence_type, (newType, oldType) => {
    //   if (newType !== oldType && newType) {
    //     handleRecurrenceTypeChange(newType)
    //   }
    // })

    onMounted(() => {
      // Set default start date to today (using local timezone)
      const today = new Date()
      form.value.start_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    })

    return {
      form,
      valid,
      loading,
      isEditing,
      recurrenceTypeRef,
      recurrenceTypeOptions,
      dayOfWeekOptions,
      handleRecurrenceTypeChange,
      addDayTime,
      removeDayTime,
      resetRecurrenceType,
      calculateDuration,
      getIntervalSuffix,
      handleSubmit,
      closeDialog
    }
  }
}
</script>

<style scoped>
/* Modern Sports Recurring Schedule Dialog Theme */
.recurring-dialog-card {
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

.v-text-field,
.v-select,
.v-textarea {
  margin-bottom: 8px;
}

.v-switch {
  margin-top: 8px;
}
</style>
