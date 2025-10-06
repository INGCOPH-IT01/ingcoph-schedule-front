<template>
  <div>
    <!-- Simple Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Booking</v-card-title>
        <v-card-text>
          <div v-if="editingBooking">
            <p>Court ID: {{ editingBooking.court_id }}</p>
            <p>Status: {{ editingBooking.status }}</p>
            <p>Date: {{ editingBooking.start_time }}</p>
          </div>
          <div v-else>
            <p>Loading...</p>
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
import { ref } from 'vue'

export default {
  name: 'BookingsSimple',
  setup() {
    const editDialog = ref(false)
    const editingBooking = ref(null)
    
    const openEdit = (booking) => {
      editingBooking.value = booking
      editDialog.value = true
    }
    
    return {
      editDialog,
      editingBooking,
      openEdit
    }
  }
}
</script>

