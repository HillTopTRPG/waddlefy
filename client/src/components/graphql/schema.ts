import { Layout } from '@/components/panes'
import gql from 'graphql-tag'

const userSignUp = gql(`
mutation UserSignUp($userId: String!, $userName: String!, $userPassword: String!, $sessionName: String!, $sessionType: String!) {
  userSignUp(input: {userId: $userId, name: $userName, password: $userPassword, sessionName: $sessionName, sessionType: $sessionType}) {
    id
    name
    iconToken
    token
    secret
    firstSession {
      id
      token
      signUpToken
      name
      sessionType
      createdAt
      players {
        id
        sessionId
        name
        iconToken
      }
      dashboards {
        id
        name
        option
      }
      sessionDataList {
        id
        type
        sessionId
        data
      }
    }
    sessions {
      id
      name
    }
  }
}
`)

const userSignIn = gql(`
mutation UserSignIn($userId: String!, $userPassword: String!) {
  userSignIn(input: {userId: $userId, password: $userPassword}) {
    id
    name
    iconToken
    token
    secret
    firstSession {
      id
      token
      signUpToken
      name
      sessionType
      createdAt
      players {
        id
        sessionId
        name
        iconToken
      }
      dashboards {
        id
        name
        option
      }
      defaultDashboardId
      defaultDashboard {
        id
        name
        layout
        option
      }
      sessionDataList {
        id
        type
        sessionId
        data
      }
    }
    sessions {
      id
      name
    }
  }
}
`)

const addSession = gql(`
mutation AddSession($name: String!, $sessionType: String!) {
  addSession(input: {name: $name, sessionType: $sessionType}) {
    id
    token
    signUpToken
    name
    sessionType
    createdAt
    players {
      id
      sessionId
      name
      iconToken
    }
    dashboards {
      id
      name
      option
    }
    defaultDashboardId
    defaultDashboard {
      id
      name
      layout
      option
    }
    sessionDataList {
      id
      type
      sessionId
      data
    }
  }
}
`)

const addDashboard = gql(`
mutation AddDashboard($dashboardName: String!, $layout: String!, $option: String!, $sessionId: String!) {
  addDashboard(input: {name: $dashboardName, layout: $layout, option: $option, sessionId: $sessionId}) {
    id
    name
    layout
    option
    sessionId
  }
}
`)

const addSessionData = gql(`
mutation AddSessionData($sessionId: String!, $type: String!, $data: String!) {
  addSessionData(input: {sessionId: $sessionId, type: $type, data: $data}) {
    id
    type
    sessionId
    data
  }
}
`)

const notify = gql(`
mutation Notify($sessionId: String!, $from: String!, $type: String!, $data: String!) {
  notify(input: {sessionId: $sessionId, from: $from, type: $type, data: $data}) {
    sessionId
    from
    type
    data
  }
}
`)

const addPlayerByUser = gql(`
mutation AddPlayerByUser($sessionId: String!, $playerName: String!) {
  addPlayerByUser(input: {sessionId: $sessionId, name: $playerName}) {
    id
    sessionId
    name
    iconToken
    status
  }
}
`)

const addPlayerByPlayer = gql(`
mutation AddPlayerByPlayer($playerName: String!, $playerPassword: String!) {
  addPlayerByPlayer(input: {name: $playerName, password: $playerPassword}) {
    id
    sessionId
    name
    status
    iconToken
    token
    secret
  }
}
`)

const playerFirstSignIn = gql(`
mutation PlayerSignIn($playerId: String!, $playerPassword: String!) {
  playerFirstSignIn(input: {playerId: $playerId, password: $playerPassword}) {
    id
    sessionId
    name
    iconToken
    token
    secret
    session {
      id
      name
      token
      sessionType
      createdAt
      user {
        id
        name
        iconToken
      }
      players {
        id
        sessionId
        name
        iconToken
      }
      dashboards {
        id
        name
      }
      defaultDashboardId
      defaultDashboard {
        id
        name
        layout
      }
      sessionDataList {
        id
        type
        sessionId
        data
      }
    }
  }
}
`)

