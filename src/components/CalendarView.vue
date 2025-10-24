<template>
  <div class="calendar-view">
    <!-- Calendar Header with Navigation -->
    <div class="calendar-header">
      <div class="calendar-controls">
        <v-btn
          icon
          size="small"
          variant="text"
          @click="previousMonth"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <!-- Month/Year Picker -->
        <v-menu
          v-model="monthYearPicker"
          :close-on-content-click="false"
          location="bottom"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="calendar-title-btn"
            >
              <h3 class="calendar-title">{{ currentMonthYear }}</h3>
              <v-icon size="small" class="ml-2">mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-card min-width="320">
            <v-card-text class="pa-4">
              <div class="month-year-selector">
                <!-- Year Selector -->
                <div class="mb-4">
                  <v-label class="text-caption mb-2">Year</v-label>
                  <div class="year-selector">
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="selectedYear--"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <span class="year-display">{{ selectedYear }}</span>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click="selectedYear++"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                </div>

                <!-- Month Grid -->
                <div>
                  <v-label class="text-caption mb-2">Month</v-label>
                  <div class="month-grid">
                    <v-btn
                      v-for="(month, index) in monthNames"
                      :key="index"
                      :variant="selectedMonth === index ? 'flat' : 'text'"
                      :color="selectedMonth === index ? 'primary' : 'default'"
                      size="small"
                      class="month-btn"
                      @click="selectMonth(index)"
                    >
                      {{ month }}
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="px-4 pb-4">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                size="small"
                @click="monthYearPicker = false"
              >
                Cancel
              </v-btn>
              <v-btn
                variant="flat"
                color="primary"
                size="small"
                @click="applyMonthYear"
              >
                Apply
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <v-btn
          icon
          size="small"
          variant="text"
          @click="nextMonth"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      <v-btn
        size="small"
        variant="outlined"
        prepend-icon="mdi-calendar-today"
        @click="goToToday"
      >
        Today
      </v-btn>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Day Headers -->
      <div v-for="day in weekDays" :key="day" class="calendar-day-header">
        {{ day }}
      </div>

      <!-- Calendar Days -->
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'has-events': day.events.length > 0
        }"
        @click="showDayEvents(day)"
      >
        <div class="day-number">{{ day.date.getDate() }}</div>
        <div class="day-events">
          <div
            v-for="event in day.events.slice(0, 3)"
            :key="event.id"
            class="calendar-event"
            :class="`event-${event.status}`"
            @click.stop="handleEventClick(event)"
          >
            <div class="event-indicator"></div>
            <div class="event-content">
              <div class="event-time">{{ formatEventTime(event) }}</div>
              <div class="event-title">{{ event.userName }}</div>
            </div>
          </div>
          <div
            v-if="day.events.length > 3"
            class="more-events"
            @click.stop="showDayEvents(day)"
          >
            +{{ day.events.length - 3 }} more
          </div>
        </div>
      </div>
    </div>

    <!-- Day Events Dialog -->
    <v-dialog v-model="dayEventsDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <div class="d-flex align-center justify-space-between w-100">
            <div>
              <v-icon class="mr-2" color="primary">mdi-calendar</v-icon>
              {{ selectedDayTitle }}
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="dayEventsDialog = false"></v-btn>
          </div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4" style="max-height: 500px; overflow-y: auto;">
          <div v-if="groupedDayEvents.length > 0">
            <!-- Loop through each court -->
            <div v-for="(courtGroup, courtIndex) in groupedDayEvents" :key="courtIndex" class="court-group">
              <div class="court-header">
                <v-icon size="small" class="mr-2">mdi-tennis-ball</v-icon>
                <span class="court-name">{{ courtGroup.courtName }}</span>
                <span v-if="courtGroup.surfaceType" class="court-surface">{{ courtGroup.surfaceType }}</span>
              </div>

              <!-- Loop through bookings for this court -->
              <div v-for="(booking, bookingIndex) in courtGroup.bookings" :key="bookingIndex" class="booking-item">
                <div class="booking-header" @click="handleEventClick(booking.event)">
                  <div class="d-flex align-center gap-2">
                    <div class="event-status-indicator mr-2" :class="`status-${booking.event.status}`"></div>
                    <span class="booking-user mr-2">{{ booking.event.userName }}</span>
                    <span class="booking-price">{{ formatPrice(booking.courtTotalPrice) }}</span>
                  </div>
                </div>

                <!-- Time slot groups -->
                <div class="time-slots">
                  <v-chip
                    v-for="(slotGroup, slotIndex) in booking.timeSlotGroups"
                    :key="slotIndex"
                    size="small"
                    variant="tonal"
                    class="time-slot-chip"
                  >
                    <v-icon start size="x-small">mdi-clock-outline</v-icon>
                    {{ formatTimeSlot(slotGroup.start, slotGroup.end) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-grey">
            No transactions on this day
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { companySettingService } from '../services/companySettingService'

export default {
  name: 'CalendarView',
  props: {
    transactions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['event-click'],
  setup(props, { emit }) {
    const currentDate = ref(new Date())
    const dayEventsDialog = ref(false)
    const selectedDay = ref(null)
    const monthYearPicker = ref(false)
    const selectedMonth = ref(new Date().getMonth())
    const selectedYear = ref(new Date().getFullYear())

    // Theme colors from company settings
    const themeColors = ref({
      primary: '#1976d2',
      secondary: '#E3F2FD',
      accent: '#BBDEFB'
    })

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    })

    const selectedDayTitle = computed(() => {
      if (!selectedDay.value) return ''
      return selectedDay.value.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    const selectedDayEvents = computed(() => {
      if (!selectedDay.value) return []
      return selectedDay.value.events
    })

    // Group events by court and time slots
    const groupedDayEvents = computed(() => {
      if (!selectedDay.value || selectedDay.value.events.length === 0) return []

      // Create a map to hold court groups
      const courtMap = new Map()

      selectedDay.value.events.forEach(event => {
        const transaction = event.transaction
        if (!transaction.cart_items) return

        // Group cart items by court
        const courtItemsMap = new Map()

        transaction.cart_items.forEach(item => {
          const courtName = item.court?.name || 'Unknown Court'
          if (!courtItemsMap.has(courtName)) {
            courtItemsMap.set(courtName, [])
          }
          courtItemsMap.get(courtName).push(item)
        })

        // Process each court
        courtItemsMap.forEach((items, courtName) => {
          if (!courtMap.has(courtName)) {
            courtMap.set(courtName, {
              surfaceType: items[0]?.court?.surface_type || null,
              bookings: []
            })
          }

          // Sort items by start time
          const sortedItems = [...items].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
          )

          // Group adjacent time slots
          const timeSlotGroups = []
          let currentGroup = null

          sortedItems.forEach(item => {
            if (!currentGroup) {
              currentGroup = {
                start: item.start_time,
                end: item.end_time,
                items: [item]
              }
            } else if (currentGroup.end === item.start_time) {
              // Adjacent slot
              currentGroup.end = item.end_time
              currentGroup.items.push(item)
            } else {
              // Gap detected, save current group and start new one
              timeSlotGroups.push(currentGroup)
              currentGroup = {
                start: item.start_time,
                end: item.end_time,
                items: [item]
              }
            }
          })

          // Add the last group
          if (currentGroup) {
            timeSlotGroups.push(currentGroup)
          }

          // Calculate total price for this court's time slots
          const courtTotalPrice = sortedItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) || 0)
          }, 0)

          // Add to court map
          courtMap.get(courtName).bookings.push({
            event,
            transaction,
            timeSlotGroups,
            courtTotalPrice
          })
        })
      })

      // Convert map to array and sort
      const result = Array.from(courtMap.entries()).map(([courtName, courtData]) => ({
        courtName,
        surfaceType: courtData.surfaceType,
        bookings: courtData.bookings
      })).sort((a, b) => a.courtName.localeCompare(b.courtName))

      return result
    })

    // Generate calendar days for the current month
    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()

      // First day of the month
      const firstDay = new Date(year, month, 1)
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0)

      // Start from the Sunday before the first day
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - startDate.getDay())

      // Generate 42 days (6 weeks) to fill the calendar grid
      const days = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const isCurrentMonth = date.getMonth() === month
        const isToday = date.getTime() === today.getTime()

        // Get events for this day
        const events = getEventsForDay(date)

        days.push({
          date,
          isCurrentMonth,
          isToday,
          events
        })
      }

      return days
    })

    // Helper function to format date in local timezone
    const formatDateLocal = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Get transactions for a specific day
    const getEventsForDay = (date) => {
      const dateStr = formatDateLocal(date)

      return props.transactions
        .filter(transaction => {
          // Get booking date from first cart item
          const bookingDate = transaction.cart_items?.[0]?.booking_date
          if (!bookingDate) return false

          // Convert booking date to local timezone format
          const bookingDateObj = new Date(bookingDate)
          const transactionDateStr = formatDateLocal(bookingDateObj)
          return transactionDateStr === dateStr
        })
        .map(transaction => {
          // Calculate overall time range (similar to BookingDetailsDialog)
          const timeRange = calculateOverallTimeRange(transaction)

          return {
            id: transaction.id,
            userName: getUserName(transaction),
            totalPrice: transaction.total_price || 0,
            status: (transaction.approval_status || 'pending').toLowerCase(),
            startTime: timeRange.start,
            endTime: timeRange.end,
            transaction
          }
        })
        .sort((a, b) => {
          // Sort by start time
          if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime)
          }
          return 0
        })
    }

    // Calculate overall time range from cart items (similar to BookingDetailsDialog's adjacentTimeRanges)
    const calculateOverallTimeRange = (transaction) => {
      if (!transaction.cart_items || transaction.cart_items.length === 0) {
        return { start: '', end: '' }
      }

      const items = transaction.cart_items

      // Remove duplicates and sort by start time
      const uniqueSlots = []
      const seenSlots = new Set()
      items.forEach(item => {
        const key = `${item.start_time}-${item.end_time}`
        if (!seenSlots.has(key)) {
          seenSlots.add(key)
          uniqueSlots.push({
            start: item.start_time,
            end: item.end_time
          })
        }
      })
      uniqueSlots.sort((a, b) => a.start.localeCompare(b.start))

      // Group consecutive/adjacent slots
      const timeRanges = []
      let currentRange = null

      uniqueSlots.forEach(slot => {
        if (!currentRange) {
          // Start a new range
          currentRange = {
            start: slot.start,
            end: slot.end
          }
        } else if (currentRange.end === slot.start) {
          // Slot is consecutive (end of current range matches start of this slot)
          currentRange.end = slot.end
        } else {
          // Gap detected, save current range and start new one
          timeRanges.push(currentRange)
          currentRange = {
            start: slot.start,
            end: slot.end
          }
        }
      })

      // Add the last range
      if (currentRange) {
        timeRanges.push(currentRange)
      }

      // Return the overall time range (earliest start to latest end)
      if (timeRanges.length === 0) {
        return { start: '', end: '' }
      }

      return {
        start: timeRanges[0].start,
        end: timeRanges[timeRanges.length - 1].end
      }
    }

    const getUserName = (transaction) => {
      const firstCartItem = transaction.cart_items?.[0]
      const userId = transaction.user_id
      const bookingForUserId = firstCartItem?.booking_for_user_id

      // Check if user_id equals booking_for_user_id (admin booked for themselves or no booking_for)
      const isBookingForSelf = userId === bookingForUserId

      // Get user role and admin notes
      const userRole = transaction.user?.role?.toLowerCase()
      const isAdminOrStaff = userRole === 'admin' || userRole === 'staff'
      const adminNotes = transaction.admin_notes || firstCartItem?.admin_notes
      const userName = transaction.user?.name || 'N/A'

      // If admin/staff booked for themselves and has admin notes, show notes in parentheses
      if (isBookingForSelf && isAdminOrStaff && adminNotes) {
        return `${userName} (${adminNotes})`
      }

      // Otherwise, show booking_for name if exists, or the user's name
      if (firstCartItem?.booking_for_user_name) {
        return firstCartItem.booking_for_user_name
      }

      return userName
    }

    const formatEventTime = (event) => {
      if (!event.startTime || !event.endTime) return ''

      const formatTime = (time) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
      }

      return `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
    }

    const formatPrice = (price) => {
      return `₱${parseFloat(price || 0).toFixed(2)}`
    }

    const formatTimeSlot = (startTime, endTime) => {
      if (!startTime || !endTime) return ''

      const formatTime = (time) => {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
      }

      return `${formatTime(startTime)} - ${formatTime(endTime)}`
    }

    const handleEventClick = (event) => {
      emit('event-click', event.transaction)
      dayEventsDialog.value = false
    }

    const showDayEvents = (day) => {
      selectedDay.value = day
      dayEventsDialog.value = true
    }

    const previousMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() - 1)
      currentDate.value = newDate
    }

    const nextMonth = () => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + 1)
      currentDate.value = newDate
    }

    const goToToday = () => {
      currentDate.value = new Date()
      selectedMonth.value = new Date().getMonth()
      selectedYear.value = new Date().getFullYear()
    }

    const selectMonth = (monthIndex) => {
      selectedMonth.value = monthIndex
    }

    const applyMonthYear = () => {
      const newDate = new Date(selectedYear.value, selectedMonth.value, 1)
      currentDate.value = newDate
      monthYearPicker.value = false
    }

    // Load theme colors from company settings
    const loadThemeColors = async () => {
      try {
        const settings = await companySettingService.getSettings()
        if (settings.bg_primary_color && settings.bg_secondary_color && settings.bg_accent_color) {
          // Extract RGB from hex for alpha transparency calculations
          themeColors.value = {
            primary: settings.bg_primary_color || '#1976d2',
            secondary: settings.bg_secondary_color || '#E3F2FD',
            accent: settings.bg_accent_color || '#BBDEFB'
          }

          // Apply colors to CSS variables
          applyThemeColors()
        }
      } catch (error) {
        // Keep default blue theme
      }
    }

    const applyThemeColors = () => {
      const root = document.documentElement

      // Use the accent color as the main theme color for calendar
      root.style.setProperty('--calendar-theme-color', themeColors.value.accent)

      // Create a lighter version of accent for subtle backgrounds
      root.style.setProperty('--calendar-theme-light', hexToRgba(themeColors.value.accent, 0.1))

      // Create a medium opacity version for hover states
      root.style.setProperty('--calendar-theme-hover', hexToRgba(themeColors.value.accent, 0.2))

      // Use secondary color for very light backgrounds
      root.style.setProperty('--calendar-bg-light', themeColors.value.secondary)
    }

    // Helper function to convert hex to rgba
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Listen for background color updates
    const handleBackgroundColorUpdate = (event) => {
      if (event.detail) {
        themeColors.value = {
          primary: event.detail.primary || themeColors.value.primary,
          secondary: event.detail.secondary || themeColors.value.secondary,
          accent: event.detail.accent || themeColors.value.accent
        }
        applyThemeColors()
      }
    }

    // Watch for currentDate changes to update selectedMonth and selectedYear
    watch(() => currentDate.value, (newDate) => {
      selectedMonth.value = newDate.getMonth()
      selectedYear.value = newDate.getFullYear()
    })

    onMounted(() => {
      loadThemeColors()
      window.addEventListener('background-colors-updated', handleBackgroundColorUpdate)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('background-colors-updated', handleBackgroundColorUpdate)
    })

    return {
      currentDate,
      currentMonthYear,
      weekDays,
      monthNames,
      calendarDays,
      dayEventsDialog,
      selectedDay,
      selectedDayTitle,
      selectedDayEvents,
      groupedDayEvents,
      monthYearPicker,
      selectedMonth,
      selectedYear,
      formatEventTime,
      formatPrice,
      formatTimeSlot,
      handleEventClick,
      showDayEvents,
      previousMonth,
      nextMonth,
      goToToday,
      selectMonth,
      applyMonthYear,
      themeColors
    }
  }
}
</script>

<style scoped>
.calendar-view {
  width: 100%;
}

/* Calendar Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--calendar-bg-light, #E3F2FD);
  border-radius: 12px;
  border: 1px solid var(--calendar-theme-color, #BBDEFB);
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.calendar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  min-width: 200px;
  text-align: center;
}

.calendar-title-btn {
  padding: 8px 16px !important;
  height: auto !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

.calendar-title-btn:hover {
  background: var(--calendar-theme-light, rgba(25, 118, 210, 0.1));
}

/* Month/Year Selector */
.month-year-selector {
  min-width: 280px;
}

.year-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 0;
}

.year-display {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  min-width: 80px;
  text-align: center;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.month-btn {
  text-transform: none !important;
  font-weight: 600;
  letter-spacing: 0;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.calendar-day-header {
  background: var(--calendar-theme-color, #BBDEFB);
  color: #1e293b;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-day {
  background: white;
  min-height: 120px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  background: var(--calendar-theme-light, #f8fafc);
}

.calendar-day.other-month {
  background: #f8fafc;
  opacity: 0.5;
}

.calendar-day.today {
  background: var(--calendar-theme-light, rgba(25, 118, 210, 0.1));
  border: 2px solid var(--calendar-theme-color, #1976d2);
}

.calendar-day.today .day-number {
  background: var(--calendar-theme-color, #1976d2);
  color: #1e293b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Calendar Events */
.calendar-event {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  overflow: hidden;
}

.calendar-event:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.event-indicator {
  width: 4px;
  height: 100%;
  min-height: 20px;
  border-radius: 2px;
}

.event-content {
  flex: 1;
  overflow: hidden;
}

.event-time {
  font-size: 0.7rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Event Status Colors */
.calendar-event.event-pending {
  background: rgba(251, 191, 36, 0.15);
  color: #92400e;
  border-left: 3px solid #f59e0b;
}

.calendar-event.event-pending .event-indicator {
  background: #f59e0b;
}

.calendar-event.event-pending_waitlist {
  background: rgba(59, 130, 246, 0.15);
  color: #1e40af;
  border-left: 3px solid #3b82f6;
}

.calendar-event.event-pending_waitlist .event-indicator {
  background: #3b82f6;
}

.calendar-event.event-approved {
  background: rgba(16, 185, 129, 0.15);
  color: #065f46;
  border-left: 3px solid #10b981;
}

.calendar-event.event-approved .event-indicator {
  background: #10b981;
}

.calendar-event.event-rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #991b1b;
  border-left: 3px solid #ef4444;
}

.calendar-event.event-rejected .event-indicator {
  background: #ef4444;
}

/* More Events Indicator */
.more-events {
  font-size: 0.7rem;
  color: #1e293b;
  padding: 4px 6px;
  text-align: center;
  cursor: pointer;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.2s ease;
  background: var(--calendar-theme-light, rgba(25, 118, 210, 0.1));
}

.more-events:hover {
  background: var(--calendar-theme-hover, rgba(25, 118, 210, 0.2));
}

/* Event Status Indicator */
.event-status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-status-indicator.status-pending {
  background: #f59e0b;
}

.event-status-indicator.status-pending_waitlist {
  background: #3b82f6;
}

.event-status-indicator.status-approved {
  background: #10b981;
}

.event-status-indicator.status-rejected {
  background: #ef4444;
}

/* Court Group Styles */
.court-group {
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.court-header {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  background: var(--calendar-theme-light, rgba(25, 118, 210, 0.1));
  border-bottom: 1px solid var(--calendar-theme-color, #BBDEFB);
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}

.court-name {
  font-size: 0.95rem;
  font-weight: 700;
}

.court-surface {
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  margin-left: 8px;
}

.booking-item {
  padding: 10px 14px;
  border-bottom: 1px solid #f8fafc;
}

.booking-item:last-child {
  border-bottom: none;
}

.booking-header {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 0;
}

.booking-header:hover {
  opacity: 0.7;
}

.booking-user {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1e293b;
}

.booking-price {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding-left: 26px;
}

.time-slot-chip {
  font-size: 0.813rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 16px;
    padding: 12px;
  }

  .calendar-title {
    font-size: 1.25rem;
    min-width: auto;
  }

  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }

  .calendar-day-header {
    padding: 8px;
    font-size: 0.75rem;
  }

  .day-number {
    font-size: 0.75rem;
  }

  .calendar-event {
    padding: 2px 4px;
    font-size: 0.65rem;
  }

  .event-time {
    font-size: 0.6rem;
  }

  /* Show only event indicator on mobile */
  .calendar-event .event-content {
    display: none;
  }

  .calendar-event .event-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    min-height: auto;
  }

  .more-events {
    font-size: 0.65rem;
    padding: 2px 4px;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 60px;
    padding: 2px;
  }

  .calendar-day-header {
    padding: 6px 2px;
    font-size: 0.65rem;
  }

  .day-number {
    font-size: 0.7rem;
    margin-bottom: 4px;
  }

  .calendar-day.today .day-number {
    width: 24px;
    height: 24px;
    font-size: 0.65rem;
  }

  .day-events {
    gap: 2px;
  }
}
</style>
