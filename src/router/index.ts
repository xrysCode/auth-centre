import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import TableCom from '../components/TableCom.vue'
import TableCom2 from '../components/TableCom2.vue'
import AppHome from '@/App.vue'
import DraggableTree from '../components/DraggableTree.vue'
import User from '../components/User.vue'

import FunctionTree from '../components/FunctionTree.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/base/application',
    name: 'application',
    component: TableCom,
    props: {
      tableUrl: '/base/application'
    }
  },
  {
    path: '/serve/split',
    name: 'TableCom2',
    component: TableCom2,
    props: {
      tableUrl: '/base/service'
    }
  },
  {
    path: '/functionTree',
    name: 'FunctionTree',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: FunctionTree// () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },

  {
    path: '/menus',
    name: 'DraggableTree',
    component: DraggableTree
  },
  {
    path: '/user',
    name: 'user',
    component: User
  }
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes
})

export default router
