import { createRouter, createWebHistory } from 'vue-router'
import Main from '@/pages/Main.vue'
import Home from '@/pages/Home.vue'
import SignUp from '@/pages/SignUp.vue'
import PlayerSignUp from '@/pages/PlayerSignUp.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/u/:userToken/:sessionId',
    name: 'UserMain1',
    component: Main,
    props: (r: { params: { userToken: string; sessionId: string }; query: { rail?: string } }) => ({
      userToken: r.params.userToken,
      sessionId: r.params.sessionId,
      rail: r.query.rail || ''
    })
  },
  {
    path: '/u/:userToken/:sessionId/:dashboardId',
    name: 'UserMain2',
    component: Main,
    props: (r: {
      params: { userToken: string; sessionId: string; dashboardId: string }
      query: { rail?: string }
    }) => ({
      userToken: r.params.userToken,
      sessionId: r.params.sessionId,
      dashboardId: r.params.dashboardId,
      rail: r.query.rail || ''
    })
  },
  {
    path: '/d/:signUpToken',
    name: 'PlayerSignUp',
    component: PlayerSignUp,
    props: (r: { params: { signUpToken: string } }) => ({
      signUpToken: r.params.signUpToken
    })
  },
  {
    path: '/d/:sessionToken/:playerId',
    name: 'PlayerSignIn',
    component: PlayerSignUp,
    props: (r: { params: { sessionToken: string; playerId: string } }) => ({
      sessionToken: r.params.sessionToken,
      playerId: r.params.playerId
    })
  },
  {
    path: '/p/:playerToken',
    name: 'PlayerMain0',
    component: Main,
    props: (r: { params: { playerToken: string }; query: { rail?: string } }) => ({
      playerToken: r.params.playerToken,
      rail: r.query.rail || ''
    })
  },
  {
    path: '/p/:playerToken/:firstNav',
    name: 'PlayerMain1',
    component: Main,
    props: (r: { params: { playerToken: string; firstNav: string }; query: { rail?: string } }) => ({
      playerToken: r.params.playerToken,
      firstNav: r.params.firstNav,
      rail: r.query.rail || ''
    })
  },
  {
    path: '/p/:playerToken/:firstNav/:secondNav',
    name: 'PlayerMain2',
    component: Main,
    props: (r: { params: { playerToken: string; firstNav: string; secondNav: string }; query: { rail?: string } }) => ({
      playerToken: r.params.playerToken,
      firstNav: r.params.firstNav,
      secondNav: r.params.secondNav,
      rail: r.query.rail || ''
    })
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
