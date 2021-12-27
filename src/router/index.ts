import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import AuthTable from '../business/AuthTable.vue'
import Application from '../business/Application.vue'
import ServiceSplit from '../business/ServiceSplit.vue'
import AppHome from '@/App.vue'
import MenuTree from '../business/MenuTree.vue'
import TableCom from '../components/TableCom.vue'
import UserTable from '../business/UserTable.vue'

import AuthFunctionTree from '../business/AuthFunctionTree.vue'
import FunctionTree from '../business/FunctionTree.vue'
import UserAuthTable from '../business/UserAuthTable.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'TableCom',
    component: TableCom,
    props: {
      tableUrl: '/base/service'
    }
  },
  {
    path: '/base/application',
    name: 'application',
    component: Application,
    props: {
      tableUrl: '/base/application'
    }
  },
  {
    path: '/serve/split',
    name: 'ServiceSplit',
    component: ServiceSplit,
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
    component: MenuTree
  },
  {
    path: '/authTable',
    name: 'AuthTable',
    component: AuthTable
  },
  {
    path: '/authFunction',
    name: 'AuthFunctionTree',
    component: AuthFunctionTree
  },
  {
    path: '/user',
    name: 'user',
    component: UserTable
  },
  {
    path: '/userAuthTable',
    name: 'UserAuthTable',
    component: UserAuthTable
  }
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHashHistory(),
  routes
})

export default router
