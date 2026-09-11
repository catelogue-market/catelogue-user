<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    interface ProductImage {
        id: number
        product_id: number
        s3_key: string
        url: string
        sort_order: number
    }

    interface Product {
        id: number
        name: string | null
        category_1_id: number | null
        category_2_id: number | null
        brand: string | null
        description: string | null
        spec_1: string | null
        spec_2: string | null
        spec_3: string | null
        spec_4: string | null
        spec_5: string | null
        stock: number | null
        status: number
        images: ProductImage[]
        created_at: string
        updated_at: string
    }

    const route = useRoute()
    const router = useRouter()

    const product = ref<Product | null>(null)
    const loading = ref(true)
    const error = ref('')
    const selectedImageIndex = ref(0)

    const API_BASE_URL = 'http://43.216.228.124:8080'

    const fetchProduct = async () => {
        loading.value = true
        error.value = ''

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/products/${route.params.id}`
            )

            if (!response.ok) {
                throw new Error('Failed to load product')
            }

            product.value = await response.json()
            selectedImageIndex.value = 0
        } catch (err) {
            error.value = err instanceof Error
                ? err.message
                : 'Failed to load product'
        } finally {
            loading.value = false
        }
    }

    const selectImage = (index: number) => {
        selectedImageIndex.value = index
    }

    const currentImage = computed(() => {
        if (!product.value || product.value.images.length === 0) {
            return ''
        }

        return product.value.images[selectedImageIndex.value]?.url || ''
    })

    const productSpecs = computed(() => {
        if (!product.value) {
            return []
        }

        return [
            {
                label: 'Spec 1',
                value: product.value.spec_1,
            },
            {
                label: 'Spec 2',
                value: product.value.spec_2,
            },
            {
                label: 'Spec 3',
                value: product.value.spec_3,
            },
            {
                label: 'Spec 4',
                value: product.value.spec_4,
            },
            {
                label: 'Spec 5',
                value: product.value.spec_5,
            },
        ].filter(
            (spec): spec is { label: string; value: string } =>
                typeof spec.value === 'string' &&
                spec.value.trim() !== ''
        )
    })

    const getProductName = () => {
        return product.value?.name?.trim() || 'Unnamed Product'
    }

    onMounted(fetchProduct)
</script>

<template>
  <div class="speedkex-app">
    <header class="site-header">
      <div class="container">
        <nav class="navbar">
          <RouterLink
            to="/products"
            class="logo"
          >
            Catelogue<span>.</span>
          </RouterLink>

          <div class="nav-links">
            <a href="/products#categories">
              Categories
            </a>

            <a href="/products#products">
              Products
            </a>

            <a href="/products#about">
              About
            </a>
          </div>

          <a
            href="/products#products"
            class="nav-button"
          >
            Shop Products
          </a>

          <button
            type="button"
            class="mobile-menu-btn"
            aria-label="Back to products"
            @click="router.push('/products')"
          >
            ←
          </button>
        </nav>
      </div>
    </header>

    <main class="product-detail-page">
      <div class="container">
        <button
          type="button"
          class="product-detail-back"
          @click="router.back()"
        >
          <span>←</span>
          <span>Back to Products</span>
        </button>

        <div
          v-if="loading"
          class="product-detail-loading"
        >
          <div class="product-detail-loading-image"></div>

          <div class="product-detail-loading-content">
            <div class="skeleton-line skeleton-brand"></div>
            <div class="skeleton-line skeleton-name"></div>
            <div class="skeleton-line skeleton-description"></div>
            <div class="skeleton-line skeleton-description short"></div>
          </div>
        </div>

        <div
          v-else-if="error"
          class="catalogue-state"
        >
          <div class="catalogue-state-icon">
            !
          </div>

          <h3>
            Unable to load product
          </h3>

          <p>
            {{ error }}
          </p>

          <button
            type="button"
            class="catalogue-state-button"
            @click="fetchProduct"
          >
            Try again
          </button>
        </div>

        <section
          v-else-if="product"
          class="product-detail"
        >
          <div class="product-detail-images">
            <div class="product-detail-main-image-wrapper">
              <img
                v-if="currentImage"
                :src="currentImage"
                :alt="getProductName()"
                class="product-detail-main-image"
              />

              <div
                v-else
                class="product-detail-no-image"
              >
                <span>
                  No Image
                </span>
              </div>

              <div
                v-if="product.images.length > 1"
                class="product-detail-image-count"
              >
                {{ selectedImageIndex + 1 }}
                /
                {{ product.images.length }}
              </div>
            </div>

            <div
              v-if="product.images.length > 1"
              class="product-detail-thumbnails"
            >
              <button
                v-for="(image, index) in product.images"
                :key="image.id"
                type="button"
                class="product-detail-thumbnail"
                :class="{
                  active: selectedImageIndex === index
                }"
                @click="selectImage(index)"
              >
                <img
                  :src="image.url"
                  :alt="`${getProductName()} image ${index + 1}`"
                />
              </button>
            </div>
          </div>

          <div class="product-detail-info">
            <span class="section-label">
              CATELOGUE PRODUCT
            </span>

            <p class="product-detail-brand">
              {{ product.brand?.trim() || '\u00A0' }}
            </p>

            <h1 class="product-detail-name">
              {{ getProductName() }}
            </h1>

            <p
              v-if="product.description?.trim()"
              class="product-detail-description"
            >
              {{ product.description }}
            </p>

            <div
              v-if="productSpecs.length > 0"
              class="product-detail-specs"
            >
              <div class="product-detail-section-title">
                Specifications
              </div>

              <div
                v-for="spec in productSpecs"
                :key="spec.label"
                class="product-detail-spec-row"
              >
                <strong>
                  {{ spec.label }}
                </strong>

                <span>
                  {{ spec.value }}
                </span>
              </div>
            </div>

            <div
              v-if="product.stock !== null"
              class="product-detail-stock"
            >
              <span>
                Stock
              </span>

              <strong>
                {{ product.stock }}
              </strong>
            </div>

            <div class="product-detail-actions">
              <RouterLink
                to="/products"
                class="button button-secondary"
              >
                ← Continue Browsing
              </RouterLink>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-content">
        <div>
          © 2026 Catelogue
        </div>

        <div>
          Products · Quality · Style
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.product-detail-page {
  min-height: calc(100vh - 78px);
  padding: 40px 0 100px;
}

.product-detail-back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
}

.product-detail-back:hover {
  color: #fff;
}

.product-detail-back span:first-child {
  color: var(--orange);
  font-size: 18px;
}

.product-detail {
  display: grid;
  grid-template-columns:
    minmax(0, 1.05fr)
    minmax(0, 0.95fr);
  gap: 70px;
  align-items: start;
}

.product-detail-images {
  min-width: 0;
}

.product-detail-main-image-wrapper {
  position: relative;
  width: 100%;
  height: 560px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 28px;
  background: #15191f;
}

.product-detail-main-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.product-detail-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #68707b;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.product-detail-image-count {
  position: absolute;
  right: 18px;
  bottom: 18px;
  padding: 7px 11px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  background: rgba(5, 7, 10, 0.78);
  backdrop-filter: blur(12px);
  color: #ddd;
  font-size: 11px;
  font-weight: 700;
}

.product-detail-thumbnails {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.product-detail-thumbnail {
  width: 82px;
  height: 82px;
  flex: 0 0 82px;
  padding: 0;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #15191f;
  cursor: pointer;
  opacity: 0.65;
  transition:
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.product-detail-thumbnail:hover {
  opacity: 1;
}

.product-detail-thumbnail.active {
  border-color: var(--orange);
  opacity: 1;
}

.product-detail-thumbnail img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.product-detail-info {
  min-width: 0;
  padding-top: 15px;
}

.product-detail-brand {
  height: 18px;
  margin: 0 0 10px;
  color: #ff9275;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-detail-name {
  margin: 0;
  color: #fff;
  font-size: clamp(42px, 5vw, 64px);
  line-height: 0.95;
  font-weight: 850;
  letter-spacing: -3px;
}

.product-detail-description {
  max-width: 600px;
  margin: 28px 0 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.75;
  white-space: pre-line;
}

.product-detail-specs {
  margin-top: 45px;
  border-top: 1px solid var(--border);
}

.product-detail-section-title {
  padding: 22px 0 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.product-detail-spec-row {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 24px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  line-height: 1.6;
}

.product-detail-spec-row strong {
  color: #fff;
  font-weight: 700;
}

.product-detail-spec-row span {
  color: var(--muted);
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.product-detail-stock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
  padding: 17px 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  color: var(--muted);
  font-size: 13px;
}

.product-detail-stock strong {
  color: #fff;
  font-size: 18px;
}

.product-detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.product-detail-loading {
  display: grid;
  grid-template-columns:
    minmax(0, 1.05fr)
    minmax(0, 0.95fr);
  gap: 70px;
}

.product-detail-loading-image {
  height: 560px;
  border-radius: 28px;
  background:
    linear-gradient(
      90deg,
      #15191f 25%,
      #1b2027 50%,
      #15191f 75%
    );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.product-detail-loading-content {
  padding-top: 50px;
}

.product-detail-loading-content .skeleton-line {
  margin-bottom: 18px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1000px) {
  .product-detail {
    gap: 45px;
  }

  .product-detail-main-image-wrapper {
    height: 460px;
  }

  .product-detail-loading {
    gap: 45px;
  }

  .product-detail-loading-image {
    height: 460px;
  }
}

@media (max-width: 760px) {
  .product-detail-page {
    padding: 30px 0 70px;
  }

  .product-detail-back {
    margin-bottom: 28px;
  }

  .product-detail,
  .product-detail-loading {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .product-detail-info {
    padding-top: 0;
  }

  .product-detail-loading-content {
    padding-top: 0;
  }

  .product-detail-main-image-wrapper,
  .product-detail-loading-image {
    height: 430px;
  }

  .product-detail-name {
    font-size: 48px;
  }

  .product-detail-description {
    margin-top: 24px;
    font-size: 15px;
  }

  .product-detail-specs {
    margin-top: 35px;
  }
}

@media (max-width: 600px) {
  .product-detail-page {
    padding-top: 20px;
  }

  .product-detail-main-image-wrapper,
  .product-detail-loading-image {
    height: 330px;
    border-radius: 20px;
  }

  .product-detail-thumbnail {
    width: 70px;
    height: 70px;
    flex-basis: 70px;
  }

  .product-detail-name {
    font-size: 42px;
    letter-spacing: -2px;
  }

  .product-detail-spec-row {
    grid-template-columns: 75px minmax(0, 1fr);
    gap: 15px;
  }

  .product-detail-actions {
    flex-direction: column;
  }

  .product-detail-actions .button {
    width: 100%;
  }
}
</style>