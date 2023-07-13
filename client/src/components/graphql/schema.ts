import gql from 'graphql-tag'

const userSignUp = gql(`
mutation UserSignUp($userId: String!, $userName: String!, $userPassword: String!, $dashboardName: String!, $layout: String!, $metaData: String!) {
  userSignUp(input: {userId: $userId, name: $userName, password: $userPassword, dashboardName: $dashboardName, layout: $layout, metaData: $metaData}) {
    id
    name
    iconToken
    token
    secret
    firstDashboard {
      id
      token
      signUpToken
      name
      layout
      metaData
      createdAt
      players {
        id
        dashboardId
        name
        iconToken
      }
    }
    dashboards {
      id
      name
    }
  }
}
`)
export type UserSignUpResult = {
  userSignUp: UserForUser
}

const userSignIn = gql(`
mutation UserSignIn($userId: String!, $userPassword: String!) {
  userSignIn(input: {userId: $userId, password: $userPassword}) {
    id
    name
    iconToken
    token
    secret
    firstDashboard {
      id
      token
      signUpToken
      name
      layout
      metaData
      createdAt
      players {
        id
        dashboardId
        name
        iconToken
      }
    }
    dashboards {
      id
      name
    }
  }
}
`)
export type UserSignInResult = {
  userSignIn: UserForUser
}

const addDashboard = gql(`
mutation AddDashboard($name: String!, $layout: String!, $metaData: String!) {
  addDashboard(input: {name: $name, layout: $layout, metaData: $metaData}) {
    id
    token
    signUpToken
    name
    layout
    metaData
    createdAt
    players {
      id
      dashboardId
      name
      iconToken
    }
  }
}
`)
export type AddDashboardResult = {
  addDashboard: DashboardForUser
}

const addPlayerByUser = gql(`
mutation AddPlayerByUser($dashboardId: String!, $playerName: String!) {
  addPlayerByUser(input: {dashboardId: $dashboardId, name: $playerName}) {
    id
    dashboardId
    name
    iconToken
    status
  }
}
`)
export type AddPlayerByUserResult = {
  addPlayerByUser: AbstractPlayer
}

const addPlayerByPlayer = gql(`
mutation AddPlayerByPlayer($playerName: String!, $playerPassword: String!) {
  addPlayerByPlayer(input: {name: $playerName, password: $playerPassword}) {
    id
    dashboardId
    name
    iconToken
    status
  }
}
`)
export type AddPlayerByPlayerResult = {
  addPlayerByPlayer: AbstractPlayer
}

const playerFirstSignIn = gql(`
mutation PlayerSignIn($playerId: String!, $playerPassword: String!) {
  playerFirstSignIn(input: {playerId: $playerId, password: $playerPassword}) {
    id
    dashboardId
    name
    iconToken
    token
    secret
    dashboard {
      id
      name
      token
      layout
      metaData
      createdAt
      user {
        id
        name
        iconToken
      }
      players {
        id
        dashboardId
        name
        iconToken
      }
    }
  }
}
`)
export type PlayerFirstSignInResult = {
  playerFirstSignIn: PlayerForPlayer
}

const playerSignIn = gql(`
mutation PlayerSignIn($playerId: String!, $playerPassword: String!) {
  playerSignIn(input: {playerId: $playerId, password: $playerPassword}) {
    id
    dashboardId
    name
    iconToken
    token
    secret
    dashboard {
      id
      name
      token
      layout
      metaData
      createdAt
      user {
        id
        name
        iconToken
      }
      players {
        id
        dashboardId
        name
        iconToken
      }
    }
  }
}
`)
export type PlayerSignInResult = {
  playerSignIn: PlayerForPlayer
}

const generatePlayerResetCode = gql(`
mutation GeneratePlayerResetCode($playerId: String!) {
  generatePlayerResetCode(input: {id: $playerId}) {
    resetCode
  }
}
`)
export type GeneratePlayerResetCodeResult = {
  generatePlayerResetCode: {
    resetCode: string
  }
}

