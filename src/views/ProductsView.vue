<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue'
    import { RouterLink } from 'vue-router'

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

    interface Category {
        id: number
        name: string | null
        parent_id: number | null
        status: number
        created_at: string
        updated_at: string
    }

    //type SpecKey =
      //  | 'spec_1'
      //  | 'spec_2'
      //  | 'spec_3'
      //  | 'spec_4'
      //  | 'spec_5'

    const products = ref<Product[]>([])
    const categories = ref<Category[]>([])
    const loading = ref(true)
    const error = ref('')

    const searchQuery = ref('')
    const selectedSpec1 = ref('')
    const selectedSpec2 = ref('')
    const selectedSpec3 = ref('')
    const selectedSpec4 = ref('')
    const selectedSpec5 = ref('')
    const selectedCategory = ref<number | null>(null)

    const sortBy = ref('default')
    const mobileMenuOpen = ref(false)

    const API_BASE_URL = '/api'

    const fetchProducts = async () => {
        loading.value = true
        error.value = ''

        try {
            const response = await fetch(`${API_BASE_URL}/products`)

            if (!response.ok) {
                throw new Error('Failed to load products')
            }

            products.value = await response.json()
        } catch (err) {
            error.value = err instanceof Error
                ? err.message
                : 'Failed to load products'
        } finally {
            loading.value = false
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`)

            if (!response.ok) {
                throw new Error('Failed to load categories')
            }

            categories.value = await response.json()
        } catch (err) {
            console.error('Failed to load categories:', err)
        }
    }

    const selectCategory = (categoryId: number) => {
        selectedCategory.value =
            selectedCategory.value === categoryId
                ? null
                : categoryId

        document
            .getElementById('products')
            ?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
    }

    const normalizeText = (value: string | null | undefined) => {
        return (value ?? '').trim().toLowerCase()
    }

    // const specOptions = computed(() => {
    //     const getOptions = (key: SpecKey) => {
    //         const values = products.value
    //             .map((product) => product[key])
    //             .filter(
    //                 (value): value is string =>
    //                     typeof value === 'string' && value.trim() !== ''
    //             )

    //         return [...new Set(values)].sort((a, b) =>
    //             a.localeCompare(b, undefined, {
    //                 numeric: true,
    //                 sensitivity: 'base',
    //             })
    //         )
    //     }

    //     return {
    //         spec_1: getOptions('spec_1'),
    //         spec_2: getOptions('spec_2'),
    //         spec_3: getOptions('spec_3'),
    //         spec_4: getOptions('spec_4'),
    //         spec_5: getOptions('spec_5'),
    //     }
    // })

    const filteredProducts = computed(() => {
        const query = normalizeText(searchQuery.value)

        const result = products.value.filter((product) => {
            if (product.status !== 1) {
                return false
            }

            if (
                selectedCategory.value !== null &&
                product.category_1_id !== selectedCategory.value &&
                product.category_2_id !== selectedCategory.value
            ) {
                return false
            }

            if (query) {
                const searchableText = [
                    product.name,
                    product.brand,
                    product.description,
                    product.spec_1,
                    product.spec_2,
                    product.spec_3,
                    product.spec_4,
                    product.spec_5,
                ]
                    .map(normalizeText)
                    .join(' ')

                if (!searchableText.includes(query)) {
                    return false
                }
            }

            if (
                selectedSpec1.value &&
                product.spec_1 !== selectedSpec1.value
            ) {
                return false
            }

            if (
                selectedSpec2.value &&
                product.spec_2 !== selectedSpec2.value
            ) {
                return false
            }

            if (
                selectedSpec3.value &&
                product.spec_3 !== selectedSpec3.value
            ) {
                return false
            }

            if (
                selectedSpec4.value &&
                product.spec_4 !== selectedSpec4.value
            ) {
                return false
            }

            if (
                selectedSpec5.value &&
                product.spec_5 !== selectedSpec5.value
            ) {
                return false
            }

            return true
        })

        if (sortBy.value === 'name-asc') {
            result.sort((a, b) =>
                normalizeText(a.name).localeCompare(
                    normalizeText(b.name),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: 'base',
                    }
                )
            )
        }

        if (sortBy.value === 'name-desc') {
            result.sort((a, b) =>
                normalizeText(b.name).localeCompare(
                    normalizeText(a.name),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: 'base',
                    }
                )
            )
        }

        if (sortBy.value === 'newest') {
            result.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            )
        }

        return result
    })

    const hasActiveFilters = computed(() => {
        return (
            selectedCategory.value !== null ||
            searchQuery.value.trim() !== '' ||
            selectedSpec1.value !== '' ||
            selectedSpec2.value !== '' ||
            selectedSpec3.value !== '' ||
            selectedSpec4.value !== '' ||
            selectedSpec5.value !== ''
        )
    })

    const activeFilterCount = computed(() => {
        let count = 0

        if (selectedCategory.value !== null) {
            count++
        }

        if (searchQuery.value.trim() !== '') {
            count++
        }

        if (selectedSpec1.value) {
            count++
        }

        if (selectedSpec2.value) {
            count++
        }

        if (selectedSpec3.value) {
            count++
        }

        if (selectedSpec4.value) {
            count++
        }

        if (selectedSpec5.value) {
            count++
        }

        return count
    })

    const clearFilters = () => {
        searchQuery.value = ''
        selectedCategory.value = null
        selectedSpec1.value = ''
        selectedSpec2.value = ''
        selectedSpec3.value = ''
        selectedSpec4.value = ''
        selectedSpec5.value = ''
        sortBy.value = 'default'
    }

    const productSpecs = (product: Product) => {
        return [
            product.spec_1,
            product.spec_2,
            product.spec_3,
            product.spec_4,
            product.spec_5,
        ]
            .filter(
                (value): value is string =>
                    typeof value === 'string' && value.trim() !== ''
            )
            .slice(0, 3)
    }

    const getProductImage = (product: Product) => {
        if (!product.images || product.images.length === 0) {
            return ''
        }

        return product.images[0].url
    }

    const getProductName = (product: Product) => {
        return product.name?.trim() || 'Unnamed Product'
    }

    const getProductDescription = (product: Product) => {
        return product.description?.trim() || ''
    }

    const toggleMobileMenu = () => {
        mobileMenuOpen.value = !mobileMenuOpen.value
    }

    const closeMobileMenu = () => {
        mobileMenuOpen.value = false
    }

    onMounted(() => {
        fetchProducts()
        fetchCategories()
    })
</script>

<template>
    <div class="speedkex-app">
        <header class="site-header">
            <div class="container navbar">
                <RouterLink to="/products" class="logo">
                    Catelogue<span>.</span>
                </RouterLink>

                <nav class="nav-links">
                    <a href="#categories">Categories</a>
                    <a href="#products">Products</a>
                    <a href="#about">About</a>
                </nav>

                <a href="#products" class="nav-button">
                    Shop Products
                </a>

                <button
                    class="mobile-menu-btn"
                    type="button"
                    @click="toggleMobileMenu"
                >
                    ☰
                </button>
            </div>

            <div v-if="mobileMenuOpen" class="mobile-menu">
                <a href="#categories" @click="closeMobileMenu">Categories</a>
                <a href="#products" @click="closeMobileMenu">Products</a>
                <a href="#about" @click="closeMobileMenu">About</a>
            </div>
        </header>

        <main>
            <section class="hero">
                <div class="container hero-content">
                    <div class="section-label">
                        PERFORMANCE · PRECISION · PARTS
                    </div>

                    <h1>
                        FIND IT.<br />
                        <span>USE IT.</span>
                    </h1>

                    <p>
                        Quality parts, components and products.
                        Browse our catalogue and find what you need.
                    </p>

                    <div class="hero-actions">
                        <a href="#products" class="button">
                            Browse Products
                        </a>

                        <a href="#categories" class="button button-secondary">
                            Explore Categories
                        </a>
                    </div>
                </div>
            </section>

            <section id="categories" class="section">
                <div class="container">
                    <div class="section-heading">
                        <div>
                            <div class="section-label">CATEGORIES</div>
                            <h2>Browse by Category</h2>
                        </div>
                    </div>

                    <div class="categories-grid">
                        <a
                            v-for="(category, _) in categories"
                            
                            :key="category.id"
                            href="#products"
                            class="category-card"
                            @click.prevent="selectCategory(category.id)"
                        >

                        <!-- <a
                            v-for="(category, index) in categories.filter(
                                (category) => category.status === 1 && category.parent_id === null
                            )"
                            
                            :key="category.id"
                            href="#products"
                            class="category-card"
                            @click.prevent="selectCategory(category.id)"
                        > -->

                            <!-- <span class="category-number">
                                {{ String(index + 1).padStart(2, '0') }}
                            </span> -->

                            <h3>
                                {{ category.name || 'Unnamed Category' }}
                            </h3>

                            <!-- <p>
                                Browse products in this category.
                            </p> -->
                        </a>
                    </div>
                </div>
            </section>

            <section id="products" class="section products-section">
                <div class="container">
                    <div class="section-heading">
                        <div>
                            <div class="section-label">CATALOGUE</div>
                            <h2>Products</h2>
                        </div>

                        <div class="result-count">
                            {{ filteredProducts.length }} products
                        </div>
                    </div>

                    <div class="products-toolbar">
                        <div class="search-box">
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search products..."
                            />
                        </div>

                        <div v-if="hasActiveFilters" class="toolbar-actions">
                            <button
                                type="button"
                                class="clear-button"
                                @click="clearFilters"
                            >
                                Clear
                                <span v-if="activeFilterCount">
                                    ({{ activeFilterCount }})
                                </span>
                            </button>
                        </div>
                    </div>

                    <div v-if="loading" class="product-grid">
                        <div
                            v-for="index in 6"
                            :key="index"
                            class="product-card skeleton-card"
                        >
                            <div class="product-image skeleton"></div>

                            <div class="product-content">
                                <div class="skeleton skeleton-line small"></div>
                                <div class="skeleton skeleton-line title"></div>
                                <div class="skeleton skeleton-line"></div>
                                <div class="skeleton skeleton-line short"></div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="error" class="state-message">
                        <h3>Failed to load products</h3>
                        <p>{{ error }}</p>

                        <button
                            type="button"
                            class="button"
                            @click="fetchProducts"
                        >
                            Try Again
                        </button>
                    </div>

                    <div
                        v-else-if="filteredProducts.length === 0"
                        class="state-message"
                    >
                        <h3>
                            {{
                                products.length === 0
                                    ? 'No products yet'
                                    : 'No products found'
                            }}
                        </h3>

                        <p>
                            {{
                                products.length === 0
                                    ? 'There are currently no products available.'
                                    : 'Try changing your search or filters.'
                            }}
                        </p>

                        <button
                            v-if="hasActiveFilters"
                            type="button"
                            class="button"
                            @click="clearFilters"
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div v-else class="product-grid">
                        <RouterLink
                            v-for="product in filteredProducts"
                            :key="product.id"
                            :to="`/products/${product.id}`"
                            class="product-card"
                        >
                            <div class="product-image">
                                <img
                                    v-if="getProductImage(product)"
                                    :src="getProductImage(product)"
                                    :alt="getProductName(product)"
                                />

                                <div
                                    v-else
                                    class="product-image-placeholder"
                                >
                                    No Image
                                </div>

                                <!-- 左上角 -->
                                <span
                                    v-if="product.spec_1 != ''"
                                    class="div-brand"
                                >
                                    {{ product.spec_1 }}
                                </span>

                                <!-- 左下角 -->
                                <span
                                    v-if="product.images.length > 1"
                                    class="image-count"
                                >
                                    {{ product.images.length }} Photos
                                </span>
                            </div>

                            <div class="product-content">
                                <div class="product-brand">
                                    {{ product.brand?.trim() || '\u00A0' }}
                                </div>

                                <h3>
                                    {{ getProductName(product) }}
                                </h3>

                                <p
                                    v-if="getProductDescription(product)"
                                    class="product-description"
                                >
                                    {{ getProductDescription(product) }}
                                </p>

                                <p
                                    v-else
                                    class="product-description product-description-empty"
                                >
                                    &nbsp;
                                </p>

                                <div class="product-specs">
                                    <span
                                        v-for="(spec, index) in productSpecs(product)"
                                        :key="index"
                                        class="product-spec"
                                    >
                                        {{ spec }}
                                    </span>

                                    <span
                                        v-if="productSpecs(product).length === 0"
                                        class="product-spec-empty"
                                    >
                                        &nbsp;
                                    </span>
                                </div>

                                <div class="product-footer">
                                    <span>View Part</span>
                                    <span>→</span>
                                </div>
                            </div>
                        </RouterLink>
                    </div>
                </div>
            </section>

            <section id="about" class="section cta-section">
                <div class="container">
                    <div class="cta">
                        <div class="section-label">NEED HELP?</div>

                        <h2>Can't find what you need?</h2>

                        <p>
                            Contact us and we'll help you find the right
                            product.
                        </p>

                        <a
                            href="https://wa.me/+60123456789"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="button"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </main>

        <footer class="site-footer">
            <div class="container footer-content">
                <div class="logo">
                    Catelogue<span>.</span>
                </div>

                <div>
                    © {{ new Date().getFullYear() }} Catelogue. All rights
                    reserved.
                </div>
            </div>
        </footer>
    </div>
</template>
