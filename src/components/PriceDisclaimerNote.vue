<template>
  <p :class="['pricing-disclaimer', themeClass]">
    <v-icon :size="iconSize" :color="iconColor" class="mr-1">mdi-information-outline</v-icon>
    {{ message }}
  </p>
</template>

<script>
export default {
  name: 'PriceDisclaimerNote',
  props: {
    message: {
      type: String,
      default: 'Prices are subject to change without prior notice.'
    },
    theme: {
      type: String,
      default: 'light', // 'light' or 'dark'
      validator: (value) => ['light', 'dark'].includes(value)
    },
    iconSize: {
      type: [String, Number],
      default: 18
    }
  },
  computed: {
    themeClass() {
      return this.theme === 'dark' ? 'pricing-disclaimer-dark' : 'pricing-disclaimer-light'
    },
    iconColor() {
      return this.theme === 'dark' ? 'white' : '#64748b'
    }
  }
}
</script>

<style scoped>
.pricing-disclaimer {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
}

.pricing-disclaimer-light {
  color: #64748b;
}

.pricing-disclaimer-dark {
  color: rgba(255, 255, 255, 0.9);
}
</style>

