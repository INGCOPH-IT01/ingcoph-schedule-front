<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h5">Promotion Management</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">
              New Promotion
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="promotions"
              :loading="loading"
              class="elevation-1"
            >
              <template v-slot:item.is_active="{ item }">
                <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
                  {{ item.is_active ? 'Active' : 'Inactive' }}
                </v-chip>
              </template>

              <template v-slot:item.auto_popup_enabled="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-chip
                      v-bind="props"
                      :color="item.auto_popup_enabled ? 'info' : 'default'"
                      size="small"
                    >
                      <v-icon size="16" class="mr-1">
                        {{ item.auto_popup_enabled ? 'mdi-window-open' : 'mdi-window-closed' }}
                      </v-icon>
                      {{ item.auto_popup_enabled ? 'Yes' : 'No' }}
                    </v-chip>
                  </template>
                  <span v-if="item.auto_popup_enabled">
                    Opens every {{ item.auto_popup_interval_hours }} hour(s)
                  </span>
                  <span v-else>
                    Auto-popup disabled
                  </span>
                </v-tooltip>
              </template>

              <template v-slot:item.published_at="{ item }">
                {{ item.published_at ? formatDate(item.published_at) : 'Not set' }}
              </template>

              <template v-slot:item.expires_at="{ item }">
                {{ item.expires_at ? formatDate(item.expires_at) : 'Never' }}
              </template>

              <template v-slot:item.media="{ item }">
                <v-chip size="small">
                  {{ item.media?.length || 0 }} file(s)
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openDialog(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(item)"
                />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Promotion Dialog -->
    <v-dialog v-model="dialog" max-width="1000px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editMode ? 'Edit' : 'New' }} Promotion</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.title"
                  label="Title"
                  :rules="[v => !!v || 'Title is required']"
                  required
                />
              </v-col>

              <v-col cols="12">
                <label class="text-subtitle-2 mb-2 d-block">Content</label>
                <QuillEditor
                  v-model:content="formData.content"
                  contentType="html"
                  theme="snow"
                  :toolbar="quillToolbar"
                  style="min-height: 300px;"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.published_at"
                  label="Publish Date (Optional)"
                  type="datetime-local"
                  hint="Leave empty to publish immediately"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.expires_at"
                  label="Expiration Date (Optional)"
                  type="datetime-local"
                  hint="Leave empty for no expiration"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.display_order"
                  label="Display Order"
                  type="number"
                  hint="Lower numbers appear first"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.is_active"
                  label="Active"
                  color="primary"
                />
              </v-col>

              <v-col cols="12">
                <v-divider class="my-2" />
                <label class="text-subtitle-2 mb-2 d-block">Auto-Popup Settings</label>
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <div class="text-caption">
                    When enabled, this promotion will automatically appear in a dialog when users visit the home page.
                    The interval controls how often it shows (e.g., every 4 hours means users won't see it again for 4 hours after closing it).
                  </div>
                </v-alert>
              </v-col>

              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.auto_popup_enabled"
                  label="Enable Auto-Popup"
                  color="primary"
                  hint="Show this promotion automatically when users visit the home page"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.auto_popup_interval_hours"
                  label="Popup Interval (Hours)"
                  type="number"
                  min="1"
                  max="168"
                  :disabled="!formData.auto_popup_enabled"
                  hint="How often to show this popup (1-168 hours)"
                  persistent-hint
                  prepend-icon="mdi-timer-outline"
                >
                  <template v-slot:append>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon="mdi-clock-fast"
                          size="small"
                          variant="text"
                          v-bind="props"
                          :disabled="!formData.auto_popup_enabled"
                        />
                      </template>
                      <v-list>
                        <v-list-item @click="formData.auto_popup_interval_hours = 1">
                          <v-list-item-title>Every 1 hour</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="formData.auto_popup_interval_hours = 4">
                          <v-list-item-title>Every 4 hours (Default)</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="formData.auto_popup_interval_hours = 12">
                          <v-list-item-title>Every 12 hours</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="formData.auto_popup_interval_hours = 24">
                          <v-list-item-title>Once per day</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="formData.auto_popup_interval_hours = 72">
                          <v-list-item-title>Every 3 days</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="formData.auto_popup_interval_hours = 168">
                          <v-list-item-title>Once per week</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-text-field>
              </v-col>

              <v-col cols="12">
                <v-file-input
                  v-model="newMediaFiles"
                  label="Upload Images/Videos"
                  accept="image/*,video/*"
                  multiple
                  prepend-icon="mdi-camera"
                  show-size
                  chips
                  hint="Max file size: 50MB per file"
                  persistent-hint
                />
              </v-col>

              <!-- Existing media preview (edit mode) -->
              <v-col v-if="editMode && existingMedia.length > 0" cols="12">
                <label class="text-subtitle-2 mb-2 d-block">Existing Media</label>
                <v-row>
                  <v-col
                    v-for="(media, index) in existingMedia"
                    :key="index"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-card>
                      <v-img
                        v-if="isImage(media)"
                        :src="getMediaUrl(media)"
                        height="150"
                        cover
                      />
                      <video
                        v-else
                        :src="getMediaUrl(media)"
                        controls
                        style="width: 100%; max-height: 150px;"
                      />
                      <v-card-actions>
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          color="error"
                          @click="removeExistingMedia(index)"
                        />
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="savePromotion">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { promotionService } from '../services/promotionService'
import Swal from 'sweetalert2'

const promotions = ref([])
const loading = ref(false)
const dialog = ref(false)
const editMode = ref(false)
const saving = ref(false)
const form = ref(null)
const newMediaFiles = ref([])
const existingMedia = ref([])

const formData = ref({
  title: '',
  content: '',
  is_active: true,
  auto_popup_enabled: false,
  auto_popup_interval_hours: 4,
  display_order: 0,
  published_at: '',
  expires_at: ''
})

const headers = [
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Status', key: 'is_active', sortable: true },
  { title: 'Auto-Popup', key: 'auto_popup_enabled', sortable: true },
  { title: 'Published', key: 'published_at', sortable: true },
  { title: 'Expires', key: 'expires_at', sortable: true },
  { title: 'Media', key: 'media', sortable: false },
  { title: 'Order', key: 'display_order', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
]

const quillToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['link', 'image', 'video'],
  ['clean']
]

onMounted(() => {
  loadPromotions()
})

async function loadPromotions() {
  loading.value = true
  try {
    promotions.value = await promotionService.getPromotions()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message
    })
  } finally {
    loading.value = false
  }
}

