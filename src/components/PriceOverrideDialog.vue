<template>
  <v-dialog v-model="internalOpen" max-width="420" persistent>
    <v-card class="price-override-dialog">
      <!-- Header -->
      <v-card-title class="d-flex align-center pa-5 pb-3">
        <v-avatar color="orange-darken-1" size="40" class="mr-3">
          <v-icon color="white" size="22">mdi-tag-edit</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">Price Override</div>
          <div class="text-caption text-medium-emphasis">Override password required</div>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <!-- Item Info -->
        <v-sheet
          color="grey-lighten-4"
          rounded="lg"
          class="pa-3 mb-4 d-flex align-center"
        >
          <v-icon color="primary" class="mr-2">mdi-package-variant</v-icon>
          <div class="flex-grow-1">
            <div class="text-body-2 font-weight-medium">{{ item?.product?.name }}</div>
            <div class="text-caption text-medium-emphasis">
              Original price: <strong>{{ formatPrice(item?.product?.price) }}</strong>
            </div>
          </div>
        </v-sheet>

        <!-- New Price Input -->
        <v-text-field
          v-model.number="newPrice"
          label="New Price"
          type="number"
          min="0"
          step="0.01"
          prefix="₱"
          variant="outlined"
          density="comfortable"
          :error-messages="priceError"
          autofocus
          class="mb-4"
          @keydown.enter="focusPassword"
        />

        <v-divider class="mb-4">
          <span class="text-caption text-medium-emphasis px-2">Authorization</span>
        </v-divider>

        <v-alert
          v-if="authError"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-3"
          closable
          @click:close="authError = ''"
        >
          {{ authError }}
        </v-alert>

        <v-text-field
          ref="passwordRef"
          v-model="overridePassword"
          label="Override Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          density="comfortable"
          autocomplete="off"
          hint="Enter the override password set in Company Settings"
          persistent-hint
          @keydown.enter="submit"
        />
      </v-card-text>

      <v-card-actions class="pa-5 pt-2 gap-2">
        <v-btn
          variant="outlined"
          color="grey"
          @click="cancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="orange-darken-1"
          variant="flat"
          :loading="loading"
          :disabled="!canSubmit"
          prepend-icon="mdi-check-circle"
          @click="submit"
        >
          Apply Override
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue'
import api from '../services/api'
import { formatPrice } from '../utils/formatters'

export default {
  name: 'PriceOverrideDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'override-applied'],
  setup(props, { emit }) {
    const newPrice = ref('')
    const overridePassword = ref('')
    const showPassword = ref(false)
    const loading = ref(false)
    const authError = ref('')
    const priceError = ref('')
    const passwordRef = ref(null)

    const internalOpen = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const canSubmit = computed(() => {
      return (
        newPrice.value !== '' &&
        parseFloat(newPrice.value) >= 0 &&
        overridePassword.value.length >= 1
      )
    })

    watch(() => props.modelValue, (val) => {
      if (val) {
        newPrice.value = props.item?.price_override ?? props.item?.product?.price ?? ''
        overridePassword.value = ''
        authError.value = ''
        priceError.value = ''
        showPassword.value = false
      }
    })

    const focusPassword = () => {
      passwordRef.value?.$el?.querySelector('input')?.focus()
    }

    const cancel = () => {
      internalOpen.value = false
    }

    const submit = async () => {
      priceError.value = ''
      authError.value = ''

      const priceVal = parseFloat(newPrice.value)
      if (isNaN(priceVal) || priceVal < 0) {
        priceError.value = 'Please enter a valid price (≥ 0).'
        return
      }

      if (!overridePassword.value) {
        authError.value = 'Override password is required.'
        return
      }

      try {
        loading.value = true

        const response = await api.post('/pos/verify-override-password', {
          password: overridePassword.value
        })

        if (response.data.success) {
          emit('override-applied', {
            itemIndex: props.item?._cartIndex,
            newPrice: priceVal
          })
          internalOpen.value = false
        } else {
          authError.value = response.data.message || 'Authorization failed.'
        }
      } catch (err) {
        if (err.response?.status === 401) {
          authError.value = 'Incorrect override password.'
        } else if (err.response?.status === 403) {
          authError.value = err.response?.data?.message || 'Override password not configured. Contact your admin.'
        } else {
          authError.value = err.response?.data?.message || 'Verification failed. Please try again.'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      internalOpen,
      newPrice,
      overridePassword,
      showPassword,
      loading,
      authError,
      priceError,
      passwordRef,
      canSubmit,
      focusPassword,
      cancel,
      submit,
      formatPrice
    }
  }
}
</script>

<style scoped>
.price-override-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}
</style>
