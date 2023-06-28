import { createRouter, createWebHistory } from 'vue-router'
import AppSync from '@/pages/Main.vue'
import Home from '@/pages/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/use',
    name: 'Use',
    component: AppSync
  },
  {
    path: '/:connectionId',
    name: 'Connected',
    component: AppSync,
    props: (r: { params: { connectionId: string } }) => ({
      connectionId: r.params.connectionId
    }),
  },
  {
    path: '/:connectionId/:roomToken',
    name: 'Entered',
    component: AppSync,
    props: (r: { params: { connectionId: string, roomToken: string } }) => ({
      connectionId: r.params.connectionId,
      roomToken: r.params.roomToken,
    }),
  },
  {
    path: '/:connectionId/:roomToken/:userToken',
    name: 'LoggedIn',
    component: AppSync,
    props: (r: { params: { connectionId: string, roomToken: string, userToken: string } }) => ({
      connectionId: r.params.connectionId,
      roomToken: r.params.roomToken,
      userToken: r.params.userToken
    }),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