function openDialog(item = null) {
  if (item) {
    editMode.value = true
    formData.value = {
      id: item.id,
      title: item.title,
      content: item.content,
      is_active: item.is_active,
      auto_popup_enabled: item.auto_popup_enabled || false,
      auto_popup_interval_hours: item.auto_popup_interval_hours || 4,
      display_order: item.display_order,
      published_at: item.published_at ? formatDatetimeLocal(item.published_at) : '',
      expires_at: item.expires_at ? formatDatetimeLocal(item.expires_at) : ''
    }
    existingMedia.value = item.media ? [...item.media] : []
  } else {
    editMode.value = false
    formData.value = {
      title: '',
      content: '',
      is_active: true,
      auto_popup_enabled: false,
      auto_popup_interval_hours: 4,
      display_order: 0,
      published_at: '',
      expires_at: ''
    }
    existingMedia.value = []
  }
  newMediaFiles.value = []
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  if (form.value) {
    form.value.reset()
  }
}

async function savePromotion() {
  if (!form.value?.validate || !(await form.value.validate()).valid) {
    return
  }

  saving.value = true
  try {
    const data = {
      title: formData.value.title,
      content: formData.value.content,
      is_active: formData.value.is_active,
      auto_popup_enabled: formData.value.auto_popup_enabled,
      auto_popup_interval_hours: formData.value.auto_popup_interval_hours,
      display_order: formData.value.display_order,
      published_at: formData.value.published_at || null,
      expires_at: formData.value.expires_at || null,
      media: newMediaFiles.value
    }

    if (editMode.value) {
      data.existing_media = existingMedia.value
      await promotionService.updatePromotion(formData.value.id, data)
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Promotion updated successfully'
      })
    } else {
      await promotionService.createPromotion(data)
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Promotion created successfully'
      })
    }

    closeDialog()
    loadPromotions()
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message
    })
  } finally {
    saving.value = false
  }
}

async function confirmDelete(item) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete "${item.title}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    try {
      await promotionService.deletePromotion(item.id)
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Promotion deleted successfully'
      })
      loadPromotions()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      })
    }
  }
}

function removeExistingMedia(index) {
  existingMedia.value.splice(index, 1)
}

function isImage(url) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}

function getMediaUrl(url) {
  // Check if URL is already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // Otherwise prepend the backend base URL
  return import.meta.env.VITE_API_URL.replace('/api', '') + url
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function formatDatetimeLocal(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
</script>

<style scoped>
:deep(.ql-container) {
  min-height: 300px;
}

:deep(.ql-editor) {
  min-height: 300px;
}
</style>
