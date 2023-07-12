import { AuthOptions, createAuthLink } from 'aws-appsync-auth-link'
import {ApolloClient, ApolloLink, FetchResult, InMemoryCache, NormalizedCacheObject} from '@apollo/client/core'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'
import { InjectionKey, reactive } from 'vue'
import defaultLayout from '@/PaneLayoutTemplate/DefaultLayout'
import {
  User,
  Mutations,
  Queries,
  Subscriptions,
  Dashboard,
  Player,
  DirectPlayerAccessQueryResult,
  UserSignInResult,
  AddDashboardResult,
  DirectDashboardAccessQueryResult,
  UserSignUpResult,
  PlayerSignInResult,
  ResetPlayerPasswordResult,
  GeneratePlayerResetCodeResult,
  AddPlayerByUserResult,
  PlayerFirstSignInResult,
  AddPlayerByPlayerResult,
  OnAddPlayerResult
} from '@/components/graphql/schema'
import { Router } from 'vue-router'
import { Observable } from '@apollo/client'

// ローカル開発時のみ有効な値であり、流出しても問題ない情報
const DEFAULT_URL = 'https://frhcambmmrhl7hkeuym7pzwbu4.appsync-api.ap-northeast-1.amazonaws.com/graphql'
const DEFAULT_REGION = 'ap-northeast-1'

const DEFAULT_DASHBOARD_NAME = 'No title'
const DEFAULT_DASHBOARD_LAYOUT = JSON.stringify(defaultLayout)
const DEFAULT_DASHBOARD_META_DATA = 'meta data sample'

export function makeGraphQlClient(endPointUrl: string, region: string, getAuthToken: () => string) {
  const auth: AuthOptions = {
    type: 'AWS_LAMBDA',
    token: getAuthToken
  }
  const link = ApolloLink.from([
    createAuthLink({url: endPointUrl, region, auth}),
    createSubscriptionHandshakeLink({url: endPointUrl, region, auth})
  ])
  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  })
}

function sortId(d: { id: string }, e: { id: string }): number {
  if (d.id < e.id) return -1
  return d.id > e.id ? 1 : 0
}

