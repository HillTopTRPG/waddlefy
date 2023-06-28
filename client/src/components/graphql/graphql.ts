import {AuthOptions, createAuthLink} from 'aws-appsync-auth-link'
import {ApolloClient, ApolloError, ApolloLink, InMemoryCache, NormalizedCacheObject} from '@apollo/client/core'
import {createSubscriptionHandshakeLink} from 'aws-appsync-subscription-link'
import {InjectionKey, reactive} from 'vue'
import {
  Room,
  User,
  InitMutationResult,
  GetRoomQueryResult,
  GetUserQueryResult,
  GetRoomsQueryResult,
  AddRoomMutationResult,
  EntryRoomMutationResult,
  SignUpMutationResult,
  SignInMutationResult,
  Mutations,
  Queries, Chat,
} from "@/components/graphql/schema";

function makeGraphQlClient(endPointUrl: string, region: string, getAuthToken: () => string) {
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

// ローカル開発時のみ有効な値であり、流出しても問題ない情報
const DEFAULT_URL = 'https://ossf36uukbbldn5ieraulzvima.appsync-api.ap-northeast-1.amazonaws.com/graphql'
const DEFAULT_REGION = 'ap-northeast-1'

export default function useGraphQl(
  connectionId: string,
  roomToken: string,
  userToken: string
) {
  // 状態
  const state = reactive<{
    ready: boolean;
    connectionId: string;
    roomId: string;
    roomToken: string;
    userId: string;
    userToken: string;
    rooms: Room[]
    users: User[]
    chats: Chat[]
  }>({
    ready: false,
    connectionId,
    roomId: '',
    roomToken,
    userId: '',
    userToken,
    rooms: [],
    users: [],
    chats: []
  })

  // ロジック
  let appSyncClient: ApolloClient<NormalizedCacheObject> | null = null

  function getAuthToken(): string {
    if (!state.connectionId) {
      return '1'
    }
    const authorize = [state.connectionId, state.roomToken, state.userToken].filter(s => s).join('/')
    console.log(JSON.stringify({ authorize }))
    return authorize
  }

  async function initialize() {
    state.roomId = ''
    state.userId = ''
    state.rooms = []
    state.users = []
    state.ready = false

    if (appSyncClient) {
      await appSyncClient.clearStore()
      appSyncClient.stop()
    }

    let graphql: string = DEFAULT_URL
    let region: string = DEFAULT_REGION
    const apiInfoResult = await fetch('/api')
    try {
      const apiInfoJson: { graphql: string, region: string } = await apiInfoResult.json()
      graphql = apiInfoJson.graphql
      region = apiInfoJson.region
    } catch (error: SyntaxError) {
      console.warn('/apiで情報が取得できませんでした')
      console.warn('ローカル開発中ですね？')
    }

    appSyncClient = makeGraphQlClient(graphql, region, getAuthToken)

    if (!state.connectionId) {
      const initResult = await appSyncClient.mutate<InitMutationResult>({ mutation: Mutations.initMutation })
      state.connectionId = initResult.data?.init.connectionId || ''
      console.log(initResult)
      history.replaceState(null, '', `/${getAuthToken()}`)
    }

    if (state.roomToken) {
      const getRoomResult = await appSyncClient.query<GetRoomQueryResult>({
        query: Queries.getRoomQuery,
        variables: {
          roomToken: state.roomToken
        },
        fetchPolicy: 'network-only'
      })
      console.log(JSON.stringify(getRoomResult.data, null, 2))
      state.roomId = getRoomResult.data.getRoom.id || ''
      state.users = getRoomResult.data.getRoom.users || []
    } else {
      const getRoomsResult = await appSyncClient.query<GetRoomsQueryResult>({
        query: Queries.getRoomsQuery,
        fetchPolicy: 'network-only'
      })
      console.log(JSON.stringify(getRoomsResult.data, null, 2))
      state.rooms = getRoomsResult?.data?.getRooms || []
    }

    if (state.userToken) {
      const getUserResult = await appSyncClient.query<GetUserQueryResult>({
        query: Queries.getUserQuery,
        variables: {
          userToken: state.userToken
        },
        fetchPolicy: 'network-only'
      })
      console.log(JSON.stringify(getUserResult.data, null, 2))
      state.userId = getUserResult.data.getUser.id || ''
    }

    state.ready = true
  }
  initialize().then()

  async function addRoom(roomName: string, roomPassword: string) {
    if (!appSyncClient) return
    const addRoomResult = await appSyncClient.mutate<AddRoomMutationResult>({
      mutation: Mutations.addRoomMutation,
      variables: { roomName, roomPassword }
    })
    console.log(JSON.stringify(addRoomResult.data, null, 2))
    state.roomId = addRoomResult?.data?.addRoom.id || ''
    state.roomToken = addRoomResult?.data?.addRoom.token || ''
    history.replaceState(null, '', `/${getAuthToken()}`)
  }

  async function entryRoom(id: string, password: string) {
    if (!appSyncClient) {
      return
    }
    const entryRoomResult = await appSyncClient!.mutate<EntryRoomMutationResult>({
      mutation: Mutations.entryRoomMutation,
      variables: {
        roomId: id,
        roomPassword: password
      },
      fetchPolicy: 'no-cache'
    })
    console.log(JSON.stringify(entryRoomResult.data, null, 2))
    state.roomId = entryRoomResult.data?.entryRoom.id || ''
    state.roomToken = entryRoomResult.data?.entryRoom.token || ''
    state.users = entryRoomResult.data?.entryRoom.users || []
    history.replaceState(null, '', `/${getAuthToken()}`)
    console.log(JSON.stringify(state.users, null, 2))
  }

  async function signUp(userName: string, userPassword: string) {
    if (!appSyncClient) return
    const signUpResult = await appSyncClient!.mutate<SignUpMutationResult>({
      mutation: Mutations.signUpMutation,
      variables: { userName, userPassword }
    })
    console.log(JSON.stringify(signUpResult.data, null, 2))
    state.userId = signUpResult.data?.signUp.id || ''
    state.userToken = signUpResult.data?.signUp.token || ''
    history.replaceState(null, '', `/${getAuthToken()}`)
  }

  async function signIn(userId: string, userPassword: string) {
    if (!appSyncClient) return
    try {
      const signInResult = await appSyncClient!.mutate<SignInMutationResult>({
        mutation: Mutations.signInMutation,
        variables: { userId, userPassword }
      })
      console.log(JSON.stringify(signInResult.data, null, 2))
      state.userId = signInResult.data?.signIn.id || ''
      state.userToken = signInResult.data?.signIn.token || ''
      history.replaceState(null, '', `/${getAuthToken()}`)
    } catch (error: ApolloError) {
      // TODO AuthorizedError
    }
  }
  async function patchUser( _updateUser: Partial<{
    name: string
    type: string
  }>) {
    // TODO 未実装
  }
  async function deleteUser() {
    // TODO 未実装
  }

  return {
    state,
    addRoom,
    entryRoom,
    signUp,
    signIn,
    patchUser,
    deleteUser
  }
}

export type GraphQlStore = ReturnType<typeof useGraphQl>
export const GraphQlKey: InjectionKey<GraphQlStore> = Symbol('GraphQlStore') as any