const resetPlayerPassword = gql(`
mutation ResetPlayerPassword($playerId: String!, $resetCode: String!, $playerPassword: String!) {
  resetPlayerPassword(input: {id: $playerId, resetCode: $resetCode, password: $playerPassword}) {
    id
    name
    iconToken
    token
    secret
    dashboard {
      id
      name
      token
      layout
      metaData
      createdAt
      user {
        id
        name
        iconToken
      }
      players {
        id
        dashboardId
        name
        iconToken
      }
    }
  }
}
`)
export type ResetPlayerPasswordResult = {
  resetPlayerPassword: PlayerForPlayer
}

const updateUserName = gql(`
mutation UpdateUserName($userName: String!) {
  updateUserName(input: {name: $userName}) {
    id
    name
    iconToken
  }
}
`)
export type UpdateUserNameResult = {
  updateUserName: AbstractUser
}

const updateUserIcon = gql(`
mutation UpdateUserIcon {
  updateUserIcon {
    id
    name
    iconToken
  }
}
`)
export type UpdateUserIconResult = {
  updateUserIcon: AbstractUser
}

const updateDashboard = gql(`
mutation UpdateDashboard($dashboardId: String!, $name: String!, $layout: String!, $metaData: String!) {
  updateDashboard(input: {dashboardId: $dashboardId, name: $name, layout: $layout, metaData: $metaData}) {
    id
    name
    token
    layout
    metaData
  }
}
`)
export type UpdatedDashboard = {
  id: string
  name: string
  token: string
  layout: string
  metaData: string
}
export type UpdateDashboardResult = {
  updateDashboard: UpdatedDashboard
}

const updatePlayerName = gql(`
mutation UpdatePlayerName($playerName: String!) {
  updatePlayerName(input: {name: $playerName}) {
    id
    dashboardId
    name
    status
    iconToken
  }
}
`)
export type UpdatePlayerNameResult = {
  updatePlayerName: AbstractPlayer
}

const updatePlayerIcon = gql(`
mutation UpdatePlayerIcon {
  updatePlayerIcon {
    id
    dashboardId
    name
    status
    iconToken
  }
}
`)
export type UpdatePlayerIconResult = {
  updatePlayerIcon: AbstractPlayer
}

const deleteDashboard = gql(`
mutation DeleteDashboard($dashboardId: String!) {
  deleteDashboard(input: {id: $dashboardId}) {
    id
    dashboardId
  }
}
`)
export type DeleteDashboardResult = {
  deleteDashboard: DeletedId
}

const deletePlayer = gql(`
mutation DeletePlayer($playerId: String!) {
  deletePlayer(input: {id: $playerId}) {
    id
    dashboardId
  }
}
`)
export type DeletePlayerResult = {
  deletePlayer: DeletedId
}

const checkDuplicateUserId = gql(`
query CheckDuplicateUserId($userId: String!) {
  checkDuplicateUserId(id: $userId) {
    ok
  }
}
`)
export type CheckDuplicateUserIdResult = {
  checkDuplicateUserId: {
    ok: boolean
  }
}

const directDashboardAccess = gql(`
query DirectDashboardAccess($dashboardId: String!) {
  directDashboardAccess(id: $dashboardId) {
    id
    token
    signUpToken
    name
    layout
    metaData
    createdAt
    user {
      id
      name
      iconToken
      token
      secret
      dashboards {
        id
        name
      }
    }
    players {
      id
      dashboardId
      name
      iconToken
      status
    }
  }
}
`)
export type DirectDashboardAccessQueryResult = {
  directDashboardAccess: DashboardForUser
}

const getDashboardPlayer = gql(`
query GetDashboardPlayer($playerId: String!) {
  getDashboardPlayer(id: $playerId) {
    id
    dashboardId
    name
    iconToken
    status
  }
}
`)
export type AbstractPlayer = {
  id: string
  dashboardId: string
  name: string
  iconToken: string
  status: string
}
export type GetDashboardPlayerResult = {
  getDashboardPlayer: AbstractPlayer
}