export async function userSignIn(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  userId: string,
  userPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<UserSignInResult>({
    mutation: Mutations.userSignIn,
    variables: { userId, userPassword }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.userSignIn
  if (data) {
    const { token, secret, firstDashboard } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    localStorage.setItem('userId', userId)
    router.push({ name: 'UserMain1', params: { userToken: token, firstNav: firstDashboard.id } }).then()
  }
}

export async function userSignUp(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  userId: string,
  userName: string,
  userPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<UserSignUpResult>({
    mutation: Mutations.userSignUp,
    variables: {
      userId,
      userName,
      userPassword,
      dashboardName: DEFAULT_DASHBOARD_NAME,
      layout: DEFAULT_DASHBOARD_LAYOUT,
      metaData: DEFAULT_DASHBOARD_META_DATA
    }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.userSignUp
  if (data) {
    const { token, secret, firstDashboard } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    localStorage.setItem('userId', userId)
    router.push({ name: 'UserMain1', params: { userToken: token, firstNav: firstDashboard.id } }).then()
  }
}

export async function playerSignUp(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerName: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<AddPlayerByPlayerResult>({
    mutation: Mutations.addPlayerByPlayer,
    variables: { playerName, playerPassword }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.addPlayerByPlayer
  if (data) {
    await playerSignIn(appSyncClient, data.id, playerPassword, router)
  }
}

export async function playerFirstSignIn(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerId: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<PlayerFirstSignInResult>({
    mutation: Mutations.playerFirstSignIn,
    variables: { playerId, playerPassword }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.playerFirstSignIn
  if (data) {
    const { token, secret } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    router.push({ name: 'PlayerMain0', params: { playerToken: token } }).then()
  }
}

export async function playerSignIn(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerId: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<PlayerSignInResult>({
    mutation: Mutations.playerSignIn,
    variables: { playerId, playerPassword }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.playerSignIn
  if (data) {
    const { token, secret } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    router.push({ name: 'PlayerMain0', params: { playerToken: token } }).then()
  }
}

export async function resetPlayerPassword(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerId: string,
  resetCode: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<ResetPlayerPasswordResult>({
    mutation: Mutations.resetPlayerPassword,
    variables: { playerId, resetCode, playerPassword }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.resetPlayerPassword
  if (data) {
    const { token, secret } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    router.push({ name: 'PlayerMain0', params: { playerToken: token } }).then()
  }
}

async function callAddDashboard(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  name: string,
  layout: string,
  metaData: string,
  callback: (data: Dashboard) => void
): Promise<void> {
  if (!appSyncClient) return
  const result = await appSyncClient.mutate<AddDashboardResult>({
    mutation: Mutations.addDashboard,
    variables: { name, layout, metaData }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const addDashboard = result.data?.addDashboard
  if (addDashboard) {
    callback({
      id: data.id,
      token: data.token,
      name: data.name,
      layout: data.layout,
      metaData: data.metaData,
      createdAt: data.createdAt,
    })
  }
}

export async function fetchGraphQlConnectionInfo() {
  const apiInfoResult = await fetch('/api')
  try {
    const apiInfoJson: { graphql: string, region: string } = await apiInfoResult.json()
    return apiInfoJson
  } catch (error) {
    console.warn('/apiで情報が取得できませんでした')
    console.warn('ローカル開発中ですね？')
  }
  return {
    graphql: DEFAULT_URL,
    region: DEFAULT_REGION
  }
}

export default function useGraphQl(
  userToken: string,
  playerToken: string,
  dashboardId: string
) {
  // 状態
  const state = reactive<{
    ready: boolean
    user: User | null
    player: Player | null
    dashboard: Dashboard | null
    dashboards: {id: string, name: string}[]
    players: Player[]
  }>({
    ready: false,
    user: null,
    player: null,
    dashboards: [],
    dashboard: null,
    players: []
  })

  // ロジック
  let appSyncClient: ApolloClient<NormalizedCacheObject> | null = null

  let operation: string = ''

  function getAuthToken(): string {
    let authorize = 'waddlefy'
    switch(operation) {
      case 'query directDashboardAccess':
      case 'mutation addPlayerByUser':
      case 'mutation addDashboard':
      case 'mutation generatePlayerResetCode':
        const userSecret = JSON.parse(localStorage.getItem(userToken) || '{}')?.secret
        authorize = `u/${userToken}/${userSecret || ''}`
        break
      case 'query directPlayerAccess':
        const playerSecret = JSON.parse(localStorage.getItem(playerToken) || '{}')?.secret
        authorize = `p/${playerToken}/${playerSecret || ''}`
        break
      default:
    }
    console.log(JSON.stringify({ operation, authorize }))
    return authorize
  }

  async function initialize() {
    state.user = null
    state.dashboard = null
    state.player = null
    state.players = []

    state.ready = false

    if (appSyncClient) {
      await appSyncClient.clearStore()
      appSyncClient.stop()
    }

    const { graphql, region } = await fetchGraphQlConnectionInfo()
    appSyncClient = makeGraphQlClient(graphql, region, getAuthToken)

    if (userToken) {
      await directDashboardAccess(dashboardId)
    }

    if (playerToken) {
      operation = 'query directPlayerAccess'
      const result = await appSyncClient.mutate<DirectPlayerAccessQueryResult>({
        mutation: Queries.directPlayerAccess
      })
      console.log(JSON.stringify(result.data, null, 2))
      const directPlayerAccess = result.data?.directPlayerAccess
      if (directPlayerAccess) {
        const { id, token, iconToken, name, dashboard } = directPlayerAccess
        state.user = { id: dashboard.user.id, name: dashboard.user.name, iconToken: dashboard.user.iconToken } as User
        state.dashboards = []
        state.dashboard = {
          id: dashboard.id,
          token: dashboard.token,
          name: dashboard.name,
          layout: dashboard.layout,
          metaData: dashboard.metaData,
          createdAt: dashboard.createdAt,
        }
        state.players = dashboard.players.sort(sortId)
        state.player = {
          id, token, iconToken, name
        }
      }
    }

    onAddPlayerSubscription()

    state.ready = true
  }
  initialize().then()

  async function addDefaultDashboard() {
    if (!appSyncClient) return
    operation = 'mutation addDashboard'
    await callAddDashboard(
      appSyncClient,
      DEFAULT_DASHBOARD_NAME,
      DEFAULT_DASHBOARD_LAYOUT,
      DEFAULT_DASHBOARD_META_DATA,
      dashboard => {
        state.dashboard = dashboard
        state.dashboards.push({ id: dashboard.id, name: dashboard.name })
      }
    )
  }

  async function directDashboardAccess(dashboardId: string) {
    if (!appSyncClient) return
    state.dashboard = null
    state.players = []
    console.log(dashboardId)
    operation = 'query directDashboardAccess'
    const result = await appSyncClient.mutate<DirectDashboardAccessQueryResult>({
      mutation: Queries.directDashboardAccess,
      variables: { dashboardId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    const directDashboardAccess = result.data?.directDashboardAccess
    if (directDashboardAccess) {
      state.user = {
        id: directDashboardAccess.user.id,
        token: directDashboardAccess.user.token,
        name: directDashboardAccess.user.name,
        iconToken: directDashboardAccess.user.iconToken,
      }
      state.dashboards = directDashboardAccess.user.dashboards.sort(sortId)
      state.dashboard = {
        id: directDashboardAccess.id,
        token: directDashboardAccess.token,
        name: directDashboardAccess.name,
        layout: directDashboardAccess.layout,
        metaData: directDashboardAccess.metaData,
        createdAt: directDashboardAccess.createdAt,
      }
      state.players = directDashboardAccess.players.sort(sortId)
    }
  }

  async function generatePlayerResetCode(playerId: string): Promise<string | null> {
    if (!appSyncClient) return null
    try {
      operation = 'mutation generatePlayerResetCode'
      const result = await appSyncClient.mutate<GeneratePlayerResetCodeResult>({
        mutation: Mutations.generatePlayerResetCode,
        variables: { playerId }
      })
      console.log(JSON.stringify(result.data, null, 2))
      const data = result.data?.generatePlayerResetCode
      return data?.resetCode || null
    } catch (e) {
      // Nothing
    }
    return null
  }

  async function addPlayerByUser(playerName: string): Promise<void> {
    if (!appSyncClient) return

    const dashboardId = state.dashboard?.id || ''

    operation = 'mutation addPlayerByUser'
    await appSyncClient.mutate<AddPlayerByUserResult>({
      mutation: Mutations.addPlayerByUser,
      variables: { playerName, dashboardId }
    })
    // Subscriptionによってstateに登録される
  }

  function onAddPlayerSubscription(): Observable<FetchResult<OnAddPlayerResult>> {
    if (!appSyncClient) return
    const result = appSyncClient.subscribe<OnAddPlayerResult>({
      query: Subscriptions.onAddPlayer,
      fetchPolicy: 'network-only'
    })
    result.subscribe({
      next(value: FetchResult<OnAddPlayerResult>) {
        const data = value.data?.onAddPlayer
        if (data) {
          state.players.push(data)
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return result
  }

  return {
    state,
    addDefaultDashboard,
    directDashboardAccess,
    addPlayerByUser,
    generatePlayerResetCode
  }
}

export type GraphQlStore = ReturnType<typeof useGraphQl>
export const GraphQlKey: InjectionKey<GraphQlStore> = Symbol('GraphQlStore') as any
