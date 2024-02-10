import {
  AbstractDashboard,
  Dashboard,
  DashboardOption,
  MutationResult,
  Mutations,
  Player,
  PlayerForPlayer,
  Queries,
  QueryResult,
  Session,
  SessionData,
  SessionForUser,
  SubscriptionResult,
  Subscriptions,
  User
} from '@/components/graphql/schema'
import { Layout } from '@/components/panes'
import {
  Nechronica,
  NechronicaCopiableWrap,
  NechronicaType,
  NechronicaWrap
} from '@/components/panes/Nechronica/nechronica'
import { clone } from '@/components/panes/PrimaryDataUtility'
import { ShinobiGami, ShinobigamiEmotion, getCharacterDiffMessages } from '@/components/panes/Shinobigami/shinobigami'
import router from '@/router'
import { Observable } from '@apollo/client'
import { ApolloClient, ApolloLink, FetchResult, InMemoryCache, NormalizedCacheObject } from '@apollo/client/core'
import { AuthOptions, createAuthLink } from 'aws-appsync-auth-link'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'
import { omit } from 'lodash'
import { InjectionKey, reactive, watch } from 'vue'
import { Router } from 'vue-router'
import { uuid } from 'vue-uuid'

// ローカル開発時のみ有効な値
const DEFAULT_URL = (import.meta.env as any).VITE_GRAPHQL_URL
const DEFAULT_REGION = (import.meta.env as any).VITE_GRAPHQL_REGION

export const DEFAULT_SESSION_NAME = 'No title session'
export const DEFAULT_DASHBOARD_NAME = 'No title page'
const DEFAULT_SESSION_TYPE = 'init'

export type CharacterWrap = {
  id: string
  player: string
  viewPass: string
  character: ShinobiGami
}

export function makeGraphQlClient(endPointUrl: string, region: string, getAuthToken: () => string) {
  const auth: AuthOptions = {
    type: 'AWS_LAMBDA',
    token: getAuthToken
  }
  try {
    const link = ApolloLink.from([
      createAuthLink({ url: endPointUrl, region, auth }),
      createSubscriptionHandshakeLink({ url: endPointUrl, region, auth })
    ])
    return new ApolloClient({
      link,
      cache: new InMemoryCache()
    })
  } catch (err) {
    console.error(
      JSON.stringify(
        {
          message: 'GraphQLへの接続に失敗しました。',
          endPointUrl,
          region
        },
        null,
        2
      )
    )
    throw Error('GraphQLへの接続に失敗しました。')
  }
}

function sortId(d: { id: string }, e: { id: string }): number {
  if (d.id < e.id) return -1
  return d.id > e.id ? 1 : 0
}

async function addDefaultSessionForSignIn(appSyncClient: ApolloClient<NormalizedCacheObject>): Promise<Session> {
  return new Promise(resolve => {
    callAddSession(appSyncClient, DEFAULT_SESSION_NAME, DEFAULT_SESSION_TYPE, session => {
      resolve(session)
    })
  })
}

export async function userSignIn(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  userId: string,
  userPassword: string,
  graphql: string,
  region: string
): Promise<void> {
  window.logger.info('Mutations.userSignIn')
  const result = await appSyncClient.mutate<MutationResult.UserSignIn>({
    mutation: Mutations.userSignIn,
    variables: { userId, userPassword }
  })
  window.logger.info(JSON.stringify(result.data, null, 2))
  const data = result.data?.userSignIn
  if (!data) return
  const { token, secret } = data
  const { firstSession } = data
  localStorage.setItem(token, JSON.stringify({ secret }))
  localStorage.setItem('userId', userId)
  let sessionId: string = firstSession?.id
  let dashboardId = firstSession?.defaultDashboardId
  if (!firstSession) {
    const appSyncClientForCreateSession = makeGraphQlClient(graphql, region, () => `u/${token}/${secret || ''}`)
    const { id, defaultDashboardId } = await addDefaultSessionForSignIn(appSyncClientForCreateSession)
    sessionId = id
    dashboardId = defaultDashboardId
  }
  if (dashboardId) {
    router.push({ name: 'UserMain2', params: { userToken: token, sessionId, dashboardId } }).then()
  } else {
    router.push({ name: 'UserMain1', params: { userToken: token, sessionId } }).then()
  }
}

export async function userSignUp(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  userId: string,
  userName: string,
  userPassword: string
): Promise<void> {
  window.logger.info('Mutations.userSignUp')
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
  window.logger.info(JSON.stringify(result.data, null, 2))
  const data = result.data?.userSignUp
  if (!data) return
  const { token, secret, firstSession } = data
  localStorage.setItem(token, JSON.stringify({ secret }))
  localStorage.setItem('userId', userId)
  router.push({ name: 'UserMain1', params: { userToken: token, sessionId: firstSession.id } }).then()
}

export async function playerSignUp(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerName: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  window.logger.info('Mutations.addPlayerByPlayer')
  const result = await appSyncClient.mutate<MutationResult.AddPlayerByPlayer>({
    mutation: Mutations.addPlayerByPlayer,
    variables: { playerName, playerPassword }
  })
  window.logger.info(JSON.stringify(result.data, null, 2))
  const data = result.data?.addPlayerByPlayer
  if (!data) return
  const { id, token, secret, sessionId } = data
  const player = JSON.stringify(omit(data, 'token', 'secret', 'session'))
  localStorage.setItem(token, JSON.stringify({ secret }))

  window.logger.info('Mutations.notify')
  await appSyncClient.mutate<MutationResult.Notify>({
    mutation: Mutations.notify,
    variables: { sessionId, from: id, type: 'add-player', data: player }
  })

  router.push({ name: 'PlayerMain0', params: { playerToken: data.token } }).then()
}

