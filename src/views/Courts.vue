<template>
  <div class="courts-container">
    <!-- Modern Sports Background -->
    <div class="sports-background">
      <div class="sports-overlay"></div>
      <div class="sports-pattern"></div>
    </div>
    
    <!-- Enhanced Header -->
    <div class="courts-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">mdi-stadium</v-icon>
          {{ isAdmin ? 'Court Management' : 'Court Directory' }}
        </div>
        <h1 class="header-title">
          <span class="title-gradient">{{ isAdmin ? 'Manage' : 'Explore' }}</span> Courts
        </h1>
        <p class="header-subtitle">
          {{ isAdmin ? 'Manage and organize multi-sport court facilities with professional precision' : 'Discover and book premium multi-sport court facilities' }}
        </p>
        <div v-if="isAdmin" class="header-actions">
          <v-btn
            class="header-btn-primary"
            size="x-large"
            prepend-icon="mdi-plus"
            @click="openAddDialog"
            elevation="8"
          >
            Add New Court
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Enhanced Toolbar -->
    <div class="courts-toolbar">
      <div class="toolbar-section">
        <div class="search-section">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search courts..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
          ></v-text-field>
        </div>
        <div class="filters-section">
          <!-- View Toggle (Admin Only) -->
          <v-btn-toggle
            v-if="isAdmin"
            v-model="viewMode"
            mandatory
            density="compact"
            class="mr-2"
          >
            <v-btn value="grid" size="small">
              <v-icon>mdi-view-grid</v-icon>
            </v-btn>
            <v-btn value="table" size="small">
              <v-icon>mdi-table</v-icon>
            </v-btn>
          </v-btn-toggle>
          
          <v-btn
            class="filter-btn"
            variant="outlined"
            size="small"
            prepend-icon="mdi-download"
          >
            Export Data
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="courts-grid-container">
      <v-container fluid>
        <v-row>
          <v-col
            v-for="court in filteredCourts"
            :key="court.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card 
              class="court-card" 
              elevation="2" 
              hover
              @click="navigateToCourtDetails(court.id)"
              style="cursor: pointer;"
            >
              <!-- Court Images -->
              <div class="court-images-wrapper">
                <v-carousel
                  v-if="court.images && court.images.length > 0"
                  height="200"
                  hide-delimiters
                  show-arrows="hover"
                  cycle
                  interval="3000"
                >
                  <v-carousel-item
                    v-for="(image, index) in court.images"
                    :key="index"
                    :src="image.image_url"
                    cover
                  ></v-carousel-item>
                </v-carousel>
                <div v-else class="court-no-image">
                  <v-icon size="64" color="grey-lighten-1">mdi-stadium</v-icon>
                </div>
                
                <!-- Sport Badge -->
                <v-chip
                  class="court-sport-badge"
                  :color="getSportColor(court.sport?.name)"
                  size="small"
                  label
                >
                  <v-icon start size="small">{{ getSportIcon(court.sport?.name) }}</v-icon>
                  {{ court.sport?.name }}
                </v-chip>
                
                <!-- Status Badge -->
                <v-chip
                  class="court-status-badge"
                  :color="court.is_active ? 'success' : 'error'"
                  size="x-small"
                  label
                >
                  {{ court.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>

              <!-- Court Info -->
              <v-card-title class="court-card-title">
                {{ court.name }}
              </v-card-title>

              <v-card-text class="court-card-content">
                <div class="court-info-row">
                  <v-icon size="small" color="primary">mdi-map-marker</v-icon>
                  <span class="court-info-text">{{ court.location || 'No location' }}</span>
                </div>
                
                <div class="court-info-row">
                  <v-icon size="small" color="success">mdi-cash</v-icon>
                  <span class="court-info-price">₱{{ court.price_per_hour }}/hr</span>
                </div>
                
                <div v-if="court.amenities && typeof court.amenities === 'string'" class="court-amenities">
                  <v-chip
                    v-for="(amenity, index) in court.amenities.split(',').slice(0, 3)"
                    :key="index"
                    size="x-small"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ amenity.trim() }}
                  </v-chip>
                  <v-chip
                    v-if="court.amenities.split(',').length > 3"
                    size="x-small"
                    variant="text"
                    class="mb-1"
                  >
                    +{{ court.amenities.split(',').length - 3 }} more
                  </v-chip>
                </div>
              </v-card-text>

              <!-- Actions -->
              <v-card-actions v-if="isAdmin" class="court-card-actions">
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click.stop="editCourt(court)"
                >
                  <v-icon start size="small">mdi-pencil</v-icon>
                  Edit
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  size="small"
                  variant="text"
                  :color="court.is_active ? 'error' : 'success'"
                  @click.stop="toggleCourtStatus(court)"
                >
                  <v-icon start size="small">
                    {{ court.is_active ? 'mdi-cancel' : 'mdi-check-circle' }}
                  </v-icon>
                  {{ court.is_active ? 'Deactivate' : 'Activate' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- No Courts Message -->
        <v-row v-if="filteredCourts.length === 0 && !loading">
          <v-col cols="12" class="text-center py-12">
            <v-icon size="64" color="grey-lighten-1">mdi-stadium-variant</v-icon>
            <p class="text-h6 text-grey-darken-1 mt-4">No courts found</p>
            <p class="text-grey">Try adjusting your search criteria</p>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Table View -->
    <div v-else class="excel-table-container">
      <v-data-table
        :headers="headers"
        :items="filteredCourts"
        :loading="loading"
        :items-per-page="15"
        class="excel-data-table"
        no-data-text="No courts found"
        loading-text="Loading courts..."
        :item-props="itemProps"
      >
        <!-- Court Name Column -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="excel-cell-content">
            <div class="excel-cell-icon">🏟️</div>
            <div class="excel-cell-text">
              <div class="excel-cell-title">{{ item.name }}</div>
              <div class="excel-cell-subtitle">{{ item.location }}</div>
            </div>
          </div>
        </template>

        <!-- Sport Column -->
        <template v-slot:[`item.sport_name`]="{ item }">
          <v-chip 
            color="primary" 
            variant="tonal" 
            size="small"
            class="excel-chip"
          >
            {{ item.sport.name }}
          </v-chip>
        </template>

        <!-- Price Column -->
        <template v-slot:[`item.price_per_hour`]="{ item }">
          <div class="excel-price">
            <span class="excel-price-amount">₱{{ item.price_per_hour }}/hour</span>
          </div>
        </template>


        <!-- Amenities Column -->
        <template v-slot:[`item.amenities`]="{ item }">
          <div v-if="item.amenities && item.amenities.length" class="excel-amenities">
            <v-chip
              v-for="(amenity, index) in item.amenities.slice(0, 2)"
              :key="index"
              size="x-small"
              color="grey"
              variant="outlined"
              class="excel-amenity-chip"
            >
              {{ amenity }}
            </v-chip>
            <v-chip
              v-if="item.amenities.length > 2"
              size="x-small"
              color="grey"
              variant="outlined"
              class="excel-amenity-chip"
            >
              +{{ item.amenities.length - 2 }}
            </v-chip>
          </div>
          <span v-else class="excel-empty">-</span>
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
          <div class="excel-actions">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              :to="`/courts/${item.id}`"
              class="excel-action-btn"
            ></v-btn>
            <v-btn
              v-if="isAdmin"
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="openEditDialog(item)"
              class="excel-action-btn"
            ></v-btn>
            <v-btn
              v-if="isAdmin"
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteCourt(item.id)"
              class="excel-action-btn"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Court Dialog -->
    <CourtDialog
      :is-open="dialogOpen"
      :court="selectedCourt"
      @close="closeDialog"
      @saved="handleCourtSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { courtService } from '../services/courtService'
import { authService } from '../services/authService'
import CourtDialog from '../components/CourtDialog.vue'

export default {
  name: 'Courts',
  components: {
    CourtDialog
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const courts = ref([])
    const searchQuery = ref('')
    const loading = ref(true)
    const error = ref(null)
    const dialogOpen = ref(false)
    const selectedCourt = ref(null)
    const isAdmin = ref(false)
    const viewMode = ref('grid') // Default to grid view

    const headers = [
      { title: 'Court Name', key: 'name', sortable: true, width: '25%' },
      { title: 'Type', key: 'sport_name', sortable: true, width: '15%' },
      { title: 'Price/Hour', key: 'price_per_hour', sortable: true, width: '15%' },
      { title: 'Amenities', key: 'amenities', sortable: false, width: '25%' },
      { title: 'Status', key: 'is_active', sortable: true, width: '10%' },
      { title: 'Actions', key: 'actions', sortable: false, width: '10%' }
    ]

    const filteredCourts = computed(() => {
      let filtered = courts.value

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(court =>
          court.name.toLowerCase().includes(query) ||
          court.location?.toLowerCase().includes(query) ||
          court.sport.name.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    const itemProps = (item) => ({
      class: 'excel-table-row'
    })

    const fetchData = async () => {
      try {
        loading.value = true
        const courtsData = await courtService.getCourts()
        courts.value = courtsData
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const openAddDialog = () => {
      selectedCourt.value = null
      dialogOpen.value = true
    }

    const openEditDialog = (court) => {
      selectedCourt.value = court
      dialogOpen.value = true
    }

    const closeDialog = () => {
      dialogOpen.value = false
      selectedCourt.value = null
    }

    const handleCourtSaved = () => {
      fetchData() // Refresh the courts list
    }

    const deleteCourt = async (courtId) => {
      if (!confirm('Are you sure you want to delete this court?')) return
      
      try {
        await courtService.deleteCourt(courtId)
        await fetchData() // Refresh the list
      } catch (err) {
        alert('Failed to delete court: ' + err.message)
      }
    }

    const checkAdminStatus = async () => {
      try {
        isAdmin.value = await authService.isAdmin()
      } catch (error) {
        isAdmin.value = false
      }
    }

    const getSportColor = (sportName) => {
      const colors = {
        'Basketball': 'orange',
        'Tennis': 'green',
        'Badminton': 'blue',
        'Volleyball': 'red',
        'Football': 'teal',
        'Soccer': 'purple'
      }
      return colors[sportName] || 'grey'
    }

    const getSportIcon = (sportName) => {
      const icons = {
        'Basketball': 'mdi-basketball',
        'Tennis': 'mdi-tennis',
        'Badminton': 'mdi-badminton',
        'Volleyball': 'mdi-volleyball',
        'Football': 'mdi-football',
        'Soccer': 'mdi-soccer'
      }
      return icons[sportName] || 'mdi-stadium'
    }

    const editCourt = (court) => {
      openEditDialog(court)
    }

    const toggleCourtStatus = async (court) => {
      try {
        const newStatus = !court.is_active
        await courtService.updateCourt(court.id, { is_active: newStatus })
        court.is_active = newStatus
      } catch (err) {
        alert('Failed to update court status: ' + err.message)
      }
    }

    const navigateToCourtDetails = (courtId) => {
      router.push(`/courts/${courtId}`)
    }

    onMounted(async () => {
      await checkAdminStatus()
      fetchData()
    })

    // Watch for route changes to refresh data when navigating to this page
    watch(() => route.path, (newPath) => {
      if (newPath === '/courts') {
        fetchData()
      }
    })

    return {
      courts,
      searchQuery,
      filteredCourts,
      loading,
      error,
      dialogOpen,
      selectedCourt,
      isAdmin,
      viewMode,
      headers,
      itemProps,
      openAddDialog,
      openEditDialog,
      closeDialog,
      handleCourtSaved,
      deleteCourt,
      getSportColor,
      getSportIcon,
      editCourt,
      toggleCourtStatus,
      navigateToCourtDetails
    }
  }
}
</script>

<style scoped>
/* Modern Sports Courts Theme */
.courts-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 32px;
  position: relative;
  z-index: 1;
}

/* Enhanced Background */
.sports-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  z-index: -3;
}

.sports-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
  z-index: -2;
}

.sports-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
  background-size: 20px 20px;
  z-index: -1;
}

/* Courts Header */
.courts-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 0;
  position: relative;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: white;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.header-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  font-weight: 700 !important;
  text-transform: none !important;
  padding: 16px 32px !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.header-btn-primary:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6) !important;
}

/* Toolbar Section */
.courts-toolbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar-section {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 250px;
}

.search-field {
  border-radius: 8px !important;
}

.filters-section {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: none !important;
}

.excel-header {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px 8px 0 0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  background: #3b82f6 !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-toolbar {
  background: white;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.excel-search {
  flex: 1;
  max-width: 300px;
}

.excel-search-field {
  font-size: 14px;
}

.excel-filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.excel-filter-select {
  min-width: 150px;
  font-size: 14px;
}

.excel-filter-btn,
.excel-export-btn {
  font-size: 14px;
  text-transform: none;
  border-radius: 6px;
}

.excel-table-container {
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.excel-data-table {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.excel-data-table :deep(.v-data-table__wrapper) {
  border: none;
}

.excel-data-table :deep(.v-data-table-header) {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.excel-data-table :deep(.v-data-table-header th) {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 12px 16px !important;
  border-right: 1px solid #e2e8f0 !important;
  text-transform: none !important;
}

.excel-data-table :deep(.v-data-table-header th:last-child) {
  border-right: none !important;
}

.excel-data-table :deep(.v-data-table__td) {
  padding: 12px 16px !important;
  border-right: 1px solid #f1f5f9 !important;
  font-size: 14px !important;
  vertical-align: middle !important;
}

.excel-data-table :deep(.v-data-table__td:last-child) {
  border-right: none !important;
}

.excel-data-table :deep(.v-data-table__tr:hover) {
  background: #f8fafc !important;
}

.excel-table-row {
  border-bottom: 1px solid #f1f5f9;
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
  background: #eff6ff;
  border-radius: 6px;
}

.excel-cell-text {
  flex: 1;
  min-width: 0;
}

.excel-cell-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 2px;
}

.excel-cell-subtitle {
  color: #6b7280;
  font-size: 12px;
}

.excel-chip {
  font-weight: 500;
  font-size: 12px;
}

.excel-price {
  display: flex;
  align-items: center;
  gap: 4px;
}

.excel-price-amount {
  color: #059669;
  font-size: 14px;
  font-weight: 600;
}

.excel-currency {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.excel-amount {
  color: #1f2937;
  font-weight: 600;
  font-size: 16px;
}

.excel-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.excel-amenity-chip {
  font-size: 11px;
  height: 20px;
}

.excel-empty {
  color: #9ca3af;
  font-style: italic;
}

.excel-status-chip {
  font-weight: 500;
  font-size: 12px;
}

/* Grid View Styles */
.courts-grid-container {
  background: transparent;
  padding: 24px;
}

.court-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.court-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.court-images-wrapper {
  position: relative;
  background: #f1f5f9;
}

.court-no-image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.court-sport-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.court-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.court-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  padding: 16px 16px 8px 16px;
}

.court-card-content {
  flex-grow: 1;
  padding: 0 16px 16px 16px;
}

.court-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.court-info-text {
  font-size: 0.875rem;
  color: #64748b;
}

.court-info-price {
  font-size: 1rem;
  font-weight: 600;
  color: #059669;
}

.court-amenities {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.court-card-actions {
  border-top: 1px solid #e2e8f0;
  padding: 12px;
  background: #f8fafc;
}

/* Details Dialog Styles */
.details-no-image {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 8px;
}

.details-section {
  padding: 16px 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.detail-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 500;
}

.excel-actions {
  display: flex;
  gap: 4px;
}

.excel-action-btn {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .excel-container {
    padding: 12px;
  }
  
  .excel-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .excel-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .excel-search {
    max-width: none;
  }
  
  .excel-filters {
    justify-content: space-between;
  }
}
</style>