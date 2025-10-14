<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="closeModal"
    max-width="600"
    persistent
  >
    <v-card class="court-dialog-card">
      <div class="dialog-header">
        <div class="header-badge">
          <v-icon color="white" size="20" class="mr-2">
            {{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}
          </v-icon>
          {{ isEdit ? 'Court Management' : 'New Court' }}
        </div>
        <h2 class="dialog-title">
          <span class="title-gradient">{{ isEdit ? 'Edit' : 'Add' }}</span> Court
        </h2>
        <p class="dialog-subtitle">
          {{ isEdit ? 'Update court information and settings' : 'Create a new badminton court facility' }}
        </p>
      </div>

      <v-divider class="dialog-divider"></v-divider>

      <v-form @submit.prevent="handleSubmit" class="pa-6">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.name"
              label="Court Name"
              placeholder="Enter court name"
              :rules="[v => !!v || 'Court name is required']"
              required
              variant="outlined"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="form.sport_ids"
              :items="sports"
              item-title="name"
              item-value="id"
              label="Sports"
              variant="outlined"
              :rules="[v => (v && v.length > 0) || 'At least one sport is required']"
              required
              multiple
              chips
              closable-chips
            >
              <template v-slot:prepend-inner>
                <span class="sport-icon">🏟️</span>
              </template>
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <span class="sport-icon">{{ getSportIcon(item.raw.name) }}</span>
                  </template>
                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                </v-list-item>
              </template>
              <template v-slot:chip="{ item }">
                <v-chip
                  closable
                  size="small"
                >
                  <span class="sport-icon mr-1">{{ getSportIcon(item.raw.name) }}</span>
                  {{ item.raw.name }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description"
              placeholder="Enter court description"
              rows="3"
              variant="outlined"
            ></v-textarea>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.price_per_hour"
              label="Price per Hour"
              type="number"
              step="0.01"
              min="0"
              :rules="[v => v >= 0 || 'Price must be non-negative']"
              variant="outlined"
              prepend-inner-icon="mdi-currency-php"
              class="excel-price-field"
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.location"
              label="Location"
              placeholder="Enter court location"
              variant="outlined"
              prepend-inner-icon="mdi-map-marker"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-label class="text-subtitle-2 mb-2">Photos</v-label>
              <input type="file" class="d-none" id="imageInput" ref="imageInput" @change="onImagesChange" multiple accept="image/*"/>
              <v-btn v-if="previewImages.length > 0" variant="outlined" color="primary" @click="$refs.imageInput.click()">
                Upload Photos
              </v-btn>
            </div>

              <v-card
                v-if="previewImages.length > 0"
                height="200px"
                class="overflow-y-auto"
              >
                <v-container fluid>
                  <v-row dense no-gutters>
                    <v-col
                      cols="3"
                      v-for="(image, index) in previewImages"
                      :key="index"
                      class="d-flex justify-center pa-0 gap-2 mb-2"
                    >
                      <v-card
                        height="100px"
                        width="100px"
                        class="position-relative rounded-lg overflow-hidden"
                      >
                        <!-- Image -->
                        <img
                        v-if="image.image_url"
                          :src="`${image.image_url}`"
                          class="w-100 h-100"
                          style="object-fit: cover; border-radius: 8px;"
                        />
                        <img v-else :src="image" class="w-100 h-100" style="object-fit: cover; border-radius: 8px;" />

                        <!-- Close button overlay -->
                        <v-btn
                          icon="mdi-close-circle"
                          color="red"
                          size="small"
                          variant="tonal"
                          class="position-absolute top-0 right-0"
                          density="compact"
                          @click="removeImage(index)"
                        />
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>


            <v-card v-else height="200px">
              <v-card-text class="d-flex align-center justify-center flex-column">
                <v-icon size="100" @click="$refs.imageInput.click()" color="primary">mdi-image</v-icon>
                <span class="text-subtitle-2">No photos uploaded yet</span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-label class="text-subtitle-2 mb-2">Amenities</v-label>
            <v-combobox
              v-model="form.amenities"
              :items="[]"
              label="Add amenities"
              placeholder="Type and press Enter to add"
              multiple
              chips
              closable-chips
              variant="outlined"
              prepend-inner-icon="mdi-star"
            ></v-combobox>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-switch
              v-model="form.is_active"
              label="Active"
              color="primary"
              hide-details
            ></v-switch>
          </v-col>
        </v-row>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          {{ error }}
        </v-alert>
      </v-form>

      <v-divider></v-divider>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeModal"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="handleSubmit"
          :loading="loading"
          :disabled="loading"
        >
          {{ isEdit ? 'Update Court' : 'Add Court' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { courtService } from '../services/courtService'

export default {
  name: 'CourtDialog',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    court: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const loading = ref(false)
    const error = ref('')
    const sports = ref([])

    const form = ref({
      name: '',
      description: '',
      price_per_hour: 0,
      location: '',
      amenities: [],
      is_active: true,
      images: [],
      sport_ids: []
    })

    const previewImages = ref([])

    const isEdit = computed(() => !!props.court)

    const getSportIcon = (sportName) => {
      const icons = {
        'Badminton': '🏸',
        'Tennis': '🎾',
        'Basketball': '🏀',
        'Volleyball': '🏐',
        'Football': '⚽',
        'Soccer': '⚽',
        'Table Tennis': '🏓',
        'Squash': '🎾'
      }
      return icons[sportName] || '🏟️'
    }

    const fetchSports = async () => {
      try {
        sports.value = await courtService.getSports()
        console.log('Loaded sports:', sports.value) // Debug: see what sports are loaded
      } catch (err) {
        console.error('Failed to fetch sports:', err)
      }
    }

    const resetForm = () => {
      form.value = {
        name: '',
        description: '',
        price_per_hour: 0,
        location: '',
        amenities: [],
        is_active: true,
        images: [],
        sport_ids: [], // Changed to array for multiple sports
        trashImages: []
      }
      error.value = ''
      previewImages.value = []
      form.value.trashImages = []
    }

    const populateForm = () => {
      if (props.court) {
        // Get sport IDs from the sports relationship (many-to-many)
        const sportIds = props.court.sports && props.court.sports.length > 0
          ? props.court.sports.map(sport => sport.id)
          : (props.court.sport_id ? [props.court.sport_id] : []) // Fallback to single sport_id if exists

        form.value = {
          name: props.court.name || '',
          description: props.court.description || '',
          price_per_hour: props.court.price_per_hour || '',
          location: props.court.location || '',
          amenities: [...(props.court.amenities || [])],
          is_active: props.court.is_active !== false,
          images: [...([])],
          sport_ids: sportIds,
          trashImages: [...(props.court.trashImages || [])]
        }
        previewImages.value = [...(props.court.images || [])]
      }
    }

    const uploadImages = () => {
      console.log(form.value.images)
    }

    const onImagesChange = (e) => {
      if (e.target.files.length > 0) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (el) => {
      // keep previous images and add the new one
      previewImages.value = [...(previewImages.value || []), el.target.result];
      form.value.images = [...(form.value.images || []), file];
    };

    e.target.value = null

    reader.readAsDataURL(file);
  }
    }
    const handleSubmit = async () => {
      try {
        loading.value = true
        error.value = ''
        const courtData = {
          ...form.value,
        }

        if (isEdit.value) {
          await courtService.updateCourt(props.court.id, courtData)
          if(form.value.images.length > 0) {
            await saveUploadedImages()
          }
        } else {
          await courtService.createCourt(courtData)
          if(form.value.images.length > 0) {
            await saveUploadedImages()
          }
        }

        emit('saved')
        closeModal()
      } catch (err) {
        error.value = err.message || 'Failed to save court'
      } finally {
        loading.value = false
      }
    }

    const saveUploadedImages = async () => {
      const formData = new FormData()
      form.value.images.forEach((image, index) => {
        formData.append("images[]", image);
      });
      await courtService.saveImage(props.court.id, formData)
    }

    const closeModal = () => {
      resetForm()
      emit('close')
    }

    const removeImage = (index) => {
      form.value.trashImages.push(previewImages.value[index])
      previewImages.value.splice(index, 1)
    }

    watch(() => props.isOpen, (isOpen) => {
      if (isOpen) {
        populateForm()
      }
    })

    watch(() => props.court, () => {
      if (props.isOpen) {
        populateForm()
      }
    })

    onMounted(() => {
      fetchSports()
    })

    return {
      sports,
      form,
      loading,
      error,
      isEdit,
      getSportIcon,
      handleSubmit,
      closeModal,
      uploadImages,
      onImagesChange,
      removeImage,
      previewImages,
      saveUploadedImages
    }
  }
}
</script>

<style scoped>
.sport-icon {
  font-size: 20px;
  margin-right: 8px;
}

/* Modern Sports Court Dialog Theme */
.court-dialog-card {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
}

.dialog-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 32px;
  text-align: center;
  position: relative;
}

.dialog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
  z-index: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 16px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

.dialog-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  color: white;
  position: relative;
  z-index: 2;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dialog-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}

.dialog-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
  margin: 0 !important;
}
</style>
