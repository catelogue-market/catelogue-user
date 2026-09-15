import { createRouter, createWebHistory } from 'vue-router'
import ProductsView from '../views/ProductsView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'

const router = createRouter({
  history: createWebHistory('/catelogue-user/'),
  routes: [
    {
      path: '/',
      redirect: '/products',
    },
    {
      path: '/products',
      component: ProductsView,
    },
    {
      path: '/products/:id',
      component: ProductDetailView,
    },
  ],
})

export default router
