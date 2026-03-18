<template>
  <div v-if="banners.length > 0" class="banner-carousel-wrapper">
    <v-carousel
      v-model="currentSlide"
      cycle
      :interval="5000"
      hide-delimiter-background
      show-arrows="hover"
      height="auto"
      class="banner-carousel"
    >
      <v-carousel-item
        v-for="(banner, index) in banners"
        :key="banner.id"
      >
        <div class="banner-image-container">
          <v-img
            :src="banner.image_url"
            :alt="banner.title || 'Banner'"
            cover
            class="banner-image"
            :aspect-ratio="aspectRatio"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  indeterminate
                  color="grey-lighten-5"
                ></v-progress-circular>
              </div>
            </template>
          </v-img>
        </div>
      </v-carousel-item>

      <!-- Custom indicators -->
      <template v-slot:additional>
        <div class="banner-indicators">
          <div
            v-for="(banner, index) in banners"
            :key="`indicator-${banner.id}`"
            class="banner-indicator"
            :class="{ active: index === currentSlide }"
            @click="currentSlide = index"
          ></div>
        </div>
      </template>
    </v-carousel>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { bannerService } from '../services/bannerService'

export default {
  name: 'BannerCarousel',
  props: {
    aspectRatio: {
      type: Number,
      default: 21 / 9 // Default widescreen aspect ratio
    }
  },
  setup() {
    const banners = ref([])
    const currentSlide = ref(0)
    const loading = ref(true)
    const error = ref(null)

    const fetchBanners = async () => {
      try {
        loading.value = true
        error.value = null
        banners.value = await bannerService.getActiveBanners()
      } catch (err) {
        console.error('Error fetching banners:', err)
        error.value = 'Failed to load banners'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchBanners()
    })

    return {
      banners,
      currentSlide,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.banner-carousel-wrapper {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.banner-carousel {
  border-radius: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.banner-image-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* Custom indicators styling */
.banner-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.banner-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.banner-indicator:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.banner-indicator.active {
  background: white;
  width: 30px;
  border-radius: 5px;
  border: 2px solid white;
}

/* Responsive design */
@media (max-width: 768px) {
  .banner-carousel {
    border-radius: 0;
  }

  .banner-indicators {
    bottom: 12px;
    gap: 8px;
  }

  .banner-indicator {
    width: 8px;
    height: 8px;
  }

  .banner-indicator.active {
    width: 24px;
  }
}

@media (max-width: 480px) {
  .banner-indicators {
    bottom: 8px;
    gap: 6px;
  }

  .banner-indicator {
    width: 6px;
    height: 6px;
  }

  .banner-indicator.active {
    width: 18px;
  }
}
</style>