const playerSignIn = gql(`
mutation PlayerSignIn($playerId: String!, $playerPassword: String!) {
  playerSignIn(input: {playerId: $playerId, password: $playerPassword}) {
    id
    sessionId
    name
    iconToken
    token
    secret
    session {
      id
      name
      token
      sessionType
      createdAt
      user {
        id
        name
        iconToken
      }
      players {
        id
        sessionId
        name
        iconToken
      }
      dashboards {
        id
        name
        option
      }
      defaultDashboardId
      defaultDashboard {
        id
        name
        layout
        option
      }
      sessionDataList {
        id
        type
        sessionId
        data
      }
    }
  }
}
`)

const generatePlayerResetCode = gql(`
mutation GeneratePlayerResetCode($playerId: String!) {
  generatePlayerResetCode(input: {id: $playerId}) {
    resetCode
  }
}
`)

const resetPlayerPassword = gql(`
mutation ResetPlayerPassword($playerId: String!, $resetCode: String!, $playerPassword: String!) {
  resetPlayerPassword(input: {id: $playerId, resetCode: $resetCode, password: $playerPassword}) {
    id
    name
    iconToken
    token
    secret
    session {
      id
      name
      token
      sessionType
      createdAt
      user {
        id
        name
        iconToken
      }
      players {
        id
        sessionId
        name
        iconToken
      }
      dashboards {
        id
        name
        option
      }
      defaultDashboardId
      defaultDashboard {
        id
        name
        layout
        option
      }
      sessionDataList {
        id
        type
        sessionId
        data
      }
    }
  }
}
`)

const updateUserName = gql(`
mutation UpdateUserName($userName: String!) {
  updateUserName(input: {name: $userName}) {
    id
    name
    iconToken
  }
}
`)

const updateUserIcon = gql(`
mutation UpdateUserIcon {
  updateUserIcon {
    id
    name
    iconToken
  }
}
`)

const updateSession = gql(`
mutation UpdateSession($sessionId: String!, $name: String!, $sessionType: String!, $defaultDashboardId: String!) {
  updateSession(input: {sessionId: $sessionId, name: $name, sessionType: $sessionType, defaultDashboardId: $defaultDashboardId}) {
    id
    name
    token
    sessionType
    defaultDashboardId
  }
}
`)
type UpdatedSession = {
  id: string
  name: string
  token: string
  sessionType: string
  defaultDashboardId: string
}

const updateDashboard = gql(`
mutation UpdateDashboard($sessionId: String!, $dashboardId: String!, $name: String!, $layout: String!, $option: String!) {
  updateDashboard(input: {sessionId: $sessionId, dashboardId: $dashboardId, name: $name, layout: $layout, option: $option}) {
    id
    name
    layout
    option
    sessionId
  }
}
`)
type UpdatedDashboard = {
  id: string
  name: string
  layout: string
  option: string
  sessionId: string
}

const updateSessionData = gql(`
mutation UpdateSessionData($id: String!, $sessionId: String!, $data: String!) {
  updateSessionData(input: {id: $id, sessionId: $sessionId, data: $data}) {
    id
    type
    sessionId
    data
  }
}
`)

const updatePlayerName = gql(`
mutation UpdatePlayerName($playerName: String!) {
  updatePlayerName(input: {name: $playerName}) {
    id
    sessionId
    name
    status
    iconToken
  }
}
`)

const updatePlayerIcon = gql(`
mutation UpdatePlayerIcon {
  updatePlayerIcon {
    id
    sessionId
    name
    status
    iconToken
  }
}
`)

const deleteSession = gql(`
mutation DeleteSession($sessionId: String!) {
  deleteSession(input: {id: $sessionId}) {
    id
    sessionId
  }
}
`)

const deleteDashboard = gql(`
mutation DeleteDashboard($sessionId: String!, $dashboardId: String!) {
  deleteDashboard(input: {sessionId: $sessionId, id: $dashboardId}) {
    id
    sessionId
  }
}
`)

