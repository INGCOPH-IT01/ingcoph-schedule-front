<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="$emit('close')"
    max-width="1200px"
    persistent
    class="responsive-dialog"
    :fullscreen="$vuetify.display.mobile"
    transition="dialog-bottom-transition"
  >
    <v-card class="booking-dialog">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-content">
          <v-icon size="32" class="mr-3">mdi-calendar-check</v-icon>
          <div>
            <h2 class="text-h5">Book a Court</h2>
            <p class="text-subtitle-2 text-grey">Select sport and time slot</p>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Stepper -->
      <v-card-text class="pa-6">
        <!-- Progress Indicator -->
        <div class="stepper-header mb-6">
          <div
            v-for="(stepName, index) in ['Sport', 'Court & Time Slot', 'Confirm']"
            :key="index"
            :class="['step-indicator', { 'active': step === index + 1, 'completed': step > index + 1 }]"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-label">{{ stepName }}</div>
          </div>
        </div>

        <v-window v-model="step" class="mb-6">
          <!-- Step 1: Select Sport -->
          <v-window-item :value="1">
            <div class="step-content">
              <h3 class="text-h6 mb-4">
                <v-icon class="mr-2" color="primary">mdi-racquetball</v-icon>
                Select a Sport
              </h3>

              <v-row>
                <v-col
                  v-for="sport in sports"
                  :key="sport.id"
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <v-card
                    :class="['sport-card', { 'selected': selectedSport?.id === sport.id }]"
                    @click="selectSport(sport)"
                    hover
                  >
                    <v-icon
                      v-if="selectedSport?.id === sport.id"
                      class="selected-check-icon"
                      color="primary"
                      size="32"
                    >
                      mdi-check-circle
                    </v-icon>
                    <v-card-text class="text-center pa-4">
                      <div class="sport-icon-large"><v-icon :color="sportService.getSportColor(sport.name)">{{ sportService.getSportIcon(sport.name, sport.icon) }}</v-icon></div>
                      <h4 class="text-h6 mt-2">{{ sport.name }}</h4>
                      <p class="text-caption text-grey">{{ sport.description }}</p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-if="sports.length === 0" type="info" class="mt-4">
                No sports available. Please contact the administrator.
              </v-alert>

              <!-- Number of Players Field -->
              <v-card v-if="selectedSport" variant="outlined" class="mt-6 pa-4">
                <h4 class="text-h6 mb-4">
                  <v-icon class="mr-2" color="primary">mdi-account-multiple</v-icon>
                  Number of Players
                </h4>
                <v-text-field
                  v-model="numberOfPlayers"
                  type="number"
                  label="How many players?"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-group"
                  :rules="[v => v >= 1 || 'At least 1 player required']"
                  persistent-hint
                  min="1"
                  @update:model-value="(val) => {
                    numberOfPlayers.value = parseInt(val) || 1
                  }"
                ></v-text-field>
              </v-card>
            </div>
          </v-window-item>

          <!-- Step 2: Select Court & Time Slot -->
          <v-window-item :value="2">
            <div class="step-content">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-btn icon="mdi-arrow-left" variant="text" @click="step = 1" size="small"></v-btn>
                  <h3 class="text-h6 ml-2">
                    <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
                    Select Court & Time Slots
                  </h3>
                </div>
                <v-chip color="success" v-if="totalBookings > 0">
                  {{ totalBookings }} slot(s) selected
                </v-chip>
              </div>

              <!-- Selected Sport Info -->
              <!-- <v-card variant="tonal" color="primary" class="mb-4" v-if="selectedSport">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon size="32" class="mr-3">{{ sportService.getSportIcon(selectedSport.name, selectedSport.icon) }}</v-icon>
                      <div>
                        <h4 class="text-h6">{{ selectedSport.name }} Courts</h4>
                        <p class="text-caption mb-0">{{ selectedSport.description }}</p>
                      </div>
                    </div>
                    <v-chip color="white" size="large">
                      {{ filteredCourts.length }} court(s) available
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card> -->

              <!-- Booking Confirmation Delay Notice -->
              <v-alert
                variant="tonal"
                class="mb-4"
                density="compact"
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  <div>
                    <div class="font-weight-bold">Important Notice</div>
                    <div class="text-caption">There may be a carry over delay in the confirmation of your booking during weekends and holidays. This is normal processing time.</div>
                  </div>
                </div>
              </v-alert>

              <!-- Facebook Regular Sessions Notice (User Role Only) -->
              <v-alert
                v-if="!isAdminOrStaff && facebookPageUrl"
                variant="tonal"
                color="info"
                class="mb-4"
                density="compact"
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-facebook</v-icon>
                  <div>
                    <div class="text-caption">
                      If you want to book regular sessions please message us on
                      <a
                        :href="facebookPageUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary font-weight-bold text-decoration-none"
                      >
                        {{ facebookPageName || 'our Facebook page' }}
                      </a>
                    </div>
                  </div>
                </div>
              </v-alert>

              <!-- Date Selection -->
              <v-row class="mb-4">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="selectedDate"
                    type="date"
                    label="Select Date"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar"
                    :min="minDate"
                    :max="maxDate"
                    @update:model-value="loadTimeSlotsForAllCourts"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Blocked Date Alert -->
              <v-alert
                v-if="selectedDateBlockInfo.isBlocked"
                type="error"
                variant="tonal"
                class="mb-4"
                prominent
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-3" size="large">mdi-calendar-remove</v-icon>
                  <div>
                    <div class="font-weight-bold text-h6 mb-1">Date Not Available</div>
                    <div>{{ selectedDateBlockInfo.reason }}</div>
                  </div>
                </div>
              </v-alert>

              <!-- Time Slots Grid for Each Court (Filtered by Sport) -->
              <div v-if="selectedDate">
                <v-alert
                  v-if="filteredCourts.length === 0"
                  type="warning"
                  variant="tonal"
                  class="mb-4"
                >
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-alert-circle</v-icon>
                    <div>
                      <div class="font-weight-bold">No courts available for {{ selectedSport?.name }}</div>
                      <div class="text-caption">Please select a different sport or contact the administrator.</div>
                    </div>
                  </div>
                </v-alert>

                <div
                  v-for="court in filteredCourts"
                  :key="court.id"
                  class="court-time-slots-section mb-6"
                >
                  <v-card variant="outlined" class="pa-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center flex-wrap">
                        <div class="mr-3">
                          <h4 class="text-subtitle-1 mb-0">
                            <v-icon class="mr-2" color="primary">mdi-stadium</v-icon>
                            {{ court.name }}
                          </h4>
                          <div v-if="court.surface_type" class="text-caption text-grey ml-7">
                            <v-icon size="12" class="mr-1">mdi-texture-box</v-icon>
                            {{ court.surface_type }}
                          </div>
                        </div>
                        <div class="d-flex flex-wrap">
                          <!-- Show all sports this court supports -->
                          <v-chip
                            v-for="sport in getCourtSports(court)"
                            :key="sport.id"
                            :color="sportService.getSportColor(sport.name)"
                            size="small"
                            class="mr-1 mb-1"
                            :variant="sport.id === selectedSport.id ? 'elevated' : 'outlined'"
                          >
                            <v-icon start size="small">{{ sportService.getSportIcon(sport.name, sport.icon) }}</v-icon>
                            {{ sport.name }}
                          </v-chip>
                        </div>
                      </div>
                      <v-chip
                        v-if="courtTimeSlots[court.id]?.slots.length > 0"
                        color="success"
                        size="small"
                      >
                        {{ courtTimeSlots[court.id].slots.length }} slot(s)
                      </v-chip>
                    </div>

                    <v-progress-circular
                      v-if="loadingSlots"
                      indeterminate
                      color="primary"
                      class="d-block mx-auto"
                    ></v-progress-circular>

                    <div v-else-if="timeSlots[court.id] && timeSlots[court.id].length > 0" class="time-slots-grid">
                      <v-card
                        v-for="slot in timeSlots[court.id]"
                        :key="slot.start"
                        :class="getSlotClasses(court.id, slot)"
                        :disabled="!canSelectSlot(slot)"
                        @click="handleSlotClick(court.id, slot)"
                      >
                        <v-icon
                          v-if="isTimeSlotSelected(court.id, slot.start)"
                          class="selected-check-icon"
                          color="primary"
                          size="24"
                        >
                          mdi-check-circle
                        </v-icon>
                        <v-card-text class="text-center pa-3">
                          <div class="text-body-2 font-weight-bold">{{ formatTime(slot.start) }}</div>
                          <div class="text-caption">to</div>
                          <div class="text-body-2 font-weight-bold">{{ formatTime(slot.end) }}</div>
                          <v-chip
                            :color="getSlotStatusColor(slot)"
                            size="x-small"
                            class="mt-2"
                          >
                            {{ getSlotStatusLabel(slot) }}
                          </v-chip>
                          <!-- Show customer name when slot is booked or waitlist (Admin/Staff only) -->
                          <div
                            v-if="isAdminOrStaff && (slot.is_booked || slot.is_waitlist_available) && slot.display_name"
                            class="customer-name-label mt-2"
                          >
                            <v-icon size="12" class="mr-1">mdi-account</v-icon>
                            <span class="text-caption">{{ slot.display_name }}</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>

                    <v-alert v-else-if="timeSlots[court.id] && timeSlots[court.id].length === 0" type="info" class="mt-2">
                      No time slots available for {{ court.name }} on this date.
                    </v-alert>

                    <v-alert v-else type="warning" class="mt-2">
                      Please wait, loading time slots for {{ court.name }}...
                    </v-alert>
                  </v-card>
                </div>
              </div>

              <v-alert v-else type="info" class="mt-4">
                Please select a date to view available time slots.
              </v-alert>
            </div>
          </v-window-item>

          <!-- Step 3: Confirm Booking -->
          <v-window-item :value="3">
            <div class="step-content">
              <div class="d-flex align-center mb-4">
                <v-btn icon="mdi-arrow-left" variant="text" @click="step = 2" size="small"></v-btn>
                <h3 class="text-h6 ml-2">
                  <v-icon class="mr-2" color="primary">mdi-check-circle</v-icon>
                  Confirm Your Booking
                </h3>
              </div>

              <v-card variant="outlined" class="booking-summary mb-4">
                <v-card-text>
                  <div class="summary-header mb-4">
                    <h4 class="text-h6">
                      <v-icon class="mr-2" color="primary">mdi-racquetball</v-icon>
                      {{ selectedSport?.name }}
                    </h4>
                    <v-chip color="primary">
                      {{ totalBookings }} booking(s)
                    </v-chip>
                  </div>

                  <v-divider class="mb-4"></v-divider>

                  <!-- Overall Time Range (Adjacent Time Sensitive) -->
                  <div v-if="overallTimeRange.length > 0">
                    <v-card
                      v-for="(range, index) in overallTimeRange"
                      :key="index"
                      variant="tonal"
                      color="primary"
                      :class="['mb-3 overall-time-range', { 'mt-0': index === 0 }]"
                    >
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center justify-space-between">
                          <div class="d-flex align-center">
                            <v-icon color="primary" size="32" class="mr-3">mdi-clock-time-four-outline</v-icon>
                            <div>
                              <div class="text-caption text-grey-darken-1 mb-1">
                                {{ overallTimeRange.length > 1 ? `Time Range ${index + 1}` : 'Overall Time Range' }}
                              </div>
                              <div class="text-h6 font-weight-bold">
                                {{ formatTime(range.start) }} - {{ formatTime(range.end) }}
                              </div>
                            </div>
                          </div>
                          <div class="text-right">
                            <v-chip color="primary" size="small" class="mb-1">
                              <v-icon start size="16">mdi-calendar-clock</v-icon>
                              {{ range.slotCount }} slot{{ range.slotCount > 1 ? 's' : '' }}
                            </v-chip>
                            <div>
                              <v-chip color="primary" size="small" variant="tonal">
                                <v-icon start size="16">mdi-calendar</v-icon>
                                {{ formatDate(selectedDate) }}
                              </v-chip>
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Pricing Breakdown by Rate -->
                  <div class="pricing-breakdown mb-4">
                    <h5 class="text-subtitle-1 font-weight-bold mb-3">
                      <v-icon class="mr-2" color="info">mdi-cash-multiple</v-icon>
                      Pricing Breakdown
                    </h5>

                    <div
                      v-for="(rateGroup, index) in getPricingBreakdown()"
                      :key="index"
                      class="rate-group-section mb-3"
                    >
                      <v-card variant="outlined" class="pa-3">
                        <div class="d-flex align-center justify-space-between mb-2">
                          <div>
                            <h6 class="text-subtitle-2 font-weight-bold">
                              {{ rateGroup.rateName }}
                            </h6>
                            <div v-if="rateGroup.rateDescription" class="text-caption text-grey">
                              {{ rateGroup.rateDescription }}
                            </div>
                          </div>
                          <v-chip color="info" size="small">
                            ₱{{ rateGroup.pricePerHour.toFixed(2) }}/hr
                          </v-chip>
                        </div>

                        <v-divider class="my-2"></v-divider>

                        <div class="rate-slots-list">
                          <div
                            v-for="(slot, slotIndex) in rateGroup.slots"
                            :key="slotIndex"
                            class="d-flex align-center justify-space-between mb-2"
                          >
                            <div class="d-flex align-center flex-grow-1">
                              <v-icon size="16" class="mr-2" color="grey">mdi-stadium</v-icon>
                              <span class="text-body-2">{{ slot.courtName }}</span>
                              <span v-if="slot.surfaceType" class="text-caption text-grey ml-1">
                                ({{ slot.surfaceType }})
                              </span>
                              <v-icon size="12" class="mx-2" color="grey">mdi-circle-small</v-icon>
                              <span class="text-body-2">
                                {{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}
                              </span>
                            </div>
                            <span class="text-body-2 font-weight-medium">
                              ₱{{ slot.price.toFixed(2) }}
                            </span>
                          </div>
                        </div>

                        <v-divider class="my-2"></v-divider>

                        <div class="d-flex justify-space-between align-center">
                          <span class="text-caption text-grey">
                            {{ rateGroup.slots.length }} slot(s)
                          </span>
                          <span class="text-body-2 font-weight-bold">
                            Subtotal: ₱{{ rateGroup.totalPrice.toFixed(2) }}
                          </span>
                        </div>
                      </v-card>
                    </div>
                  </div>

              <!-- POS Products Section (if any selected and feature enabled) -->
              <div v-if="posProductsEnabled && selectedProducts.length > 0" class="pos-products-breakdown mb-4">
                <h5 class="text-subtitle-1 font-weight-bold mb-3">
                  <v-icon class="mr-2" color="success">mdi-shopping</v-icon>
                  POS Products
                </h5>

                <v-card variant="outlined" class="pa-3">
                  <div
                    v-for="(item, index) in selectedProducts"
                    :key="index"
                    class="d-flex align-center justify-space-between mb-2"
                  >
                    <div class="d-flex align-center flex-grow-1">
                      <v-icon size="16" class="mr-2" color="success">mdi-package-variant</v-icon>
                      <span class="text-body-2">{{ item.product.name }}</span>
                      <span class="text-caption text-grey ml-2">
                        ({{ item.quantity }} × ₱{{ parseFloat(item.product.price).toFixed(2) }})
                      </span>
                    </div>
                    <span class="text-body-2 font-weight-medium">
                      ₱{{ (parseFloat(item.product.price) * item.quantity).toFixed(2) }}
                    </span>
                  </div>

                  <v-divider class="my-2"></v-divider>

                  <div class="d-flex justify-space-between align-center">
                    <span class="text-caption text-grey">
                      {{ selectedProducts.length }} product{{ selectedProducts.length !== 1 ? 's' : '' }}
                    </span>
                    <span class="text-body-2 font-weight-bold">
                      Subtotal: ₱{{ calculatePosAmount().toFixed(2) }}
                    </span>
                  </div>
                </v-card>
              </div>
                </v-card-text>
              </v-card>

              <!-- POS Products Section (Optional) - only show if feature is enabled -->
              <v-expansion-panels v-if="posProductsEnabled" class="mt-4">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-shopping</v-icon>
                      <span class="font-weight-bold">Add Products (Optional)</span>
                      <v-chip
                        v-if="selectedProducts.length > 0"
                        color="primary"
                        size="small"
                        class="ml-3"
                      >
                        {{ selectedProducts.length }} product{{ selectedProducts.length !== 1 ? 's' : '' }} - ₱{{ calculatePosAmount().toFixed(2) }}
                      </v-chip>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <ProductSelector v-model="selectedProducts" />
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>

              <!-- Total Price Section with Breakdown -->
              <v-card variant="elevated" color="success" class="mt-4">
                <v-card-text class="pa-4">
                  <!-- Breakdown when both booking and POS items exist (only if POS products enabled) -->
                  <div v-if="posProductsEnabled && calculateBookingAmount() > 0 && calculatePosAmount() > 0">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="text-body-2 text-white">
                        <v-icon size="small" color="white" class="mr-1">mdi-calendar-clock</v-icon>
                        Court Booking
                      </div>
                      <div class="text-body-1 text-white">
                        ₱{{ calculateBookingAmount().toFixed(2) }}
                      </div>
                    </div>
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="text-body-2 text-white">
                        <v-icon size="small" color="white" class="mr-1">mdi-shopping</v-icon>
                        Products
                      </div>
                      <div class="text-body-1 text-white">
                        ₱{{ calculatePosAmount().toFixed(2) }}
                      </div>
                    </div>
                    <v-divider class="my-2" color="white" opacity="0.3"></v-divider>
                  </div>

                  <!-- Total -->
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="text-caption text-white">Total Price</div>
                      <div class="text-h4 font-weight-bold text-white">
                        ₱{{ calculateTotalPrice() }}
                      </div>
                    </div>
                    <v-icon size="48" color="white">mdi-cash-multiple</v-icon>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Admin/Staff Booking Field - Only for admin and staff users -->
              <v-card v-if="isAdminOrStaff" variant="outlined" class="mt-4 admin-booking-field">
                <v-card-text>
                  <h4 class="text-h6 mb-4">
                    <v-icon class="mr-2" color="warning">mdi-account-cog</v-icon>
                    Admin Booking Details
                  </h4>

                  <v-alert type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">Booking on behalf of another user</div>
                        <div class="text-caption">Specify who this booking is actually for</div>
                      </div>
                    </div>
                  </v-alert>

                  <v-combobox
                    v-model="bookingForUser"
                    :items="userNames"
                    label="Booking for (Select or Type User Name)"
                    placeholder="Select from list or type a name"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    hint="Select existing user or type a custom name (e.g., walk-in customer)"
                    persistent-hint
                    clearable
                    class="mb-2"
                    item-title="name"
                    return-object
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template v-slot:prepend>
                          <v-avatar size="32" class="mr-2">
                            <v-img :src="`https://ui-avatars.com/api/?name=${item.raw.name}&background=3b82f6&color=fff`"></v-img>
                          </v-avatar>
                        </template>
                        <v-list-item-title>
                          <span v-if="item.raw.email" class="text-caption text-medium-emphasis">{{ item.raw.email }}</span>
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                    <template v-slot:chip="{}">
                      <div class="d-flex align-center" v-if="typeof bookingForUser === 'object' && bookingForUser && bookingForUser.name">
                        <v-avatar size="24" class="mr-2">
                          <v-img :src="`https://ui-avatars.com/api/?name=${bookingForUser.name}&background=3b82f6&color=fff`"></v-img>
                        </v-avatar>
                        <span>{{ bookingForUser.name }}</span>
                      </div>
                      <div class="d-flex align-center" v-else>
                        <v-icon size="24" class="mr-2" color="orange">mdi-account-plus</v-icon>
                        <span>{{ bookingForUser }}</span>
                      </div>
                    </template>
                  </v-combobox>

                  <v-textarea
                    v-model="adminNotes"
                    label="Admin Notes (Optional)"
                    placeholder="Add any additional notes about this booking..."
                    variant="outlined"
                    prepend-inner-icon="mdi-note-text"
                    rows="2"
                    hint="Internal notes - not visible to the customer"
                    persistent-hint
                  ></v-textarea>
                </v-card-text>
              </v-card>

              <!-- Notes / Special Requests Section -->
              <v-card variant="outlined" class="mt-4 notes-section">
                <v-card-text>
                  <h4 class="text-h6 mb-4">
                    <v-icon class="mr-2" color="info">mdi-message-text</v-icon>
                    Special Requests or Notes
                  </h4>

                  <v-textarea
                    v-model="bookingNotes"
                    label="Notes (Optional)"
                    placeholder="Any special requests or additional information? (e.g., preferred court location, accessibility requirements)"
                    variant="outlined"
                    prepend-inner-icon="mdi-note-text-outline"
                    rows="3"
                    auto-grow
                    counter="500"
                    :rules="[v => !v || v.length <= 500 || 'Notes must be less than 500 characters']"
                    hint="Optional - Add any special requests or information for your booking"
                    persistent-hint
                  ></v-textarea>
                </v-card-text>
              </v-card>

              <!-- Waitlist Booking Notice -->
              <v-card v-if="waitlistEnabled && hasWaitlistSlots" variant="outlined" class="mt-4 waitlist-notice">
                <v-card-text>
                  <h4 class="text-h6 mb-4">
                    <v-icon class="mr-2" color="warning">mdi-clock-alert</v-icon>
                    Waitlist Booking
                  </h4>

                  <v-alert type="warning" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">You are booking waitlisted time slot(s)</div>
                        <div class="text-caption mt-2">
                          <span v-if="allSlotsAreWaitlist">All your selected slots are waitlisted.</span>
                          <span v-else>Some of your selected slots are waitlisted.</span>
                          You will be notified via email if the slot becomes available.
                        </div>
                        <div class="text-caption mt-2">
                          <strong>Payment is not required at this time.</strong> You'll be able to upload proof of payment once notified.
                        </div>
                      </div>
                    </div>
                  </v-alert>
                </v-card-text>
              </v-card>

              <!-- Payment Options (only show if not all waitlist or if admin/staff can skip) -->
              <v-card v-if="!(waitlistEnabled && allSlotsAreWaitlist)" variant="outlined" class="mt-4 payment-options">
                <v-card-text>
                  <h4 class="text-h6 mb-4">
                    <v-icon class="mr-2" color="success">mdi-cellphone-check</v-icon>
                    {{ isAdminOrStaff ? 'Payment Options' : 'Payment Required' }}
                  </h4>

                  <v-alert v-if="!isAdminOrStaff && !hasWaitlistSlots" type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">Payment is required to complete your booking</div>
                        <div class="text-caption">All bookings must be paid via GCash before submission</div>
                      </div>
                    </div>
                  </v-alert>

                  <v-alert v-if="waitlistEnabled && hasWaitlistSlots && !allSlotsAreWaitlist" type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">Mixed booking: Available + Waitlist</div>
                        <div class="text-caption">Payment is only required for the available time slots. Waitlisted slots will require payment upon availability notification.</div>
                      </div>
                    </div>
                  </v-alert>

                  <!-- Admin/Staff can choose to skip payment -->
                  <v-alert v-if="isAdminOrStaff" type="info" variant="tonal" class="mb-4">
                    <div class="d-flex align-center">
                      <div>
                        <div class="font-weight-bold">As Admin/Staff, payment is optional</div>
                        <div class="text-caption">You can book time slots without payment, but they cannot be marked as "showed up" until payment is completed</div>
                      </div>
                    </div>
                  </v-alert>

                  <!-- Admin/Staff Payment Checkbox -->
                  <v-checkbox
                    v-if="isAdminOrStaff"
                    v-model="skipPayment"
                    label="Skip payment for now (book without payment)"
                    color="primary"
                    hide-details
                    class="mb-4"
                  ></v-checkbox>

                  <!-- GCash Payment Details -->
                  <v-card v-if="!skipPayment" variant="tonal" color="success" class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-avatar size="48" class="mr-3">
                        <v-icon size="32" color="success">mdi-cellphone-check</v-icon>
                      </v-avatar>
                      <div>
                        <h5 class="text-subtitle-1 font-weight-bold">GCash Payment</h5>
                        <p class="text-caption mb-0">Secure and instant payment</p>
                      </div>
                    </div>

                    <v-divider class="my-3"></v-divider>

                    <v-row>
                      <v-col cols="12" md="7">
                        <div class="text-body-2 mb-2">
                          <strong>Amount to Pay:</strong> ₱{{ calculateTotalPrice() }}
                        </div>

                        <ProofOfPaymentUpload
                          v-model="proofOfPayment"
                          v-model:reference-number="paymentReferenceNumber"
                          label="Proof of Payment"
                          placeholder="Upload screenshots"
                          density="compact"
                          :multiple="true"
                          hint="Upload screenshots of your GCash payment receipts (max 5MB each)"
                          :rules="skipPayment ? [] : [v => !!v && v.length > 0 || 'Proof of payment is required', validateFileSize]"
                        />
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
                            width="180"
                            height="180"
                          ></v-img>
                          <canvas v-else ref="gcashQrCanvas" class="gcash-qr-code"></canvas>
                          <div class="text-caption text-center mt-2 text-grey-darken-1">
                            GCash QR Code
                          </div>
                        </div>
                      </v-col>
                    </v-row>

                    <v-alert type="info" density="compact" class="mt-3">
                      <div class="text-caption">
                        <strong>Instructions:</strong>
                        <ol class="pl-4 mb-0">
                          <li>Scan QR code to pay ₱{{ calculateTotalPrice() }}</li>
                          <li>Take a screenshot of your payment receipt</li>
                          <li>Upload the screenshot above</li>
                          <li>Click "Checkout" to complete</li>
                        </ol>
                      </div>
                    </v-alert>
                  </v-card>
                </v-card-text>
              </v-card>

              <v-alert v-if="!skipPayment && !(waitlistEnabled && allSlotsAreWaitlist)" type="info" class="mt-4" icon="mdi-information">
                <div class="font-weight-bold mb-1">Booking Confirmation Process</div>
                <div>Your booking will be confirmed after payment verification.</div>
                <div class="text-caption mt-2">
                  <v-icon size="small" class="mr-1">mdi-clock-alert</v-icon>
                  Please note: There may be a carry over delay in the confirmation of your booking during weekends and holidays.
                </div>
              </v-alert>

              <v-alert v-if="skipPayment && isAdminOrStaff && !(waitlistEnabled && allSlotsAreWaitlist)" type="warning" class="mt-4" icon="mdi-alert">
                <div class="font-weight-bold">Booking without payment</div>
                <div class="text-caption">Time slots will be marked as booked, but cannot be marked as "showed up" until payment is completed.</div>
                <div class="text-caption mt-2">
                  <v-icon size="small" class="mr-1">mdi-clock-alert</v-icon>
                  Please note: There may be a carry over delay in the confirmation of your booking during weekends and holidays.
                </div>
              </v-alert>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
        <v-btn
          v-if="step < 3"
          color="primary"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Next
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <template v-else>
          <!-- Add to Cart button (hidden if user booking disabled) -->
          <v-btn
            color="info"
            variant="outlined"
            :loading="addingToCart"
            @click="addToCart"
            v-if="canUsersBook"
            class="mr-2"
          >
            <v-icon start>mdi-cart-plus</v-icon>
            Add to Cart
          </v-btn>
          <v-alert v-else type="info" variant="tonal" density="compact" class="mr-2">
            Booking creation is disabled for user accounts.
          </v-alert>

          <!-- Waitlist submission (all slots are waitlist) -->
          <v-btn
            v-if="waitlistEnabled && allSlotsAreWaitlist"
            color="warning"
            :loading="submitting"
            @click="submitWaitlistBooking"
          >
            <v-icon start>mdi-clock-alert</v-icon>
            Submit Waitlist
          </v-btn>

          <!-- Regular checkout with payment (no waitlist or mixed with payment required) -->
          <v-btn
            v-if="!(waitlistEnabled && allSlotsAreWaitlist) && !skipPayment"
            color="success"
            :loading="submitting"
            :disabled="!proofOfPayment || proofOfPayment.length === 0"
            @click="submitBookingWithGCash"
          >
            <v-icon start>mdi-cellphone-check</v-icon>
            Checkout
          </v-btn>

          <!-- Admin/Staff skip payment -->
          <v-btn
            v-if="!(waitlistEnabled && allSlotsAreWaitlist) && skipPayment && isAdminOrStaff"
            color="warning"
            :loading="submitting"
            @click="submitBookingWithoutPayment"
          >
            <v-icon start>mdi-calendar-check</v-icon>
            Book Without Payment
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Booking Disabled Snackbar -->
  <BookingDisabledSnackbar
    v-model="bookingDisabledSnackbar"
    :message="bookingDisabledMessage"
  />
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { courtService } from '../services/courtService'
import { bookingService } from '../services/bookingService'
import { cartService } from '../services/cartService'
import { sportService } from '../services/sportService'
import { paymentSettingService } from '../services/paymentSettingService'
import { companySettingService } from '../services/companySettingService'
import { authService } from '../services/authService'
import { productService } from '../services/productService'
import { formatTime, formatDateLong, formatPrice } from '../utils/formatters'
import api from '../services/api'
import Swal from 'sweetalert2'
import QRCode from 'qrcode'
import ProofOfPaymentUpload from './ProofOfPaymentUpload.vue'
import BookingDisabledSnackbar from './BookingDisabledSnackbar.vue'
import ProductSelector from './ProductSelector.vue'

export default {
  name: 'NewBookingDialog',
  components: {
    ProofOfPaymentUpload,
    BookingDisabledSnackbar,
    ProductSelector
  },
  props: {
    canUsersBook: {
      type: Boolean,
      default: true
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    preselectedSport: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'booking-created'],
  setup(props, { emit }) {
    // SweetAlert with custom z-index configuration
    const showAlert = (options) => {
      return Swal.fire({
        ...options,
        customClass: {
          container: 'swal2-container-high-z'
        },
        didOpen: () => {
          // Ensure the container has the highest z-index
          const container = document.querySelector('.swal2-container')
          if (container) {
            container.style.zIndex = '9999'
          }
        }
      })
    }

    const step = ref(1)
    const sports = ref([])
    const courts = ref([])
    const timeSlots = ref([])
    const loadingSlots = ref(false)
    const submitting = ref(false)
    const addingToCart = ref(false)

    // Payment options
    const paymentMethod = ref('gcash') // GCash payment is required
    const gcashQrCanvas = ref(null)
    const proofOfPayment = ref([])
    const paymentReferenceNumber = ref('')
    const skipPayment = ref(false) // Admin/Staff can skip payment

    // Payment settings from Payment Details module
    const paymentSettings = ref({
      payment_gcash_number: '0917-123-4567',
      payment_gcash_name: 'Company Name',
      payment_instructions: 'Please send payment to our GCash number and upload proof of payment.',
      payment_qr_code_url: null
    })

    // Selections
    const selectedSport = ref(null)
    const selectedDate = ref('')
    const courtTimeSlots = ref({}) // Store time slots per court: { courtId: { date: '', slots: [] } }
    const numberOfPlayers = ref(1) // Number of players for the booking
    const bookingNotes = ref('') // Customer notes/special requests

    // POS Products
    const selectedProducts = ref([])

    // Admin booking fields
    const bookingForUser = ref(null)
    const adminNotes = ref('')
    const currentUser = ref(null)
    const userNames = ref([])

    // Facebook page settings
    const facebookPageUrl = ref('')
    const facebookPageName = ref('')

    // Waitlist feature setting
    const waitlistEnabled = ref(true)

    // POS products feature setting
    const posProductsEnabled = ref(true)

    // Booking disabled snackbar
    const bookingDisabledSnackbar = ref(false)
    const bookingDisabledMessage = ref('')

    // Blocked dates
    const blockedBookingDates = ref([])
    const selectedDateBlockInfo = ref({ isBlocked: false, reason: '' })

    // Computed
    const minDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })

    // Computed property for max date - restrict regular users to current month only
    const maxDate = computed(() => {
      if (currentUser.value?.role === 'user') {
        const now = new Date()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        return endOfMonth.toISOString().split('T')[0]
      }
      return null // Admin and staff have no max date restriction
    })

    const isAdmin = computed(() => {
      return currentUser.value?.role === 'admin'
    })

    const isAdminOrStaff = computed(() => {
      return currentUser.value?.role === 'admin' || currentUser.value?.role === 'staff'
    })

    const filteredCourts = computed(() => {
      if (!selectedSport.value) return []

      return courts.value.filter(court => {
        if (!court.is_active) return false

        // Check if court supports the selected sport
        // Handle both single sport_id and multiple sports array
        if (court.sport_id === selectedSport.value.id) {
          return true
        }

        // Check if court has multiple sports (sports array)
        if (court.sports && Array.isArray(court.sports)) {
          return court.sports.some(sport => sport.id === selectedSport.value.id)
        }

        // Check if court has sport_ids array
        if (court.sport_ids && Array.isArray(court.sport_ids)) {
          return court.sport_ids.includes(selectedSport.value.id)
        }

        return false
      })
    })

    const canProceed = computed(() => {
      switch (step.value) {
        case 1: return selectedSport.value !== null && numberOfPlayers.value >= 1 && numberOfPlayers.value <= 100
        case 2: return Object.keys(courtTimeSlots.value).length > 0 &&
                       Object.values(courtTimeSlots.value).some(ct => ct.slots.length > 0)
        default: return false
      }
    })

    const totalBookings = computed(() => {
      return Object.values(courtTimeSlots.value).reduce((total, ct) => total + ct.slots.length, 0)
    })

    // Check if any selected slots are waitlist
    const hasWaitlistSlots = computed(() => {
      return Object.values(courtTimeSlots.value).some(ct =>
        ct.slots.some(slot => slot.is_waitlist)
      )
    })

    // Check if ALL selected slots are waitlist
    const allSlotsAreWaitlist = computed(() => {
      const allSlots = Object.values(courtTimeSlots.value).flatMap(ct => ct.slots)
      return allSlots.length > 0 && allSlots.every(slot => slot.is_waitlist)
    })

    // Calculate the overall time range from all selected slots (adjacent time sensitive)
    const overallTimeRange = computed(() => {
      const allSlots = []
      const slotCountMap = new Map() // Track count of each time slot across all courts

      Object.values(courtTimeSlots.value).forEach(courtData => {
        if (courtData.slots && courtData.slots.length > 0) {
          courtData.slots.forEach(slot => {
            const slotKey = `${slot.start}-${slot.end}`

            // Track all slots for range calculation
            allSlots.push({
              start: slot.start,
              end: slot.end
            })

            // Count how many times this time slot appears across all courts
            slotCountMap.set(slotKey, (slotCountMap.get(slotKey) || 0) + 1)
          })
        }
      })

      if (allSlots.length === 0) {
        return []
      }

      // Remove duplicates and sort by start time
      const uniqueSlots = []
      const seenSlots = new Set()
      allSlots.forEach(slot => {
        const key = `${slot.start}-${slot.end}`
        if (!seenSlots.has(key)) {
          seenSlots.add(key)
          uniqueSlots.push(slot)
        }
      })
      uniqueSlots.sort((a, b) => a.start.localeCompare(b.start))

      // Group consecutive/adjacent slots
      const timeRanges = []
      let currentRange = null
      let currentSlots = []

      uniqueSlots.forEach(slot => {
        if (!currentRange) {
          // Start a new range
          currentRange = {
            start: slot.start,
            end: slot.end
          }
          currentSlots = [slot]
        } else if (currentRange.end === slot.start) {
          // Slot is consecutive (end of current range matches start of this slot)
          currentRange.end = slot.end
          currentSlots.push(slot)
        } else {
          // Gap detected, save current range and start new one
          // Sum up the actual count of slots across all courts for this range
          const totalSlotCount = currentSlots.reduce((sum, s) => {
            const key = `${s.start}-${s.end}`
            return sum + (slotCountMap.get(key) || 0)
          }, 0)

          timeRanges.push({
            ...currentRange,
            slotCount: totalSlotCount
          })
          currentRange = {
            start: slot.start,
            end: slot.end
          }
          currentSlots = [slot]
        }
      })

      // Add the last range
      if (currentRange) {
        // Sum up the actual count of slots across all courts for this range
        const totalSlotCount = currentSlots.reduce((sum, s) => {
          const key = `${s.start}-${s.end}`
          return sum + (slotCountMap.get(key) || 0)
        }, 0)

        timeRanges.push({
          ...currentRange,
          slotCount: totalSlotCount
        })
      }

      return timeRanges
    })

    // Methods
    const getCourtSports = (court) => {
      const sportsList = []

      // If court has a single sport_id, find the sport object
      if (court.sport_id) {
        const sport = sports.value.find(s => s.id === court.sport_id)
        if (sport) {
          sportsList.push(sport)
        }
      }

      // If court has multiple sports array
      if (court.sports && Array.isArray(court.sports)) {
        court.sports.forEach(sport => {
          if (!sportsList.find(s => s.id === sport.id)) {
            sportsList.push(sport)
          }
        })
      }

      // If court has sport_ids array, find corresponding sport objects
      if (court.sport_ids && Array.isArray(court.sport_ids)) {
        court.sport_ids.forEach(sportId => {
          const sport = sports.value.find(s => s.id === sportId)
          if (sport && !sportsList.find(s => s.id === sport.id)) {
            sportsList.push(sport)
          }
        })
      }

      return sportsList
    }

    const selectSport = (sport) => {
      selectedSport.value = sport
      selectedDate.value = ''
      courtTimeSlots.value = {}
      timeSlots.value = {}
      // Reset to 1 player when changing sport
      if (numberOfPlayers.value === 0) {
        numberOfPlayers.value = 1
      }
    }

    const handleSlotClick = (courtId, slot) => {
      // Debug logging
      console.log('Slot clicked:', {
        courtId,
        start: slot.start,
        available: slot.available,
        is_waitlist_available: slot.is_waitlist_available,
        is_booked: slot.is_booked,
        waitlistEnabled: waitlistEnabled.value,
        canSelect: canSelectSlot(slot)
      })

      // Guard: Only proceed if slot can be selected
      if (!canSelectSlot(slot)) {
        console.warn('❌ Slot selection blocked - slot cannot be selected')
        return
      }

      console.log('✅ Proceeding with slot selection')
      toggleTimeSlot(courtId, slot)
    }

    const toggleTimeSlot = (courtId, slot) => {
      // Double-check: Ensure slot can be selected
      if (!canSelectSlot(slot)) {
        return
      }

      if (!courtTimeSlots.value[courtId]) {
        courtTimeSlots.value[courtId] = {
          date: selectedDate.value,
          slots: []
        }
      }

      const slots = courtTimeSlots.value[courtId].slots
      const index = slots.findIndex(s => s.start === slot.start)

      if (index > -1) {
        // Remove slot
        slots.splice(index, 1)
        // If no slots left for this court, remove the court entry
        if (slots.length === 0) {
          delete courtTimeSlots.value[courtId]
        }
      } else {
        // Add slot (include waitlist flag if waitlist is enabled)
        slots.push({
          ...slot,
          is_waitlist: waitlistEnabled.value && slot.is_waitlist_available && !slot.available
        })
      }
    }

    const isTimeSlotSelected = (courtId, slotStart) => {
      return courtTimeSlots.value[courtId]?.slots.some(s => s.start === slotStart) || false
    }

    // Helper function to get all CSS classes for a slot
    const getSlotClasses = (courtId, slot) => {
      const classes = ['time-slot-card']

      // Check if selected
      if (isTimeSlotSelected(courtId, slot.start)) {
        classes.push('selected')
      }

      // Check if slot can be selected
      const selectable = canSelectSlot(slot)

      if (!selectable) {
        // Slot is unavailable
        classes.push('unavailable')

        // Debug log for unavailable slots
        if (slot.is_waitlist_available) {
          console.log(`Slot ${slot.start} marked unavailable (waitlist disabled):`, {
            available: slot.available,
            is_waitlist_available: slot.is_waitlist_available,
            waitlistEnabled: waitlistEnabled.value,
            classes: [...classes]
          })
        }
      } else if (waitlistEnabled.value && slot.is_waitlist_available && !slot.available) {
        // Slot is available for waitlist (only if waitlist is enabled)
        classes.push('waitlist')

        console.log(`Slot ${slot.start} marked as waitlist:`, {
          waitlistEnabled: waitlistEnabled.value,
          classes: [...classes]
        })
      }

      return classes
    }

    // Helper function to determine if a slot can be selected
    const canSelectSlot = (slot) => {
      // If slot is available, it can always be selected
      if (slot.available) {
        return true
      }

      // If slot is not available and has waitlist
      if (slot.is_waitlist_available) {
        // Only allow selection if waitlist feature is enabled
        if (waitlistEnabled.value) {
          return true
        } else {
          // Waitlist is disabled, cannot select this slot
          return false
        }
      }

      // Otherwise, slot cannot be selected (fully booked, no waitlist)
      return false
    }

    // Helper function to get slot status label
    const getSlotStatusLabel = (slot) => {
      // If slot is booked (not available and not waitlist)
      if (slot.is_booked && !slot.is_waitlist_available) {
        return 'Booked'
      }

      // If waitlist is enabled and slot is waitlist-available
      if (waitlistEnabled.value && slot.is_waitlist_available && !slot.available) {
        return 'Waitlist'
      }

      // If waitlist is disabled but slot is waitlist-available, show as Booked
      if (!waitlistEnabled.value && slot.is_waitlist_available) {
        return 'Booked'
      }

      // If slot is not available for any other reason
      if (!slot.available) {
        return 'Booked'
      }

      // Slot is available
      return 'Available'
    }

    // Helper function to get slot status color
    const getSlotStatusColor = (slot) => {
      // If slot is booked (not available and not waitlist)
      if (slot.is_booked && !slot.is_waitlist_available) {
        return 'error'
      }

      // If waitlist is enabled and slot is waitlist-available
      if (waitlistEnabled.value && slot.is_waitlist_available && !slot.available) {
        return 'warning'
      }

      // If waitlist is disabled but slot is waitlist-available, show as error (booked)
      if (!waitlistEnabled.value && slot.is_waitlist_available) {
        return 'error'
      }

      // If slot is not available for any other reason
      if (!slot.available) {
        return 'error'
      }

      // Slot is available
      return 'success'
    }

    const nextStep = async () => {
      if (!canProceed.value) return

      // If moving from Step 2 to Step 3 and there are waitlist slots, show warning (only if waitlist is enabled)
      if (step.value === 2 && waitlistEnabled.value && hasWaitlistSlots.value) {
        const result = await showAlert({
          icon: 'warning',
          title: 'Waitlist Booking',
          html: `
            <div style="text-align: left;">
              <p><strong>You have selected time slot(s) that are currently pending approval for another user.</strong></p>
              <p style="margin-top: 12px;">By proceeding, you will be added to the waitlist:</p>
              <ul style="margin-top: 8px; padding-left: 20px;">
                <li>You <strong>cannot upload proof of payment</strong> at this time</li>
                <li>Your position will be secured in the waitlist queue</li>
                <li>You will receive an email notification if the slot becomes available</li>
                <li>You'll have <strong>1 hour to complete payment</strong> once notified</li>
              </ul>
              ${!allSlotsAreWaitlist.value ? '<p style="margin-top: 12px; color: #f59e0b;"><strong>⚠️ Note:</strong> Some of your selected slots are available, while others are waitlist. You can submit all together.</p>' : ''}
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Continue to Waitlist',
          cancelButtonText: 'Go Back',
          confirmButtonColor: '#f59e0b',
          width: '600px'
        })

        if (result.isConfirmed) {
          step.value++
        }
      } else {
        step.value++
      }
    }

    const loadTimeSlots = async () => {
      if (selectedCourts.value.length === 0 || !selectedDate.value) return

      loadingSlots.value = true
      try {
        // Load time slots for all selected courts
        const slotsPromises = selectedCourts.value.map(court =>
          courtService.getAvailableSlots(court.id, selectedDate.value)
            .then(slots => ({ courtId: court.id, slots }))
        )

        const results = await Promise.all(slotsPromises)

        // Store slots by court ID with deduplication
        const newTimeSlots = {}
        results.forEach(result => {
          // Deduplicate slots based on start-end time combination
          const uniqueSlots = []
          const seenKeys = new Set()

          result.slots.forEach(slot => {
            const key = `${slot.start}-${slot.end}`
            if (!seenKeys.has(key)) {
              seenKeys.add(key)
              uniqueSlots.push(slot)
            }
          })

          newTimeSlots[result.courtId] = uniqueSlots
        })
        timeSlots.value = newTimeSlots
      } catch (error) {
        showAlert({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load available time slots. Please try again.'
        })
      } finally {
        loadingSlots.value = false
      }
    }

    const loadTimeSlotsForAllCourts = async () => {
      if (!selectedDate.value) return

      loadingSlots.value = true
      try {
        // Load time slots for all filtered courts
        const slotsPromises = filteredCourts.value.map(court =>
          courtService.getAvailableSlots(court.id, selectedDate.value)
            .then(slots => ({ courtId: court.id, slots }))
        )

        const results = await Promise.all(slotsPromises)

        // Store slots by court ID with deduplication
        const newTimeSlots = {}
        results.forEach(result => {
          // Deduplicate slots based on start-end time combination
          const uniqueSlots = []
          const seenKeys = new Set()

          result.slots.forEach(slot => {
            const key = `${slot.start}-${slot.end}`
            if (!seenKeys.has(key)) {
              seenKeys.add(key)
              uniqueSlots.push(slot)
            }
          })

          newTimeSlots[result.courtId] = uniqueSlots
        })
        timeSlots.value = newTimeSlots
      } catch (error) {
        showAlert({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load available time slots. Please try again.'
        })
      } finally {
        loadingSlots.value = false
      }
    }

    // Use imported formatDate as formatDate alias
    const formatDate = formatDateLong

    /**
     * Get the price per hour for a specific date and time considering time-based pricing
     */
    const getPriceForDateTime = (dateTime) => {
      if (!selectedSport.value) {
        return 0
      }

      // Get all active time-based pricing rules for this sport, ordered by priority (highest first)
      const pricingRules = (selectedSport.value.time_based_pricing || [])
        .filter(rule => rule.is_active)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))

      // If no pricing rules exist, return the default price
      if (pricingRules.length === 0) {
        return parseFloat(selectedSport.value.price_per_hour || 0)
      }

      const dayOfWeek = dateTime.getDay() // 0 = Sunday, 1 = Monday, etc.
      const time = dateTime.toTimeString().substring(0, 8) // HH:mm:ss format

      // Find the first matching rule with highest priority
      for (const rule of pricingRules) {
        // Check if the rule has become effective yet
        if (rule.effective_date) {
          const effectiveDate = new Date(rule.effective_date)
          if (dateTime < effectiveDate) {
            continue // Skip rules that haven't reached their effective date
          }
        }

        // Check if the rule applies to this day of week
        const daysOfWeek = rule.days_of_week

        // If days_of_week is null or empty, rule applies to all days
        if (daysOfWeek && daysOfWeek.length > 0 && !daysOfWeek.includes(dayOfWeek)) {
          continue
        }

        // Check if the time falls within the rule's time range
        // Convert time strings to comparable format
        const ruleStart = rule.start_time.length === 5 ? `${rule.start_time}:00` : rule.start_time
        const ruleEnd = rule.end_time.length === 5 ? `${rule.end_time}:00` : rule.end_time

        if (time >= ruleStart && time < ruleEnd) {
          return parseFloat(rule.price_per_hour)
        }
      }

      // If no matching rule found, return the default price
      return parseFloat(selectedSport.value.price_per_hour || 0)
    }

    /**
     * Calculate total price for a time range considering time-based pricing
     */
    const calculatePriceForRange = (startDateTime, endDateTime) => {
      let totalPrice = 0
      const currentTime = new Date(startDateTime)

      // Handle midnight crossing: if end time is before start time, it means next day
      let adjustedEndDateTime = new Date(endDateTime)
      if (adjustedEndDateTime <= currentTime) {
        adjustedEndDateTime = new Date(adjustedEndDateTime.getTime() + 24 * 60 * 60 * 1000) // Add 1 day
      }

      // Calculate price for each hour segment
      while (currentTime < adjustedEndDateTime) {
        const nextHour = new Date(currentTime.getTime() + 60 * 60 * 1000) // Add 1 hour

        // If next hour exceeds end time, calculate partial hour
        if (nextHour > adjustedEndDateTime) {
          const fraction = (adjustedEndDateTime - currentTime) / (60 * 60 * 1000)
          totalPrice += getPriceForDateTime(currentTime) * fraction
          break
        }

        // Add full hour price
        totalPrice += getPriceForDateTime(currentTime)
        currentTime.setTime(nextHour.getTime())
      }

      return totalPrice
    }

    /**
     * Get pricing breakdown grouped by rates
     * Returns an array of rate groups with their slots and prices
     */
    const getPricingBreakdown = () => {
      const breakdown = new Map() // Using Map to group by rate

      Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
        const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
        if (court) {
          courtData.slots.forEach(slot => {
            // Create proper datetime objects with the selected date
            const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
            const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

            // Get the pricing rule that applies to this slot
            const pricePerHour = getPriceForDateTime(startDateTime)
            const slotPrice = calculatePriceForRange(startDateTime, endDateTime)

            // Find the pricing rule name
            let rateName = 'Standard Rate'
            let rateDescription = null

            if (selectedSport.value?.time_based_pricing) {
              const pricingRules = selectedSport.value.time_based_pricing
                .filter(rule => rule.is_active)
                .sort((a, b) => (b.priority || 0) - (a.priority || 0))

              const dayOfWeek = startDateTime.getDay()
              const time = startDateTime.toTimeString().substring(0, 8)

              for (const rule of pricingRules) {
                // Check if the rule has become effective yet
                if (rule.effective_date) {
                  const effectiveDate = new Date(rule.effective_date)
                  if (startDateTime < effectiveDate) {
                    continue // Skip rules that haven't reached their effective date
                  }
                }

                const daysOfWeek = rule.days_of_week
                if (daysOfWeek && daysOfWeek.length > 0 && !daysOfWeek.includes(dayOfWeek)) {
                  continue
                }

                const ruleStart = rule.start_time.length === 5 ? `${rule.start_time}:00` : rule.start_time
                const ruleEnd = rule.end_time.length === 5 ? `${rule.end_time}:00` : rule.end_time

                if (time >= ruleStart && time < ruleEnd) {
                  rateName = rule.name
                  rateDescription = `${formatTime(rule.start_time)} - ${formatTime(rule.end_time)}`
                  break
                }
              }
            }

            // Create a unique key for this rate
            const rateKey = `${pricePerHour}-${rateName}`

            if (!breakdown.has(rateKey)) {
              breakdown.set(rateKey, {
                rateName,
                rateDescription,
                pricePerHour,
                slots: [],
                totalPrice: 0
              })
            }

            const group = breakdown.get(rateKey)
            group.slots.push({
              courtId,
              courtName: court.name,
              surfaceType: court.surface_type,
              start: slot.start,
              end: slot.end,
              price: slotPrice
            })
            group.totalPrice += slotPrice
          })
        }
      })

      // Convert Map to array and sort by price (highest first)
      const result = Array.from(breakdown.values()).sort((a, b) => b.pricePerHour - a.pricePerHour)

      // Sort slots within each rate group by court name, then by start time
      result.forEach(rateGroup => {
        rateGroup.slots.sort((a, b) => {
          // First, compare by court name
          const courtComparison = a.courtName.localeCompare(b.courtName)
          if (courtComparison !== 0) {
            return courtComparison
          }
          // If court names are the same, compare by start time
          return a.start.localeCompare(b.start)
        })
      })

      return result
    }

    // Calculate booking amount (court slots only)
    const calculateBookingAmount = () => {
      let total = 0
      Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
        const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
        if (court) {
          courtData.slots.forEach(slot => {
            // Create proper datetime objects with the selected date
            const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
            const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

            // Use time-based pricing calculation
            const slotPrice = calculatePriceForRange(startDateTime, endDateTime)
            total += slotPrice
          })
        }
      })
      return total
    }

    // Calculate POS amount (products only)
    const calculatePosAmount = () => {
      return selectedProducts.value.reduce((sum, item) => {
        return sum + (parseFloat(item.product.price) * item.quantity)
      }, 0)
    }

    // Calculate total price (booking + POS)
    const calculateTotalPrice = () => {
      const bookingTotal = calculateBookingAmount()
      const posTotal = calculatePosAmount()
      return (bookingTotal + posTotal).toFixed(2)
    }

    // Validation function for file sizes
    const validateFileSize = (files) => {
      if (!files) return true
      const fileArray = Array.isArray(files) ? files : [files]
      return fileArray.every(file => file.size < 5242880) || 'Each file should be less than 5 MB'
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    const addToCart = async () => {
      addingToCart.value = true

      try {
        // Validate selections
        if (!selectedSport.value || !selectedDate.value) {
          showAlert({
            icon: 'warning',
            title: 'Incomplete Selection',
            text: 'Please select sport and time slots before adding to cart.'
          })
          addingToCart.value = false
          return
        }

        // Check if selected date is blocked (for regular users only)
        if (selectedDateBlockInfo.value.isBlocked && currentUser.value?.role === 'user') {
          showAlert({
            icon: 'error',
            title: 'Date Not Available',
            text: selectedDateBlockInfo.value.reason || 'This date is blocked for booking.'
          })
          addingToCart.value = false
          return
        }

        // Prepare admin booking data - include admin_notes even if not booking for someone else
        let adminBookingData = null
        if (isAdminOrStaff.value) {
          if (bookingForUser.value) {
            // Booking for another user
            if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
              adminBookingData = {
                booking_for_user_id: bookingForUser.value.id,
                booking_for_user_name: bookingForUser.value.name
              }
            } else {
              adminBookingData = {
                booking_for_user_name: bookingForUser.value
              }
            }
          }

          // Always include admin_notes if admin has entered them
          if (adminNotes.value) {
            if (!adminBookingData) {
              adminBookingData = {}
            }
            adminBookingData.admin_notes = adminNotes.value
          }

        }

        // Create cart items from current selections
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
          if (court && courtData.slots && courtData.slots.length > 0) {
            courtData.slots.forEach(slot => {
              // Create proper datetime objects with the selected date for accurate pricing
              const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
              const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

              // Use time-based pricing calculation
              const price = calculatePriceForRange(startDateTime, endDateTime)

              const numPlayers = parseInt(numberOfPlayers.value) || 1

              const cartItem = {
                court_id: court.id,
                sport_id: selectedSport.value.id,
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price,
                number_of_players: numPlayers,
                notes: bookingNotes.value || null
              }

              // Add admin booking fields to each cart item if admin is booking for someone
              if (adminBookingData) {
                Object.assign(cartItem, adminBookingData)
              }

              cartItems.push(cartItem)
            })
          }
        })

        if (cartItems.length === 0) {
          showAlert({
            icon: 'warning',
            title: 'No Time Slots Selected',
            text: 'Please select at least one time slot to add to booking.'
          })
          addingToCart.value = false
          return
        }

        // Add to booking via API
        const response = await cartService.addToCart(cartItems)

        // FIX #11: Handle improved waitlist response (supports multiple items and mixed scenarios)
        if (response.waitlisted) {
          // All items were waitlisted
          const totalWaitlisted = response.total_waitlisted || 1
          const waitlistEntries = response.waitlist_entries || [response.waitlist_entry]
          const firstEntry = waitlistEntries[0]
          const position = response.position

          let waitlistHtml = `
            <div style="text-align: left;">
              <p><strong>${totalWaitlisted > 1
                ? 'These time slots are currently pending approval for other users.'
                : 'This time slot is currently pending approval for another user.'}</strong></p>
              <p style="margin-top: 12px;">You have been added to the waitlist:</p>
          `

          if (totalWaitlisted === 1) {
            waitlistHtml += `
              <ul style="margin-top: 8px; padding-left: 20px;">
                <li><strong>Position:</strong> #${position} in queue</li>
                <li><strong>Court:</strong> ${firstEntry.court.name}</li>
                <li><strong>Time:</strong> ${new Date(firstEntry.start_time).toLocaleTimeString()} - ${new Date(firstEntry.end_time).toLocaleTimeString()}</li>
              </ul>
            `
          } else {
            waitlistHtml += `
              <ul style="margin-top: 8px; padding-left: 20px;">
                <li><strong>Total slots waitlisted:</strong> ${totalWaitlisted}</li>
            `
            waitlistEntries.slice(0, 3).forEach((entry, index) => {
              waitlistHtml += `
                <li><strong>Slot ${index + 1}:</strong> ${entry.court.name} - ${new Date(entry.start_time).toLocaleTimeString()} - ${new Date(entry.end_time).toLocaleTimeString()}</li>
              `
            })
            if (totalWaitlisted > 3) {
              waitlistHtml += `<li><em>...and ${totalWaitlisted - 3} more</em></li>`
            }
            waitlistHtml += `</ul>`
          }

          waitlistHtml += `
              <p style="margin-top: 12px; color: #ff9800;"><strong>📧 You will receive an email notification if ${totalWaitlisted > 1 ? 'any of the slots become' : 'the slot becomes'} available.</strong></p>
              <p style="margin-top: 8px; font-size: 0.9em; color: #666;">The notification will give you 1 hour to complete your booking.</p>
            </div>
          `

          showAlert({
            icon: 'info',
            title: '⏳ Added to Waitlist',
            html: waitlistHtml,
            confirmButtonText: 'OK',
            width: '600px'
          })

          emit('close')
          resetForm()
          return
        }

        // FIX #11: Handle mixed scenario (some added, some waitlisted)
        if (response.has_waitlist && response.total_waitlisted > 0) {
          const totalAdded = response.total_added || 0
          const totalWaitlisted = response.total_waitlisted || 0

          showAlert({
            icon: 'info',
            title: 'Booking Status',
            html: `
              <div style="text-align: left;">
                <p><strong>Your booking request has been processed:</strong></p>
                <ul style="margin-top: 12px; padding-left: 20px;">
                  ${totalAdded > 0 ? `<li>✅ <strong>${totalAdded}</strong> time slot(s) successfully added to cart</li>` : ''}
                  ${totalWaitlisted > 0 ? `<li>⏳ <strong>${totalWaitlisted}</strong> time slot(s) added to waitlist (pending approval from other users)</li>` : ''}
                </ul>
                ${totalWaitlisted > 0 ? '<p style="margin-top: 12px; color: #ff9800;"><strong>📧 You will receive email notifications if waitlisted slots become available.</strong></p>' : ''}
              </div>
            `,
            confirmButtonText: 'OK',
            width: '600px'
          })

          // Dispatch custom events to update cart count and refresh bookings
          window.dispatchEvent(new CustomEvent('cart-updated'))
          window.dispatchEvent(new CustomEvent('booking-created'))
          emit('booking-created')

          emit('close')
          resetForm()
          return
        }

        // Dispatch custom events to update cart count and refresh bookings
        window.dispatchEvent(new CustomEvent('cart-updated'))
        window.dispatchEvent(new CustomEvent('booking-created'))

        // Emit booking-created event to refresh bookings list
        emit('booking-created')

        showAlert({
          icon: 'success',
          title: 'Added to Cart!',
          html: `
            <p>Successfully added <strong>${cartItems.length}</strong> booking(s) to your cart!</p>
            <p class="text-muted">You can continue booking or checkout from the cart.</p>
          `,
          confirmButtonText: 'OK',
          timer: 3000
        })

        emit('close')
        resetForm()
      } catch (error) {

        // Check if this is a specific error response that we should handle specially
        const errorData = error.response?.data

        // FIX #11: Handle waitlist response from error (in case it comes as error)
        if (errorData?.waitlisted) {
          const totalWaitlisted = errorData.total_waitlisted || 1
          const waitlistEntries = errorData.waitlist_entries || [errorData.waitlist_entry]
          const firstEntry = waitlistEntries[0]
          const position = errorData.position

          let waitlistHtml = `
            <div style="text-align: left;">
              <p><strong>${totalWaitlisted > 1
                ? 'These time slots are currently pending approval for other users.'
                : 'This time slot is currently pending approval for another user.'}</strong></p>
              <p style="margin-top: 12px;">You have been added to the waitlist:</p>
          `

          if (totalWaitlisted === 1) {
            waitlistHtml += `
              <ul style="margin-top: 8px; padding-left: 20px;">
                <li><strong>Position:</strong> #${position} in queue</li>
                <li><strong>Court:</strong> ${firstEntry.court.name}</li>
                <li><strong>Time:</strong> ${new Date(firstEntry.start_time).toLocaleTimeString()} - ${new Date(firstEntry.end_time).toLocaleTimeString()}</li>
              </ul>
            `
          } else {
            waitlistHtml += `
              <ul style="margin-top: 8px; padding-left: 20px;">
                <li><strong>Total slots waitlisted:</strong> ${totalWaitlisted}</li>
            `
            waitlistEntries.slice(0, 3).forEach((entry, index) => {
              waitlistHtml += `
                <li><strong>Slot ${index + 1}:</strong> ${entry.court.name} - ${new Date(entry.start_time).toLocaleTimeString()} - ${new Date(entry.end_time).toLocaleTimeString()}</li>
              `
            })
            if (totalWaitlisted > 3) {
              waitlistHtml += `<li><em>...and ${totalWaitlisted - 3} more</em></li>`
            }
            waitlistHtml += `</ul>`
          }

          waitlistHtml += `
              <p style="margin-top: 12px; color: #ff9800;"><strong>📧 You will receive an email notification if ${totalWaitlisted > 1 ? 'any of the slots become' : 'the slot becomes'} available.</strong></p>
              <p style="margin-top: 8px; font-size: 0.9em; color: #666;">The notification will give you 1 hour to complete your booking.</p>
            </div>
          `

          showAlert({
            icon: 'info',
            title: '⏳ Added to Waitlist',
            html: waitlistHtml,
            confirmButtonText: 'OK',
            width: '600px'
          })

          emit('close')
          resetForm()
          return
        }

        // FIX #11: Handle mixed scenario from error path
        if (errorData?.has_waitlist && errorData?.total_waitlisted > 0) {
          const totalAdded = errorData.total_added || 0
          const totalWaitlisted = errorData.total_waitlisted || 0

          showAlert({
            icon: 'info',
            title: 'Booking Status',
            html: `
              <div style="text-align: left;">
                <p><strong>Your booking request has been processed:</strong></p>
                <ul style="margin-top: 12px; padding-left: 20px;">
                  ${totalAdded > 0 ? `<li>✅ <strong>${totalAdded}</strong> time slot(s) successfully added to cart</li>` : ''}
                  ${totalWaitlisted > 0 ? `<li>⏳ <strong>${totalWaitlisted}</strong> time slot(s) added to waitlist (pending approval from other users)</li>` : ''}
                </ul>
                ${totalWaitlisted > 0 ? '<p style="margin-top: 12px; color: #ff9800;"><strong>📧 You will receive email notifications if waitlisted slots become available.</strong></p>' : ''}
              </div>
            `,
            confirmButtonText: 'OK',
            width: '600px'
          })

          // Dispatch custom events to update cart count and refresh bookings
          window.dispatchEvent(new CustomEvent('cart-updated'))
          window.dispatchEvent(new CustomEvent('booking-created'))
          emit('booking-created')

          emit('close')
          resetForm()
          return
        }

        showAlert({
          icon: 'error',
          title: 'Failed',
          text: errorData?.message || 'Failed to add bookings to cart. Please try again.'
        })
      } finally {
        addingToCart.value = false
      }
    }

    const submitBookingWithGCash = async () => {
      if (!proofOfPayment.value || proofOfPayment.value.length === 0) {
        showAlert({
          icon: 'warning',
          title: 'Missing Proof of Payment',
          text: 'Please upload screenshot(s) of your GCash payment receipt(s).'
        })
        return
      }

      // Check if selected date is blocked (for regular users only)
      if (selectedDateBlockInfo.value.isBlocked && currentUser.value?.role === 'user') {
        showAlert({
          icon: 'error',
          title: 'Date Not Available',
          text: selectedDateBlockInfo.value.reason || 'This date is blocked for booking.'
        })
        return
      }

      submitting.value = true
      try {
        // Convert all proof of payment files to base64 array
        const proofBase64Array = []
        if (proofOfPayment.value && proofOfPayment.value.length > 0) {
          const files = Array.isArray(proofOfPayment.value) ? proofOfPayment.value : Array.from(proofOfPayment.value)

          for (const file of files) {
            const reader = new FileReader()
            const base64 = await new Promise((resolve) => {
              reader.onload = (e) => resolve(e.target.result)
              reader.readAsDataURL(file)
            })
            proofBase64Array.push(base64)
          }
        }

        // Prepare admin booking data - include admin_notes even if not booking for someone else
        let adminBookingData = null
        if (isAdminOrStaff.value) {
          if (bookingForUser.value) {
            // Booking for another user
            if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
              adminBookingData = {
                booking_for_user_id: bookingForUser.value.id,
                booking_for_user_name: bookingForUser.value.name
              }
            } else {
              adminBookingData = {
                booking_for_user_name: bookingForUser.value
              }
            }
          }

          // Always include admin_notes if admin has entered them
          if (adminNotes.value) {
            if (!adminBookingData) {
              adminBookingData = {}
            }
            adminBookingData.admin_notes = adminNotes.value
          }

        }

        // Create cart items array with admin booking fields
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
          if (court) {
            courtData.slots.forEach(slot => {
              // Create proper datetime objects with the selected date for accurate pricing
              const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
              const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

              // Use time-based pricing calculation
              const price = calculatePriceForRange(startDateTime, endDateTime)

              const numPlayers = parseInt(numberOfPlayers.value) || 1

              const cartItem = {
                court_id: parseInt(courtId),
                sport_id: selectedSport.value.id,
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price,
                number_of_players: numPlayers,
                notes: bookingNotes.value || null
              }

              // Add admin booking fields to each cart item
              if (adminBookingData) {
                Object.assign(cartItem, adminBookingData)
              }

              cartItems.push(cartItem)
            })
          }
        })

        // Add items to cart first
        await cartService.addToCart(cartItems)

        // Get the cart items that were just added
        const cartResponse = await cartService.getCartTransaction()
        const cartItemIds = cartResponse.cart_items.map(item => item.id)

        // Prepare POS items if any products selected and feature is enabled
        const posItems = posProductsEnabled.value ? selectedProducts.value.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.product.price),
          discount: item.discount || 0
        })) : []

        // Checkout with GCash payment (send array of base64 images) and POS items
        const bookingAmount = calculateBookingAmount()
        const posAmount = posProductsEnabled.value ? calculatePosAmount() : 0
        const totalAmount = bookingAmount + posAmount

        await cartService.checkout({
          payment_method: 'gcash',
          payment_reference_number: paymentReferenceNumber.value,
          proof_of_payment: proofBase64Array,
          selected_items: cartItemIds,
          pos_items: posItems,
          pos_amount: posAmount,
          booking_amount: bookingAmount,
          total_amount: totalAmount
        })

        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Emit booking-created event immediately to refresh the list
        emit('booking-created')

        // Dispatch global events immediately
        window.dispatchEvent(new CustomEvent('booking-created'))
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Show success message (non-blocking for list refresh)
        await showAlert({
          icon: 'success',
          title: 'Payment Successful!',
          html: `
            <p>Successfully created <strong>${cartItems.length}</strong> booking(s) with GCash payment!</p>
            <p class="text-success">Your bookings are confirmed and pending admin approval!</p>
          `,
          confirmButtonText: 'OK'
        })

        // Close dialog and reset form after user closes alert
        emit('close')
        resetForm()
      } catch (error) {

        let errorMessage = 'Failed to process GCash payment. Please try again.'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat()
          errorMessage = errors.join(', ')
        } else if (error.message) {
          errorMessage = error.message
        }

        showAlert({
          icon: 'error',
          title: 'Payment Failed',
          html: `<p>${errorMessage}</p>
                 ${error.response?.data?.errors ? '<pre style="text-align: left; font-size: 11px; max-height: 200px; overflow: auto;">' + JSON.stringify(error.response.data.errors, null, 2) + '</pre>' : ''}`
        })
      } finally {
        submitting.value = false
      }
    }

    const submitWaitlistBooking = async () => {
      submitting.value = true

      try {
        // Validate selections
        if (!selectedSport.value || !selectedDate.value) {
          showAlert({
            icon: 'warning',
            title: 'Incomplete Selection',
            text: 'Please select sport and time slots before submitting to waitlist.'
          })
          submitting.value = false
          return
        }

        // Check if selected date is blocked (for regular users only)
        if (selectedDateBlockInfo.value.isBlocked && currentUser.value?.role === 'user') {
          showAlert({
            icon: 'error',
            title: 'Date Not Available',
            text: selectedDateBlockInfo.value.reason || 'This date is blocked for booking.'
          })
          submitting.value = false
          return
        }

        // Prepare admin booking data if admin/staff
        let adminBookingData = null
        if (isAdminOrStaff.value) {
          if (bookingForUser.value) {
            if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
              adminBookingData = {
                booking_for_user_id: bookingForUser.value.id,
                booking_for_user_name: bookingForUser.value.name
              }
            } else {
              adminBookingData = {
                booking_for_user_name: bookingForUser.value
              }
            }
          }
          if (adminNotes.value) {
            if (!adminBookingData) {
              adminBookingData = {}
            }
            adminBookingData.admin_notes = adminNotes.value
          }
        }

        // Create cart items array for waitlist booking
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
          if (court) {
            courtData.slots.forEach(slot => {
              const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
              const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)
              const price = calculatePriceForRange(startDateTime, endDateTime)
              const numPlayers = parseInt(numberOfPlayers.value) || 1

              const cartItem = {
                court_id: parseInt(courtId),
                sport_id: selectedSport.value.id,
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price,
                number_of_players: numPlayers,
                notes: bookingNotes.value || null,
                is_waitlist: true // Mark as waitlist booking
              }

              if (adminBookingData) {
                Object.assign(cartItem, adminBookingData)
              }

              cartItems.push(cartItem)
            })
          }
        })

        if (cartItems.length === 0) {
          showAlert({
            icon: 'warning',
            title: 'No Time Slots Selected',
            text: 'Please select at least one time slot for waitlist.'
          })
          submitting.value = false
          return
        }

        // Submit to waitlist via addToCart (which handles waitlist logic)
        const response = await cartService.addToCart(cartItems)

        // Dispatch events to update UI
        window.dispatchEvent(new CustomEvent('cart-updated'))
        window.dispatchEvent(new CustomEvent('booking-created'))
        emit('booking-created')

        // Show success message
        await showAlert({
          icon: 'success',
          title: 'Added to Waitlist!',
          html: `
            <div style="text-align: left;">
              <p>Successfully added <strong>${cartItems.length}</strong> booking(s) to the waitlist!</p>
              <p style="margin-top: 12px;">📧 You will receive an email notification when the slot becomes available.</p>
              <p style="margin-top: 8px; color: #666; font-size: 0.9em;">The notification will give you 1 hour to complete your booking with payment.</p>
            </div>
          `,
          confirmButtonText: 'OK'
        })

        emit('close')
        resetForm()
      } catch (error) {
        let errorMessage = 'Failed to add bookings to waitlist. Please try again.'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        showAlert({
          icon: 'error',
          title: 'Waitlist Failed',
          text: errorMessage
        })
      } finally {
        submitting.value = false
      }
    }

    const submitBookingWithoutPayment = async () => {
      submitting.value = true

      try {
        // Validate selections
        if (!selectedSport.value || !selectedDate.value) {
          showAlert({
            icon: 'warning',
            title: 'Incomplete Selection',
            text: 'Please select sport and time slots before booking.'
          })
          submitting.value = false
          return
        }

        // Check if selected date is blocked (for regular users only)
        if (selectedDateBlockInfo.value.isBlocked && currentUser.value?.role === 'user') {
          showAlert({
            icon: 'error',
            title: 'Date Not Available',
            text: selectedDateBlockInfo.value.reason || 'This date is blocked for booking.'
          })
          submitting.value = false
          return
        }

        // Prepare admin booking data - include admin_notes even if not booking for someone else
        let adminBookingData = null
        if (isAdminOrStaff.value) {
          if (bookingForUser.value) {
            // Booking for another user
            if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
              adminBookingData = {
                booking_for_user_id: bookingForUser.value.id,
                booking_for_user_name: bookingForUser.value.name
              }
            } else {
              adminBookingData = {
                booking_for_user_name: bookingForUser.value
              }
            }
          }

          // Always include admin_notes if admin/staff has entered them
          if (adminNotes.value) {
            if (!adminBookingData) {
              adminBookingData = {}
            }
            adminBookingData.admin_notes = adminNotes.value
          }

        }

        // Create cart items array with admin booking fields
        const cartItems = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          const court = filteredCourts.value.find(c => c.id === parseInt(courtId))
          if (court) {
            courtData.slots.forEach(slot => {
              // Create proper datetime objects with the selected date for accurate pricing
              const startDateTime = new Date(`${selectedDate.value}T${slot.start}:00`)
              const endDateTime = new Date(`${selectedDate.value}T${slot.end}:00`)

              // Use time-based pricing calculation
              const price = calculatePriceForRange(startDateTime, endDateTime)

              const numPlayers = parseInt(numberOfPlayers.value) || 1

              const cartItem = {
                court_id: parseInt(courtId),
                sport_id: selectedSport.value.id,
                booking_date: selectedDate.value,
                start_time: slot.start,
                end_time: slot.end,
                price: price,
                number_of_players: numPlayers,
                notes: bookingNotes.value || null
              }

              // Add admin booking fields to each cart item
              if (adminBookingData) {
                Object.assign(cartItem, adminBookingData)
              }

              cartItems.push(cartItem)
            })
          }
        })

        if (cartItems.length === 0) {
          showAlert({
            icon: 'warning',
            title: 'No Time Slots Selected',
            text: 'Please select at least one time slot to book.'
          })
          submitting.value = false
          return
        }

        // Add items to cart first
        await cartService.addToCart(cartItems)

        // Get the cart items that were just added
        const cartResponse = await cartService.getCartTransaction()
        const cartItemIds = cartResponse.cart_items.map(item => item.id)

        // Prepare POS items if any products selected and feature is enabled
        const posItems = posProductsEnabled.value ? selectedProducts.value.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.product.price),
          discount: item.discount || 0
        })) : []

        // Checkout without payment, including POS items
        const bookingAmount = calculateBookingAmount()
        const posAmount = posProductsEnabled.value ? calculatePosAmount() : 0
        const totalAmount = bookingAmount + posAmount

        await cartService.checkout({
          payment_method: 'pending',
          payment_reference_number: paymentReferenceNumber.value,
          skip_payment: true,
          selected_items: cartItemIds,
          pos_items: posItems,
          pos_amount: posAmount,
          booking_amount: bookingAmount,
          total_amount: totalAmount
        })

        // Dispatch cart updated event
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Emit booking-created event immediately to refresh the list
        emit('booking-created')

        // Dispatch global events immediately
        window.dispatchEvent(new CustomEvent('booking-created'))
        window.dispatchEvent(new CustomEvent('cart-updated'))

        // Show success message (non-blocking for list refresh)
        await showAlert({
          icon: 'success',
          title: 'Booking Created!',
          html: `
            <p>Successfully created <strong>${cartItems.length}</strong> booking(s) without payment!</p>
            <p class="text-warning">Remember: These bookings cannot be marked as "showed up" until payment is completed.</p>
          `,
          confirmButtonText: 'OK'
        })

        // Close dialog and reset form after user closes alert
        emit('close')
        resetForm()
      } catch (error) {

        let errorMessage = 'Failed to create bookings. Please try again.'

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat()
          errorMessage = errors.join(', ')
        } else if (error.message) {
          errorMessage = error.message
        }

        showAlert({
          icon: 'error',
          title: 'Booking Failed',
          html: `<p>${errorMessage}</p>
                 ${error.response?.data?.errors ? '<pre style="text-align: left; font-size: 11px; max-height: 200px; overflow: auto;">' + JSON.stringify(error.response.data.errors, null, 2) + '</pre>' : ''}`
        })
      } finally {
        submitting.value = false
      }
    }

    const submitBooking = async () => {
      submitting.value = true
      try {
        // Check if selected date is blocked (for regular users only)
        if (selectedDateBlockInfo.value.isBlocked && currentUser.value?.role === 'user') {
          showAlert({
            icon: 'error',
            title: 'Date Not Available',
            text: selectedDateBlockInfo.value.reason || 'This date is blocked for booking.'
          })
          submitting.value = false
          return
        }

        // Prepare admin booking data if admin/staff is booking for someone else
        const adminBookingData = {}
        if (isAdminOrStaff.value && bookingForUser.value) {
          // Check if bookingForUser is an object (existing user) or string (custom name)
          if (typeof bookingForUser.value === 'object' && bookingForUser.value.id) {
            adminBookingData.booking_for_user_id = bookingForUser.value.id
            adminBookingData.booking_for_user_name = bookingForUser.value.name
          } else {
            adminBookingData.booking_for_user_name = bookingForUser.value
          }

          if (adminNotes.value) {
            adminBookingData.admin_notes = adminNotes.value
          }
        }

        // Create an array of all bookings to be created
        const bookingsToCreate = []
        Object.entries(courtTimeSlots.value).forEach(([courtId, courtData]) => {
          courtData.slots.forEach(slot => {
            // Format start and end times properly
            const startDateTime = `${selectedDate.value} ${slot.start}:00`
            const endDateTime = `${selectedDate.value} ${slot.end}:00`

            bookingsToCreate.push({
              court_id: parseInt(courtId),
              start_time: startDateTime,
              end_time: endDateTime,
              ...adminBookingData
            })
          })
        })

        // Create all bookings
        const bookingPromises = bookingsToCreate.map(bookingData =>
          bookingService.createBooking(bookingData)
        )

        await Promise.all(bookingPromises)

        showAlert({
          icon: 'success',
          title: 'Bookings Created!',
          html: `
            <p>Successfully created <strong>${bookingsToCreate.length}</strong> booking(s)!</p>
            <p class="text-muted">All bookings are pending approval.</p>
          `,
          confirmButtonText: 'OK'
        })

        emit('booking-created')
        emit('close')
        resetForm()
      } catch (error) {
        showAlert({
          icon: 'error',
          title: 'Booking Failed',
          text: error.response?.data?.message || 'Failed to create some bookings. Please try again.'
        })
      } finally {
        submitting.value = false
      }
    }

    const resetForm = () => {
      step.value = 1
      selectedSport.value = null
      selectedDate.value = ''
      courtTimeSlots.value = {}
      timeSlots.value = {}
      numberOfPlayers.value = 1
      bookingNotes.value = ''
      paymentMethod.value = 'gcash'
      proofOfPayment.value = []
      paymentReferenceNumber.value = ''
      skipPayment.value = false
      selectedProducts.value = [] // Reset POS products
      // Reset admin fields
      bookingForUser.value = null
      adminNotes.value = ''
    }

    const fetchSports = async () => {
      try {
        // Get current user and check if they can create bookings
        const user = await authService.getCurrentUser()
        const canBook = await companySettingService.canUserCreateBookings(user?.role || 'user')

        if (!canBook) {
          bookingDisabledMessage.value = 'Booking is currently disabled. Please contact the administrator for more information.'
          bookingDisabledSnackbar.value = true
          return // Don't fetch sports if booking is disabled
        }

        sports.value = await courtService.getSports()
      } catch (error) {
        console.error('Error fetching sports:', error)
      }
    }

    const fetchCourts = async () => {
      try {
        courts.value = await courtService.getCourts()
      } catch (error) {
      }
    }

    const fetchCurrentUser = async () => {
      try {
        currentUser.value = await authService.getCurrentUser()
      } catch (error) {
        currentUser.value = null
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users')

        if (response.data.success && response.data.data) {
          userNames.value = response.data.data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }))
        } else {
          userNames.value = []
        }
      } catch (error) {
        userNames.value = []
      }
    }

    // Fetch waitlist and POS products configuration
    const fetchWaitlistConfig = async () => {
      try {
        const settings = await companySettingService.getSettings()
        waitlistEnabled.value = settings.waitlist_enabled !== undefined ? settings.waitlist_enabled : true
        posProductsEnabled.value = settings.pos_products_enabled !== undefined ? settings.pos_products_enabled : true
        console.log('Booking config loaded:', {
          waitlist_enabled: settings.waitlist_enabled,
          waitlistEnabled: waitlistEnabled.value,
          pos_products_enabled: settings.pos_products_enabled,
          posProductsEnabled: posProductsEnabled.value
        })
      } catch (error) {
        console.error('Failed to load booking config:', error)
        // Default to true if loading fails
        waitlistEnabled.value = true
        posProductsEnabled.value = true
      }
    }

    // Re-check if currently selected date is blocked (called when settings are updated)
    const recheckBlockedDates = async () => {
      if (selectedDate.value && currentUser.value) {
        const result = await companySettingService.isDateBlocked(selectedDate.value, currentUser.value.role)
        selectedDateBlockInfo.value = result
        console.log('Rechecked blocked dates for:', selectedDate.value, result)
      }
    }

    // Handler for company settings updated event
    const handleCompanySettingsUpdated = async () => {
      await fetchWaitlistConfig()
      await recheckBlockedDates()
    }

    // Watchers
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
          const amount = calculateTotalPrice()

          // Generate QR code with GCash payment link format
          const qrData = `gcash://pay?number=${gcashNumber}&amount=${amount}&name=${accountName}`

          await QRCode.toCanvas(gcashQrCanvas.value, qrData, {
            width: 180,
            margin: 2,
            color: {
              dark: '#2e7d32',
              light: '#ffffff'
            }
          })
        }
      } catch (error) {
        // Keep default values if loading fails
      }
    }

    // Watch for payment method change to generate QR
    watch(paymentMethod, async (newMethod) => {
      if (newMethod === 'gcash') {
        await nextTick()
        setTimeout(() => {
          generateGCashQR()
        }, 100)
      }
    })

    // Watch for step changes to generate QR code on step 3
    watch(step, async (newStep) => {
      if (newStep === 3) {
        // Generate QR code when reaching confirmation step
        await nextTick()
        setTimeout(() => {
          generateGCashQR()
        }, 100)
      }
    })

    watch(() => props.isOpen, async (newValue) => {
      if (newValue) {
        // Refresh waitlist config when dialog opens
        await fetchWaitlistConfig()

        await fetchSports()
        await fetchCourts()
        await fetchCurrentUser()

        // Only fetch users if the current user is admin or staff
        if (isAdminOrStaff.value) {
          fetchUsers()
        }

        // Load Facebook page settings and blocked dates
        try {
          const settings = await companySettingService.getSettings()
          facebookPageUrl.value = settings.facebook_page_url || ''
          facebookPageName.value = settings.facebook_page_name || ''
          blockedBookingDates.value = settings.blocked_booking_dates || []
        } catch (error) {
        }

        // If a preselected sport is provided, select it and move to step 2
        if (props.preselectedSport) {
          await nextTick()
          // Find the sport in the loaded sports list by ID
          const sport = sports.value.find(s => s.id === props.preselectedSport.id)
          if (sport) {
            selectSport(sport)
            step.value = 2
          }
        }
      } else {
        resetForm()
      }
    })

    // Add event listener for booking updates to refresh availability
    const handleBookingUpdated = () => {
      // Only reload if we're on step 2 (time slot selection) and have a selected date
      if (step.value === 2 && selectedDate.value) {
        loadTimeSlotsForAllCourts()
      }
    }

    onMounted(async () => {
      // Load waitlist configuration immediately on mount
      await fetchWaitlistConfig()

      if (props.isOpen) {
        await fetchSports()
        await fetchCourts()
        await fetchCurrentUser()

        // Only fetch users if the current user is admin or staff
        if (isAdminOrStaff.value) {
          fetchUsers()
        }

        // Load Facebook page settings and blocked dates
        try {
          const settings = await companySettingService.getSettings()
          facebookPageUrl.value = settings.facebook_page_url || ''
          facebookPageName.value = settings.facebook_page_name || ''
          blockedBookingDates.value = settings.blocked_booking_dates || []
        } catch (error) {
        }

        // If a preselected sport is provided, select it and move to step 2
        if (props.preselectedSport) {
          await nextTick()
          const sport = sports.value.find(s => s.id === props.preselectedSport.id)
          if (sport) {
            selectSport(sport)
            step.value = 2
          }
        }
      }

      // Listen for booking updates to refresh availability
      window.addEventListener('booking-updated', handleBookingUpdated)
      window.addEventListener('booking-created', handleBookingUpdated)

      // Listen for company settings updates to refresh waitlist config and blocked dates
      window.addEventListener('company-settings-updated', handleCompanySettingsUpdated)
    })

    // Watch for selected date changes to check if it's blocked
    watch(selectedDate, async (newDate) => {
      if (newDate && currentUser.value) {
        const result = await companySettingService.isDateBlocked(newDate, currentUser.value.role)
        selectedDateBlockInfo.value = result
      } else {
        selectedDateBlockInfo.value = { isBlocked: false, reason: '' }
      }
    })

    // Cleanup event listeners when component is unmounted
    onUnmounted(() => {
      window.removeEventListener('booking-updated', handleBookingUpdated)
      window.removeEventListener('booking-created', handleBookingUpdated)
      window.removeEventListener('company-settings-updated', handleCompanySettingsUpdated)
    })

    return {
      step,
      sports,
      courts,
      timeSlots,
      loadingSlots,
      submitting,
      addingToCart,
      paymentMethod,
      gcashQrCanvas,
      proofOfPayment,
      paymentReferenceNumber,
      paymentSettings,
      skipPayment,
      selectedSport,
      selectedDate,
      courtTimeSlots,
      numberOfPlayers,
      bookingNotes,
      minDate,
      maxDate,
      filteredCourts,
      canProceed,
      totalBookings,
      overallTimeRange,
      getCourtSports,
      selectSport,
      handleSlotClick,
      toggleTimeSlot,
      isTimeSlotSelected,
      getSlotClasses,
      canSelectSlot,
      getSlotStatusLabel,
      getSlotStatusColor,
      nextStep,
      loadTimeSlots,
      loadTimeSlotsForAllCourts,
      formatTime,
      formatDate,
      formatPrice,
      getPricingBreakdown,
      calculateTotalPrice,
      calculateBookingAmount,
      calculatePosAmount,
      validateFileSize,
      generateGCashQR,
      handleImageError,
      addToCart,
      submitBookingWithGCash,
      submitBookingWithoutPayment,
      submitWaitlistBooking,
      submitBooking,
      hasWaitlistSlots,
      allSlotsAreWaitlist,
      // POS Products
      selectedProducts,
      // Admin fields
      isAdmin,
      isAdminOrStaff,
      bookingForUser,
      adminNotes,
      userNames,
      // Facebook page settings
      facebookPageUrl,
      facebookPageName,
      // Waitlist feature setting
      waitlistEnabled,
      // POS products feature setting
      posProductsEnabled,
      // Booking disabled snackbar
      bookingDisabledSnackbar,
      bookingDisabledMessage,
      blockedBookingDates,
      selectedDateBlockInfo,
      // Services
      sportService
    }
  }
}
</script>

<style scoped>
.booking-dialog {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  background: #ffffff !important;
}

/* Fixed Header */
.booking-dialog > .v-card-title,
.booking-dialog > .dialog-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Scrollable Content */
.booking-dialog .v-card-text {
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 180px);
  background: #ffffff !important;
  color: #1f2937 !important;
}

