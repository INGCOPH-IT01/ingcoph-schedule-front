<template>
  <div>
    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="bookings"
      :search="searchQuery"
      :loading="loading"
      class="elevation-1"
    >
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          size="small"
          color="primary"
          @click="editBooking(item)"
        ></v-btn>
      </template>
    </v-data-table>

    <!-- Simple Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Booking</v-card-title>
        <v-card-text>
          <div v-if="editingBooking">
            <p><strong>Court ID:</strong> {{ editingBooking.court_id }}</p>
            <p><strong>Status:</strong> {{ editingBooking.status }}</p>
            <p><strong>Date:</strong> {{ editingBooking.start_time }}</p>
            <p><strong>Total Price:</strong> ₱{{ (parseFloat(editingBooking.total_price) || 0).toFixed(2) }}</p>
          </div>
          <div v-else>
            <p>Loading booking details...</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { bookingService } from '../services/bookingService'

export default {
  name: 'BookingsMinimal',
  setup() {
    const editDialog = ref(false)
    const editingBooking = ref(null)
    const bookings = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    
    const headers = [
      { title: 'Court', key: 'court.name', sortable: true },
      { title: 'Date', key: 'start_time', sortable: true },
      { title: 'Status', key: 'status', sortable: true },
      { title: 'Total Price', key: 'total_price', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false }
    ]
    
    const fetchBookings = async () => {
      try {
        loading.value = true
        bookings.value = await bookingService.getBookings()
      } catch (error) {
      } finally {
        loading.value = false
      }
    }
    
    const editBooking = (booking) => {
      editingBooking.value = booking
      editDialog.value = true
    }
    
    onMounted(() => {
      fetchBookings()
    })
    
    return {
      editDialog,
      editingBooking,
      bookings,
      loading,
      searchQuery,
      headers,
      fetchBookings,
      editBooking
    }
  }
}
</script>
