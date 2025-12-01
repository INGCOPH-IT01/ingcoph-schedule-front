<template>
  <div class="sports-management">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">
        <v-icon class="mr-2" color="primary" size="32">mdi-basketball</v-icon>
        Sports Management
      </h1>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreateDialog"
        size="large"
      >
        Add New Sport
      </v-btn>
    </div>

    <!-- Sports Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="sports"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:[`item.icon`]="{ item }">
          <v-icon v-if="item.icon" size="32" :color="sportService.getSportColor(item.name)">
            {{ item.icon }}
          </v-icon>
          <span v-else class="text-grey">No icon set</span>
        </template>

        <template v-slot:[`item.price_per_hour`]="{ item }">
          <v-chip color="success" variant="tonal" size="small">
            ₱{{ parseFloat(item.price_per_hour || 0).toFixed(2) }}/hr
          </v-chip>
        </template>

        <template v-slot:[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            variant="tonal"
            size="small"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template v-slot:[`item.courts_count`]="{ item }">
          <v-chip color="info" variant="tonal" size="small">
            {{ item.courts_count || 0 }} courts
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-clock-time-four"
            size="small"
            variant="text"
            color="info"
            @click="openPricingDialog(item)"
            title="Manage Time-based Pricing"
          ></v-btn>
          <v-btn
            icon="mdi-history"
            size="small"
            variant="text"
            color="secondary"
            @click="openPriceHistoryDialog(item)"
            title="View Price History"
          ></v-btn>
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="primary"
            @click="openEditDialog(item)"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="confirmDelete(item)"
            :disabled="(item.courts_count || 0) > 0"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          <v-icon class="mr-2" color="primary">mdi-{{ editMode ? 'pencil' : 'plus' }}</v-icon>
          {{ editMode ? 'Edit Sport' : 'Add New Sport' }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-form ref="form">
            <v-text-field
              v-model="formData.name"
              label="Sport Name"
              placeholder="e.g., Basketball, Tennis"
              prepend-inner-icon="mdi-format-text"
              variant="outlined"
              :rules="[v => !!v || 'Name is required']"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              label="Description"
              placeholder="Enter sport description"
              prepend-inner-icon="mdi-text"
              variant="outlined"
              rows="3"
              class="mb-4"
            ></v-textarea>

            <v-text-field
              v-model.number="formData.price_per_hour"
              label="Price per Hour (₱)"
              placeholder="e.g., 150"
              prepend-inner-icon="mdi-cash"
              variant="outlined"
              type="number"
              min="0"
              step="0.01"
              :rules="[v => v >= 0 || 'Price must be 0 or greater']"
              class="mb-4"
            ></v-text-field>

            <!-- MDI Icon Picker -->
            <v-text-field
              v-model="formData.icon"
              label="MDI Icon Name"
              placeholder="e.g., mdi-basketball, mdi-tennis, mdi-soccer"
              prepend-inner-icon="mdi-emoticon"
              variant="outlined"
              hint="Enter Material Design Icon name (find icons at https://pictogrammers.com/library/mdi/)"
              persistent-hint
              class="mb-4"
            >
              <template v-slot:append-inner>
                <v-icon v-if="formData.icon" :color="sportService.getSportColor(formData.name)">
                  {{ formData.icon }}
                </v-icon>
              </template>
            </v-text-field>

            <!-- Common Sport Icons Reference -->
            <v-card variant="tonal" color="info" class="mb-4">
              <v-card-text>
                <div class="text-subtitle-2 mb-2 font-weight-bold">Common Sport Icons:</div>
                <v-chip-group column>
                  <v-chip
                    v-for="(icon, sport) in commonSportIcons"
                    :key="sport"
                    size="small"
                    @click="formData.icon = icon"
                    class="cursor-pointer"
                  >
                    <v-icon start>{{ icon }}</v-icon>
                    {{ sport }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>
            </v-card>

            <v-switch
              v-model="formData.is_active"
              label="Active"
              color="success"
              hide-details
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveSport"
            :loading="saving"
          >
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
          Confirm Delete
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          Are you sure you want to delete <strong>{{ sportToDelete?.name }}</strong>?
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteSport"
            :loading="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Time-based Pricing Dialog -->
    <v-dialog v-model="pricingDialog" max-width="900">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          <v-icon class="mr-2" color="info">mdi-clock-time-four</v-icon>
          Time-based Pricing for {{ selectedSport?.name }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <!-- Default Price Info -->
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-subtitle-2 font-weight-bold mb-1">Default Price</div>
            <div>₱{{ parseFloat(selectedSport?.price_per_hour || 0).toFixed(2) }}/hr</div>
            <div class="text-caption mt-1">This price is used when no time-based rules match</div>
          </v-alert>

          <!-- Info about features -->
          <v-alert type="success" variant="tonal" density="compact" class="mb-4">
            <div class="text-subtitle-2 mb-1">
              <v-icon size="small" class="mr-1">mdi-star</v-icon>
              Key Features
            </div>
            <div class="text-caption mb-2">
              <strong>📅 Day-specific Pricing:</strong> Set different prices for specific days (e.g., weekends, weekdays).
              <br>
              <strong>⏰ Time-based Rules:</strong> Define pricing for specific time ranges (e.g., peak hours, off-peak).
              <br>
              <strong>🔄 Automated Changes:</strong> Schedule future price changes with effective dates.
            </div>
            <div class="text-caption font-weight-bold">
              💡 Tip: Combine day selection with time ranges for maximum flexibility (e.g., "Weekend Mornings" or "Weekday Evenings").
            </div>
          </v-alert>

          <!-- Add New Pricing Rule Button -->
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openPricingRuleDialog"
            class="mb-4"
          >
            Add Pricing Rule
          </v-btn>

          <!-- Tabs for Active and Scheduled Rules -->
          <v-tabs v-model="pricingTab" color="primary" class="mb-4">
            <v-tab value="active">
              <v-icon start>mdi-check-circle</v-icon>
              Active Rules ({{ activePricingRules.length }})
            </v-tab>
            <v-tab value="scheduled">
              <v-icon start>mdi-calendar-clock</v-icon>
              Pending Changes ({{ scheduledPricingRules.length }})
            </v-tab>
            <v-tab value="all">
              <v-icon start>mdi-format-list-bulleted</v-icon>
              All ({{ timeBasedPricing.length }})
            </v-tab>
          </v-tabs>

          <v-window v-model="pricingTab">
            <!-- Active Rules Tab -->
            <v-window-item value="active">
              <v-data-table
                v-if="activePricingRules.length > 0"
                :headers="pricingTableHeaders"
                :items="activePricingRules"
                :items-per-page="10"
                class="elevation-1"
              >
                <template v-slot:[`item.name`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon color="success" class="mr-2" size="small">
                      mdi-clock-check-outline
                    </v-icon>
                    <span class="font-weight-bold">{{ item.name }}</span>
                  </div>
                </template>

                <template v-slot:[`item.price_per_hour`]="{ item }">
                  <v-chip size="small" color="success" variant="tonal">
                    ₱{{ parseFloat(item.price_per_hour).toFixed(2) }}/hr
                  </v-chip>
                </template>

                <template v-slot:[`item.time_range`]="{ item }">
                  <div class="text-no-wrap">
                    <v-icon size="small" class="mr-1">mdi-clock</v-icon>
                    {{ item.start_time }} - {{ item.end_time }}
                  </div>
                </template>

                <template v-slot:[`item.days_of_week`]="{ item }">
                  <div v-if="item.days_of_week && item.days_of_week.length > 0" class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="day in item.days_of_week"
                      :key="day"
                      size="x-small"
                      color="primary"
                      variant="tonal"
                    >
                      {{ ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] }}
                    </v-chip>
                  </div>
                  <v-chip v-else size="x-small" color="info" variant="tonal">All days</v-chip>
                </template>

                <template v-slot:[`item.priority`]="{ item }">
                  <v-chip size="small" color="grey" variant="outlined">
                    {{ item.priority }}
                  </v-chip>
                </template>

                <template v-slot:[`item.status`]="{ item }">
                  <div>
                    <v-chip size="x-small" color="success">
                      ACTIVE NOW
                    </v-chip>
                    <div v-if="item.effective_date" class="text-caption text-success mt-1">
                      Since: {{ formatEffectiveDate(item.effective_date) }}
                    </div>
                  </div>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="editPricingRule(item)"
                    title="Edit rule"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deletePricingRule(item)"
                    title="Delete rule"
                  ></v-btn>
                </template>
              </v-data-table>

              <v-alert v-else type="info" variant="tonal">
                No pricing rules are currently active.
              </v-alert>
            </v-window-item>

            <!-- Scheduled Rules Tab -->
            <v-window-item value="scheduled">
              <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
                <div class="text-subtitle-2 mb-1">
                  <v-icon size="small" class="mr-1">mdi-information</v-icon>
                  Pending Price Changes
                </div>
                <div class="text-caption">
                  These rules have been configured to take effect on a future date.
                  The pricing shown below will automatically apply when the effective date arrives.
                </div>
              </v-alert>

              <v-list v-if="scheduledPricingRules.length > 0">
                <v-list-item
                  v-for="pricing in scheduledPricingRules"
                  :key="pricing.id"
                  class="mb-2 border rounded"
                >
                  <template v-slot:prepend>
                    <v-icon color="warning">
                      mdi-calendar-clock
                    </v-icon>
                  </template>

                  <v-list-item-title>
                    <span class="font-weight-bold">{{ pricing.name }}</span>
                    <v-chip size="small" color="success" variant="tonal" class="ml-2">
                      ₱{{ parseFloat(pricing.price_per_hour).toFixed(2) }}/hr
                    </v-chip>
                    <v-chip size="x-small" color="warning" class="ml-2">
                      PENDING
                    </v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="text-warning font-weight-bold mb-2">
                      <v-icon size="small">mdi-calendar-clock</v-icon>
                      Will take effect on: {{ formatEffectiveDate(pricing.effective_date) }}
                    </div>
                    <div>
                      <v-icon size="small">mdi-clock</v-icon>
                      {{ pricing.start_time }} - {{ pricing.end_time }}
                    </div>
                    <div v-if="pricing.days_of_week && pricing.days_of_week.length > 0" class="d-flex align-center flex-wrap gap-1 my-1">
                      <v-icon size="small">mdi-calendar</v-icon>
                      <v-chip
                        v-for="day in pricing.days_of_week"
                        :key="day"
                        size="x-small"
                        color="primary"
                        variant="tonal"
                      >
                        {{ ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] }}
                      </v-chip>
                    </div>
                    <div v-else>
                      <v-icon size="small">mdi-calendar</v-icon>
                      <v-chip size="x-small" color="info" variant="tonal">All days</v-chip>
                    </div>
                    <div>
                      <v-icon size="small">mdi-priority-high</v-icon>
                      Priority: {{ pricing.priority }}
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="editPricingRule(pricing)"
                      title="Edit scheduled pricing"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deletePricingRule(pricing)"
                      title="Cancel scheduled change"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
              <v-alert v-else type="info" variant="tonal">
                No pricing changes are scheduled for the future.
              </v-alert>
            </v-window-item>

            <!-- All Rules Tab -->
            <v-window-item value="all">
              <v-list v-if="timeBasedPricing.length > 0">
                <v-list-item
                  v-for="pricing in timeBasedPricing"
                  :key="pricing.id"
                  class="mb-2 border rounded"
                >
                  <template v-slot:prepend>
                    <v-icon
                      :color="!pricing.is_active ? 'grey' : (isPricingActive(pricing) ? 'success' : 'warning')"
                    >
                      {{ !pricing.is_active ? 'mdi-cancel' : (isPricingActive(pricing) ? 'mdi-clock-check-outline' : 'mdi-calendar-clock') }}
                    </v-icon>
                  </template>

                  <v-list-item-title>
                    <span class="font-weight-bold">{{ pricing.name }}</span>
                    <v-chip size="small" color="success" variant="tonal" class="ml-2">
                      ₱{{ parseFloat(pricing.price_per_hour).toFixed(2) }}/hr
                    </v-chip>
                    <v-chip
                      v-if="!pricing.is_active"
                      size="x-small"
                      color="grey"
                      class="ml-2"
                    >
                      INACTIVE
                    </v-chip>
                    <v-chip
                      v-else-if="isPricingActive(pricing)"
                      size="x-small"
                      color="success"
                      class="ml-2"
                    >
                      ACTIVE NOW
                    </v-chip>
                    <v-chip
                      v-else
                      size="x-small"
                      color="warning"
                      class="ml-2"
                    >
                      PENDING
                    </v-chip>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div>
                      <v-icon size="small">mdi-clock</v-icon>
                      {{ pricing.start_time }} - {{ pricing.end_time }}
                    </div>
                    <div v-if="pricing.days_of_week && pricing.days_of_week.length > 0" class="d-flex align-center flex-wrap gap-1 my-1">
                      <v-icon size="small">mdi-calendar</v-icon>
                      <v-chip
                        v-for="day in pricing.days_of_week"
                        :key="day"
                        size="x-small"
                        color="primary"
                        variant="tonal"
                      >
                        {{ ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] }}
                      </v-chip>
                    </div>
                    <div v-else>
                      <v-icon size="small">mdi-calendar</v-icon>
                      <v-chip size="x-small" color="info" variant="tonal">All days</v-chip>
                    </div>
                    <div>
                      <v-icon size="small">mdi-priority-high</v-icon>
                      Priority: {{ pricing.priority }}
                    </div>
                    <div v-if="pricing.effective_date && isPricingActive(pricing)" class="mt-1 text-success">
                      <v-icon size="small">mdi-calendar-check</v-icon>
                      Became effective: {{ formatEffectiveDate(pricing.effective_date) }}
                    </div>
                    <div v-if="pricing.effective_date && !isPricingActive(pricing)" class="mt-1 text-warning font-weight-bold">
                      <v-icon size="small">mdi-calendar-clock</v-icon>
                      Will activate on: {{ formatEffectiveDate(pricing.effective_date) }}
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="editPricingRule(pricing)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deletePricingRule(pricing)"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-alert v-else type="warning" variant="tonal" class="mt-4">
                No time-based pricing rules configured. The default price will be used for all times.
              </v-alert>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="pricingDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Pricing Rule Dialog -->
    <v-dialog v-model="pricingRuleDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          <v-icon class="mr-2" color="primary">mdi-{{ pricingRuleEditMode ? 'pencil' : 'plus' }}</v-icon>
          {{ pricingRuleEditMode ? 'Edit Pricing Rule' : 'Add Pricing Rule' }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-form ref="pricingForm">
            <v-text-field
              v-model="pricingFormData.name"
              label="Rule Name"
              placeholder="e.g., Peak Hours, Weekend Premium"
              prepend-inner-icon="mdi-format-text"
              variant="outlined"
              :rules="[v => !!v || 'Name is required']"
              class="mb-4"
            ></v-text-field>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="pricingFormData.start_time"
                  label="Start Time"
                  type="time"
                  prepend-inner-icon="mdi-clock-start"
                  variant="outlined"
                  :rules="[v => !!v || 'Start time is required']"
                  class="mb-4"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="pricingFormData.end_time"
                  label="End Time"
                  type="time"
                  prepend-inner-icon="mdi-clock-end"
                  variant="outlined"
                  :rules="[v => !!v || 'End time is required']"
                  class="mb-4"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model.number="pricingFormData.price_per_hour"
              label="Price per Hour (₱)"
              placeholder="e.g., 200"
              prepend-inner-icon="mdi-cash"
              variant="outlined"
              type="number"
              min="0"
              step="0.01"
              :rules="[v => v >= 0 || 'Price must be 0 or greater']"
              class="mb-4"
            ></v-text-field>

            <!-- Days of Week Selection -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2 d-flex align-center">
                <v-icon size="small" class="mr-2">mdi-calendar-week</v-icon>
                Applicable Days
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" size="small" class="ml-1" color="info">mdi-information</v-icon>
                  </template>
                  <span>Select specific days or leave empty for all days</span>
                </v-tooltip>
              </div>

              <!-- Quick Select Buttons -->
              <div class="mb-2">
                <v-chip-group>
                  <v-chip
                    size="small"
                    @click="pricingFormData.days_of_week = [1,2,3,4,5]"
                    prepend-icon="mdi-briefcase"
                    variant="outlined"
                  >
                    Weekdays
                  </v-chip>
                  <v-chip
                    size="small"
                    @click="pricingFormData.days_of_week = [0,6]"
                    prepend-icon="mdi-weather-sunny"
                    variant="outlined"
                  >
                    Weekends
                  </v-chip>
                  <v-chip
                    size="small"
                    @click="pricingFormData.days_of_week = []"
                    prepend-icon="mdi-calendar-blank"
                    variant="outlined"
                  >
                    All Days
                  </v-chip>
                </v-chip-group>
              </div>

              <v-select
                v-model="pricingFormData.days_of_week"
                label="Select specific days"
                :items="daysOfWeekOptions"
                multiple
                chips
                closable-chips
                prepend-inner-icon="mdi-calendar"
                variant="outlined"
                hint="Leave empty to apply this pricing to all days of the week"
                persistent-hint
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip
                    v-if="index < 7"
                    size="small"
                    closable
                    @click:close="removeDayFromSelection(item.value)"
                  >
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-select>
            </div>

            <v-text-field
              v-model.number="pricingFormData.priority"
              label="Priority"
              placeholder="Higher priority rules override lower ones"
              prepend-inner-icon="mdi-priority-high"
              variant="outlined"
              type="number"
              hint="Higher numbers = higher priority (e.g., 10 overrides 5)"
              persistent-hint
              class="mb-4"
            ></v-text-field>

            <!-- Effectivity Date -->
            <v-divider class="mb-4"></v-divider>
            <div class="text-subtitle-2 mb-3 font-weight-bold">
              <v-icon class="mr-1">mdi-calendar-clock</v-icon>
              Effectivity Date
            </div>

            <v-alert
              v-if="pricingRuleEditMode"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              <div class="text-caption">
                <strong>Editing an active rule:</strong> Changes will apply immediately.
                To schedule a future price change, create a new rule instead.
              </div>
            </v-alert>

            <v-text-field
              v-model="pricingFormData.effective_date"
              label="Effective From (Optional)"
              type="datetime-local"
              prepend-inner-icon="mdi-calendar-start"
              variant="outlined"
              :hint="pricingRuleEditMode
                ? 'When editing, leave empty to apply immediately. Setting a future date will delay the update.'
                : 'Leave empty to apply immediately. Set a future date to schedule this pricing in advance.'"
              persistent-hint
              class="mb-4"
              clearable
            ></v-text-field>

            <v-alert v-if="pricingFormData.effective_date"
                     type="info"
                     variant="tonal"
                     density="compact"
                     class="mb-4">
              <div class="font-weight-bold mb-1">Scheduled Activation</div>
              This pricing {{ pricingRuleEditMode ? 'update' : 'rule' }} will become active on
              {{ formatEffectiveDate(pricingFormData.effective_date) }} and continue indefinitely.
              <div v-if="!pricingRuleEditMode" class="mt-2 text-caption">
                💡 The current pricing will remain in effect until this date arrives.
              </div>
            </v-alert>

            <v-alert v-else
                     type="success"
                     variant="tonal"
                     density="compact"
                     class="mb-4">
              <div class="font-weight-bold mb-1">Immediate Activation</div>
              This {{ pricingRuleEditMode ? 'update' : 'rule' }} will apply immediately when saved.
            </v-alert>

            <v-switch
              v-model="pricingFormData.is_active"
              label="Active"
              color="success"
              hide-details
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="pricingRuleDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="savePricingRule"
            :loading="savingPricing"
          >
            {{ pricingRuleEditMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Price History Dialog -->
    <v-dialog v-model="priceHistoryDialog" max-width="1000">
      <v-card>
        <v-card-title class="text-h5 pa-6">
          <v-icon class="mr-2" color="secondary">mdi-history</v-icon>
          Price Change History for {{ selectedSport?.name }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            <div class="text-caption">
              Track all pricing changes and see who made them and when they took effect.
            </div>
          </v-alert>

          <v-progress-linear v-if="loadingHistory" indeterminate color="primary" class="mb-4"></v-progress-linear>

          <v-timeline v-if="priceHistory.length > 0" side="end" align="start" density="compact">
            <v-timeline-item
              v-for="history in priceHistory"
              :key="history.id"
              :dot-color="getChangeTypeColor(history.change_type)"
              size="small"
            >
              <template v-slot:opposite>
                <div class="text-caption">
                  {{ formatEffectiveDate(history.created_at) }}
                </div>
              </template>

              <v-card variant="tonal" :color="getChangeTypeColor(history.change_type)">
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-chip
                      :color="getChangeTypeColor(history.change_type)"
                      size="small"
                      class="mr-2"
                    >
                      {{ getChangeTypeLabel(history.change_type) }}
                    </v-chip>
                    <span v-if="history.changed_by" class="text-caption text-grey">
                      by {{ (history.changed_by.first_name && history.changed_by.last_name)
                        ? `${history.changed_by.first_name} ${history.changed_by.last_name}`.trim()
                        : history.changed_by.email }}
                    </span>
                  </div>

                  <div class="font-weight-bold mb-2">{{ history.description }}</div>

                  <v-row v-if="history.old_value || history.new_value" dense>
                    <v-col v-if="history.old_value" cols="12" md="6">
                      <div class="text-caption text-grey mb-1">Previous Value:</div>
                      <v-card variant="outlined" density="compact">
                        <v-card-text class="pa-2">
                          <div v-if="history.change_type === 'default_price_updated'">
                            <strong>₱{{ parseFloat(history.old_value.price_per_hour || 0).toFixed(2) }}/hr</strong>
                          </div>
                          <div v-else>
                            <div><strong>{{ history.old_value.name }}</strong></div>
                            <div class="text-caption">
                              ₱{{ parseFloat(history.old_value.price_per_hour || 0).toFixed(2) }}/hr
                              | {{ history.old_value.start_time }} - {{ history.old_value.end_time }}
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col v-if="history.new_value" cols="12" md="6">
                      <div class="text-caption text-grey mb-1">New Value:</div>
                      <v-card variant="outlined" density="compact" color="success">
                        <v-card-text class="pa-2">
                          <div v-if="history.change_type === 'default_price_updated'">
                            <strong>₱{{ parseFloat(history.new_value.price_per_hour || 0).toFixed(2) }}/hr</strong>
                          </div>
                          <div v-else>
                            <div><strong>{{ history.new_value.name }}</strong></div>
                            <div class="text-caption">
                              ₱{{ parseFloat(history.new_value.price_per_hour || 0).toFixed(2) }}/hr
                              | {{ history.new_value.start_time }} - {{ history.new_value.end_time }}
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>

                  <div v-if="history.effective_date" class="mt-2 text-caption">
                    <v-icon size="small">mdi-calendar-check</v-icon>
                    Effective: {{ formatEffectiveDate(history.effective_date) }}
                  </div>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>

          <v-alert v-else-if="!loadingHistory" type="info" variant="tonal">
            No price change history available for this sport.
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="priceHistoryDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
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
import { ref, onMounted, computed } from 'vue'
import { courtService } from '../services/courtService'
import { sportService } from '../services/sportService'

export default {
  name: 'SportsManagement',
  setup() {
    const sports = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const editMode = ref(false)
    const form = ref(null)
    const sportToDelete = ref(null)

    // Time-based pricing state
    const pricingDialog = ref(false)
    const pricingRuleDialog = ref(false)
    const pricingRuleEditMode = ref(false)
    const selectedSport = ref(null)
    const timeBasedPricing = ref([])
    const savingPricing = ref(false)
    const pricingForm = ref(null)
    const pricingTab = ref('all')

    // Price history state
    const priceHistory = ref([])
    const priceHistoryDialog = ref(false)
    const loadingHistory = ref(false)

    const formData = ref({
      name: '',
      description: '',
      icon: '',
      price_per_hour: 0,
      is_active: true
    })

    const pricingFormData = ref({
      name: '',
      start_time: '',
      end_time: '',
      price_per_hour: 0,
      days_of_week: [],
      is_active: true,
      priority: 0,
      effective_date: null
    })

    const daysOfWeekOptions = [
      { title: 'Sunday', value: 0 },
      { title: 'Monday', value: 1 },
      { title: 'Tuesday', value: 2 },
      { title: 'Wednesday', value: 3 },
      { title: 'Thursday', value: 4 },
      { title: 'Friday', value: 5 },
      { title: 'Saturday', value: 6 }
    ]

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const headers = [
      { title: 'Icon', key: 'icon', sortable: false, width: '100px' },
      { title: 'Sport Name', key: 'name', sortable: true },
      { title: 'Description', key: 'description', sortable: false },
      { title: 'Default Price/Hour', key: 'price_per_hour', sortable: true },
      { title: 'Status', key: 'is_active', sortable: true },
      { title: 'Courts', key: 'courts_count', sortable: false },
      { title: 'Actions', key: 'actions', sortable: false, width: '200px' }
    ]

    const pricingTableHeaders = [
      { title: 'Rule Name', key: 'name', sortable: true },
      { title: 'Price/Hour', key: 'price_per_hour', sortable: true, width: '130px' },
      { title: 'Time Range', key: 'time_range', sortable: false, width: '150px' },
      { title: 'Days', key: 'days_of_week', sortable: false, width: '200px' },
      { title: 'Priority', key: 'priority', sortable: true, width: '100px' },
      { title: 'Status', key: 'status', sortable: false, width: '150px' },
      { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
    ]

    const commonSportIcons = {
      'Basketball': 'mdi-basketball',
      'Badminton': 'mdi-badminton',
      'Tennis': 'mdi-tennis',
      'Volleyball': 'mdi-volleyball',
      'Soccer': 'mdi-soccer',
      'Football': 'mdi-football',
      'Table Tennis': 'mdi-table-tennis',
      'Baseball': 'mdi-baseball',
      'Swimming': 'mdi-swim',
      'Running': 'mdi-run',
      'Boxing': 'mdi-boxing-glove',
      'Golf': 'mdi-golf',
      'Hockey': 'mdi-hockey-sticks',
      'Rugby': 'mdi-rugby'
    }

    const fetchSports = async () => {
      try {
        loading.value = true
        const response = await courtService.getSports()
        sports.value = response
      } catch (error) {
        showSnackbar('Failed to load sports', 'error')
      } finally {
        loading.value = false
      }
    }

    const openCreateDialog = () => {
      editMode.value = false
      formData.value = {
        name: '',
        description: '',
        icon: '',
        price_per_hour: 0,
        is_active: true
      }
      dialog.value = true
    }

    const openEditDialog = (sport) => {
      editMode.value = true
      formData.value = {
        id: sport.id,
        name: sport.name,
        description: sport.description || '',
        icon: sport.icon || '',
        price_per_hour: sport.price_per_hour || 0,
        is_active: sport.is_active
      }
      dialog.value = true
    }

    const saveSport = async () => {
      try {
        saving.value = true

        if (editMode.value) {
          await courtService.updateSport(formData.value.id, formData.value)
          showSnackbar('Sport updated successfully', 'success')
        } else {
          await courtService.createSport(formData.value)
          showSnackbar('Sport created successfully', 'success')
        }

        dialog.value = false
        await fetchSports()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to save sport', 'error')
      } finally {
        saving.value = false
      }
    }

    const confirmDelete = (sport) => {
      sportToDelete.value = sport
      deleteDialog.value = true
    }

    const deleteSport = async () => {
      try {
        deleting.value = true
        await courtService.deleteSport(sportToDelete.value.id)
        showSnackbar('Sport deleted successfully', 'success')
        deleteDialog.value = false
        await fetchSports()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to delete sport', 'error')
      } finally {
        deleting.value = false
      }
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    // Time-based pricing methods
    const openPricingDialog = async (sport) => {
      selectedSport.value = sport
      pricingDialog.value = true
      await fetchTimeBasedPricing(sport.id)
    }

    const fetchTimeBasedPricing = async (sportId) => {
      try {
        timeBasedPricing.value = await courtService.getTimeBasedPricing(sportId)
      } catch (error) {
        showSnackbar('Failed to load time-based pricing', 'error')
      }
    }

    const openPricingRuleDialog = () => {
      pricingRuleEditMode.value = false
      pricingFormData.value = {
        name: '',
        start_time: '',
        end_time: '',
        price_per_hour: 0,
        days_of_week: [],
        is_active: true,
        priority: 0,
        effective_date: null
      }
      pricingRuleDialog.value = true
    }

    const editPricingRule = (pricing) => {
      pricingRuleEditMode.value = true
      pricingFormData.value = {
        id: pricing.id,
        name: pricing.name,
        start_time: pricing.start_time ? pricing.start_time.substring(0, 5) : '',
        end_time: pricing.end_time ? pricing.end_time.substring(0, 5) : '',
        price_per_hour: pricing.price_per_hour,
        days_of_week: pricing.days_of_week || [],
        is_active: pricing.is_active,
        priority: pricing.priority,
        effective_date: pricing.effective_date ? formatDateTimeForInput(pricing.effective_date) : null
      }
      pricingRuleDialog.value = true
    }

    const savePricingRule = async () => {
      try {
        savingPricing.value = true

        // Ensure time format is HH:MM (strip seconds if present)
        const formattedData = {
          ...pricingFormData.value,
          start_time: pricingFormData.value.start_time ? pricingFormData.value.start_time.substring(0, 5) : '',
          end_time: pricingFormData.value.end_time ? pricingFormData.value.end_time.substring(0, 5) : '',
          effective_date: pricingFormData.value.effective_date || null
        }

        if (pricingRuleEditMode.value) {
          await courtService.updateTimeBasedPricing(
            selectedSport.value.id,
            formattedData.id,
            formattedData
          )
          showSnackbar('Pricing rule updated successfully', 'success')
        } else {
          await courtService.createTimeBasedPricing(
            selectedSport.value.id,
            formattedData
          )
          showSnackbar('Pricing rule created successfully', 'success')
        }

        pricingRuleDialog.value = false
        await fetchTimeBasedPricing(selectedSport.value.id)
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to save pricing rule', 'error')
      } finally {
        savingPricing.value = false
      }
    }

    const deletePricingRule = async (pricing) => {
      if (!confirm(`Are you sure you want to delete the pricing rule "${pricing.name}"?`)) {
        return
      }

      try {
        await courtService.deleteTimeBasedPricing(selectedSport.value.id, pricing.id)
        showSnackbar('Pricing rule deleted successfully', 'success')
        await fetchTimeBasedPricing(selectedSport.value.id)
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to delete pricing rule', 'error')
      }
    }

    const getDayNames = (days) => {
      if (!days || days.length === 0) return 'All days'
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return days.map(day => dayNames[day]).join(', ')
    }

    const removeDayFromSelection = (dayValue) => {
      const index = pricingFormData.value.days_of_week.indexOf(dayValue)
      if (index > -1) {
        pricingFormData.value.days_of_week.splice(index, 1)
      }
    }

    // Format effectivity date for display
    const formatEffectiveDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Format datetime for input field (converts from ISO to datetime-local format)
    const formatDateTimeForInput = (dateString) => {
      if (!dateString) return null
      const date = new Date(dateString)
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    // Check if a pricing rule is currently active (effective date has passed)
    const isPricingActive = (pricing) => {
      if (!pricing.effective_date) return true // No effective date means immediately active
      const now = new Date()
      const effectiveDate = new Date(pricing.effective_date)
      return effectiveDate <= now
    }

    // Check if a rule has pending changes (effective date is in the future)
    const hasPendingChanges = (pricing) => {
      if (!pricing.effective_date) return false
      const now = new Date()
      const effectiveDate = new Date(pricing.effective_date)
      return effectiveDate > now
    }

    // Computed property for active pricing rules
    // Only shows rules that are currently in effect (no effective date OR effective date has passed)
    const activePricingRules = computed(() => {
      return timeBasedPricing.value.filter(pricing => {
        if (!pricing.is_active) return false
        return isPricingActive(pricing)
      })
    })

    // Computed property for scheduled pricing rules
    // Only shows rules with future effective dates
    const scheduledPricingRules = computed(() => {
      return timeBasedPricing.value.filter(pricing => {
        if (!pricing.is_active) return false
        return hasPendingChanges(pricing)
      })
    })

    // Price history methods
    const fetchPriceHistory = async (sportId) => {
      try {
        loadingHistory.value = true
        const response = await courtService.getPriceHistory(sportId)
        priceHistory.value = response
      } catch (error) {
        showSnackbar('Failed to load price history', 'error')
      } finally {
        loadingHistory.value = false
      }
    }

    const openPriceHistoryDialog = async (sport) => {
      selectedSport.value = sport
      priceHistoryDialog.value = true
      await fetchPriceHistory(sport.id)
    }

    const getChangeTypeLabel = (changeType) => {
      const labels = {
        'default_price_updated': 'Default Price Updated',
        'time_based_pricing_created': 'Pricing Rule Created',
        'time_based_pricing_updated': 'Pricing Rule Updated',
        'time_based_pricing_deleted': 'Pricing Rule Deleted'
      }
      return labels[changeType] || changeType
    }

    const getChangeTypeColor = (changeType) => {
      const colors = {
        'default_price_updated': 'primary',
        'time_based_pricing_created': 'success',
        'time_based_pricing_updated': 'warning',
        'time_based_pricing_deleted': 'error'
      }
      return colors[changeType] || 'grey'
    }

    onMounted(async () => {
      await fetchSports()
    })

    return {
      sports,
      loading,
      saving,
      deleting,
      dialog,
      deleteDialog,
      editMode,
      form,
      formData,
      snackbar,
      headers,
      pricingTableHeaders,
      commonSportIcons,
      sportToDelete,
      fetchSports,
      openCreateDialog,
      openEditDialog,
      saveSport,
      confirmDelete,
      deleteSport,
      showSnackbar,
      // Time-based pricing
      pricingDialog,
      pricingRuleDialog,
      pricingRuleEditMode,
      selectedSport,
      timeBasedPricing,
      savingPricing,
      pricingForm,
      pricingFormData,
      daysOfWeekOptions,
      openPricingDialog,
      openPricingRuleDialog,
      editPricingRule,
      savePricingRule,
      deletePricingRule,
      getDayNames,
      removeDayFromSelection,
      formatEffectiveDate,
      formatDateTimeForInput,
      // Pricing tabs and filters
      pricingTab,
      activePricingRules,
      scheduledPricingRules,
      isPricingActive,
      hasPendingChanges,
      // Price history
      priceHistory,
      priceHistoryDialog,
      loadingHistory,
      fetchPriceHistory,
      openPriceHistoryDialog,
      getChangeTypeLabel,
      getChangeTypeColor,
      // Services
      sportService
    }
  }
}
</script>

<style scoped>
.sports-management {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
}

/* Background is now handled globally by App.vue */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #B71C1C;
  display: flex;
  align-items: center;
  margin: 0;
}

.cursor-pointer {
  cursor: pointer;
}

@media (max-width: 768px) {
  .sports-management {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
