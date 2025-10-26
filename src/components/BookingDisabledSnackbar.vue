<template>
  <v-snackbar
    v-model="show"
    :timeout="timeout"
    :color="color"
    :location="location"
    multi-line
  >
    <div class="d-flex align-center">
      <v-icon class="mr-3" size="28">{{ icon }}</v-icon>
      <div>
        <div class="font-weight-bold mb-1">{{ title }}</div>
        <div>{{ message }}</div>
      </div>
    </div>
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="close"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'BookingDisabledSnackbar',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Booking Unavailable'
    },
    message: {
      type: String,
      default: 'Booking is currently disabled. Please contact the administrator for more information.'
    },
    color: {
      type: String,
      default: 'error'
    },
    icon: {
      type: String,
      default: 'mdi-alert-circle'
    },
    timeout: {
      type: Number,
      default: 5000
    },
    location: {
      type: String,
      default: 'top'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const show = ref(props.modelValue)

    watch(() => props.modelValue, (newValue) => {
      show.value = newValue
    })

    watch(show, (newValue) => {
      emit('update:modelValue', newValue)
    })

    const close = () => {
      show.value = false
    }

    return {
      show,
      close
    }
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