const getDashboardPlayers = gql(`
query GetDashboardPlayers {
  getDashboardPlayers {
    id
    dashboardId
    name
    iconToken
    status
  }
}
`)
export type GetDashboardPlayersResult = {
  getDashboardPlayers: AbstractPlayer[]
}

const directPlayerAccess = gql(`
query DirectPlayerAccess {
  directPlayerAccess {
    id
    name
    iconToken
    token
    secret
    dashboard {
      id
      name
      token
      layout
      metaData
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
    }
  }
}
`)
export type DirectPlayerAccessQueryResult = {
  directPlayerAccess: PlayerForPlayer
}

export type UserForUser = {
  id: string
  name: string
  iconToken: string
  token: string
  secret: string
  firstDashboard: DashboardForUser
  dashboards: AbstractDashboard[]
}

export type User = {
  id: string
  name: string
  iconToken: string
  token?: string
}

export type PlayerForPlayer = {
  id: string
  name: string
  iconToken: string
  token: string
  secret: string
  dashboard: DashboardForPlayer
}

export type Player = {
  id: string
  name: string
  iconToken: string
  token?: string
  status?: string
  resetCode?: string
}

export type DashboardForUser = {
  id: string
  token: string
  signUpToken: string
  name: string
  layout: string
  metaData: string
  createdAt: number
  user: UserForUser
  players: AbstractPlayer[]
}

export type DashboardForPlayer = {
  id: string
  token: string
  name: string
  layout: string
  metaData: string
  createdAt: number
  user: AbstractUser
  players: AbstractPlayer[]
}

export type Dashboard = {
  id: string
  token: string
  signUpToken?: string
  name: string
  layout: string
  metaData: string
  createdAt: number
}

export type AbstractDashboard = {
  id: string
  name: string
}

export type AbstractUser = {
  id: string
  name: string
  iconToken: string
}

export type DeletedId = {
  id: string
  dashboardId: string
}

const onAddPlayer = gql(`
subscription OnAddPlayer($dashboardId: String!) {
  onAddPlayer(dashboardId: $dashboardId) {
    id
    name
    iconToken
    status
  }
}
`)
export type OnAddPlayerResult = {
  onAddPlayer: AbstractPlayer
}

const onUpdateUser = gql(`
subscription OnUpdateUser($userId: String!) {
  onUpdateUser(id: $userId) {
    id
    name
    iconToken
  }
}
`)
export type OnUpdateUserResult = {
  onUpdateUser: AbstractUser
}

const onUpdateDashboard = gql(`
subscription OnUpdateDashboard($dashboardId: String!) {
  onUpdateDashboard(id: $dashboardId) {
    id
    name
    token
    layout
    metaData
  }
}
`)
export type OnUpdateDashboardResult = {
  onUpdateDashboard: UpdatedDashboard
}

const onUpdatePlayer = gql(`
subscription OnUpdatePlayer($dashboardId: String!) {
  onUpdatePlayer(dashboardId: $dashboardId) {
    id
    dashboardId
    name
    status
    iconToken
  }
}
`)
export type OnUpdatePlayerResult = {
  onUpdatePlayer: AbstractPlayer
}

const onDeletePlayer = gql(`
subscription OnDeletePlayer($dashboardId: String!) {
  onDeletePlayer(dashboardId: $dashboardId) {
    id
  }
}
`)
export type OnDeletePlayerResult = {
  onDeletePlayer: { id: string }
}

export const Mutations = {
  userSignUp,
  userSignIn,
  addDashboard,
  addPlayerByUser,
  addPlayerByPlayer,
  playerFirstSignIn,
  playerSignIn,
  resetPlayerPassword,
  generatePlayerResetCode,
  updateUserName,
  updateUserIcon,
  updateDashboard,
  updatePlayerName,
  updatePlayerIcon,
  deleteDashboard,
  deletePlayer
}

export const Queries = {
  checkDuplicateUserId,
  directPlayerAccess,
  directDashboardAccess,
  getDashboardPlayer,
  getDashboardPlayers
}

export const Subscriptions = {
  onAddPlayer,
  onDeletePlayer,
  onUpdateUser,
  onUpdateDashboard,
  onUpdatePlayer
}
