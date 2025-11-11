<template>
  <div class="product-management">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-badge">
          <v-icon color="#1e293b" size="20" class="mr-2">mdi-package-variant</v-icon>
          Inventory Management
        </div>
        <h1 class="header-title">
          <span class="title-gradient">Product</span> Management
        </h1>
        <p class="header-subtitle">
          Manage products, categories, and inventory levels
        </p>
      </div>
    </div>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">Total Products</div>
            <div class="text-h4 text-primary">{{ products.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">Low Stock Items</div>
            <div class="text-h4 text-warning">{{ lowStockCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">Out of Stock</div>
            <div class="text-h4 text-error">{{ outOfStockCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">Categories</div>
            <div class="text-h4 text-success">{{ categories.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Actions and Filters -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
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
          <v-col cols="12" md="3">
            <v-select
              v-model="filterCategory"
              :items="categoryFilterOptions"
              label="Filter by Category"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterStock"
              :items="stockFilterOptions"
              label="Filter by Stock"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-select>
          </v-col>
        </v-row>
        <v-row class="mt-3">
          <v-col>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openProductDialog()">
              Add Product
            </v-btn>
            <v-btn color="success" variant="outlined" prepend-icon="mdi-tag" class="ml-2" @click="openCategoryDialog()">
              Manage Categories
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Products Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :loading="loading"
        class="elevation-0"
      >
        <template v-slot:[`item.image`]="{ item }">
          <v-avatar
            size="48"
            rounded
            class="my-2 cursor-pointer"
            @click="openImageViewer(item)"
            :style="(item.image_url || item.image) ? 'cursor: pointer;' : ''"
          >
            <v-img v-if="item.image_url || item.image" :src="item.image_url || getProductImageUrl(item.image)">
              <template v-slot:error>
                <v-icon>mdi-package-variant</v-icon>
              </template>
            </v-img>
            <v-icon v-else>mdi-package-variant</v-icon>
          </v-avatar>
        </template>

        <template v-slot:[`item.category`]="{ item }">
          <v-chip v-if="item.category" size="small" variant="tonal">
            {{ item.category.name }}
          </v-chip>
          <span v-else class="text-grey">N/A</span>
        </template>

        <template v-slot:[`item.price`]="{ item }">
          <span class="font-weight-bold">{{ formatPrice(item.price) }}</span>
        </template>

        <template v-slot:[`item.stock_quantity`]="{ item }">
          <v-chip
            v-if="item.track_inventory"
            :color="getStockColor(item)"
            size="small"
            variant="tonal"
          >
            {{ item.stock_quantity }} {{ item.unit }}
          </v-chip>
          <span v-else class="text-grey">Not tracked</span>
        </template>

        <template v-slot:[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text" @click="openProductDialog(item)"></v-btn>
          <v-btn icon="mdi-package-up" size="small" variant="text" @click="openStockDialog(item)"></v-btn>
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteProduct(item)"></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Product Dialog -->
    <v-dialog v-model="productDialog" max-width="800" persistent>
      <v-card>
        <v-card-title>
          {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="productFormRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productForm.name"
                  label="Product Name *"
                  variant="outlined"
                  :rules="[v => !!v || 'Name is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productForm.sku"
                  label="SKU *"
                  variant="outlined"
                  :rules="[v => !!v || 'SKU is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="productForm.category_id"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Category"
                  variant="outlined"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productForm.barcode"
                  label="Barcode"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="productForm.price"
                  label="Price *"
                  type="number"
                  prefix="₱"
                  variant="outlined"
                  :rules="[v => v >= 0 || 'Price must be positive']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="productForm.cost"
                  label="Cost"
                  type="number"
                  prefix="₱"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="productForm.unit"
                  label="Unit"
                  variant="outlined"
                  placeholder="pcs, box, bottle"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="productForm.description"
                  label="Description"
                  variant="outlined"
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productForm.stock_quantity"
                  label="Stock Quantity"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="productForm.low_stock_threshold"
                  label="Low Stock Alert"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="productImage"
                  label="Product Image"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  variant="outlined"
                  prepend-icon=""
                  prepend-inner-icon="mdi-camera"
                  :rules="imageRules"
                  show-size
                  hint="Max 2MB. Supported: JPEG, PNG, GIF, WebP"
                  persistent-hint
                ></v-file-input>
              </v-col>
              <v-col cols="12" md="3">
                <v-switch
                  v-model="productForm.track_inventory"
                  label="Track Inventory"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="3">
                <v-switch
                  v-model="productForm.is_active"
                  label="Active"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="productDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveProduct" :loading="saving">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Stock Adjustment Dialog -->
    <v-dialog v-model="stockDialog" max-width="500">
      <v-card v-if="editingProduct">
        <v-card-title>Adjust Stock - {{ editingProduct.name }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div class="mb-4">
            <div class="text-caption text-grey">Current Stock</div>
            <div class="text-h4">{{ editingProduct.stock_quantity }} {{ editingProduct.unit }}</div>
          </div>
          <v-text-field
            v-model="stockForm.quantity"
            label="New Stock Quantity"
            type="number"
            variant="outlined"
          ></v-text-field>
          <v-textarea
            v-model="stockForm.notes"
            label="Notes"
            variant="outlined"
            rows="3"
          ></v-textarea>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="stockDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="adjustStock" :loading="saving">Adjust</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Category Management Dialog -->
    <v-dialog v-model="categoryDialog" max-width="600">
      <v-card>
        <v-card-title>Manage Categories</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field
            v-model="newCategory.name"
            label="Category Name"
            variant="outlined"
            class="mb-4"
            @keyup.enter="addCategory"
          >
            <template v-slot:append>
              <v-btn color="primary" @click="addCategory" :loading="saving">Add</v-btn>
            </template>
          </v-text-field>
          <v-list>
            <v-list-item v-for="category in categories" :key="category.id">
              <v-list-item-title>{{ category.name }}</v-list-item-title>
              <template v-slot:append>
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteCategory(category)"></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="categoryDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Image Viewer Dialog -->
    <v-dialog v-model="imageViewerDialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ imageViewerProduct?.name }}</span>
          <v-btn icon="mdi-close" variant="text" @click="imageViewerDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <v-img
            v-if="imageViewerUrl"
            :src="imageViewerUrl"
            max-height="600"
            contain
          >
            <template v-slot:error>
              <div class="d-flex align-center justify-center" style="height: 300px;">
                <div class="text-center">
                  <v-icon size="64" color="grey">mdi-image-broken</v-icon>
                  <div class="text-grey mt-2">Failed to load image</div>
                </div>
              </div>
            </template>
          </v-img>
          <div v-else class="d-flex align-center justify-center" style="height: 300px;">
            <div class="text-center">
              <v-icon size="64" color="grey">mdi-package-variant</v-icon>
              <div class="text-grey mt-2">No image available</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { productService } from '../services/productService'
import { formatPrice } from '../utils/formatters'

export default {
  name: 'ProductManagement',
  setup() {
    const products = ref([])
    const categories = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const search = ref('')
    const filterCategory = ref(null)
    const filterStock = ref(null)
    const productDialog = ref(false)
    const stockDialog = ref(false)
    const categoryDialog = ref(false)
    const imageViewerDialog = ref(false)
    const imageViewerProduct = ref(null)
    const imageViewerUrl = ref('')
    const editingProduct = ref(null)
    const productFormRef = ref(null)  // Form component ref
    const productForm = ref({  // Form data
      name: '',
      sku: '',
      category_id: null,
      barcode: '',
      price: 0,
      cost: 0,
      unit: 'pcs',
      description: '',
      stock_quantity: 0,
      low_stock_threshold: 10,
      track_inventory: true,
      is_active: true
    })
    const productImage = ref(null)
    const stockForm = ref({ quantity: 0, notes: '' })
    const newCategory = ref({ name: '' })

    const snackbar = ref({ show: false, message: '', color: 'success' })

    // Image validation rules
    const imageRules = [
      (value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return true // Image is optional
        }

        const file = Array.isArray(value) ? value[0] : value

        if (!(file instanceof File)) {
          return true // Not a file, skip validation
        }

        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
          return `Image size must be less than 2MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          return `Invalid file type. Allowed types: JPEG, PNG, GIF, WebP. Got: ${file.type}`
        }

        return true
      }
    ]

    const headers = [
      { title: 'Image', key: 'image', sortable: false },
      { title: 'Name', key: 'name' },
      { title: 'SKU', key: 'sku' },
      { title: 'Category', key: 'category' },
      { title: 'Price', key: 'price' },
      { title: 'Stock', key: 'stock_quantity' },
      { title: 'Status', key: 'is_active' },
      { title: 'Actions', key: 'actions', sortable: false }
    ]

    const stockFilterOptions = [
      { title: 'All', value: null },
      { title: 'In Stock', value: 'in_stock' },
      { title: 'Low Stock', value: 'low_stock' },
      { title: 'Out of Stock', value: 'out_of_stock' }
    ]

    const categoryFilterOptions = computed(() => {
      return [{ title: 'All Categories', value: null }, ...categories.value.map(c => ({ title: c.name, value: c.id }))]
    })

    const filteredProducts = computed(() => {
      let filtered = products.value

      if (search.value) {
        const s = search.value.toLowerCase()
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(s) ||
          (p.sku && p.sku.toLowerCase().includes(s)) ||
          (p.barcode && p.barcode.toLowerCase().includes(s))
        )
      }

      if (filterCategory.value) {
        filtered = filtered.filter(p => p.category_id === filterCategory.value)
      }

      if (filterStock.value) {
        if (filterStock.value === 'in_stock') {
          filtered = filtered.filter(p => !p.track_inventory || p.stock_quantity > p.low_stock_threshold)
        } else if (filterStock.value === 'low_stock') {
          filtered = filtered.filter(p => p.track_inventory && p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold)
        } else if (filterStock.value === 'out_of_stock') {
          filtered = filtered.filter(p => p.track_inventory && p.stock_quantity <= 0)
        }
      }

      return filtered
    })

    const lowStockCount = computed(() => {
      return products.value.filter(p => p.track_inventory && p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length
    })

    const outOfStockCount = computed(() => {
      return products.value.filter(p => p.track_inventory && p.stock_quantity <= 0).length
    })

    const loadProducts = async () => {
      try {
        loading.value = true
        products.value = await productService.getProducts()
      } catch (error) {
        showSnackbar('Failed to load products', 'error')
      } finally {
        loading.value = false
      }
    }

    const loadCategories = async () => {
      try {
        categories.value = await productService.getCategories(false, false)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    const getStockColor = (product) => {
      if (!product.track_inventory) return 'grey'
      if (product.stock_quantity <= 0) return 'error'
      if (product.stock_quantity <= product.low_stock_threshold) return 'warning'
      return 'success'
    }

    const openProductDialog = (product = null) => {
      editingProduct.value = product
      if (product) {
        // Update properties individually to maintain reactivity
        productForm.value.name = product.name || ''
        productForm.value.sku = product.sku || ''
        productForm.value.category_id = product.category_id || null
        productForm.value.barcode = product.barcode || ''
        productForm.value.price = product.price || 0
        productForm.value.cost = product.cost || 0
        productForm.value.unit = product.unit || 'pcs'
        productForm.value.description = product.description || ''
        productForm.value.stock_quantity = product.stock_quantity || 0
        productForm.value.low_stock_threshold = product.low_stock_threshold || 10
        productForm.value.track_inventory = product.track_inventory !== undefined ? product.track_inventory : true
        productForm.value.is_active = product.is_active !== undefined ? product.is_active : true
      } else {
        // Reset properties individually to maintain reactivity
        productForm.value.name = ''
        productForm.value.sku = ''
        productForm.value.category_id = null
        productForm.value.barcode = ''
        productForm.value.price = 0
        productForm.value.cost = 0
        productForm.value.unit = 'pcs'
        productForm.value.description = ''
        productForm.value.stock_quantity = 0
        productForm.value.low_stock_threshold = 10
        productForm.value.track_inventory = true
        productForm.value.is_active = true
      }
      productImage.value = null
      productDialog.value = true
    }

    const saveProduct = async () => {
      // Validate form
      const { valid } = await productFormRef.value.validate()
      if (!valid) {
        showSnackbar('Please fix validation errors', 'error')
        return
      }

      try {
        saving.value = true
        const data = { ...productForm.value }

        // Convert string values to numbers
        if (data.price !== null && data.price !== undefined && data.price !== '') {
          data.price = parseFloat(data.price) || 0
        }
        if (data.cost !== null && data.cost !== undefined && data.cost !== '') {
          data.cost = parseFloat(data.cost) || 0
        }
        if (data.stock_quantity !== null && data.stock_quantity !== undefined && data.stock_quantity !== '') {
          data.stock_quantity = parseInt(data.stock_quantity) || 0
        }
        if (data.low_stock_threshold !== null && data.low_stock_threshold !== undefined && data.low_stock_threshold !== '') {
          data.low_stock_threshold = parseInt(data.low_stock_threshold) || 0
        }

        // Convert boolean values explicitly
        data.track_inventory = Boolean(data.track_inventory)
        data.is_active = Boolean(data.is_active)

        // Handle image file
        if (productImage.value) {
          // v-file-input can return either a File object or an array depending on multiple prop
          if (Array.isArray(productImage.value) && productImage.value.length > 0) {
            data.image = productImage.value[0]
          } else if (productImage.value instanceof File) {
            data.image = productImage.value
          }

          if (data.image) {
            // Additional validation before upload
            const maxSize = 2 * 1024 * 1024 // 2MB
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

            if (data.image.size > maxSize) {
              showSnackbar(`Image size must be less than 2MB. Current: ${(data.image.size / 1024 / 1024).toFixed(2)}MB`, 'error')
              saving.value = false
              return
            }

            if (!allowedTypes.includes(data.image.type)) {
              showSnackbar(`Invalid file type: ${data.image.type}. Allowed: JPEG, PNG, GIF, WebP`, 'error')
              saving.value = false
              return
            }
          }
        }

        if (editingProduct.value) {
          await productService.updateProduct(editingProduct.value.id, data)
          showSnackbar('Product updated successfully', 'success')
        } else {
          await productService.createProduct(data)
          showSnackbar('Product created successfully', 'success')
        }

        productDialog.value = false
        await loadProducts()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to save product', 'error')
      } finally {
        saving.value = false
      }
    }

    const deleteProduct = async (product) => {
      if (!confirm(`Delete product "${product.name}"?`)) return

      try {
        await productService.deleteProduct(product.id)
        showSnackbar('Product deleted successfully', 'success')
        await loadProducts()
      } catch (error) {
        showSnackbar('Failed to delete product', 'error')
      }
    }

    const openStockDialog = (product) => {
      editingProduct.value = product
      stockForm.value = {
        quantity: product.stock_quantity,
        notes: ''
      }
      stockDialog.value = true
    }

    const adjustStock = async () => {
      try {
        saving.value = true
        // Convert quantity to number
        const quantity = parseInt(stockForm.value.quantity) || 0
        await productService.adjustStock(editingProduct.value.id, quantity, stockForm.value.notes)
        showSnackbar('Stock adjusted successfully', 'success')
        stockDialog.value = false
        await loadProducts()
      } catch (error) {
        showSnackbar('Failed to adjust stock', 'error')
      } finally {
        saving.value = false
      }
    }

    const openCategoryDialog = () => {
      categoryDialog.value = true
    }

    const addCategory = async () => {
      if (!newCategory.value.name) return

      try {
        saving.value = true
        await productService.createCategory(newCategory.value)
        showSnackbar('Category added successfully', 'success')
        newCategory.value.name = ''
        await loadCategories()
      } catch (error) {
        showSnackbar('Failed to add category', 'error')
      } finally {
        saving.value = false
      }
    }

    const deleteCategory = async (category) => {
      if (!confirm(`Delete category "${category.name}"?`)) return

      try {
        await productService.deleteCategory(category.id)
        showSnackbar('Category deleted successfully', 'success')
        await loadCategories()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to delete category', 'error')
      }
    }

    const showSnackbar = (message, color = 'success') => {
      snackbar.value = { show: true, message, color }
    }

    const getProductImageUrl = (imagePath) => {
      return productService.getProductImageUrl(imagePath)
    }

    const openImageViewer = (product) => {
      if (!product.image_url && !product.image) return

      imageViewerProduct.value = product
      imageViewerUrl.value = product.image_url || getProductImageUrl(product.image)
      imageViewerDialog.value = true
    }

    onMounted(() => {
      loadProducts()
      loadCategories()
    })

    return {
      products,
      categories,
      loading,
      saving,
      search,
      filterCategory,
      filterStock,
      productDialog,
      stockDialog,
      categoryDialog,
      imageViewerDialog,
      imageViewerProduct,
      imageViewerUrl,
      editingProduct,
      productFormRef,
      productForm,
      productImage,
      stockForm,
      newCategory,
      snackbar,
      headers,
      stockFilterOptions,
      categoryFilterOptions,
      filteredProducts,
      lowStockCount,
      outOfStockCount,
      imageRules,
      getStockColor,
      openProductDialog,
      saveProduct,
      deleteProduct,
      openStockDialog,
      adjustStock,
      openCategoryDialog,
      addCategory,
      deleteCategory,
      getProductImageUrl,
      openImageViewer,
      formatPrice
    }
  }
}
</script>

<style scoped>
.product-management {
  padding: 32px;
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 48px;
  padding: 48px 0;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 50px;
  padding: 8px 20px;
  margin-bottom: 24px;
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.header-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #1e293b;
}

.title-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: #475569;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}
</style>
