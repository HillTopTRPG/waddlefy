import gql from 'graphql-tag'

const userSignUp = gql(`
mutation UserSignUp($userId: String!, $userName: String!, $userPassword: String!, $dashboardName: String!, $layout: String!, $metaData: String!) {
  userSignUp(input: {userId: $userId, name: $userName, password: $userPassword, dashboardName: $dashboardName, layout: $layout, metaData: $metaData}) {
    id
    name
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
    }
  }
}
`)
export type AddDashboardResult = {
  addDashboard: DashboardForUser
}

const addPlayer = gql(`
mutation AddDashboard($dashboardId: String!, $playerName: String!) {
  addPlayer(input: {dashboardId: $dashboardId, name: $playerName}) {
    id
    name
  }
}
`)
export type AddPlayerResult = {
  addPlayer: IdName
}

const playerSignUp = gql(`
mutation PlayerSignUp($playerName: String!, $playerPassword: String!) {
  playerSignUp(input: {name: $playerName, password: $playerPassword}) {
    id
    name
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
      }
      players {
        id
        name
      }
    }
  }
}
`)
export type PlayerSignUpResult = {
  playerSignUp: PlayerForPlayer
}

const playerFirstSignIn = gql(`
mutation PlayerSignIn($playerId: String!, $playerPassword: String!) {
  playerFirstSignIn(input: {playerId: $playerId, password: $playerPassword}) {
    id
    name
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
      }
      players {
        id
        name
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
      }
      players {
        id
        name
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
      }
      players {
        id
        name
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
    status
  }
}
`)
export type IdNameStatus = {
  id: string
  name: string
  status: string
}
export type GetDashboardPlayerResult = {
  getDashboardPlayer: IdNameStatus
}

const getDashboardPlayers = gql(`
query GetDashboardPlayers {
  getDashboardPlayers {
    id
    name
    status
  }
}
`)
export type GetDashboardPlayersResult = {
  getDashboardPlayers: IdNameStatus[]
}

const directPlayerAccess = gql(`
query DirectPlayerAccess {
  directPlayerAccess {
    id
    name
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
      }
      players {
        id
        name
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
  token: string
  secret: string
  firstDashboard: DashboardForUser
  dashboards: IdName[]
}

export type User = {
  id: string
  name: string
  token?: string
}

export type PlayerForPlayer = {
  id: string
  name: string
  token: string
  secret: string
  dashboard: DashboardForPlayer
}

export type Player = {
  id: string
  name: string
  token?: string
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
  players: IdName[]
}

export type DashboardForPlayer = {
  id: string
  token: string
  name: string
  layout: string
  metaData: string
  createdAt: number
  user: IdName
  players: IdName[]
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

export const Mutations = {
  userSignUp,
  userSignIn,
  addDashboard,
  addPlayer,
  playerSignUp,
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