export async function playerFirstSignIn(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerId: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  window.logger.info('Mutations.playerFirstSignIn')
  const result = await appSyncClient.mutate<MutationResult.PlayerFirstSignIn>({
    mutation: Mutations.playerFirstSignIn,
    variables: { playerId, playerPassword }
  })
  window.logger.info(JSON.stringify(result.data, null, 2))
  const data = result.data?.playerFirstSignIn
  if (!data) return
  const { token, secret } = data
  localStorage.setItem(token, JSON.stringify({ secret }))
  router.push({ name: 'PlayerMain0', params: { playerToken: token } }).then()
}

export async function playerSignIn(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerId: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  window.logger.info('Mutations.playerSignIn')
  const result = await appSyncClient.mutate<MutationResult.PlayerSignIn>({
    mutation: Mutations.playerSignIn,
    variables: { playerId, playerPassword }
  })
  window.logger.info(JSON.stringify(result.data, null, 2))
  const data = result.data?.playerSignIn
  if (!data) return
  const { token, secret } = data
  localStorage.setItem(token, JSON.stringify({ secret }))
  router.push({ name: 'PlayerMain0', params: { playerToken: token } }).then()
}

export async function resetPlayerPassword(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  playerId: string,
  resetCode: string,
  playerPassword: string,
  router: Router
): Promise<void> {
  window.logger.info('Mutations.resetPlayerPassword')
  const result = await appSyncClient.mutate<MutationResult.ResetPlayerPassword>({
    mutation: Mutations.resetPlayerPassword,
    variables: { playerId, resetCode, playerPassword }
  })
  window.logger.info(JSON.stringify(result.data, null, 2))
  const data = result.data?.resetPlayerPassword
  if (!data) return
  const { token, secret } = data
  localStorage.setItem(token, JSON.stringify({ secret }))
  router.push({ name: 'PlayerMain0', params: { playerToken: token } }).then()
}

async function callAddSession(
  appSyncClient: ApolloClient<NormalizedCacheObject>,
  name: string,
  sessionType: string,
  callback: (data: Session) => void
): Promise<void> {
  if (!appSyncClient) return
  window.logger.info('Mutations.addSession')
  const result = await appSyncClient.mutate<MutationResult.AddSession>({
    mutation: Mutations.addSession,
    variables: { name, sessionType }
  })
  window.logger.info(JSON.stringify(result.data, null, 2))
  const data = result.data?.addSession
  if (!data) return
  callback({
    id: data.id,
    token: data.token,
    name: data.name,
    sessionType: data.sessionType,
    createdAt: data.createdAt,
    defaultDashboardId: data.defaultDashboardId
  })
}

export async function fetchGraphQlConnectionInfo() {
  let apiInfoJson: { graphql: string; region: string } | null = null

  try {
    const apiInfoResult = await fetch('/api')
    apiInfoJson = await apiInfoResult.json()
  } catch (error) {
    window.logger.warn('/apiで情報が取得できませんでした')
    window.logger.warn('ローカル開発中ですね？')
  }

  if (!apiInfoJson) {
    apiInfoJson = {
      graphql: DEFAULT_URL,
      region: DEFAULT_REGION
    }
  }

  window.logger.info(JSON.stringify(apiInfoJson, null, 2))
  return apiInfoJson
}

export type Notification = {
  id: string
  view: boolean
  color: string
  icon: string
  text: string
}

