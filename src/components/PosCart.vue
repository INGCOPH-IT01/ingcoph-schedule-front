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

          <v-list-item-title>{{ item.product.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ formatPrice(item.product.price) }} × {{ item.quantity }}
          </v-list-item-subtitle>

          <template v-slot:append>
            <div class="d-flex flex-column align-end">
              <span class="font-weight-bold">
                {{ formatPrice(item.product.price * item.quantity) }}
              </span>
              <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                @click="removeItem(index)"
              ></v-btn>
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
  emits: ['update:items', 'update:discount', 'update:tax', 'clear'],
  setup(props, { emit }) {
    const subtotal = computed(() => {
      return props.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity)
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

.totals {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 16px;
  border-radius: 8px;
}
</style>