/* Fixed Footer */
.booking-dialog > .v-card-actions {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: white;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}

/* Ensure all text is dark and visible */
.booking-dialog h2,
.booking-dialog h3,
.booking-dialog h4,
.booking-dialog p,
.booking-dialog div,
.booking-dialog span,
.booking-dialog label {
  color: #1f2937 !important;
}

.booking-dialog .text-grey,
.booking-dialog .text-subtitle-2 {
  color: #6b7280 !important;
}

.booking-dialog .v-label {
  color: #374151 !important;
}

.booking-dialog .v-field__input {
  color: #1f2937 !important;
}

.booking-dialog .v-text-field input {
  color: #1f2937 !important;
}

.booking-dialog .v-select__selection {
  color: #1f2937 !important;
}

.step-content {
  color: #1f2937 !important;
}

.step-content h3,
.step-content h4 {
  color: #1f2937 !important;
}

.gap-2 {
  gap: 8px;
}

/* Fix SweetAlert z-index to appear above Vuetify dialogs */
:deep(.swal2-container) {
  z-index: 9999 !important;
}

:deep(.swal2-popup) {
  z-index: 10000 !important;
}

:deep(.swal2-container-high-z) {
  z-index: 9999 !important;
}

/* Custom Stepper Header */
.stepper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  position: relative;
}

