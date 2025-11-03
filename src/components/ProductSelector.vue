<template>
  <div class="product-selector">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-shopping</v-icon>
          <span>Add Products to Order</span>
        </div>
        <v-chip v-if="selectedProducts.length > 0" color="primary" variant="tonal">
          {{ selectedProducts.length }} item{{ selectedProducts.length !== 1 ? 's' : '' }}
        </v-chip>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text>
        <!-- Search and Filter -->
        <v-row class="mb-4">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Search products"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedCategory"
              :items="categoryOptions"
              label="Category"
              prepend-inner-icon="mdi-tag"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-select>
          </v-col>
        </v-row>

        <!-- Products Grid -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey">mdi-package-variant</v-icon>
          <p class="text-grey mt-2">No products available</p>
        </div>

        <v-row v-else>
          <v-col
            v-for="product in filteredProducts"
            :key="product.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              :class="['product-card', { 'selected': isSelected(product.id) }]"
              @click="toggleProduct(product)"
              hover
            >
              <div class="product-image">
                <v-img
                  v-if="product.image"
                  :src="getProductImageUrl(product.image)"
                  height="150"
                  cover
                >
                  <template v-slot:error>
                    <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                      <v-icon size="48" color="grey">mdi-image-off</v-icon>
                    </div>
                  </template>
                </v-img>
                <div v-else class="d-flex align-center justify-center bg-grey-lighten-3" style="height: 150px;">
                  <v-icon size="48" color="grey">mdi-package-variant</v-icon>
                </div>

                <!-- Stock Badge -->
                <v-chip
                  v-if="product.track_inventory"
                  :color="product.stock_quantity > 0 ? 'success' : 'error'"
                  size="x-small"
                  class="stock-badge"
                >
                  {{ product.stock_quantity }} in stock
                </v-chip>

                <!-- Selected Badge -->
                <v-chip
                  v-if="isSelected(product.id)"
                  color="primary"
                  size="small"
                  class="selected-badge"
                >
                  <v-icon start size="small">mdi-check-circle</v-icon>
                  Selected
                </v-chip>
              </div>

              <v-card-text>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">{{ formatPrice(product.price) }}</div>
                <div v-if="product.description" class="product-description text-caption">
                  {{ product.description }}
                </div>

                <!-- Quantity Selector (shown only when selected) -->
                <div v-if="isSelected(product.id)" class="quantity-selector mt-3">
                  <v-btn
                    icon="mdi-minus"
                    size="small"
                    variant="outlined"
                    @click.stop="decreaseQuantity(product.id)"
                    :disabled="getQuantity(product.id) <= 1"
                  ></v-btn>
                  <v-text-field
                    :model-value="getQuantity(product.id)"
                    @update:model-value="updateQuantity(product.id, $event)"
                    type="number"
                    min="1"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="mx-2 quantity-input"
                    @click.stop
                  ></v-text-field>
                  <v-btn
                    icon="mdi-plus"
                    size="small"
                    variant="outlined"
                    @click.stop="increaseQuantity(product.id)"
                    :disabled="product.track_inventory && getQuantity(product.id) >= product.stock_quantity"
                  ></v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Selected Products Summary -->
        <div v-if="selectedProducts.length > 0" class="mt-6">
          <v-divider class="mb-4"></v-divider>
          <h4 class="mb-3">Selected Products</h4>
          <v-list>
            <v-list-item
              v-for="item in selectedProducts"
              :key="item.product.id"
              class="selected-item"
            >
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-3" rounded>
                  <v-img
                    v-if="item.product.image"
                    :src="getProductImageUrl(item.product.image)"
                  >
                    <template v-slot:error>
                      <v-icon>mdi-package-variant</v-icon>
                    </template>
                  </v-img>
                  <v-icon v-else>mdi-package-variant</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ item.product.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatPrice(item.product.price) }} × {{ item.quantity }} =
                {{ formatPrice(item.product.price * item.quantity) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  icon="mdi-close"
                  size="small"
                  variant="text"
                  @click="removeProduct(item.product.id)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>

          <div class="total-summary mt-4 pa-4 bg-grey-lighten-4 rounded">
            <div class="d-flex justify-space-between align-center">
              <span class="text-h6">Total Products:</span>
              <span class="text-h5 text-primary font-weight-bold">
                {{ formatPrice(totalAmount) }}
              </span>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { productService } from '../services/productService'
import { formatPrice } from '../utils/formatters'

export default {
  name: 'ProductSelector',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const products = ref([])
    const categories = ref([])
    const loading = ref(false)
    const search = ref('')
    const selectedCategory = ref(null)
    const selectedProducts = ref([])

    // Initialize from model value
    watch(() => props.modelValue, (newValue) => {
      if (newValue && newValue.length > 0) {
        selectedProducts.value = [...newValue]
      }
    }, { immediate: true })

    const categoryOptions = computed(() => {
      return ['All Categories', ...categories.value.map(c => c.name)]
    })

    const filteredProducts = computed(() => {
      let filtered = products.value

      // Filter by search
      if (search.value) {
        const searchLower = search.value.toLowerCase()
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
        )
      }

      // Filter by category
      if (selectedCategory.value && selectedCategory.value !== 'All Categories') {
        filtered = filtered.filter(p => p.category?.name === selectedCategory.value)
      }

      // Filter out inactive and out-of-stock products
      filtered = filtered.filter(p => {
        if (!p.is_active) return false
        if (p.track_inventory && p.stock_quantity <= 0) return false
        return true
      })

      return filtered
    })

    const totalAmount = computed(() => {
      return selectedProducts.value.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
      }, 0)
    })

    const loadProducts = async () => {
      try {
        loading.value = true
        products.value = await productService.getProducts({ active_only: true, in_stock_only: true })
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        loading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        categories.value = await productService.getCategories(true, false)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    const isSelected = (productId) => {
      return selectedProducts.value.some(item => item.product.id === productId)
    }

    const getQuantity = (productId) => {
      const item = selectedProducts.value.find(item => item.product.id === productId)
      return item ? item.quantity : 1
    }

    const toggleProduct = (product) => {
      const index = selectedProducts.value.findIndex(item => item.product.id === product.id)
      if (index > -1) {
        selectedProducts.value.splice(index, 1)
      } else {
        selectedProducts.value.push({
          product: product,
          quantity: 1,
          unit_price: product.price,
          discount: 0
        })
      }
      emit('update:modelValue', selectedProducts.value)
    }

    const removeProduct = (productId) => {
      const index = selectedProducts.value.findIndex(item => item.product.id === productId)
      if (index > -1) {
        selectedProducts.value.splice(index, 1)
        emit('update:modelValue', selectedProducts.value)
      }
    }

    const updateQuantity = (productId, quantity) => {
      const item = selectedProducts.value.find(item => item.product.id === productId)
      if (item) {
        const newQuantity = parseInt(quantity)
        if (newQuantity > 0) {
          item.quantity = newQuantity
          emit('update:modelValue', selectedProducts.value)
        }
      }
    }

    const increaseQuantity = (productId) => {
      const item = selectedProducts.value.find(item => item.product.id === productId)
      if (item) {
        item.quantity++
        emit('update:modelValue', selectedProducts.value)
      }
    }

    const decreaseQuantity = (productId) => {
      const item = selectedProducts.value.find(item => item.product.id === productId)
      if (item && item.quantity > 1) {
        item.quantity--
        emit('update:modelValue', selectedProducts.value)
      }
    }

    const getProductImageUrl = (imagePath) => {
      return productService.getProductImageUrl(imagePath)
    }

    onMounted(() => {
      loadProducts()
      loadCategories()
    })

    return {
      products,
      categories,
      loading,
      search,
      selectedCategory,
      selectedProducts,
      categoryOptions,
      filteredProducts,
      totalAmount,
      isSelected,
      getQuantity,
      toggleProduct,
      removeProduct,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      getProductImageUrl,
      formatPrice
    }
  }
}
</script>

<style scoped>
.product-selector {
  width: 100%;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.product-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.product-image {
  position: relative;
}

.stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.selected-badge {
  position: absolute;
  top: 8px;
  left: 8px;
}

.product-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.product-price {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.product-description {
  color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-input {
  max-width: 80px;
  text-align: center;
}

.quantity-input :deep(input) {
  text-align: center;
}

.selected-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
}

.total-summary {
  border: 2px solid rgb(var(--v-theme-primary));
}
</style>

