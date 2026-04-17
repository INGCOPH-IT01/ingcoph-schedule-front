<template>
  <v-card class="pos-cart">
    <v-card-title class="d-flex align-center justify-space-between bg-primary">
      <span class="text-white">
        <v-icon class="mr-2" color="white">mdi-cart</v-icon>
        Cart
      </span>
      <v-chip v-if="items.length > 0" color="white" size="small">
        {{ items.length }} item{{ items.length !== 1 ? 's' : '' }}
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Cart Items -->
    <v-card-text class="cart-items" style="max-height: 400px; overflow-y: auto;">
      <div v-if="items.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-cart-outline</v-icon>
        <p class="text-grey mt-2">Cart is empty</p>
      </div>

      <v-list v-else>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          class="cart-item"
          :class="{ 'cart-item--overridden': item.price_override != null }"
        >
          <template v-slot:prepend>
            <v-avatar color="grey-lighten-3" rounded>
              <v-img
                v-if="item.product.image_url || item.product.image"
                :src="item.product.image_url || getProductImageUrl(item.product.image)"
              >
                <template v-slot:error>
                  <v-icon>mdi-package-variant</v-icon>
                </template>
              </v-img>
              <v-icon v-else>mdi-package-variant</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="d-flex align-center">
            {{ item.product.name }}
            <v-chip
              v-if="item.price_override != null"
              color="orange-darken-1"
              size="x-small"
              variant="tonal"
              class="ml-2"
            >
              <v-icon size="x-small" start>mdi-tag-edit</v-icon>
              Override
            </v-chip>
          </v-list-item-title>
          <v-list-item-subtitle>
            <span
              v-if="item.price_override != null"
              class="text-decoration-line-through text-grey mr-1"
            >{{ formatPrice(item.product.price) }}</span>
            <span :class="item.price_override != null ? 'text-orange-darken-1 font-weight-medium' : ''">
              {{ formatPrice(item.price_override != null ? item.price_override : item.product.price) }}
            </span>
            × {{ item.quantity }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex flex-column align-end">
              <span class="font-weight-bold" :class="item.price_override != null ? 'text-orange-darken-1' : ''">
                {{ formatPrice(effectivePrice(item) * item.quantity) }}
              </span>
              <div class="d-flex align-center mt-1">
                <!-- Price Override Button -->
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      :icon="item.price_override != null ? 'mdi-tag-edit' : 'mdi-tag-plus-outline'"
                      size="x-small"
                      :color="item.price_override != null ? 'orange-darken-1' : 'grey'"
                      variant="text"
                      @click.stop="$emit('price-override', index)"
                    ></v-btn>
                  </template>
                  {{ item.price_override != null ? 'Change overridden price' : 'Override price (admin required)' }}
                </v-tooltip>

                <!-- Clear Override -->
                <v-tooltip v-if="item.price_override != null" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-tag-remove-outline"
                      size="x-small"
                      color="grey"
                      variant="text"
                      @click.stop="$emit('clear-override', index)"
                    ></v-btn>
                  </template>
                  Remove override
                </v-tooltip>

                <v-btn
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  @click="removeItem(index)"
                ></v-btn>
              </div>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>

    <!-- Totals -->
    <v-divider></v-divider>
    <v-card-text>
      <div class="totals">
        <div class="d-flex justify-space-between mb-2">
          <span>Subtotal:</span>
          <span class="font-weight-bold">{{ formatPrice(subtotal) }}</span>
        </div>

        <!-- Optional Discount -->
        <div v-if="showDiscountTax" class="d-flex justify-space-between mb-2">
          <v-text-field
            :model-value="discount"
            @update:model-value="$emit('update:discount', parseFloat($event) || 0)"
            label="Discount"
            type="number"
            min="0"
            prefix="₱"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </div>

        <!-- Optional Tax -->
        <div v-if="showDiscountTax" class="d-flex justify-space-between mb-2">
          <v-text-field
            :model-value="tax"
            @update:model-value="$emit('update:tax', parseFloat($event) || 0)"
            label="Tax"
            type="number"
            min="0"
            prefix="₱"
            variant="outlined"
            density="compact"
            hide-details
          ></v-text-field>
        </div>

        <v-divider class="my-3"></v-divider>

        <div class="d-flex justify-space-between align-center">
          <span class="text-h6">Total:</span>
          <span class="text-h5 text-primary font-weight-bold">
            {{ formatPrice(total) }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4">
        <v-btn
          v-if="items.length > 0"
          color="error"
          variant="outlined"
          block
          class="mb-2"
          @click="$emit('clear')"
        >
          <v-icon start>mdi-delete</v-icon>
          Clear Cart
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { computed } from 'vue'
import { productService } from '../services/productService'
import { formatPrice } from '../utils/formatters'

export default {
  name: 'PosCart',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    showDiscountTax: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:items', 'update:discount', 'update:tax', 'clear', 'price-override', 'clear-override'],
  setup(props, { emit }) {
    const effectivePrice = (item) => {
      return item.price_override != null ? item.price_override : item.product.price
    }

    const subtotal = computed(() => {
      return props.items.reduce((sum, item) => {
        return sum + (effectivePrice(item) * item.quantity)
      }, 0)
    })

    const total = computed(() => {
      return subtotal.value - props.discount + props.tax
    })

    const removeItem = (index) => {
      const newItems = [...props.items]
      newItems.splice(index, 1)
      emit('update:items', newItems)
    }

    const getProductImageUrl = (imagePath) => {
      return productService.getProductImageUrl(imagePath)
    }

    return {
      subtotal,
      total,
      effectivePrice,
      removeItem,
      getProductImageUrl,
      formatPrice
    }
  }
}
</script>

<style scoped>
.pos-cart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cart-items {
  flex: 1;
}

.cart-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
}

.cart-item--overridden {
  border-color: rgba(230, 81, 0, 0.35);
  background-color: rgba(255, 152, 0, 0.04);
}

.totals {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 16px;
  border-radius: 8px;
}
</style>