const deletePlayer = gql(`
mutation DeletePlayer($playerId: String!) {
  deletePlayer(input: {id: $playerId}) {
    id
    sessionId
  }
}
`)

const deleteSessionData = gql(`
mutation DeleteSessionData($sessionDataId: String!) {
  deleteSessionData(input: {id: $sessionDataId}) {
    id
    sessionId
  }
}
`)

export namespace MutationResult {
  export type UserSignUp = {
    userSignUp: UserForUser
  }
  export type UserSignIn = {
    userSignIn: UserForUser
  }
  export type AddSession = {
    addSession: SessionForUser
  }
  export type AddDashboard = {
    addDashboard: DashboardResult
  }
  export type AddSessionData = {
    addSessionData: SessionData
  }
  export type Notify = {
    notify: NotifyData
  }
  export type AddPlayerByUser = {
    addPlayerByUser: AbstractPlayer
  }
  export type AddPlayerByPlayer = {
    addPlayerByPlayer: PlayerForPlayer
  }
  export type PlayerFirstSignIn = {
    playerFirstSignIn: PlayerForPlayer
  }
  export type PlayerSignIn = {
    playerSignIn: PlayerForPlayer
  }
  export type GeneratePlayerResetCode = {
    generatePlayerResetCode: {
      resetCode: string
    }
  }
  export type ResetPlayerPassword = {
    resetPlayerPassword: PlayerForPlayer
  }
  export type UpdateUserName = {
    updateUserName: AbstractUser
  }
  export type UpdateUserIcon = {
    updateUserIcon: AbstractUser
  }
  export type UpdateSession = {
    updateSession: UpdatedSession
  }
  export type UpdateSessionData = {
    updateSessionData: SessionData
  }
  export type UpdateDashboard = {
    updateDashboard: UpdatedDashboard
  }
  export type UpdatePlayerName = {
    updatePlayerName: AbstractPlayer
  }
  export type UpdatePlayerIcon = {
    updatePlayerIcon: AbstractPlayer
  }
  export type DeleteSession = {
    deleteSession: DeletedId
  }
  export type DeleteDashboard = {
    deleteDashboard: DeletedId
  }
  export type DeletePlayer = {
    deletePlayer: DeletedId
  }
  export type DeleteSessionData = {
    deleteSessionData: DeletedId
  }
}

const checkDuplicateUserId = gql(`
query CheckDuplicateUserId($userId: String!) {
  checkDuplicateUserId(id: $userId) {
    ok
  }
}
`)

const directSessionAccess = gql(`
query DirectSessionAccess($sessionId: String!) {
  directSessionAccess(id: $sessionId) {
    id
    token
    signUpToken
    name
    sessionType
    createdAt
    user {
      id
      name
      iconToken
      token
      secret
      sessions {
        id
        name
      }
    }
    players {
      id
      sessionId
      name
      iconToken
      status
    }
    dashboards {
      id
      name
      option
    }
    defaultDashboardId
    defaultDashboard {
      id
      name
      layout
      option
    }
    sessionDataList {
      id
      type
      sessionId
      data
    }
  }
}
`)

const directDashboardAccess = gql(`
query DirectSessionAccess($dashboardId: String!) {
  directDashboardAccess(id: $dashboardId) {
    id
    sessionId
    name
    layout
    option
  }
}
`)

const getSessionPlayer = gql(`
query GetSessionPlayer($playerId: String!) {
  getSessionPlayer(id: $playerId) {
    id
    sessionId
    name
    iconToken
    status
  }
}
`)

export namespace QueryResult {
  export type CheckDuplicateUserId = {
    checkDuplicateUserId: {
      ok: boolean
    }
  }
  export type DirectSessionAccess = {
    directSessionAccess: SessionForUser
  }
  export type DirectDashboardAccess = {
    directDashboardAccess: DashboardResult
  }
  export type DirectPlayerAccess = {
    directPlayerAccess: PlayerForPlayer
  }
  export type GetSessionPlayer = {
    getSessionPlayer: AbstractPlayer
  }
  export type GetSessionPlayers = {
    getSessionPlayers: AbstractPlayer[]
  }
}

