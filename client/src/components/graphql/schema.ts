import gql from 'graphql-tag'

const userSignUp = gql(`
mutation UserSignUp($userId: String!, $userName: String!, $userPassword: String!, $sessionName: String!, $layout: String!, $metaData: String!) {
  userSignUp(input: {userId: $userId, name: $userName, password: $userPassword, sessionName: $sessionName, layout: $layout, metaData: $metaData}) {
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
      layout
      metaData
      createdAt
      players {
        id
        sessionId
        name
        iconToken
      }
    }
    sessions {
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
    firstSession {
      id
      token
      signUpToken
      name
      layout
      metaData
      createdAt
      players {
        id
        sessionId
        name
        iconToken
      }
    }
    sessions {
      id
      name
    }
  }
}
`)
export type UserSignInResult = {
  userSignIn: UserForUser
}

const addSession = gql(`
mutation AddSession($name: String!, $layout: String!, $metaData: String!) {
  addSession(input: {name: $name, layout: $layout, metaData: $metaData}) {
    id
    token
    signUpToken
    name
    layout
    metaData
    createdAt
    players {
      id
      sessionId
      name
      iconToken
    }
  }
}
`)
export type AddSessionResult = {
  addSession: SessionForUser
}

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
export type AddPlayerByUserResult = {
  addPlayerByUser: AbstractPlayer
}

const addPlayerByPlayer = gql(`
mutation AddPlayerByPlayer($playerName: String!, $playerPassword: String!) {
  addPlayerByPlayer(input: {name: $playerName, password: $playerPassword}) {
    id
    sessionId
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
    sessionId
    name
    iconToken
    token
    secret
    session {
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
        sessionId
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
    sessionId
    name
    iconToken
    token
    secret
    session {
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
        sessionId
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
    session {
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
        sessionId
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

const updateSession = gql(`
mutation UpdateSession($sessionId: String!, $name: String!, $layout: String!, $metaData: String!) {
  updateSession(input: {sessionId: $sessionId, name: $name, layout: $layout, metaData: $metaData}) {
    id
    name
    token
    layout
    metaData
  }
}
`)
export type UpdatedSession = {
  id: string
  name: string
  token: string
  layout: string
  metaData: string
}
export type UpdateSessionResult = {
  updateSession: UpdatedSession
}

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
export type UpdatePlayerNameResult = {
  updatePlayerName: AbstractPlayer
}

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
export type UpdatePlayerIconResult = {
  updatePlayerIcon: AbstractPlayer
}

const deleteSession = gql(`
mutation DeleteSession($sessionId: String!) {
  deleteSession(input: {id: $sessionId}) {
    id
    sessionId
  }
}
`)
export type DeleteSessionResult = {
  deleteSession: DeletedId
}

const deletePlayer = gql(`
mutation DeletePlayer($playerId: String!) {
  deletePlayer(input: {id: $playerId}) {
    id
    sessionId
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

const directSessionAccess = gql(`
query DirectSessionAccess($sessionId: String!) {
  directSessionAccess(id: $sessionId) {
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
  }
}
`)
export type DirectSessionAccessQueryResult = {
  directSessionAccess: SessionForUser
}

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
export type AbstractPlayer = {
  id: string
  sessionId: string
  name: string
  iconToken: string
  status: string
}
export type GetSessionPlayerResult = {
  getSessionPlayer: AbstractPlayer
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
export type GetSessionPlayersResult = {
  getSessionPlayers: AbstractPlayer[]
}

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
  firstSession: SessionForUser
  sessions: AbstractSession[]
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

export type SessionForUser = {
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

export type SessionForPlayer = {
  id: string
  token: string
  name: string
  layout: string
  metaData: string
  createdAt: number
  user: AbstractUser
  players: AbstractPlayer[]
}

export type Session = {
  id: string
  token: string
  signUpToken?: string
  name: string
  layout: string
  metaData: string
  createdAt: number
}

export type AbstractSession = {
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
  sessionId: string
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

const onUpdateSession = gql(`
subscription OnUpdateSession($sessionId: String!) {
  onUpdateSession(id: $sessionId) {
    id
    name
    token
    layout
    metaData
  }
}
`)
export type OnUpdateSessionResult = {
  onUpdateSession: UpdatedSession
}

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
export type OnUpdatePlayerResult = {
  onUpdatePlayer: AbstractPlayer
}

const onDeletePlayer = gql(`
subscription OnDeletePlayer($sessionId: String!) {
  onDeletePlayer(sessionId: $sessionId) {
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
  addSession,
  addPlayerByUser,
  addPlayerByPlayer,
  playerFirstSignIn,
  playerSignIn,
  resetPlayerPassword,
  generatePlayerResetCode,
  updateUserName,
  updateUserIcon,
  updateSession,
  updatePlayerName,
  updatePlayerIcon,
  deleteSession,
  deletePlayer
}

export const Queries = {
  checkDuplicateUserId,
  directPlayerAccess,
  directSessionAccess,
  getSessionPlayer,
  getSessionPlayers
}

export const Subscriptions = {
  onAddPlayer,
  onDeletePlayer,
  onUpdateUser,
  onUpdateSession,
  onUpdatePlayer
}
