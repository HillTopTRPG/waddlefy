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
    name
    iconToken
    status
  }
}
`)
export type AddPlayerByUserResult = {
  addPlayerByUser: IdNameIconStatus
}

const addPlayerByPlayer = gql(`
mutation AddPlayerByPlayer($playerName: String!, $playerPassword: String!) {
  addPlayerByPlayer(input: {name: $playerName, password: $playerPassword}) {
    id
    name
    iconToken
    status
  }
}
`)
export type AddPlayerByPlayerResult = {
  addPlayerByPlayer: IdNameIconStatus
}

const playerFirstSignIn = gql(`
mutation PlayerSignIn($playerId: String!, $playerPassword: String!) {
  playerFirstSignIn(input: {playerId: $playerId, password: $playerPassword}) {
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
    name
    iconToken
    status
  }
}
`)
export type IdNameIconStatus = {
  id: string
  name: string
  iconToken: string
  status: string
}
export type GetDashboardPlayerResult = {
  getDashboardPlayer: IdNameIconStatus
}

const getDashboardPlayers = gql(`
query GetDashboardPlayers {
  getDashboardPlayers {
    id
    name
    iconToken
    status
  }
}
`)
export type GetDashboardPlayersResult = {
  getDashboardPlayers: IdNameIconStatus[]
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
  dashboards: IdName[]
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
  players: IdNameIconStatus[]
}

export type DashboardForPlayer = {
  id: string
  token: string
  name: string
  layout: string
  metaData: string
  createdAt: number
  user: IdNameIcon
  players: IdNameIconStatus[]
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

export type IdName = {
  id: string
  name: string
}

export type IdNameIcon = {
  id: string
  name: string
  iconToken: string
}

const onAddPlayer = gql(`
subscription OnAddPlayer {
  onAddPlayer {
    id
    name
    iconToken
    status
  }
}
`)
export type OnAddPlayerResult = {
  onAddPlayer: IdNameIconStatus
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
  generatePlayerResetCode
}

export const Queries = {
  checkDuplicateUserId,
  directPlayerAccess,
  directDashboardAccess,
  getDashboardPlayer,
  getDashboardPlayers
}

export const Subscriptions = {
  onAddPlayer
}
