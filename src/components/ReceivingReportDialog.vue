<template>
  <v-dialog v-model="show" max-width="1200px" persistent scrollable>
    <v-card>
      <v-card-title class="text-h5">
        {{ mode === 'create' ? 'New Receiving Report' : 'Edit Receiving Report' }}
        <v-spacer></v-spacer>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Report Details -->
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="formData.notes"
                label="Notes"
                rows="2"
                variant="outlined"
                density="compact"
              ></v-textarea>
            </v-col>
          </v-row>

          <!-- Items Section -->
          <v-row>
            <v-col cols="12">
              <v-card outlined>
                <v-card-title class="subtitle-1">
                  Items
                  <v-spacer></v-spacer>
                  <v-btn color="primary" size="small" @click="addItem">
                    <v-icon start size="small">mdi-plus</v-icon>
                    Add Item
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <!-- Barcode Scanner -->
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        ref="barcodeInput"
                        v-model="barcodeInput"
                        label="Scan or Enter Barcode"
                        placeholder="Scan barcode or type SKU and press Enter"
                        prepend-inner-icon="mdi-barcode-scan"
                        variant="outlined"
                        density="compact"
                        clearable
                        :loading="scanningBarcode"
                        @keyup.enter="handleBarcodeScanned"
                        hint="Scan product barcode to quickly add items"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-text>
                  <v-table v-if="formData.items.length > 0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Notes</th>
                        <th width="80">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in formData.items" :key="index">
                          <td style="min-width: 250px">
                            <v-autocomplete
                              v-model="item.product_id"
                              :items="products"
                              item-title="name"
                              item-value="id"
                              label="Select Product"
                              :rules="[v => !!v || 'Product is required']"
                              density="compact"
                              variant="outlined"
                              hide-details
                              :loading="loadingProducts"
                            >
                              <template v-slot:selection="{ item: product }">
                                <div>
                                  <div class="text-body-2">{{ product.raw.name }}</div>
                                  <div class="text-caption text-grey">{{ product.raw.sku }}</div>
                                </div>
                              </template>
                              <template v-slot:item="{ props, item }">
                                <v-list-item v-bind="props">
                                  <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                                  <v-list-item-subtitle>
                                    SKU: {{ item.raw.sku }} | Current Stock: {{ item.raw.stock_quantity }}
                                  </v-list-item-subtitle>
                                </v-list-item>
                              </template>
                            </v-autocomplete>
                          </td>
                          <td style="min-width: 120px">
                            <v-text-field
                              v-model.number="item.quantity"
                              type="number"
                              min="1"
                              label="Quantity"
                              :rules="[v => v > 0 || 'Quantity must be greater than 0']"
                              density="compact"
                              variant="outlined"
                              hide-details
                            ></v-text-field>
                          </td>
                          <td style="min-width: 200px">
                            <v-text-field
                              v-model="item.notes"
                              label="Notes"
                              density="compact"
                              variant="outlined"
                              hide-details
                            ></v-text-field>
                          </td>
                          <td>
                            <v-btn icon="mdi-delete" color="error" size="small" @click="removeItem(index)"></v-btn>
                          </td>
                        </tr>
                      </tbody>
                  </v-table>
                  <v-alert v-else type="info" text>
                    No items added yet. Click "Add Item" to start.
                  </v-alert>

                  <!-- Summary -->
                  <v-row v-if="formData.items.length > 0" class="mt-4">
                    <v-col cols="12" class="text-right">
                      <v-divider></v-divider>
                      <div class="mt-2">
                        <strong>Total Items:</strong> {{ totalItems }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="close">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="save"
          :loading="saving"
          :disabled="!valid || formData.items.length === 0"
        >
          {{ mode === 'create' ? 'Create' : 'Update' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Snackbar for barcode scan feedback -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="2000"
      location="top"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-dialog>
</template>

<script>
import inventoryService from '@/services/inventoryService';
import { productService } from '@/services/productService';

export default {
  name: 'ReceivingReportDialog',
  props: {
    modelValue: Boolean,
    report: Object,
    mode: {
      type: String,
      default: 'create', // 'create' or 'edit'
    },
  },
  data() {
    return {
      valid: false,
      saving: false,
      loadingProducts: false,
      scanningBarcode: false,
      barcodeInput: '',
      products: [],
      formData: {
        notes: '',
        items: [],
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    totalItems() {
      return this.formData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.initialize();
      }
    },
  },
  methods: {
    async initialize() {
      await this.loadProducts();

      if (this.mode === 'edit' && this.report) {
        await this.loadReportDetails();
      } else {
        this.resetForm();
      }

      // Focus on barcode input for immediate scanning
      this.$nextTick(() => {
        if (this.$refs.barcodeInput) {
          this.$refs.barcodeInput.focus();
        }
      });
    },

    async loadProducts() {
      this.loadingProducts = true;
      try {
        const response = await productService.getProducts();
        // productService already returns response.data, so response is the actual data
        this.products = Array.isArray(response) ? response : (response.data || response);
        console.log('Loaded products:', this.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        this.loadingProducts = false;
      }
    },

    async loadReportDetails() {
      try {
        const response = await inventoryService.getReceivingReport(this.report.id);
        const report = response.data;
        this.formData = {
          notes: report.notes || '',
          items: report.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            notes: item.notes || '',
          })),
        };
      } catch (error) {
        console.error('Error loading report details:', error);
      }
    },

    resetForm() {
      this.formData = {
        notes: '',
        items: [],
      };
      this.barcodeInput = '';
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    addItem() {
      this.formData.items.push({
        product_id: null,
        quantity: 1,
        notes: '',
      });
    },

    removeItem(index) {
      this.formData.items.splice(index, 1);
    },

    async handleBarcodeScanned() {
      if (!this.barcodeInput || !this.barcodeInput.trim()) {
        return;
      }

      this.scanningBarcode = true;
      try {
        const barcode = this.barcodeInput.trim();

        // Search for product by SKU (barcode)
        const product = this.products.find(p =>
          p.sku && p.sku.toLowerCase() === barcode.toLowerCase()
        );

        if (product) {
          // Check if product already exists in items
          const existingItemIndex = this.formData.items.findIndex(
            item => item.product_id === product.id
          );

          if (existingItemIndex !== -1) {
            // Product already exists, increment quantity
            this.formData.items[existingItemIndex].quantity++;
            this.showSnackbar(`Updated ${product.name} - Qty: ${this.formData.items[existingItemIndex].quantity}`, 'success');
          } else {
            // Add new item
            this.formData.items.push({
              product_id: product.id,
              quantity: 1,
              notes: '',
            });
            this.showSnackbar(`Added ${product.name}`, 'success');
          }

          // Clear barcode input
          this.barcodeInput = '';
        } else {
          // Product not found
          this.showSnackbar(`Product with barcode "${barcode}" not found`, 'error');
          this.barcodeInput = '';
        }
      } catch (error) {
        console.error('Error scanning barcode:', error);
        this.showSnackbar('Error scanning barcode', 'error');
      } finally {
        this.scanningBarcode = false;
        // Keep focus on barcode input for continuous scanning
        this.$nextTick(() => {
          if (this.$refs.barcodeInput) {
            this.$refs.barcodeInput.focus();
          }
        });
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async save() {
      if (!this.$refs.form.validate()) {
        return;
      }

      if (this.formData.items.length === 0) {
        return;
      }

      this.saving = true;
      try {
        if (this.mode === 'create') {
          await inventoryService.createReceivingReport(this.formData);
        } else {
          await inventoryService.updateReceivingReport(this.report.id, this.formData);
        }
        this.$emit('saved');
        this.close();
      } catch (error) {
        console.error('Error saving receiving report:', error);
        // Show error message
        alert(error.response?.data?.message || 'An error occurred while saving the report');
      } finally {
        this.saving = false;
      }
    },

    close() {
      this.show = false;
      this.$emit('closed');
      setTimeout(() => {
        this.resetForm();
      }, 300);
    },
  },
};
</script>

<style scoped>
.v-table {
  overflow-x: auto;
}
</style>