.stepper-header::before {
  content: '';
  position: absolute;
  top: 28px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: #e0e0e0;
  z-index: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step-indicator.active .step-number {
  background: #1976d2;
  color: white;
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
}

.step-indicator.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #666 !important;
  text-align: center;
}

.step-indicator.active .step-label {
  color: #1976d2 !important;
  font-weight: bold;
}

.step-indicator.completed .step-label {
  color: #4caf50 !important;
}

.dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
}

.step-content {
  min-height: 400px;
  padding: 16px;
  overflow: hidden;
}

/* Sport Cards */
.sport-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #ffffff !important;
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.sport-card .v-card-text {
  color: #1f2937 !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.sport-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #90caf9;
}

.sport-card.selected {
  border-color: #1976d2 !important;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(21, 101, 192, 0.05) 100%) !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3) !important;
  transform: scale(1.0);
}

.sport-card.selected::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1976d2;
  border-radius: inherit;
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}

.sport-card.selected .sport-icon-large {
  color: #1976d2 !important;
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.sport-card.selected h4 {
  color: #1976d2 !important;
  font-weight: 700 !important;
}

.sport-icon-large {
  font-size: 64px;
  line-height: 1;
  transition: all 0.3s ease;
}

.sport-card h4 {
  margin-top: 12px !important;
  margin-bottom: 8px !important;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sport-card p {
  margin: 0 !important;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Court Cards */
.court-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  background: #ffffff !important;
}

.court-card .v-card-title,
.court-card .v-card-text,
.court-card .v-card-subtitle {
  color: #1f2937 !important;
}

.court-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.court-card.selected {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05) !important;
}

.selection-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #1976d2;
  border-radius: 50%;
  padding: 4px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.court-image-container {
  height: 100%;
  min-height: 150px;
  overflow: hidden;
}

.court-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.court-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.amenities-chips {
  margin-top: 8px;
}

/* Time Slots Grid */
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.time-slot-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: #ffffff !important;
  position: relative;
  overflow: hidden;
}

