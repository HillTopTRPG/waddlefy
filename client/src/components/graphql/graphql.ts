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
  Session,
  Player,
  DirectPlayerAccessQueryResult,
  UserSignInResult,
  AddSessionResult,
  DirectSessionAccessQueryResult,
  UserSignUpResult,
  PlayerSignInResult,
  ResetPlayerPasswordResult,
  GeneratePlayerResetCodeResult,
  AddPlayerByUserResult,
  PlayerFirstSignInResult,
  AddPlayerByPlayerResult,
  OnAddPlayerResult,
  OnDeletePlayerResult,
  DeleteSessionResult,
  DeletePlayerResult,
  UpdatePlayerNameResult,
  UpdatePlayerIconResult,
  UpdateUserNameResult,
  UpdateUserIconResult,
  OnUpdatePlayerResult,
  OnUpdateUserResult,
  UpdateSessionResult,
  OnUpdateSessionResult
} from '@/components/graphql/schema'
import { Router } from 'vue-router'
import { Observable } from '@apollo/client'

// ローカル開発時のみ有効な値であり、流出しても問題ない情報
const DEFAULT_URL = 'https://eadjwjk4nnhybopeqn2altvcba.appsync-api.ap-northeast-1.amazonaws.com/graphql'
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
    const { token, secret, firstSession } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    localStorage.setItem('userId', userId)
    router.push({ name: 'UserMain1', params: { userToken: token, firstNav: firstSession.id } }).then()
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
      sessionName: DEFAULT_DASHBOARD_NAME,
      layout: DEFAULT_DASHBOARD_LAYOUT,
      metaData: DEFAULT_DASHBOARD_META_DATA
    }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const data = result.data?.userSignUp
  if (data) {
    const { token, secret, firstSession } = data
    localStorage.setItem(token, JSON.stringify({ secret }))
    localStorage.setItem('userId', userId)
    router.push({ name: 'UserMain1', params: { userToken: token, firstNav: firstSession.id } }).then()
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

async function callAddSession(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  name: string,
  layout: string,
  metaData: string,
  callback: (data: Session) => void
): Promise<void> {
  if (!appSyncClient) return
  const result = await appSyncClient.mutate<AddSessionResult>({
    mutation: Mutations.addSession,
    variables: { name, layout, metaData }
  })
  console.log(JSON.stringify(result.data, null, 2))
  const addSession = result.data?.addSession
  if (addSession) {
    callback({
      id: addSession.id,
      token: addSession.token,
      name: addSession.name,
      layout: addSession.layout,
      metaData: addSession.metaData,
      createdAt: addSession.createdAt,
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
  sessionId: string
) {
  // 状態
  const state = reactive<{
    ready: boolean
    user: User | null
    player: Player | null
    session: Session | null
    sessions: {id: string, name: string}[]
    players: Player[]
  }>({
    ready: false,
    user: null,
    player: null,
    sessions: [],
    session: null,
    players: []
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
      operation = 'query directPlayerAccess'
      const result = await appSyncClient.mutate<DirectPlayerAccessQueryResult>({
        mutation: Queries.directPlayerAccess
      })
      console.log(JSON.stringify(result.data, null, 2))
      const directPlayerAccess = result.data?.directPlayerAccess
      if (directPlayerAccess) {
        const { id, token, iconToken, name, session } = directPlayerAccess
        state.user = { id: session.user.id, name: session.user.name, iconToken: session.user.iconToken } as User
        state.sessions = []
        state.session = {
          id: session.id,
          token: session.token,
          name: session.name,
          layout: session.layout,
          metaData: session.metaData,
          createdAt: session.createdAt,
        }
        state.players = session.players.sort(sortId)
        state.player = {
          id, token, iconToken, name
        }
      }
    }

    onUpdateUserSubscription()

    const subscribedSessionId = []
    watch(() => state.session?.id, (sessionId) => {
      if (!sessionId) return
      if (subscribedSessionId.some(id => id === sessionId)) return
      subscribedSessionId.push(sessionId)
      onAddPlayerSubscription(sessionId)
      onUpdateSessionSubscription(sessionId)
      onUpdatePlayerSubscription(sessionId)
      onDeletePlayerSubscription(sessionId)
    }, { immediate: true })

    state.ready = true
  }
  initialize().then()

  async function addDefaultSession() {
    if (!appSyncClient) return
    operation = 'mutation addSession'
    await callAddSession(
      appSyncClient,
      DEFAULT_DASHBOARD_NAME,
      DEFAULT_DASHBOARD_LAYOUT,
      DEFAULT_DASHBOARD_META_DATA,
      session => {
        state.session = session
        state.sessions.push({ id: session.id, name: session.name })
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

  async function updateSession(name: string, layout: string, metaData: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    operation = 'mutation updateSession'
    await appSyncClient.mutate<UpdateSessionResult>({
      mutation: Mutations.updateSession,
      variables: {
        sessionId: state.session?.id || '',
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

  async function deleteSession(sessionId: string) {
    if (!appSyncClient) return
    operation = 'mutation deleteSession'
    const result = await appSyncClient.mutate<DeleteSessionResult>({
      mutation: Mutations.deleteSession,
      variables: { sessionId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    const data = result.data?.deleteSession
    if (data) {
      const idx = state.sessions.findIndex(d => d.id === data.id)
      state.sessions.splice(idx, 1)
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

  async function directSessionAccess(sessionId: string) {
    if (!appSyncClient) return
    state.session = null
    state.players = []
    operation = 'query directSessionAccess'
    const result = await appSyncClient.mutate<DirectSessionAccessQueryResult>({
      mutation: Queries.directSessionAccess,
      variables: { sessionId }
    })
    console.log(JSON.stringify(result.data, null, 2))
    const directSessionAccess = result.data?.directSessionAccess
    if (directSessionAccess) {
      state.user = {
        id: directSessionAccess.user.id,
        token: directSessionAccess.user.token,
        name: directSessionAccess.user.name,
        iconToken: directSessionAccess.user.iconToken,
      }
      state.sessions = directSessionAccess.user.sessions.sort(sortId)
      state.session = {
        id: directSessionAccess.id,
        token: directSessionAccess.token,
        name: directSessionAccess.name,
        layout: directSessionAccess.layout,
        metaData: directSessionAccess.metaData,
        createdAt: directSessionAccess.createdAt,
      }
      state.players = directSessionAccess.players.sort(sortId)
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

    const sessionId = state.session?.id || ''

    operation = 'mutation addPlayerByUser'
    await appSyncClient.mutate<AddPlayerByUserResult>({
      mutation: Mutations.addPlayerByUser,
      variables: { playerName, sessionId }
    })
    // Subscriptionによってstateに登録される
  }

  function onAddPlayerSubscription(sessionId: string): Observable<FetchResult<OnAddPlayerResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnAddPlayerResult>({
      query: Subscriptions.onAddPlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnAddPlayerResult>) {
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

  function onUpdateSessionSubscription(sessionId: string): Observable<FetchResult<OnUpdateSessionResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnUpdateSessionResult>({
      query: Subscriptions.onUpdateSession,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnUpdateSessionResult>) {
        const data = value.data?.onUpdateSession
        if (data && state.session && state.session.id === sessionId) {
          state.session.name = data.name
          state.session.layout = data.layout
          state.session.metaData = data.metaData
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdatePlayerSubscription(sessionId: string): Observable<FetchResult<OnUpdatePlayerResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnUpdatePlayerResult>({
      query: Subscriptions.onUpdatePlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnUpdatePlayerResult>) {
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

  function onDeletePlayerSubscription(sessionId: string): Observable<FetchResult<OnDeletePlayerResult>> {
    if (!appSyncClient) return
    const subscriber = appSyncClient.subscribe<OnDeletePlayerResult>({
      query: Subscriptions.onDeletePlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<OnDeletePlayerResult>) {
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

  return {
    state,
    addDefaultSession,
    directSessionAccess,
    addPlayerByUser,
    generatePlayerResetCode,
    updateUserName,
    updateUserIcon,
    updateSession,
    updatePlayerName,
    updatePlayerIcon,
    deleteSession,
    deletePlayer
  }
}

export type GraphQlStore = ReturnType<typeof useGraphQl>
export const GraphQlKey: InjectionKey<GraphQlStore> = Symbol('GraphQlStore') as any
