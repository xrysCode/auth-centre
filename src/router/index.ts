import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import TableCom from '../components/TableCom.vue'
import AppHome from '@/App.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'AppHome',
    component: AppHome
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/base/serve',
    name: 'TableCom',
    component: TableCom
  }
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes
})

export default router