/* Customer Name Label */
.customer-name-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  color: #1f2937 !important;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
}

.customer-name-label span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.7rem;
}

.time-slot-card.unavailable .customer-name-label {
  background: rgba(0, 0, 0, 0.1);
  color: #6b7280 !important;
}

.time-slot-card.waitlist .customer-name-label {
  background: rgba(255, 152, 0, 0.1);
  color: #92400e !important;
}

.time-slot-card .v-card-text {
  color: #1f2937 !important;
}

.selected-check-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.time-slot-card:hover:not(.unavailable) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #90caf9;
}

.time-slot-card.selected {
  border-color: #1976d2 !important;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(21, 101, 192, 0.1) 100%) !important;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3) !important;
  transform: scale(1.05);
}

.time-slot-card.selected::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1976d2;
  border-radius: inherit;
  animation: pulse 2s ease-in-out infinite;
}

.time-slot-card.selected .v-card-text {
  font-weight: 600 !important;
  color: #1976d2 !important;
}

.time-slot-card.selected .v-chip {
  background: #1976d2 !important;
  color: white !important;
}

.time-slot-card.unavailable,
.time-slot-card[disabled],
.time-slot-card:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  background: #f5f5f5 !important;
  pointer-events: none !important;
}

.time-slot-card.unavailable * {
  pointer-events: none !important;
}

