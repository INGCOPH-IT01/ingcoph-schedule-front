<template>
  <div class="banner-management">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2">Banner Management</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Manage homepage banner carousel images
              </p>
            </div>
            <v-btn
              color="primary"
              size="large"
              @click="openAddDialog"
              prepend-icon="mdi-plus"
            >
              Add Banner
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Banners Grid -->
      <v-row v-if="loading">
        <v-col cols="12" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-h6">Loading banners...</p>
        </v-col>
      </v-row>

      <v-row v-else-if="banners.length === 0">
        <v-col cols="12">
          <v-alert type="info" variant="tonal" prominent>
            <v-alert-title class="text-h6 mb-2">No Banners Yet</v-alert-title>
            <div>Click "Add Banner" to create your first banner image.</div>
          </v-alert>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col
          v-for="(banner, index) in banners"
          :key="banner.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="banner-card" elevation="2">
            <div class="banner-image-wrapper">
              <v-img
                :src="banner.image_url"
                :alt="banner.title || 'Banner'"
                cover
                height="200"
                class="banner-preview"
              >
                <div class="banner-overlay">
                  <v-chip
                    :color="banner.is_active ? 'success' : 'error'"
                    variant="flat"
                    size="small"
                    class="ma-2"
                  >
                    {{ banner.is_active ? 'Active' : 'Inactive' }}
                  </v-chip>
                  <v-chip
                    color="primary"
                    variant="flat"
                    size="small"
                    class="ma-2"
                  >
                    Order: {{ banner.order }}
                  </v-chip>
                </div>
              </v-img>
            </div>

            <v-card-text>
              <div class="text-h6 mb-2">
                {{ banner.title || 'Untitled Banner' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Created: {{ formatDate(banner.created_at) }}
              </div>
            </v-card-text>

            <v-card-actions class="px-4 pb-4">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="editBanner(banner)"
                prepend-icon="mdi-pencil"
              >
                Edit
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                :color="banner.is_active ? 'warning' : 'success'"
                @click="toggleActive(banner)"
                :prepend-icon="banner.is_active ? 'mdi-eye-off' : 'mdi-eye'"
              >
                {{ banner.is_active ? 'Deactivate' : 'Activate' }}
              </v-btn>
              <v-spacer />
              <v-btn
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(banner)"
                icon="mdi-delete"
              >
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4">
          {{ editMode ? 'Edit Banner' : 'Add New Banner' }}
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="formData.title"
              label="Banner Title (Optional)"
              variant="outlined"
              placeholder="e.g., Summer Promotion"
              class="mb-4"
            />

            <v-file-input
              v-if="!editMode"
              v-model="formData.image"
              label="Banner Image *"
              variant="outlined"
              accept="image/*"
              prepend-icon=""
              prepend-inner-icon="mdi-image"
              :rules="[v => !!v || 'Banner image is required']"
              show-size
              class="mb-4"
              @change="onFileChange"
            />

            <v-file-input
              v-else
              v-model="formData.image"
              label="New Banner Image (Optional)"
              variant="outlined"
              accept="image/*"
              prepend-icon=""
              prepend-inner-icon="mdi-image"
              hint="Leave empty to keep current image"
              persistent-hint
              show-size
              class="mb-4"
              @change="onFileChange"
            />

            <!-- Image Preview -->
            <div v-if="imagePreview || (editMode && currentBanner)" class="mb-4">
              <div class="text-subtitle-2 mb-2">Preview:</div>
              <v-img
                :src="imagePreview || currentBanner?.image_url"
                max-height="200"
                contain
                class="rounded"
              />
            </div>

            <v-text-field
              v-model.number="formData.order"
              label="Display Order"
              variant="outlined"
              type="number"
              min="0"
              hint="Lower numbers appear first"
              persistent-hint
              class="mb-4"
            />

            <v-switch
              v-model="formData.is_active"
              label="Active"
              color="success"
              inset
              hide-details
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog"
            :disabled="saving"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveBanner"
            :loading="saving"
            :disabled="!valid || saving"
          >
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          Confirm Delete
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          Are you sure you want to delete this banner? This action cannot be undone.
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteDialog = false"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteBanner"
            :loading="deleting"
            :disabled="deleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      top
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { bannerService } from '../services/bannerService'

export default {
  name: 'BannerManagement',
  setup() {
    const banners = ref([])
    const loading = ref(true)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const editMode = ref(false)
    const valid = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const currentBanner = ref(null)
    const imagePreview = ref(null)
    
    const formData = ref({
      title: '',
      image: null,
      order: 0,
      is_active: true
    })

    const snackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const fetchBanners = async () => {
      try {
        loading.value = true
        banners.value = await bannerService.getAllBanners()
      } catch (error) {
        showSnackbar('Failed to load banners', 'error')
        console.error('Error fetching banners:', error)
      } finally {
        loading.value = false
      }
    }

    const openAddDialog = () => {
      editMode.value = false
      currentBanner.value = null
      imagePreview.value = null
      formData.value = {
        title: '',
        image: null,
        order: banners.value.length,
        is_active: true
      }
      dialog.value = true
    }

    const editBanner = (banner) => {
      editMode.value = true
      currentBanner.value = banner
      imagePreview.value = null
      formData.value = {
        title: banner.title || '',
        image: null,
        order: banner.order,
        is_active: banner.is_active
      }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      imagePreview.value = null
      setTimeout(() => {
        editMode.value = false
        currentBanner.value = null
        formData.value = {
          title: '',
          image: null,
          order: 0,
          is_active: true
        }
      }, 300)
    }

    const onFileChange = (event) => {
      const file = formData.value.image
      if (file && file instanceof File) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      } else {
        imagePreview.value = null
      }
    }

    const saveBanner = async () => {
      if (!valid.value) return

      saving.value = true
      try {
        const data = new FormData()
        
        if (formData.value.title) {
          data.append('title', formData.value.title)
        }
        
        if (formData.value.image) {
          data.append('image', formData.value.image)
        }
        
        data.append('order', formData.value.order)
        data.append('is_active', formData.value.is_active ? '1' : '0')

        if (editMode.value) {
          await bannerService.updateBanner(currentBanner.value.id, data)
          showSnackbar('Banner updated successfully', 'success')
        } else {
          await bannerService.createBanner(data)
          showSnackbar('Banner created successfully', 'success')
        }

        closeDialog()
        await fetchBanners()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to save banner', 'error')
        console.error('Error saving banner:', error)
      } finally {
        saving.value = false
      }
    }

    const toggleActive = async (banner) => {
      try {
        const data = new FormData()
        data.append('is_active', banner.is_active ? '0' : '1')
        data.append('order', banner.order)
        
        await bannerService.updateBanner(banner.id, data)
        showSnackbar(
          banner.is_active ? 'Banner deactivated' : 'Banner activated',
          'success'
        )
        await fetchBanners()
      } catch (error) {
        showSnackbar('Failed to update banner status', 'error')
        console.error('Error toggling banner status:', error)
      }
    }

    const confirmDelete = (banner) => {
      currentBanner.value = banner
      deleteDialog.value = true
    }

    const deleteBanner = async () => {
      if (!currentBanner.value) return

      deleting.value = true
      try {
        await bannerService.deleteBanner(currentBanner.value.id)
        showSnackbar('Banner deleted successfully', 'success')
        deleteDialog.value = false
        await fetchBanners()
      } catch (error) {
        showSnackbar('Failed to delete banner', 'error')
        console.error('Error deleting banner:', error)
      } finally {
        deleting.value = false
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const showSnackbar = (text, color = 'success') => {
      snackbarText.value = text
      snackbarColor.value = color
      snackbar.value = true
    }

    onMounted(() => {
      fetchBanners()
    })

    return {
      banners,
      loading,
      dialog,
      deleteDialog,
      editMode,
      valid,
      saving,
      deleting,
      currentBanner,
      formData,
      imagePreview,
      snackbar,
      snackbarText,
      snackbarColor,
      openAddDialog,
      editBanner,
      closeDialog,
      onFileChange,
      saveBanner,
      toggleActive,
      confirmDelete,
      deleteBanner,
      formatDate
    }
  }
}
</script>

<style scoped>
.banner-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px 0;
}

.banner-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.banner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.banner-image-wrapper {
  position: relative;
  overflow: hidden;
}

.banner-preview {
  transition: transform 0.3s ease;
}

.banner-card:hover .banner-preview {
  transform: scale(1.05);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 8px;
}
</style>