export type AbstractPlayer = {
  id: string
  sessionId: string
  name: string
  iconToken: string
  status: string
}

const getSessionPlayers = gql(`
query GetSessionPlayers {
  getSessionPlayers {
    id
    sessionId
    name
    iconToken
    status
  }
}
`)

const directPlayerAccess = gql(`
query DirectPlayerAccess {
  directPlayerAccess {
    id
    name
    iconToken
    token
    secret
    session {
      id
      name
      token
      sessionType
      createdAt
      user {
        id
        name
        iconToken
      }
      players {
        id
        name
        iconToken
        status
      }
      dashboards {
        id
        name
        option
      }
      defaultDashboardId
      defaultDashboard {
        id
        name
        layout
        option
      }
      sessionDataList {
        id
        type
        sessionId
        data
      }
    }
  }
}
`)

type UserForUser = {
  id: string
  name: string
  iconToken: string
  token: string
  secret: string
  firstSession: SessionForUser
  sessions: AbstractSession[]
}

export type User = {
  id: string
  name: string
  iconToken: string
  token?: string
}

type PlayerForPlayer = {
  id: string
  sessionId: string
  name: string
  status: string
  iconToken: string
  token: string
  secret: string
  session: SessionForPlayer
}

export type Player = {
  id: string
  name: string
  iconToken: string
  token?: string
  status?: string
  resetCode?: string
}

type SessionForUser = {
  id: string
  token: string
  signUpToken: string
  name: string
  sessionType: string
  createdAt: number
  user: UserForUser
  players: AbstractPlayer[]
  dashboards: AbstractDashboard[]
  defaultDashboardId: string
  defaultDashboard: DashboardResult
  sessionDataList: SessionDataResult[]
}

type SessionForPlayer = {
  id: string
  token: string
  name: string
  sessionType: string
  createdAt: number
  user: AbstractUser
  players: AbstractPlayer[]
  dashboards: AbstractDashboard[]
  defaultDashboardId: string
  defaultDashboard: DashboardResult
  sessionDataList: SessionDataResult[]
}

export type SessionDataResult = {
  id: string
  type: string
  sessionId: string
  data: string
}

export type SessionData<T> = {
  id: string
  type: string
  sessionId: string
  data: T
}

export type NotifyData = {
  sessionId: string
  from: 'user' | string
  type: string
  data: any
}

export type Session = {
  id: string
  token: string
  signUpToken?: string
  name: string
  sessionType: string
  createdAt: number
  defaultDashboardId: string
}

type AbstractSession = {
  id: string
  name: string
}

export type AbstractUser = {
  id: string
  name: string
  iconToken: string
}

type DeletedId = {
  id: string
  sessionId: string
}

export type AbstractDashboard = {
  id: string
  name: string
  option: DashboardOption
}

type DashboardResult = {
  id: string
  name: string
  layout: string
  option: string
}

export type DashboardOption = {
  scope: 'all' | 'owner' | string[]
}

export type Dashboard = {
  id: string
  name: string
  layout: Layout
  option: DashboardOption
}

const onAddPlayer = gql(`
subscription OnAddPlayer($sessionId: String!) {
  onAddPlayer(sessionId: $sessionId) {
    id
    name
    iconToken
    status
  }
}
`)

const onAddDashboard = gql(`
subscription OnAddDashboard($sessionId: String!) {
  onAddDashboard(sessionId: $sessionId) {
    id
    name
    layout
    option
  }
}
`)

const onAddSessionData = gql(`
subscription OnAddSessionData($sessionId: String!) {
  onAddSessionData(sessionId: $sessionId) {
    id
    type
    data
  }
}
`)