.time-slot-card.waitlist:not(.unavailable) {
  border-color: #ff9800;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(251, 140, 0, 0.05) 100%) !important;
}

.time-slot-card.waitlist:not(.unavailable):hover {
  border-color: #ff9800;
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
}

/* Ensure unavailable always wins */
.time-slot-card.unavailable.waitlist {
  border-color: transparent !important;
  background: #f5f5f5 !important;
}

.time-slot-card.waitlist:not(.unavailable) .v-chip {
  background: #ff9800 !important;
  color: white !important;
}

.time-slot-card:not(.unavailable):not(.waitlist) .v-chip {
  background: #4caf50 !important;
  color: white !important;
}

.time-slot-card.unavailable .v-chip {
  background: #9e9e9e !important;
  color: white !important;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Booking Summary */
.booking-summary {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Overall Time Range */
.overall-time-range {
  border-left: 4px solid #1976d2;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%);
}

/* Pricing Breakdown */
.pricing-breakdown {
  margin-bottom: 16px;
}

/* POS Products Breakdown */
.pos-products-breakdown {
  margin-bottom: 16px;
}

.pos-products-breakdown .v-card {
  border-left: 4px solid #4caf50;
  transition: all 0.3s ease;
}

.pos-products-breakdown .v-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.rate-group-section {
  margin-bottom: 12px;
}

.rate-group-section .v-card {
  border-left: 4px solid #2196f3;
  transition: all 0.3s ease;
}

.rate-group-section .v-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* Scrolling removed - shows all items without overflow */
.rate-slots-list {
  display: flex;
  flex-direction: column;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  color: #1f2937 !important;
}

.summary-item strong {
  color: #1f2937 !important;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-total {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  color: #1f2937 !important;
}

/* Notes Section */
.notes-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.notes-section h4 {
  color: #1e40af !important;
}

.notes-section .v-textarea {
  background: white;
  border-radius: 8px;
}

/* Payment Options */
.payment-options {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow: hidden;
}

.payment-options h4,
.payment-options p,
.payment-options div {
  color: #1f2937 !important;
}

.gcash-details {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  color: #1f2937 !important;
}

.gcash-details p,
.gcash-details div,
.gcash-details strong {
  color: #1f2937 !important;
}

/* GCash QR Code */
.gcash-qr-container {
  background: white;
  padding: 12px;
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

.court-bookings-section {
  margin-bottom: 16px;
}

.time-slot-bookings-section {
  margin-bottom: 16px;
}

.time-slots-list {
  display: flex;
  flex-wrap: wrap;
}

.courts-list {
  display: flex;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 1280px) {
  .v-dialog.responsive-dialog {
    margin: 0 !important;
  }

  .booking-dialog {
    max-height: 100vh;
    height: 100vh;
  }
}

@media (max-width: 960px) {
  .dialog-header {
    flex-direction: column;
    align-items: flex-start !important;
    padding: 16px !important;
  }

  .header-content {
    margin-bottom: 8px;
  }

  .header-content h2 {
    font-size: 1.25rem !important;
  }

  .stepper-header {
    flex-wrap: wrap;
    gap: 8px;
  }

  .step-indicator {
    flex: 0 0 calc(50% - 4px);
    min-width: 0;
  }

  .step-label {
    font-size: 0.75rem !important;
  }

  .step-number {
    width: 30px !important;
    height: 30px !important;
    font-size: 0.875rem !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }

  .summary-item {
    flex-direction: column;
    align-items: flex-start !important;
  }
}

@media (max-width: 600px) {
  /* Mobile content optimizations - keeping modal height */
  .v-card-text {
    padding: 12px !important;
  }

  .dialog-header {
    padding: 12px !important;
  }

  .header-content h2 {
    font-size: 1.1rem !important;
  }

  .header-content .v-icon {
    display: none;
  }

  .stepper-header {
    gap: 4px;
  }

  .step-indicator {
    flex: 0 0 calc(50% - 2px);
  }

  .step-label {
    font-size: 0.7rem !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .step-number {
    width: 24px !important;
    height: 24px !important;
    font-size: 0.75rem !important;
    margin-bottom: 4px !important;
  }

  .sport-card,
  .court-card {
    margin-bottom: 8px;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 6px;
  }

  .time-slot-card .v-card-text {
    padding: 8px !important;
    font-size: 0.8rem !important;
  }

  .customer-name-label {
    padding: 2px 4px;
  }

  .customer-name-label span {
    font-size: 0.65rem;
  }

  .booking-summary,
  .payment-options {
    padding: 12px !important;
  }

  .gcash-qr-code {
    max-width: 200px !important;
  }

  .dialog-actions {
    flex-direction: column;
    gap: 8px;
  }

  .dialog-actions .v-btn {
    width: 100% !important;
  }

  /* Additional mobile content optimizations */
  .sport-card .v-card-text,
  .court-card .v-card-text {
    padding: 12px !important;
  }

  .booking-summary .summary-item {
    padding: 8px !important;
  }

  .payment-options .v-radio-group {
    margin-top: 8px !important;
  }

  /* Better touch targets */
  .time-slot-card {
    min-height: 60px !important;
  }

  .sport-card {
    min-height: 120px !important;
  }
}

/* Tablet optimizations - better content layout */
@media (min-width: 601px) and (max-width: 768px) {
  .booking-dialog {
    max-width: 95vw !important;
  }

  .v-card-text {
    padding: 20px !important;
  }

  .dialog-header {
    padding: 20px !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }

  .sport-card,
  .court-card {
    min-height: 180px !important;
  }

  .step-content {
    padding: 20px !important;
  }
}

@media (max-width: 400px) {
  .step-indicator {
    flex: 0 0 100%;
    flex-direction: row;
    justify-content: flex-start;
    padding: 8px;
  }

  .step-number {
    margin-bottom: 0 !important;
    margin-right: 8px !important;
  }

  .time-slots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
