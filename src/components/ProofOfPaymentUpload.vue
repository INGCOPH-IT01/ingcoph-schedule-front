<template>
  <div class="proof-of-payment-upload">
    <v-file-input
      :model-value="modelValue"
      :label="label"
      :placeholder="placeholder"
      variant="outlined"
      :density="density"
      prepend-icon="mdi-camera"
      accept="image/*"
      :multiple="multiple"
      :rules="rules"
      :hint="hint"
      :persistent-hint="persistentHint"
      :show-size="showSize"
      :disabled="disabled"
      @update:model-value="handleFileChange"
    >
      <template v-slot:selection="{ fileNames }">
        <template v-for="(fileName, index) in fileNames" :key="fileName">
          <v-chip
            v-if="index < 2"
            color="primary"
            size="small"
            class="mr-2"
          >
            {{ fileName }}
          </v-chip>
          <span
            v-else-if="index === 2"
            class="text-overline grey--text text--darken-3 mx-2"
          >
            +{{ fileNames.length - 2 }} File(s)
          </span>
        </template>
      </template>
    </v-file-input>

    <!-- Preview uploaded images -->
    <div v-if="previews.length > 0" class="mt-3">
      <div class="d-flex flex-wrap gap-2">
        <div
          v-for="(preview, index) in previews"
          :key="index"
          class="proof-preview-container proof-preview-clickable"
        >
          <v-img
            :src="preview"
            max-height="150"
            max-width="150"
            class="rounded"
            cover
            @click="openPreviewDialog(index)"
          ></v-img>
          <v-btn
            icon="mdi-close"
            size="x-small"
            color="error"
            class="remove-preview-btn"
            @click.stop="removePreview(index)"
          ></v-btn>
        </div>
      </div>
    </div>

    <!-- Preview Dialog -->
    <v-dialog
      v-model="previewDialog"
      max-width="800"
      :fullscreen="$vuetify.display.mobile"
    >
      <v-card>
        <v-card-title class="text-h5 dialog-title">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-image</v-icon>
            Preview Image
          </div>
          <v-btn icon="mdi-close" variant="text" @click="previewDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <div class="text-center">
            <img
              v-if="selectedPreview"
              :src="selectedPreview"
              alt="Preview"
              style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
            />
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="outlined"
            @click="previewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ProofOfPaymentUpload',
  props: {
    modelValue: {
      type: [Array, Object, null],
      default: null
    },
    label: {
      type: String,
      default: 'Upload Proof of Payment'
    },
    placeholder: {
      type: String,
      default: 'Select image file(s)'
    },
    hint: {
      type: String,
      default: 'Upload screenshots of your payment receipts (max 5MB each)'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    density: {
      type: String,
      default: 'default'
    },
    persistentHint: {
      type: Boolean,
      default: true
    },
    showSize: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    rules: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const previews = ref([])
    const previewDialog = ref(false)
    const selectedPreview = ref(null)

    const handleFileChange = (files) => {
      emit('update:modelValue', files)
    }

    const openPreviewDialog = (index) => {
      selectedPreview.value = previews.value[index]
      previewDialog.value = true
    }

    const removePreview = (index) => {
      // Revoke the blob URL if it exists
      if (previews.value[index]?.startsWith('blob:')) {
        URL.revokeObjectURL(previews.value[index])
      }

      // Remove from preview array
      previews.value.splice(index, 1)

      // Remove from files array
      if (props.modelValue) {
        const files = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
        const newFiles = files.filter((_, i) => i !== index)
        emit('update:modelValue', newFiles.length > 0 ? newFiles : null)
      }
    }

    // Watch for file changes to generate previews
    watch(() => props.modelValue, (newFiles) => {
      // Clean up old preview URLs
      previews.value.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
      previews.value = []

      if (newFiles) {
        const fileArray = Array.isArray(newFiles) ? newFiles : [newFiles]

        fileArray.forEach(file => {
          if (file instanceof File) {
            const reader = new FileReader()
            reader.onload = (e) => {
              previews.value.push(e.target.result)
            }
            reader.readAsDataURL(file)
          }
        })
      }
    }, { immediate: true })

    return {
      previews,
      previewDialog,
      selectedPreview,
      handleFileChange,
      openPreviewDialog,
      removePreview
    }
  }
}
</script>

<style scoped>
/* Proof of Payment Preview Styles */
.proof-preview-container {
  position: relative;
  display: inline-block;
}

.proof-preview-container.proof-preview-clickable {
  cursor: pointer;
  transition: transform 0.2s;
}

.proof-preview-container.proof-preview-clickable:hover {
  transform: scale(1.05);
}

.proof-preview-container .remove-preview-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 1;
}

.gap-2 {
  gap: 8px;
}

.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
