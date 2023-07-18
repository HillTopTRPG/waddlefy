import { InjectionKey, reactive, watch } from 'vue'
import { Router } from 'vue-router'
import { Observable } from '@apollo/client'
import { Layout } from '@/components/panes'
import { ApolloClient, ApolloLink, FetchResult, InMemoryCache, NormalizedCacheObject } from '@apollo/client/core'
import { AuthOptions, createAuthLink } from 'aws-appsync-auth-link'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'
import {
  Mutations, MutationResult,
  Queries, QueryResult,
  Subscriptions, SubscriptionResult,
  User, Session, Dashboard, AbstractDashboard, Player
} from '@/components/graphql/schema'

// ローカル開発時のみ有効な値であり、流出しても問題ない情報
const DEFAULT_URL = 'https://z46ue3pn4fc6pesko32rxh6w6a.appsync-api.ap-northeast-1.amazonaws.com/graphql'
const DEFAULT_REGION = 'ap-northeast-1'

export const DEFAULT_SESSION_NAME = 'No title session'
export const DEFAULT_DASHBOARD_NAME = 'No title page'
const DEFAULT_SESSION_TYPE = 'init'

export function makeGraphQlClient(endPointUrl: string, region: string, getAuthToken: () => string) {
  const auth: AuthOptions = {
    type: 'AWS_LAMBDA',
    token: getAuthToken
  }
  try {
    const link = ApolloLink.from([
      createAuthLink({url: endPointUrl, region, auth}),
      createSubscriptionHandshakeLink({url: endPointUrl, region, auth})
    ])
    return new ApolloClient({
      link,
      cache: new InMemoryCache()
    })
  } catch (err) {
    console.error(JSON.stringify({
      message: 'GraphQLへの接続に失敗しました。',
      endPointUrl,
      region
    }, null, 2))
  }
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
  const result = await appSyncClient.mutate<MutationResult.UserSignIn>({
    mutation: Mutations.userSignIn,
    variables: { userId, userPassword }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.userSignIn
  if (data) {
    const { token, secret, firstSession } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    localStorage.setItem('userId', userId)
    const sessionId = firstSession.id
    const dashboardId = firstSession.defaultDashboardId
    if (dashboardId) {
      router.push({ name: 'UserMain2', params: { userToken: token, sessionId, dashboardId } }).then()
    } else {
      router.push({ name: 'UserMain1', params: { userToken: token, sessionId } }).then()
    }
  }
}

export async function userSignUp(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  userId: string,
  userName: string,
  userPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<MutationResult.UserSignUp>({
    mutation: Mutations.userSignUp,
    variables: {
      userId,
      userName,
      userPassword,
      sessionName: DEFAULT_SESSION_NAME,
      sessionType: DEFAULT_SESSION_TYPE
    }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.userSignUp
  if (data) {
    const { token, secret, firstSession } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    localStorage.setItem('userId', userId)
    router.push({ name: 'UserMain1', params: { userToken: token, sessionId: firstSession.id } }).then()
  }
}

export async function playerSignUp(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerName: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  const result = await appSyncClient.mutate<MutationResult.AddPlayerByPlayer>({
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
  const result = await appSyncClient.mutate<MutationResult.PlayerFirstSignIn>({
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
  const result = await appSyncClient.mutate<MutationResult.PlayerSignIn>({
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
  const result = await appSyncClient.mutate<MutationResult.ResetPlayerPassword>({
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

async function callAddSession(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  name: string,
  sessionType: string,
  callback: (data: Session) => void
): Promise<void> {
  if (!appSyncClient) return
  const result = await appSyncClient.mutate<MutationResult.AddSession>({
    mutation: Mutations.addSession,
    variables: { name, sessionType }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.addSession
  if (data) {
    callback({
      id: data.id,
      token: data.token,
      name: data.name,
      sessionType: data.sessionType,
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
  sessionId: string,
  dashboardId: string,
  router: Router
) {
  // 状態
  const state = reactive<{
    ready: boolean
    user: User | null
    player: Player | null
    session: Session | null
    sessions: {id: string, name: string}[]
    players: Player[]
    dashboards: AbstractDashboard[]
    dashboard: Dashboard | null
  }>({
    ready: false,
    user: null,
    player: null,
    sessions: [],
    session: null,
    players: [],
    dashboards: [],
    dashboard: null
  })

  // ロジック
  let appSyncClient: ApolloClient<NormalizedCacheObject> | null = null

  let operation: string = ''

  function getAuthToken(): string {
    let authorize = 'waddlefy'
    switch(operation) {
      case 'query directSessionAccess':
      case 'mutation addPlayerByUser':
      case 'mutation addSession':
      case 'mutation addDashboard':
      case 'mutation deleteSession':
      case 'mutation updateUserName':
      case 'mutation updateUserIcon':
      case 'mutation updateSession':
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
      case 'query directDashboardAccess':
        authorize = `s/${state.session?.token || ''}`
        break
      default:
    }
    // console.log(JSON.stringify({ operation, authorize }))
    return authorize
  }

  async function initialize() {
    state.user = null
    state.session = null
    state.player = null
    state.players = []
    state.dashboards = []
    state.dashboard = null

    state.ready = false

    if (appSyncClient) {
      await appSyncClient.clearStore()
      appSyncClient.stop()
    }

    const { graphql, region } = await fetchGraphQlConnectionInfo()
    appSyncClient = makeGraphQlClient(graphql, region, getAuthToken)

    if (userToken) {
      await directSessionAccess(sessionId)
    }

    if (playerToken) {
      await directPlayerAccess()
    }

    onUpdateUserSubscription()

    const subscribedSessionId = []
    watch(() => state.session?.id, (sessionId) => {
      if (!sessionId) return
      if (subscribedSessionId.some(id => id === sessionId)) return
      subscribedSessionId.push(sessionId)
      onAddPlayerSubscription(sessionId)
      onAddDashboardSubscription(sessionId)
      onUpdateSessionSubscription(sessionId)
      onUpdateDashboardSubscription(sessionId)
      onUpdatePlayerSubscription(sessionId)
      onDeletePlayerSubscription(sessionId)
      onDeleteDashboardSubscription(sessionId)
    }, { immediate: true })

    state.ready = true
  }
  initialize().then()

  async function addDefaultSession(name?: string): Promise<void> {
    if (!appSyncClient) return
    operation = 'mutation addSession'
    await callAddSession(
      appSyncClient,
      name || DEFAULT_SESSION_NAME,
      DEFAULT_SESSION_TYPE,
      session => {
        state.session = session
        state.sessions.push({ id: session.id, name: session.name })
        state.players = []
        state.dashboards = []
        state.dashboard = null
      }
    )
  }

  async function addDashboard(dashboardName: string, layout: string): Promise<void> {
    if (!appSyncClient) return
    operation = 'mutation addDashboard'
    const result = await appSyncClient.mutate<MutationResult.AddDashboard>({
      mutation: Mutations.addDashboard,
      variables: { dashboardName: dashboardName || DEFAULT_DASHBOARD_NAME, layout, sessionId: state.session?.id || '' }
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateUserName(userName: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateUserName'
    const result = await appSyncClient.mutate<MutationResult.UpdateUserName>({
      mutation: Mutations.updateUserName,
      variables: { userName }
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateUserIcon() {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateUserIcon'
    const result = await appSyncClient.mutate<MutationResult.UpdateUserIcon>({
      mutation: Mutations.updateUserIcon
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateSession(name: string, sessionType: string, defaultDashboardId: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateSession'
    const result = await appSyncClient.mutate<MutationResult.UpdateSession>({
      mutation: Mutations.updateSession,
      variables: {
        sessionId: state.session?.id || '',
        name,
        sessionType,
        defaultDashboardId
      }
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateDashboardName(name: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateDashboard'
    const result = await appSyncClient.mutate<MutationResult.UpdateDashboard>({
      mutation: Mutations.updateDashboard,
      variables: {
        sessionId: state.session?.id || '',
        dashboardId: state.dashboard?.id || '',
        name,
        layout: state.dashboard?.layout ? JSON.stringify(state.dashboard.layout) : '',
      }
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateDashboardLayout(layout: Layout) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateDashboard'
    const result = await appSyncClient.mutate<MutationResult.UpdateDashboard>({
      mutation: Mutations.updateDashboard,
      variables: {
        sessionId: state.session?.id || '',
        dashboardId: state.dashboard?.id || '',
        name: state.dashboard?.name || '',
        layout: JSON.stringify(layout),
      }
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updatePlayerName(playerName: string) {
    if (!appSyncClient) return
    if (!state.player?.token) return
    operation = 'mutation updatePlayerName'
    const result = await appSyncClient.mutate<MutationResult.UpdatePlayerName>({
      mutation: Mutations.updatePlayerName,
      variables: { playerName }
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updatePlayerIcon() {
    if (!appSyncClient) return
    if (!state.player?.token) return
    operation = 'mutation updatePlayerIcon'
    const result = await appSyncClient.mutate<MutationResult.UpdatePlayerIcon>({
      mutation: Mutations.updatePlayerIcon
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function deleteSession(sessionId: string) {
    if (!appSyncClient) return
    if (state.sessions.length === 1) return
    operation = 'mutation deleteSession'
    console.log(sessionId)
    const result = await appSyncClient.mutate<MutationResult.DeleteSession>({
      mutation: Mutations.deleteSession,
      variables: { sessionId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    const data = result.data?.deleteSession
    if (data) {
      const idx = state.sessions.findIndex(d => d.id === data.id)
      state.sessions.splice(idx, 1)
      const nextSession = state.sessions[idx === state.sessions.length ? idx - 1 : idx]
      await directSessionAccess(nextSession.id)
    }
  }

  async function deleteDashboard(sessionId: string, dashboardId: string) {
    if (!appSyncClient) return
    if (state.dashboards.length === 1) return
    operation = 'mutation deleteDashboard'
    console.log(sessionId)
    console.log(dashboardId)
    const result = await appSyncClient.mutate<MutationResult.DeleteDashboard>({
      mutation: Mutations.deleteDashboard,
      variables: { sessionId, dashboardId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    // subscriptionにて削除される
  }

  async function deletePlayer(playerId: string) {
    if (!appSyncClient) return
    operation = 'mutation deletePlayer'
    await appSyncClient.mutate<MutationResult.DeletePlayer>({
      mutation: Mutations.deletePlayer,
      variables: { playerId }
    })
    // subscriptionにて削除される
  }

  async function directSessionAccess(sessionId: string) {
    if (!appSyncClient) return
    state.players = []
    operation = 'query directSessionAccess'
    const result = await appSyncClient.mutate<QueryResult.DirectSessionAccess>({
      mutation: Queries.directSessionAccess,
      variables: { sessionId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    const data = result.data?.directSessionAccess
    if (data) {
      state.user = {
        id: data.user.id,
        token: data.user.token,
        name: data.user.name,
        iconToken: data.user.iconToken,
      }
      state.sessions = data.user.sessions.sort(sortId)
      state.session = {
        id: data.id,
        token: data.token,
        name: data.name,
        sessionType: data.sessionType,
        createdAt: data.createdAt,
        defaultDashboardId: data.defaultDashboardId
      }
      state.players = data.players.sort(sortId)
      state.dashboards = data.dashboards.sort(sortId)
      if (data.defaultDashboard) {
        if (data.defaultDashboard.id !== dashboardId) {
          await directDashboardAccess(dashboardId)
        } else {
          state.dashboard = {
            id: data.defaultDashboard.id,
            name: data.defaultDashboard.name,
            layout: JSON.parse(data.defaultDashboard.layout) as Layout
          }
        }
      } else {
        state.dashboard = null
      }
    }
  }

  async function directDashboardAccess(dashboardId: string) {
    if (!appSyncClient) return
    operation = 'query directDashboardAccess'
    const result = await appSyncClient.mutate<QueryResult.DirectDashboardAccess>({
      mutation: Queries.directDashboardAccess,
      variables: { dashboardId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    const data = result.data?.directDashboardAccess
    if (data) {
      state.dashboard = null
      setTimeout(() => {
        state.dashboard = {
          id: data.id,
          name: data.name,
          layout: JSON.parse(data.layout) as Layout
        }
      }, 0)
    }
  }

  async function directPlayerAccess() {
    if (!appSyncClient) return
    operation = 'query directPlayerAccess'
    const result = await appSyncClient.mutate<QueryResult.DirectPlayerAccess>({
      mutation: Queries.directPlayerAccess
    })
    console.log(JSON.stringify(result.data, null, 2))
    const data = result.data?.directPlayerAccess
    if (data) {
      const { id, token, iconToken, name, session } = data
      state.user = { id: session.user.id, name: session.user.name, iconToken: session.user.iconToken } as User
      state.sessions = []
      state.session = {
        id: session.id,
        token: session.token,
        name: session.name,
        sessionType: session.sessionType,
        createdAt: session.createdAt,
        defaultDashboardId: session.defaultDashboardId
      }
      state.players = session.players.sort(sortId)
      state.player = {
        id, token, iconToken, name
      }
      state.dashboards = session.dashboards
      state.dashboard = {
        id: session.defaultDashboard.id,
        name: session.defaultDashboard.name,
        layout: JSON.parse(session.defaultDashboard.layout) as Layout
      }
    }
  }

  async function generatePlayerResetCode(playerId: string): Promise<string | null> {
    if (!appSyncClient) return null
    try {
      operation = 'mutation generatePlayerResetCode'
      const result = await appSyncClient.mutate<MutationResult.GeneratePlayerResetCode>({
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

    const sessionId = state.session?.id || ''

    operation = 'mutation addPlayerByUser'
    await appSyncClient.mutate<MutationResult.AddPlayerByUser>({
      mutation: Mutations.addPlayerByUser,
      variables: { playerName, sessionId }
    })
    // Subscriptionによってstateに登録される
  }

  function onAddPlayerSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnAddPlayer>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnAddPlayer>({
      query: Subscriptions.onAddPlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnAddPlayer>) {
        const data = value.data?.onAddPlayer
        if (data && state.session?.id === sessionId) {
          state.players.push(data)
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onAddDashboardSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnAddDashboard>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnAddDashboard>({
      query: Subscriptions.onAddDashboard,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnAddDashboard>) {
        console.log(JSON.stringify(value.data, null, 2))
        const data = value.data?.onAddDashboard
        if (data && state.session?.id === sessionId) {
          state.dashboards.push({
            id: data.id,
            name: data.name
          })
          state.dashboard = {
            id: data.id,
            name: data.name,
            layout: JSON.parse(data.layout) as Layout
          }
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateUserSubscription(): Observable<FetchResult<SubscriptionResult.OnUpdateUser>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdateUser>({
      query: Subscriptions.onUpdateUser,
      variables: { userId: state.user?.id || '' },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdateUser>) {
        console.log(JSON.stringify(value.data, null, 2))
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

  function onUpdateSessionSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnUpdateSession>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdateSession>({
      query: Subscriptions.onUpdateSession,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdateSession>) {
        console.log(JSON.stringify(value.data, null, 2))
        const data = value.data?.onUpdateSession
        if (data) {
          if (state.session && state.session.id === sessionId) {
            state.session.name = data.name
            state.session.sessionType = data.sessionType
          }
          const session = state.sessions.find(s => s.id === data.id)
          if (session) {
            session.name = data.name
          }
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateDashboardSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnUpdateDashboard>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdateDashboard>({
      query: Subscriptions.onUpdateDashboard,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdateDashboard>) {
        console.log(JSON.stringify(value.data, null, 2))
        const data = value.data?.onUpdateDashboard
        if (data && state.session && state.session.id === sessionId) {
          const dashboard = state.dashboards.find(d => d.id === data.id)
          if (dashboard) {
            dashboard.name = data.name
          }
          if (state.dashboard && state.dashboard.id === data.id) {
            const dashboardTemp = state.dashboard
            state.dashboard = null
            dashboardTemp.name = data.name
            dashboardTemp.layout = JSON.parse(data.layout)
            setTimeout(() => {
              state.dashboard = dashboardTemp
            }, 0)
          }
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdatePlayerSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnUpdatePlayer>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdatePlayer>({
      query: Subscriptions.onUpdatePlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdatePlayer>) {
        console.log(JSON.stringify(value.data, null, 2))
        const data = value.data?.onUpdatePlayer
        if (data && state.session?.id === sessionId) {
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

  function onDeletePlayerSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnDeletePlayer>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnDeletePlayer>({
      query: Subscriptions.onDeletePlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnDeletePlayer>) {
        const data = value.data?.onDeletePlayer
        if (data && state.session?.id === sessionId) {
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

  function onDeleteDashboardSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnDeleteDashboard>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnDeleteDashboard>({
      query: Subscriptions.onDeleteDashboard,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnDeleteDashboard>) {
        const data = value.data?.onDeleteDashboard
        if (data && state.session?.id === sessionId) {
          const idx = state.dashboards.findIndex(p => p.id === data.id)
          state.dashboards.splice(idx, 1)
          const nextDashboard = state.dashboards[idx === state.dashboards.length ? idx - 1: idx]
          directDashboardAccess(nextDashboard.id).then()
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
    addDefaultSession,
    addDashboard,
    directSessionAccess,
    directDashboardAccess,
    addPlayerByUser,
    generatePlayerResetCode,
    updateUserName,
    updateUserIcon,
    updateSession,
    updateDashboardName,
    updateDashboardLayout,
    updatePlayerName,
    updatePlayerIcon,
    deleteSession,
    deleteDashboard,
    deletePlayer
  }
}

export type GraphQlStore = ReturnType<typeof useGraphQl>
export const GraphQlKey: InjectionKey<GraphQlStore> = Symbol('GraphQlStore') as any