const onUpdateUser = gql(`
subscription OnUpdateUser($userId: String!) {
  onUpdateUser(id: $userId) {
    id
    name
    iconToken
  }
}
`)

const onUpdateSession = gql(`
subscription OnUpdateSession($sessionId: String!) {
  onUpdateSession(id: $sessionId) {
    id
    name
    token
    sessionType
    defaultDashboardId
  }
}
`)

const onUpdateDashboard = gql(`
subscription OnUpdateDashboard($sessionId: String!) {
  onUpdateDashboard(sessionId: $sessionId) {
    id
    name
    layout
    option
    sessionId
  }
}
`)

const onUpdateSessionData = gql(`
subscription OnUpdateSessionData($sessionId: String!) {
  onUpdateSessionData(sessionId: $sessionId) {
    id
    type
    data
  }
}
`)

const onUpdatePlayer = gql(`
subscription OnUpdatePlayer($sessionId: String!) {
  onUpdatePlayer(sessionId: $sessionId) {
    id
    sessionId
    name
    status
    iconToken
  }
}
`)

const onDeleteDashboard = gql(`
subscription OnDeleteDashboard($sessionId: String!) {
  onDeleteDashboard(sessionId: $sessionId) {
    id
  }
}
`)

const onNotify = gql(`
subscription OnNotify($sessionId: String!) {
  onNotify(sessionId: $sessionId) {
    sessionId
    from
    type
    data
  }
}
`)

const onDeletePlayer = gql(`
subscription OnDeletePlayer($sessionId: String!) {
  onDeletePlayer(sessionId: $sessionId) {
    id
  }
}
`)

const onDeleteSessionData = gql(`
subscription OnDeleteSessionData($sessionId: String!) {
  onDeleteSessionData(sessionId: $sessionId) {
    id
  }
}
`)

export namespace SubscriptionResult {
  export type OnAddPlayer = {
    onAddPlayer: AbstractPlayer
  }
  export type OnAddDashboard = {
    onAddDashboard: DashboardResult
  }
  export type OnAddSessionData = {
    onAddSessionData: SessionDataResult
  }
  export type OnUpdateUser = {
    onUpdateUser: AbstractUser
  }
  export type OnUpdateSession = {
    onUpdateSession: UpdatedSession
  }
  export type OnUpdateDashboard = {
    onUpdateDashboard: UpdatedDashboard
  }
  export type OnUpdateSessionData = {
    onUpdateSessionData: SessionData
  }
  export type OnUpdatePlayer = {
    onUpdatePlayer: AbstractPlayer
  }
  export type OnDeleteDashboard = {
    onDeleteDashboard: { id: string }
  }
  export type OnNotify = {
    onNotify: NotifyData
  }
  export type OnDeletePlayer = {
    onDeletePlayer: { id: string }
  }
  export type OnDeleteSessionData = {
    onDeleteSessionData: { id: string }
  }
}

export const Mutations = {
  userSignUp,
  userSignIn,
  addSession,
  addDashboard,
  addSessionData,
  notify,
  addPlayerByUser,
  addPlayerByPlayer,
  playerFirstSignIn,
  playerSignIn,
  resetPlayerPassword,
  generatePlayerResetCode,
  updateUserName,
  updateUserIcon,
  updateSession,
  updateDashboard,
  updateSessionData,
  updatePlayerName,
  updatePlayerIcon,
  deleteSession,
  deleteDashboard,
  deletePlayer,
  deleteSessionData
}

export const Queries = {
  checkDuplicateUserId,
  directPlayerAccess,
  directSessionAccess,
  directDashboardAccess,
  getSessionPlayer,
  getSessionPlayers
}

export const Subscriptions = {
  onAddPlayer,
  onAddDashboard,
  onAddSessionData,
  onDeletePlayer,
  onDeleteSessionData,
  onDeleteDashboard,
  onNotify,
  onUpdateUser,
  onUpdateSession,
  onUpdateDashboard,
  onUpdateSessionData,
  onUpdatePlayer
}