export default function useGraphQl(userToken: string, playerToken: string, sessionId: string, dashboardId: string) {
  // 状態
  const state = reactive<{
    ready: boolean
    user: User | null
    player: Player | null
    session: Session | null
    sessions: { id: string; name: string }[]
    players: Player[]
    dashboards: AbstractDashboard[]
    dashboard: Dashboard | null
    sessionDataList: SessionData<any>[]
    notifications: Notification[]
    dashboardCache: Map<string, Dashboard>
  }>({
    ready: false,
    user: null,
    player: null,
    sessions: [],
    session: null,
    players: [],
    dashboards: [],
    dashboard: null,
    sessionDataList: [],
    notifications: [],
    dashboardCache: new Map<string, Dashboard>()
  })

  // ロジック
  let appSyncClient: ApolloClient<NormalizedCacheObject> | null = null

  let operation: string = ''

  function getAuthToken(): string {
    let authorize = 'waddlefy'
    switch (operation) {
      case 'query directSessionAccess':
      case 'mutation addPlayerByUser':
      case 'mutation addSession':
      case 'mutation addDashboard':
      case 'mutation deleteSession':
      case 'mutation updateUserName':
      case 'mutation updateUserIcon':
      case 'mutation updateSession':
      case 'mutation deletePlayer':
      case 'mutation deleteSessionData':
      case 'mutation generatePlayerResetCode': {
        const userSecret = JSON.parse(localStorage.getItem(userToken) || '{}')?.secret
        authorize = `u/${userToken}/${userSecret || ''}`
        break
      }
      case 'query directPlayerAccess': {
        const playerSecret = JSON.parse(localStorage.getItem(playerToken) || '{}')?.secret
        authorize = `p/${playerToken}/${playerSecret || ''}`
        break
      }
      case 'mutation updatePlayerName':
      case 'mutation updatePlayerIcon': {
        if (state.user?.token) {
          const userSecret = JSON.parse(localStorage.getItem(userToken) || '{}')?.secret
          authorize = `u/${userToken}/${userSecret || ''}`
        } else {
          const playerSecret = JSON.parse(localStorage.getItem(playerToken) || '{}')?.secret
          authorize = `p/${playerToken}/${playerSecret || ''}`
        }
        break
      }
      case 'mutation addSessionData':
      case 'mutation updateSessionData':
      case 'mutation notify':
      case 'query directDashboardAccess':
        authorize = `s/${state.session?.token || ''}`
        break
      default:
    }
    // logger.info(JSON.stringify({ operation, authorize }))
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

    const subscribedSessionId: string[] = []
    watch(
      () => state.session?.id,
      sessionId => {
        if (!sessionId) return
        if (subscribedSessionId.some(id => id === sessionId)) return
        subscribedSessionId.push(sessionId)
        onAddPlayerSubscription(sessionId)
        onAddDashboardSubscription(sessionId)
        onAddSessionDataSubscription(sessionId)
        onUpdateSessionSubscription(sessionId)
        onUpdateDashboardSubscription(sessionId)
        onUpdateSessionDataSubscription(sessionId)
        onUpdatePlayerSubscription(sessionId)
        onDeletePlayerSubscription(sessionId)
        onDeleteSessionDataSubscription(sessionId)
        onDeleteDashboardSubscription(sessionId)
        onNotifySubscription(sessionId)
      },
      { immediate: true }
    )

    state.ready = true
  }
  initialize().then()

  async function addDefaultSession(name?: string): Promise<void> {
    if (!appSyncClient) return
    operation = 'mutation addSession'
    await callAddSession(appSyncClient, name || DEFAULT_SESSION_NAME, DEFAULT_SESSION_TYPE, session => {
      state.session = session
      state.sessions.push({ id: session.id, name: session.name })
      state.players = []
      state.dashboards = []
      state.dashboard = null
      state.sessionDataList = []
    })
  }

  async function addDashboard(dashboardName: string, layout: Layout, option: DashboardOption): Promise<void> {
    if (!appSyncClient) return
    window.logger.info('Mutations.addDashboard')
    operation = 'mutation addDashboard'
    const result = await appSyncClient.mutate<MutationResult.AddDashboard>({
      mutation: Mutations.addDashboard,
      variables: {
        dashboardName: dashboardName || DEFAULT_DASHBOARD_NAME,
        layout: JSON.stringify(layout),
        option: JSON.stringify(option),
        sessionId: state.session?.id || ''
      }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateUserName(userName: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    window.logger.info('Mutations.updateUserName')
    operation = 'mutation updateUserName'
    const result = await appSyncClient.mutate<MutationResult.UpdateUserName>({
      mutation: Mutations.updateUserName,
      variables: { userId: state.user.id, userName }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateUserIcon() {
    if (!appSyncClient) return
    if (!state.user?.token) return
    window.logger.info('Mutations.updateUserIcon')
    operation = 'mutation updateUserIcon'
    const result = await appSyncClient.mutate<MutationResult.UpdateUserIcon>({
      mutation: Mutations.updateUserIcon,
      variables: { userId: state.user.id }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateSession(name: string, sessionType: string, defaultDashboardId: string) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    window.logger.info('Mutations.updateSession')
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
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateSessionDataHelper(id: string, data: string) {
    if (!appSyncClient) return
    window.logger.info('Mutations.updateSessionData')
    operation = 'mutation updateSessionData'
    const result = await appSyncClient.mutate<MutationResult.UpdateSessionData>({
      mutation: Mutations.updateSessionData,
      variables: {
        id,
        sessionId: state.session?.id || '',
        data
      }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateTargetConfig(configId: string, owner: string, target: string, type: string, data: any) {
    await updateSessionDataHelper(
      configId,
      JSON.stringify({
        owner,
        target,
        type,
        data
      })
    )
  }

  async function updateShinobigamiCharacter(
    characterId: string,
    playerId: string,
    viewPass: string,
    data: ShinobiGami
  ) {
    await updateSessionDataHelper(
      characterId,
      JSON.stringify({
        player: playerId,
        viewPass,
        character: data
      })
    )
  }

  async function updateNechronicaCharacter(characterId: string, wrapObj: NechronicaWrap) {
    await updateSessionDataHelper(characterId, JSON.stringify(wrapObj))
  }

  async function updateNechronicaCharacterHelper(characterId: string, wrapFunc: (cloned: NechronicaWrap) => void) {
    const character = state.sessionDataList.find(sd => sd.id === characterId)
    if (!character) return
    const cloned = clone<NechronicaWrap>(character.data)!
    wrapFunc(cloned)
    if (JSON.stringify(cloned) === JSON.stringify(character.data)) return
    await updateNechronicaCharacter(characterId, cloned)
  }

  async function updateShinobigamiHandoutSessionMemo(sessionMemoId: string, handoutId: string, text: string) {
    await updateSessionDataHelper(
      sessionMemoId,
      JSON.stringify({
        handoutId,
        text
      })
    )
  }

  async function updateShinobigamiHandoutPrivateMemo(privateMemoId: string, handoutId: string, text: string) {
    const isUserControl = Boolean(state.user?.token)
    await updateSessionDataHelper(
      privateMemoId,
      JSON.stringify({
        ownerType: isUserControl ? 'user' : 'player',
        ownerId: isUserControl ? null : state.player?.id,
        handoutId,
        text
      })
    )
  }

  async function updateShinobigamiHandout(
    handoutId: string,
    name: string,
    intro: string,
    objective: string,
    secret: string,
    person: string,
    published: boolean,
    knowSelfSecret: boolean
  ) {
    await updateSessionDataHelper(
      handoutId,
      JSON.stringify({
        name,
        intro,
        objective,
        secret,
        person,
        published,
        knowSelfSecret
      })
    )
  }

  async function updateShinobigamiHandoutRelation(
    relationId: string,
    ownerId: string,
    targetId: string,
    type: 'location' | 'secret' | ShinobigamiEmotion
  ) {
    await updateSessionDataHelper(
      relationId,
      JSON.stringify({
        ownerId,
        targetId,
        type
      })
    )
  }

  async function updateShinobigamiEnigma(
    enigmaId: string,
    name: string,
    threat: number,
    disableJudgement: string,
    camouflage: string,
    entityName: string,
    effect: string,
    bind: string,
    used: boolean,
    disabled: boolean
  ) {
    await updateSessionDataHelper(
      enigmaId,
      JSON.stringify({
        name,
        threat,
        disableJudgement,
        camouflage,
        entityName,
        effect,
        bind,
        used,
        disabled
      })
    )
  }

  async function updateShinobigamiPersona(
    personaId: string,
    name: string,
    effect: string,
    bind: string,
    leaked: boolean
  ) {
    await updateSessionDataHelper(
      personaId,
      JSON.stringify({
        name,
        effect,
        bind,
        leaked
      })
    )
  }

  async function updateShinobigamiPrize(
    prizeId: string,
    name: string,
    description: string,
    secret: string,
    owner: string,
    readableList: string[],
    leakedList: string[]
  ) {
    await updateSessionDataHelper(
      prizeId,
      JSON.stringify({
        name,
        description,
        secret,
        owner,
        readableList,
        leakedList
      })
    )
  }

  async function updateDashboardHelper(name: string | null, layout: Layout | null, option: DashboardOption | null) {
    if (!appSyncClient) return
    if (!state.user?.token) return
    window.logger.info('Mutations.updateDashboard')
    operation = 'mutation updateDashboard'
    const result = await appSyncClient.mutate<MutationResult.UpdateDashboard>({
      mutation: Mutations.updateDashboard,
      variables: {
        sessionId: state.session?.id || '',
        dashboardId: state.dashboard?.id || '',
        name: name || state.dashboard?.name || '',
        layout: JSON.stringify(layout || state.dashboard?.layout || {}),
        option: JSON.stringify(option || state.dashboard?.option || {})
      }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updateDashboardName(name: string) {
    await updateDashboardHelper(name, null, null)
  }

  async function updateDashboardLayout(layout: Layout) {
    await updateDashboardHelper(null, layout, null)
  }

  async function updateDashboardOption(option: DashboardOption) {
    await updateDashboardHelper(null, null, option)
  }

  async function updatePlayerName(playerId: string, playerName: string) {
    if (!appSyncClient) return
    window.logger.info('Mutations.updatePlayerName')
    operation = 'mutation updatePlayerName'
    const result = await appSyncClient.mutate<MutationResult.UpdatePlayerName>({
      mutation: Mutations.updatePlayerName,
      variables: { playerId, playerName }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function updatePlayerIcon(playerId: string) {
    if (!appSyncClient) return
    window.logger.info('Mutations.updatePlayerIcon')
    operation = 'mutation updatePlayerIcon'
    window.logger.info('Mutations.updatePlayerIcon')
    const result = await appSyncClient.mutate<MutationResult.UpdatePlayerIcon>({
      mutation: Mutations.updatePlayerIcon,
      variables: { playerId }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて更新される
  }

  async function deleteSession(sessionId: string) {
    if (!appSyncClient) return
    if (state.sessions.length === 1) return
    window.logger.info('Mutations.deleteSession')
    operation = 'mutation deleteSession'
    const result = await appSyncClient.mutate<MutationResult.DeleteSession>({
      mutation: Mutations.deleteSession,
      variables: { sessionId }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    const data = result.data?.deleteSession
    if (!data) return
    const idx = state.sessions.findIndex(d => d.id === data.id)
    state.sessions.splice(idx, 1)
    const nextSession = state.sessions[idx === state.sessions.length ? idx - 1 : idx]
    await directSessionAccess(nextSession.id)
  }

  async function deleteDashboard(sessionId: string, dashboardId: string) {
    if (!appSyncClient) return
    if (state.dashboards.length === 1) return
    window.logger.info('Mutations.deleteDashboard')
    operation = 'mutation deleteDashboard'
    const result = await appSyncClient.mutate<MutationResult.DeleteDashboard>({
      mutation: Mutations.deleteDashboard,
      variables: { sessionId, dashboardId }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    // subscriptionにて削除される
  }

  async function deletePlayer(playerId: string) {
    if (!appSyncClient) return
    window.logger.info('Mutations.deletePlayer')
    operation = 'mutation deletePlayer'
    await appSyncClient.mutate<MutationResult.DeletePlayer>({
      mutation: Mutations.deletePlayer,
      variables: { playerId }
    })
    // subscriptionにて削除される
  }

  async function deleteSessionData(sessionDataId: string) {
    if (!appSyncClient) return
    window.logger.info('Mutations.deleteSessionData')
    operation = 'mutation deleteSessionData'
    await appSyncClient.mutate<MutationResult.DeleteSessionData>({
      mutation: Mutations.deleteSessionData,
      variables: { sessionDataId }
    })
    // subscriptionにて削除される
  }

  async function directSessionAccess(sessionId: string) {
    if (!appSyncClient) return
    state.players = []
    operation = 'query directSessionAccess'
    let data: SessionForUser | undefined = undefined

    window.logger.info('Queries.directSessionAccess')
    async function requestDirectSessionAccess(useSessionId: string) {
      const result = await appSyncClient!.mutate<QueryResult.DirectSessionAccess>({
        mutation: Queries.directSessionAccess,
        variables: { sessionId: useSessionId }
      })
      window.logger.info(JSON.stringify(result.data, null, 2))
      return result.data?.directSessionAccess
    }
    try {
      data = await requestDirectSessionAccess(sessionId)
    } catch (err) {
      await router.replace({ name: 'Home' })
      return
    }
    if (!data) {
      const { id } = await addDefaultSessionForSignIn(appSyncClient)
      await requestDirectSessionAccess(id)
    }
    if (!data) return

    state.user = {
      id: data.user.id,
      token: data.user.token,
      name: data.user.name,
      iconToken: data.user.iconToken
    }
    state.sessions = data.user.sessions.sort(sortId)
    state.session = {
      id: data.id,
      signUpToken: data.signUpToken,
      token: data.token,
      name: data.name,
      sessionType: data.sessionType,
      createdAt: data.createdAt,
      defaultDashboardId: data.defaultDashboardId
    }
    state.players = data.players.sort(sortId)
    state.dashboards = data.dashboards
      .map((d: AbstractDashboard) => {
        d.option = JSON.parse(d.option.toString()) as DashboardOption
        return d
      })
      .sort(sortId)
    if (data.defaultDashboard) {
      if (data.defaultDashboard.id === dashboardId) {
        state.dashboard = {
          id: data.defaultDashboard.id,
          name: data.defaultDashboard.name,
          layout: JSON.parse(data.defaultDashboard.layout) as Layout,
          option: JSON.parse(data.defaultDashboard.option) as DashboardOption
        }
        state.dashboardCache.set(state.dashboard.id, clone<Dashboard>(state.dashboard)!)
      } else {
        await directDashboardAccess(dashboardId || data.defaultDashboard.id)
      }
    } else {
      state.dashboard = null
    }
    state.sessionDataList = data.sessionDataList.sort(sortId).map((d: SessionData<any>) => {
      const raw = JSON.parse(d.data)
      return {
        id: d.id,
        type: d.type,
        sessionId: d.sessionId,
        data: {
          id: d.id,
          ...raw
        }
      }
    })
  }

  async function changeDashboard(dashboardId: string) {
    const newDashboard = state.dashboardCache.get(dashboardId)
    if (state.dashboard && newDashboard) {
      state.dashboard.id = newDashboard.id
      state.dashboard.name = newDashboard.name
      state.dashboard.option = newDashboard.option
      state.dashboard.layout = null
      setTimeout(() => {
        if (state.dashboard) {
          state.dashboard.layout = newDashboard.layout
        }
      })
    } else {
      await directDashboardAccess(dashboardId)
    }
  }

  async function directDashboardAccess(dashboardId: string) {
    if (!appSyncClient) return
    window.logger.info('Queries.directDashboardAccess')
    operation = 'query directDashboardAccess'
    const result = await appSyncClient.mutate<QueryResult.DirectDashboardAccess>({
      mutation: Queries.directDashboardAccess,
      variables: { dashboardId }
    })
    window.logger.info(JSON.stringify(result.data, null, 2))
    const data = result.data?.directDashboardAccess
    if (!data) return
    state.dashboard = null
    setTimeout(() => {
      state.dashboard = {
        id: data.id,
        name: data.name,
        layout: JSON.parse(data.layout) as Layout,
        option: JSON.parse(data.option) as DashboardOption
      }
      state.dashboardCache.set(state.dashboard.id, clone<Dashboard>(state.dashboard)!)
    }, 0)
  }

  async function directPlayerAccess() {
    if (!appSyncClient) return
    window.logger.info('Queries.directPlayerAccess')
    operation = 'query directPlayerAccess'
    let data: PlayerForPlayer | undefined = undefined

    try {
      const result = await appSyncClient.mutate<QueryResult.DirectPlayerAccess>({
        mutation: Queries.directPlayerAccess
      })
      window.logger.info(JSON.stringify(result.data, null, 2))
      data = result.data?.directPlayerAccess
    } catch (err) {
      await router.replace({ name: 'Home' })
    }

    if (!data) return

    const { id, token, iconToken, name, session } = data
    state.user = {
      id: session.user.id,
      name: session.user.name,
      iconToken: session.user.iconToken
    } as User
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
      id,
      token,
      iconToken,
      name
    }
    state.dashboards = session.dashboards
      .map((d: AbstractDashboard) => {
        d.option = JSON.parse(d.option.toString()) as DashboardOption
        return d
      })
      .sort(sortId)
    state.dashboard = {
      id: session.defaultDashboard.id,
      name: session.defaultDashboard.name,
      layout: JSON.parse(session.defaultDashboard.layout) as Layout,
      option: JSON.parse(session.defaultDashboard.option) as DashboardOption
    }
    state.dashboardCache.set(state.dashboard.id, clone<Dashboard>(state.dashboard)!)
    state.sessionDataList = session.sessionDataList.sort(sortId).map((d: SessionData<any>) => {
      const raw = JSON.parse(d.data)
      return {
        id: d.id,
        type: d.type,
        sessionId: d.sessionId,
        data: {
          id: d.id,
          ...raw
        }
      }
    })
  }

  async function generatePlayerResetCode(playerId: string): Promise<string | null> {
    if (!appSyncClient) return null
    try {
      window.logger.info('Mutations.generatePlayerResetCode')
      operation = 'mutation generatePlayerResetCode'
      const result = await appSyncClient.mutate<MutationResult.GeneratePlayerResetCode>({
        mutation: Mutations.generatePlayerResetCode,
        variables: { playerId }
      })
      window.logger.info(JSON.stringify(result.data, null, 2))
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

    window.logger.info('Mutations.addPlayerByUser')
    operation = 'mutation addPlayerByUser'
    await appSyncClient.mutate<MutationResult.AddPlayerByUser>({
      mutation: Mutations.addPlayerByUser,
      variables: { playerName, sessionId }
    })
    // Subscriptionによってstateに登録される
  }

  async function sendNotify(type: string, data: any) {
    if (!appSyncClient) return

    const from = state.user?.token ? 'user' : state.player?.id || ''

    window.logger.info('Mutations.notify')
    operation = 'mutation notify'
    await appSyncClient.mutate<MutationResult.Notify>({
      mutation: Mutations.notify,
      variables: { sessionId: state.session?.id || '', from, type, data: JSON.stringify(data) }
    })
  }

  async function addSessionDataHelper(type: string, data: string) {
    if (!appSyncClient) return

    window.logger.info('Mutations.addSessionData')
    operation = 'mutation addSessionData'
    await appSyncClient.mutate<MutationResult.AddSessionData>({
      mutation: Mutations.addSessionData,
      variables: { sessionId: state.session?.id || '', type, data }
    })
  }

  async function addTargetConfig(owner: string, target: string, type: string, data: any) {
    await addSessionDataHelper('target-config', JSON.stringify({ owner, target, type, data }))
  }

  async function addShinobigamiCharacter(perspective: string, dataObj: ShinobiGami, password: string): Promise<void> {
    const characterWrap: Omit<CharacterWrap, 'id'> = {
      player: perspective || 'user',
      viewPass: password,
      character: dataObj
    }
    await addSessionDataHelper('shinobigami-character', JSON.stringify(characterWrap))
    // Subscriptionによってstateに登録される
  }

  async function addNechronicaCharacter(
    perspective: string,
    type: NechronicaType,
    dataObj: Nechronica,
    copy: Partial<NechronicaCopiableWrap>
  ): Promise<void> {
    const characterWrap: NechronicaWrap = {
      player: perspective || 'user',
      type,
      position: 0,
      actionValue: type === 'legion' ? 8 : 0,
      health: type === 'legion' ? 5 : 0,
      hide: type !== 'doll',
      maxActionValue: type === 'legion' ? 8 : 0,
      ...copy,
      backboneStack: false,
      character: dataObj
    }
    await addSessionDataHelper('nechronica-character', JSON.stringify(characterWrap))
    // Subscriptionによってstateに登録される
  }

  async function addNechronicaSingleton(dataObj: any): Promise<void> {
    await addSessionDataHelper('nechronica-singleton', JSON.stringify(dataObj))
    // Subscriptionによってstateに登録される
  }

  async function addShinobigamiHandoutSessionMemo(handoutId: string, text: string): Promise<void> {
    await addSessionDataHelper(
      'shinobigami-handout-session-memo',
      JSON.stringify({
        handoutId,
        text
      })
    )
    // Subscriptionによってstateに登録される
  }

  async function addShinobigamiHandoutPrivateMemo(handoutId: string, text: string): Promise<void> {
    const isUserControl = Boolean(state.user?.token)
    await addSessionDataHelper(
      'shinobigami-handout-private-memo',
      JSON.stringify({
        ownerType: isUserControl ? 'user' : 'player',
        ownerId: isUserControl ? null : state.player?.id,
        handoutId,
        text
      })
    )
    // Subscriptionによってstateに登録される
  }

  async function addShinobigamiHandout(
    name?: string,
    intro?: string,
    objective?: string,
    secret?: string,
    published?: boolean
  ): Promise<void> {
    const type = 'shinobigami-handout'
    const next = state.sessionDataList.filter(sd => sd.type === type).length + 1
    await addSessionDataHelper(
      type,
      JSON.stringify({
        name: name || `PC${next}`,
        intro: intro || '',
        objective: objective || '',
        secret: secret || '',
        person: '',
        published: published || false,
        knowSelfSecret: true
      })
    )
    // Subscriptionによってstateに登録される
  }

  async function addShinobigamiHandoutRelation(
    ownerId: string,
    targetId: string,
    type: 'location' | 'secret' | ShinobigamiEmotion | string
  ): Promise<void> {
    await addSessionDataHelper(
      'shinobigami-handout-relation',
      JSON.stringify({
        ownerId,
        targetId,
        type
      })
    )
    // Subscriptionによってstateに登録される
  }

  async function addShinobigamiEnigma(name?: string, power?: string, menace?: string, notes?: string): Promise<void> {
    const type = 'shinobigami-enigma'
    const next = state.sessionDataList.filter(sd => sd.type === type).length + 1
    let threat: number = 1
    if (menace) {
      const menaceNum = parseInt(menace, 10)
      if (!isNaN(menaceNum)) {
        threat = menaceNum
      }
    }
    await addSessionDataHelper(
      type,
      JSON.stringify({
        name: name || `エニグマ${next}`,
        threat,
        disableJudgement: '',
        camouflage: '',
        entityName: power || '',
        effect: notes || '',
        bind: '',
        used: false,
        disabled: false
      })
    )
    // Subscriptionによってstateに登録される
  }

  async function addShinobigamiPersona(): Promise<void> {
    const type = 'shinobigami-persona'
    const next = state.sessionDataList.filter(sd => sd.type === type).length + 1
    await addSessionDataHelper(
      type,
      JSON.stringify({
        name: `ペルソナ${next}`,
        effect: '',
        bind: '',
        leaked: false
      })
    )
    // Subscriptionによってstateに登録される
  }

  async function addShinobigamiPrize(name?: string): Promise<void> {
    const type = 'shinobigami-prize'
    const next = state.sessionDataList.filter(sd => sd.type === type).length + 1
    await addSessionDataHelper(
      type,
      JSON.stringify({
        name: name || `プライズ${next}`,
        description: '',
        secret: '',
        owner: '',
        readableList: [],
        leakedList: []
      })
    )
    // Subscriptionによってstateに登録される
  }

  function onAddPlayerSubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnAddPlayer>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnAddPlayer>({
      query: Subscriptions.onAddPlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnAddPlayer>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
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

  function onAddDashboardSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnAddDashboard>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnAddDashboard>({
      query: Subscriptions.onAddDashboard,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnAddDashboard>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onAddDashboard
        if (data && state.session?.id === sessionId) {
          const dashboard: AbstractDashboard = {
            id: data.id,
            name: data.name,
            option: JSON.parse(data.option) as DashboardOption
          }
          state.dashboards.push(dashboard)
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onAddSessionDataSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnAddSessionData>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnAddSessionData>({
      query: Subscriptions.onAddSessionData,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnAddSessionData>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onAddSessionData
        if (data && state.session?.id === sessionId) {
          const raw = JSON.parse(data.data)
          state.sessionDataList.push({
            id: data.id,
            type: data.type,
            sessionId: data.sessionId,
            data: {
              id: data.id,
              ...raw
            }
          })
          const dataType = data.type
          if (dataType === 'shinobigami-handout-session-memo') {
            const handout = state.sessionDataList.find(sd => sd.id === raw.handoutId)
            const handoutName = handout?.data.name || ''
            addNotification(`${handoutName}の共有メモが更新されました`, 'mdi-pencil-circle-outline', 'lime-lighten-4')
          }
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateUserSubscription(): Observable<FetchResult<SubscriptionResult.OnUpdateUser>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdateUser>({
      query: Subscriptions.onUpdateUser,
      variables: { userId: state.user?.id || '' },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdateUser>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onUpdateUser
        if (!data || !state.user) return
        state.user.name = data.name
        state.user.iconToken = data.iconToken
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateSessionSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnUpdateSession>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdateSession>({
      query: Subscriptions.onUpdateSession,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdateSession>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onUpdateSession
        if (!data) return
        if (state.session && state.session.id === sessionId) {
          state.session.name = data.name
          state.session.sessionType = data.sessionType
          state.session.defaultDashboardId = data.defaultDashboardId
        }
        const session = state.sessions.find(s => s.id === data.id)
        if (session) {
          session.name = data.name
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateDashboardSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnUpdateDashboard>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdateDashboard>({
      query: Subscriptions.onUpdateDashboard,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdateDashboard>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onUpdateDashboard
        if (data && state.session && state.session.id === sessionId) {
          const dashboard = state.dashboards.find(d => d.id === data.id)
          const layout = JSON.parse(data.layout)
          const option = JSON.parse(data.option)
          if (dashboard) {
            dashboard.name = data.name
            dashboard.option = option
          }
          if (state.dashboard && state.dashboard.id === data.id) {
            state.dashboard.name = data.name
            state.dashboard.layout = null
            state.dashboard.option = option
            setTimeout(() => {
              state.dashboard!.layout = layout
            }, 0)
          }
          state.dashboardCache.set(data.id, {
            id: data.id,
            name: data.name,
            layout,
            option
          })
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdateSessionDataSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnUpdateSessionData>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdateSessionData>({
      query: Subscriptions.onUpdateSessionData,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdateSessionData>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onUpdateSessionData
        if (!data) return
        if (state.session && state.session.id === sessionId) {
          const idx = state.sessionDataList.findIndex(sd => sd.id === data.id)
          if (idx >= 0) {
            const old = clone(state.sessionDataList[idx].data)
            state.sessionDataList[idx].data = {
              id: data.id,
              ...JSON.parse(data.data)
            }
            const next = state.sessionDataList[idx].data
            const dataType = state.sessionDataList[idx].type
            if (dataType === 'shinobigami-character') {
              const characterName = old.character.characterName
              getCharacterDiffMessages(old, next, state.players, characterName).forEach(({ text, icon, color }) =>
                addNotification(text, icon, color)
              )
            }
            if (dataType === 'shinobigami-handout-session-memo') {
              window.logger.info(JSON.stringify(next, null, 2))
              const handoutName = state.sessionDataList.find(c => c.id === next.handoutId)?.data.name
              addNotification(`${handoutName}の共有メモが更新されました`, 'mdi-pencil-circle-outline', 'lime-lighten-4')
            }
          }
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onUpdatePlayerSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnUpdatePlayer>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnUpdatePlayer>({
      query: Subscriptions.onUpdatePlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnUpdatePlayer>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
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

  function onDeletePlayerSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnDeletePlayer>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnDeletePlayer>({
      query: Subscriptions.onDeletePlayer,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnDeletePlayer>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
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

  function onDeleteSessionDataSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnDeleteSessionData>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnDeleteSessionData>({
      query: Subscriptions.onDeleteSessionData,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnDeleteSessionData>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onDeleteSessionData
        if (data && state.session?.id === sessionId) {
          const idx = state.sessionDataList.findIndex(sd => sd.id === data.id)
          state.sessionDataList.splice(idx, 1)
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onDeleteDashboardSubscription(
    sessionId: string
  ): Observable<FetchResult<SubscriptionResult.OnDeleteDashboard>> | null {
    if (!appSyncClient) return null
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
          const nextDashboard = state.dashboards[idx === state.dashboards.length ? idx - 1 : idx]
          directDashboardAccess(nextDashboard.id).then()
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function onNotifySubscription(sessionId: string): Observable<FetchResult<SubscriptionResult.OnNotify>> | null {
    if (!appSyncClient) return null
    const subscriber = appSyncClient.subscribe<SubscriptionResult.OnNotify>({
      query: Subscriptions.onNotify,
      variables: { sessionId },
      fetchPolicy: 'network-only'
    })
    subscriber.subscribe({
      next(value: FetchResult<SubscriptionResult.OnNotify>) {
        window.logger.info(JSON.stringify(value.data, null, 2))
        const data = value.data?.onNotify
        if (!data || state.session?.id !== sessionId) return
        if (data.from === 'user' && state.user?.token) return
        if (data.from === state.player?.id) return
        const type = data.type
        const contents = JSON.parse(data.data)
        if (type === 'notification') {
          const { text, icon, color } = contents
          addNotification(text, icon, color)
        } else if (type === 'add-player') {
          window.logger.info(JSON.stringify(contents, null, 2))
          state.players.push(contents)
          addNotification(`${contents.name}が参加しました。`, 'mdi-account', 'lime-lighten-4')
        }
      },
      error(errorValue: any) {
        console.error(errorValue)
      }
    })
    return subscriber
  }

  function addNotification(text: string, icon: string, color: string) {
    state.notifications.unshift({
      id: uuid.v4(),
      view: true,
      text,
      icon,
      color
    })
  }

  function closeNotification(id: string) {
    const idx = state.notifications.findIndex(n => n.id === id)
    if (idx < 0) return
    state.notifications[idx].view = false
    setTimeout(() => {
      const idx = state.notifications.findIndex(n => n.id === id)
      if (idx < 0) return
      state.notifications.splice(idx, 1)
    }, 300)
  }

  function closeNotificationAll() {
    state.notifications.forEach(n => (n.view = false))
    setTimeout(() => {
      state.notifications.splice(0, state.notifications.length)
    }, 300)
  }

  async function updateNechronicaSingletonHelper<T>(makeData: (data: Partial<T>) => T | null) {
    const singleton = state.sessionDataList.find(sd => sd.type === 'nechronica-singleton')
    if (singleton) {
      const cloned = clone(singleton.data)!
      const updateData = makeData(cloned)
      if (!updateData) return
      const updateDataStr = JSON.stringify(updateData)
      if (JSON.stringify(singleton.data) !== updateDataStr) {
        await updateSessionDataHelper(singleton.id, updateDataStr)
      }
    } else {
      const data = makeData({})
      if (!data) return
      await addNechronicaSingleton(data)
    }
  }

  return {
    state,
    addDefaultSession,
    addDashboard,
    directSessionAccess,
    changeDashboard,
    directDashboardAccess,
    addPlayerByUser,
    sendNotify,
    generatePlayerResetCode,
    updateUserName,
    updateUserIcon,
    updateSession,
    updateDashboardName,
    updateDashboardLayout,
    updateDashboardOption,
    updatePlayerName,
    updatePlayerIcon,
    deleteSession,
    deleteDashboard,
    deletePlayer,
    deleteSessionData,
    addNotification,
    closeNotification,
    closeNotificationAll,
    addTargetConfig,
    addShinobigamiCharacter,
    addShinobigamiHandoutSessionMemo,
    addShinobigamiHandoutPrivateMemo,
    addShinobigamiHandout,
    addShinobigamiHandoutRelation,
    addShinobigamiEnigma,
    addShinobigamiPersona,
    addShinobigamiPrize,
    addNechronicaCharacter,
    updateTargetConfig,
    updateShinobigamiCharacter,
    updateShinobigamiHandoutSessionMemo,
    updateShinobigamiHandoutPrivateMemo,
    updateShinobigamiHandout,
    updateShinobigamiHandoutRelation,
    updateShinobigamiEnigma,
    updateShinobigamiPersona,
    updateShinobigamiPrize,
    updateNechronicaCharacterHelper,
    updateNechronicaSingletonHelper
  }
}

export type GraphQlStore = ReturnType<typeof useGraphQl>
export const GraphQlKey: InjectionKey<GraphQlStore> = Symbol('GraphQlStore') as any
