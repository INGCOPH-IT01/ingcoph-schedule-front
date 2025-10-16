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
          <v-icon v-if="item.icon" size="32" :color="getSportColor(item.name)">
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
            {{ item.courts?.length || 0 }} courts
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
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
            :disabled="(item.courts?.length || 0) > 0"
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
                <v-icon v-if="formData.icon" :color="getSportColor(formData.name)">
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
import { ref, onMounted } from 'vue'
import { courtService } from '../services/courtService'

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

    const formData = ref({
      name: '',
      description: '',
      icon: '',
      price_per_hour: 0,
      is_active: true
    })

    const snackbar = ref({
      show: false,
      message: '',
      color: 'success'
    })

    const headers = [
      { title: 'Icon', key: 'icon', sortable: false, width: '100px' },
      { title: 'Sport Name', key: 'name', sortable: true },
      { title: 'Description', key: 'description', sortable: false },
      { title: 'Price/Hour', key: 'price_per_hour', sortable: true },
      { title: 'Status', key: 'is_active', sortable: true },
      { title: 'Courts', key: 'courts_count', sortable: false },
      { title: 'Actions', key: 'actions', sortable: false, width: '150px' }
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
        console.error('Failed to fetch sports:', error)
        showSnackbar('Failed to load sports', 'error')
      } finally {
        loading.value = false
      }
    }

    const fetchCourts = async () => {
      try {
        const courts = await courtService.getCourts()
        // Add courts count to each sport
        sports.value = sports.value.map(sport => ({
          ...sport,
          courts: courts.filter(court => court.sport_id === sport.id)
        }))
      } catch (error) {
        console.error('Failed to fetch courts:', error)
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
        await fetchCourts()
      } catch (error) {
        console.error('Failed to save sport:', error)
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
        await fetchCourts()
      } catch (error) {
        console.error('Failed to delete sport:', error)
        showSnackbar(error.response?.data?.message || 'Failed to delete sport', 'error')
      } finally {
        deleting.value = false
      }
    }

    const getSportColor = (sportName) => {
      const colors = {
        'Basketball': 'orange',
        'Badminton': 'blue',
        'Tennis': 'green',
        'Volleyball': 'purple',
        'Table Tennis': 'red',
        'Futsal': 'teal',
        'Soccer': 'green',
        'Football': 'brown'
      }
      return colors[sportName] || 'primary'
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = {
        show: true,
        message,
        color
      }
    }

    onMounted(async () => {
      await fetchSports()
      await fetchCourts()
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
      commonSportIcons,
      sportToDelete,
      fetchSports,
      openCreateDialog,
      openEditDialog,
      saveSport,
      confirmDelete,
      deleteSport,
      getSportColor,
      showSnackbar
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
