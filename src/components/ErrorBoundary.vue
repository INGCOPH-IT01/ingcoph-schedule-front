<template>
  <div v-if="error" class="error-boundary">
    <v-card class="mx-auto error-card" max-width="600" elevation="4">
      <v-card-title class="error-title">
        <v-icon size="large" color="error" class="mr-2">mdi-alert-circle</v-icon>
        {{ title }}
      </v-card-title>

      <v-card-text>
        <div v-if="showDetails" class="error-details">
          <p class="error-message">{{ error.message }}</p>

          <v-expansion-panels v-if="showStack" class="mt-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <span class="text-caption">Technical Details</span>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <pre class="error-stack">{{ error.stack }}</pre>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>

        <div v-else class="error-simple">
          <p>{{ fallbackMessage }}</p>
        </div>

        <div class="error-actions mt-4">
          <v-btn
            color="primary"
            variant="flat"
            @click="handleReload"
            :loading="reloading"
          >
            <v-icon start>mdi-refresh</v-icon>
            Reload Page
          </v-btn>

          <v-btn
            v-if="onRetry"
            color="secondary"
            variant="outlined"
            @click="handleRetry"
            class="ml-2"
          >
            <v-icon start>mdi-replay</v-icon>
            Try Again
          </v-btn>

          <v-btn
            v-if="showReset"
            color="warning"
            variant="outlined"
            @click="handleReset"
            class="ml-2"
          >
            <v-icon start>mdi-backup-restore</v-icon>
            Reset State
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>

  <slot v-else></slot>
</template>

<script>
import { ref, onErrorCaptured, watch } from 'vue'

export default {
  name: 'ErrorBoundary',
  props: {
    title: {
      type: String,
      default: 'Something went wrong'
    },
    fallbackMessage: {
      type: String,
      default: 'An unexpected error occurred. Please try reloading the page.'
    },
    showDetails: {
      type: Boolean,
      default: false  // Set to true in development
    },
    showStack: {
      type: Boolean,
      default: false  // Set to true in development
    },
    showReset: {
      type: Boolean,
      default: false
    },
    onRetry: {
      type: Function,
      default: null
    },
    onReset: {
      type: Function,
      default: null
    },
    logError: {
      type: Boolean,
      default: true
    }
  },
  emits: ['error'],
  setup(props, { emit }) {
    const error = ref(null)
    const reloading = ref(false)

    // Capture errors from child components
    onErrorCaptured((err, instance, info) => {
      error.value = err

      // Log error if enabled
      if (props.logError) {
        console.error('Error captured by ErrorBoundary:', {
          error: err,
          component: instance?.$options?.name || 'Unknown',
          info
        })
      }

      // Emit error event for parent handling
      emit('error', { error: err, instance, info })

      // Prevent error from propagating further
      return false
    })

    // Watch for prop changes to reset error state
    watch(() => props.onRetry, () => {
      if (error.value) {
        error.value = null
      }
    })

    const handleReload = () => {
      reloading.value = true
      setTimeout(() => {
        window.location.reload()
      }, 300)
    }

    const handleRetry = () => {
      error.value = null
      if (props.onRetry) {
        props.onRetry()
      }
    }

    const handleReset = () => {
      error.value = null
      if (props.onReset) {
        props.onReset()
      } else {
        // Default reset: clear localStorage (except auth)
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        localStorage.clear()
        if (token) localStorage.setItem('token', token)
        if (user) localStorage.setItem('user', user)

        handleReload()
      }
    }

    return {
      error,
      reloading,
      handleReload,
      handleRetry,
      handleReset
    }
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 20px;
}

.error-card {
  margin: 20px;
}

.error-title {
  display: flex;
  align-items: center;
  color: #d32f2f;
  font-weight: 600;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

.error-details {
  padding: 10px 0;
}

.error-message {
  font-size: 1rem;
  margin-bottom: 12px;
  color: #424242;
  line-height: 1.5;
}

.error-simple {
  padding: 10px 0;
  font-size: 1rem;
  color: #616161;
  line-height: 1.6;
}

.error-stack {
  font-size: 12px;
  color: #e53935;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 600px) {
  .error-actions {
    flex-direction: column;
  }

  .error-actions .v-btn {
    width: 100%;
    margin-left: 0 !important;
  }
}
</style>
