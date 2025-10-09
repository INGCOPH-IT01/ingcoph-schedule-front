<template>
  <div class="court-image-gallery">
    <div v-if="images && images.length > 0" class="image-gallery">
      <!-- Single image display -->
      <div v-if="images.length === 1" class="single-image">
        <img 
          :src="images[0].image_url"
          :alt="courtName"
          class="court-image-single"
          @error="handleImageError"
        />
      </div>
      
      <!-- Multiple images display -->
      <div v-else class="multiple-images">
        <!-- Main image -->
        <div class="main-image-container">
          <img 
            :src="selectedImage || images[0].image_url"
            :alt="courtName"
            class="court-image-main"
            @error="handleImageError"
          />
          <div v-if="images.length > 1" class="image-counter">
            {{ currentImageIndex + 1 }} / {{ images.length }}
          </div>
        </div>
        
        <!-- Thumbnail navigation -->
        <div v-if="images.length > 1" class="thumbnail-container">
          <div 
            v-for="(image, index) in images" 
            :key="image.id"
            class="thumbnail-item"
            :class="{ active: index === currentImageIndex }"
            @click="selectImage(index)"
          >
            <img 
              :src="image.image_url"
              :alt="`${courtName} - Image ${index + 1}`"
              class="thumbnail-image"
              @error="handleImageError"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fallback icon when no images -->
    <div v-else class="no-images">
      <v-icon size="40" color="grey-lighten-1">🏟️</v-icon>
      <div class="no-images-text">No images available</div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CourtImageGallery',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    courtName: {
      type: String,
      default: 'Court'
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  },
  emits: ['image-error'],
  setup(props, { emit }) {
    const currentImageIndex = ref(0)
    const selectedImage = ref(null)

    const selectImage = (index) => {
      currentImageIndex.value = index
      selectedImage.value = props.images[index].image_url
    }

    const handleImageError = (event) => {
      emit('image-error', event)
      // Hide the broken image
      event.target.style.display = 'none'
    }

    const gallerySize = computed(() => {
      const sizes = {
        small: {
          main: '60px',
          thumbnail: '20px',
          container: '80px'
        },
        medium: {
          main: '100px',
          thumbnail: '30px',
          container: '120px'
        },
        large: {
          main: '150px',
          thumbnail: '40px',
          container: '180px'
        }
      }
      return sizes[props.size] || sizes.medium
    })

    return {
      currentImageIndex,
      selectedImage,
      selectImage,
      handleImageError,
      gallerySize
    }
  }
}
</script>

<style scoped>
.court-image-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-gallery {
  width: 100%;
}

/* Single image display */
.single-image {
  display: flex;
  justify-content: center;
}

.court-image-single {
  width: v-bind('gallerySize.main');
  height: v-bind('gallerySize.main');
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Multiple images display */
.multiple-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.main-image-container {
  position: relative;
  display: flex;
  justify-content: center;
}

.court-image-main {
  width: v-bind('gallerySize.main');
  height: v-bind('gallerySize.main');
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.court-image-main:hover {
  transform: scale(1.05);
}

.image-counter {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.thumbnail-container {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: v-bind('gallerySize.container');
}

.thumbnail-item {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.thumbnail-item:hover {
  border-color: #1976d2;
}

.thumbnail-item.active {
  border-color: #1976d2;
  box-shadow: 0 0 0 1px #1976d2;
}

.thumbnail-image {
  width: v-bind('gallerySize.thumbnail');
  height: v-bind('gallerySize.thumbnail');
  object-fit: cover;
  display: block;
}

/* No images fallback */
.no-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: v-bind('gallerySize.main');
  height: v-bind('gallerySize.main');
  background: #f5f5f5;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

.no-images-text {
  font-size: 10px;
  color: #9e9e9e;
  margin-top: 4px;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .thumbnail-container {
    max-width: 100%;
  }
  
  .thumbnail-image {
    width: 25px;
    height: 25px;
  }
}
</style>
