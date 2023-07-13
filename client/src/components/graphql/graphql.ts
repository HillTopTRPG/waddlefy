import { AuthOptions, createAuthLink } from 'aws-appsync-auth-link'
import {ApolloClient, ApolloLink, FetchResult, InMemoryCache, NormalizedCacheObject} from '@apollo/client/core'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'
import {InjectionKey, reactive, watch} from 'vue'
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
  OnAddPlayerResult,
  OnDeletePlayerResult,
  DeleteDashboardResult,
  DeletePlayerResult,
  UpdatePlayerNameResult,
  UpdatePlayerIconResult,
  UpdateUserNameResult,
  UpdateUserIconResult,
  OnUpdatePlayerResult,
  OnUpdateUserResult,
  UpdateDashboardResult,
  OnUpdateDashboardResult
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
      id: addDashboard.id,
      token: addDashboard.token,
      name: addDashboard.name,
      layout: addDashboard.layout,
      metaData: addDashboard.metaData,
      createdAt: addDashboard.createdAt,
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
      case 'mutation deleteDashboard':
      case 'mutation updateUserName':
      case 'mutation updateUserIcon':
      case 'mutation updateDashboard':
      case 'mutation deletePlayer':
      case 'mutation generatePlayerResetCode':
        const userSecret = JSON.parse(localStorage.getItem(userToken) || '{}')?.secret
        authorize = `u/${userToken}/${userSecret || ''}`
        break
      case 'query directPlayerAccess':
      case 'mutation updatePlayerName':
      case 'mutation updatePlayerIcon':
        const playerSecret = JSON.parse(localStorage.getItem(playerToken) || '{}')?.secret
        authorize = `p/${playerToken}/${playerSecret || ''}`
        break
      default:
    }
    // console.log(JSON.stringify({ operation, authorize }))
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

    onUpdateUserSubscription()

    const subscribedDashboardId = []
    watch(() => state.dashboard?.id, (dashboardId) => {
      if (!dashboardId) return
      if (subscribedDashboardId.some(id => id === dashboardId)) return
      subscribedDashboardId.push(dashboardId)
      onAddPlayerSubscription(dashboardId)
      onUpdateDashboardSubscription(dashboardId)
      onUpdatePlayerSubscription(dashboardId)
      onDeletePlayerSubscription(dashboardId)
    }, { immediate: true })

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
        state.players = []
      }
    )
  }

  async function updateUserName(userName: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateUserName'
    await appSyncClient.mutate<UpdateUserNameResult>({
      mutation: Mutations.updateUserName,
      variables: { userName }
    })
    // subscriptionにて更新される
  }

  async function updateUserIcon() {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateUserIcon'
    await appSyncClient.mutate<UpdateUserIconResult>({
      mutation: Mutations.updateUserIcon
    })
    // subscriptionにて更新される
  }

  async function updateDashboard(name: string, layout: string, metaData: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateDashboard'
    await appSyncClient.mutate<UpdateDashboardResult>({
      mutation: Mutations.updateDashboard,
      variables: {
        dashboardId: state.dashboard?.id || '',
        name,
        layout,
        metaData
      }
    })
    // subscriptionにて更新される
  }

  async function updatePlayerName(playerName: string) {
    if (!appSyncClient) return
    if (!state.player?.token) return
    operation = 'mutation updatePlayerName'
    await appSyncClient.mutate<UpdatePlayerNameResult>({
      mutation: Mutations.updatePlayerName,
      variables: { playerName }
    })
    // subscriptionにて更新される
  }

  async function updatePlayerIcon() {
    if (!appSyncClient) return
    if (!state.player?.token) return
    operation = 'mutation updatePlayerIcon'
    await appSyncClient.mutate<UpdatePlayerIconResult>({
      mutation: Mutations.updatePlayerIcon
    })
    // subscriptionにて更新される
  }

  async function deleteDashboard(dashboardId: string) {
    if (!appSyncClient) return
    operation = 'mutation deleteDashboard'
    const result = await appSyncClient.mutate<DeleteDashboardResult>({
      mutation: Mutations.deleteDashboard,
      variables: { dashboardId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    const data = result.data?.deleteDashboard
    if (data) {
      const idx = state.dashboards.findIndex(d => d.id === data.id)
      state.dashboards.splice(idx, 1)
    }
  }

  async function deletePlayer(playerId: string) {
    if (!appSyncClient) return
    operation = 'mutation deletePlayer'
    await appSyncClient.mutate<DeletePlayerResult>({
      mutation: Mutations.deletePlayer,
      variables: { playerId }
    })
    // subscriptionにて削除される
  }

  async function directDashboardAccess(dashboardId: string) {
    if (!appSyncClient) return
    state.dashboard = null
    state.players = []
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

  function onAddPlayerSubscription(dashboardId: string): Observable<FetchResult<OnAddPlayerResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnAddPlayerResult>({
      query: Subscriptions.onAddPlayer,
      variables: { dashboardId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnAddPlayerResult>) {
        const data = value.data?.onAddPlayer
        if (data && state.dashboard?.id === dashboardId) {
          state.players.push(data)
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateUserSubscription(): Observable<FetchResult<OnUpdateUserResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnUpdateUserResult>({
      query: Subscriptions.onUpdateUser,
      variables: { userId: state.user?.id || '' },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnUpdateUserResult>) {
        const data = value.data?.onUpdateUser
        if (data) {
          state.user.name = data.name
          state.user.iconToken = data.iconToken
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateDashboardSubscription(dashboardId: string): Observable<FetchResult<OnUpdateDashboardResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnUpdateDashboardResult>({
      query: Subscriptions.onUpdateDashboard,
      variables: { dashboardId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnUpdateDashboardResult>) {
        const data = value.data?.onUpdateDashboard
        if (data && state.dashboard && state.dashboard.id === dashboardId) {
          state.dashboard.name = data.name
          state.dashboard.layout = data.layout
          state.dashboard.metaData = data.metaData
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdatePlayerSubscription(dashboardId: string): Observable<FetchResult<OnUpdatePlayerResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnUpdatePlayerResult>({
      query: Subscriptions.onUpdatePlayer,
      variables: { dashboardId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnUpdatePlayerResult>) {
        const data = value.data?.onUpdatePlayer
        if (data && state.dashboard?.id === dashboardId) {
          const idx = state.players.findIndex(p => p.id === data.id)
          state.players[idx].name = data.name
          state.players[idx].iconToken = data.iconToken
          state.players[idx].status = data.status
          if (state.player?.id === data.id) {
            state.player.name = data.name
            state.player.iconToken = data.iconToken
            state.player.status = data.status
          }
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onDeletePlayerSubscription(dashboardId: string): Observable<FetchResult<OnDeletePlayerResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnDeletePlayerResult>({
      query: Subscriptions.onDeletePlayer,
      variables: { dashboardId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnDeletePlayerResult>) {
        const data = value.data?.onDeletePlayer
        if (data && state.dashboard?.id === dashboardId) {
          const idx = state.players.findIndex(p => p.id === data.id)
          state.players.splice(idx, 1)
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  return {
    state,
    addDefaultDashboard,
    directDashboardAccess,
    addPlayerByUser,
    generatePlayerResetCode,
    updateUserName,
    updateUserIcon,
    updateDashboard,
    updatePlayerName,
    updatePlayerIcon,
    deleteDashboard,
    deletePlayer
  }
}

export type GraphQlStore = ReturnType<typeof useGraphQl>
export const GraphQlKey: InjectionKey<GraphQlStore> = Symbol('GraphQlStore') as any
