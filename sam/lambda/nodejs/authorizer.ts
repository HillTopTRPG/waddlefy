import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {DynamoDBDocumentClient, QueryCommand, QueryCommandOutput} from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

type UserData = {
  id: string,
  token: string,
  secret: string
}
type PlayerData = UserData // 同じ構造

async function getTokenData<T>(tableName: string, token: string, tokenName: string): Promise<T | undefined> {
  try {
    const data: QueryCommandOutput = await ddbDocClient.send(new QueryCommand({
      TableName : tableName,
      IndexName: `${tokenName}-index`,
      KeyConditionExpression: '#token = :token',
      ExpressionAttributeNames: {
        '#token' : tokenName
      },
      ExpressionAttributeValues: {
        ':token': token
      }
    }))
    if (!data || data.Items.length !== 1 || !data.Items[0]) {
      return undefined
    }
    return data.Items[0] as T
  } catch (err) {
    // do nothing
  }
  return undefined
}

async function getTokenSecretData<T extends { secret: string }>(tableName: string, token: string, secret: string): Promise<T | undefined> {
  try {
    const data = await getTokenData<T>(tableName, token, 'token')
    if (data.secret !== secret) {
      return undefined
    }
    return data
  } catch (err) {
    // do nothing
  }
  return undefined
}

const ALL_OPERATIONS = [
  'Mutation.userSignUp',
  'Mutation.userSignIn',
  'Mutation.addSession',
  'Mutation.addDashboard',
  'Mutation.addPlayerByUser',
  'Mutation.addPlayerByPlayer',
  'Mutation.addSessionData',
  'Mutation.playerFirstSignIn',
  'Mutation.playerSignIn',
  'Mutation.generatePlayerResetCode',
  'Mutation.resetPlayerPassword',
  'Mutation.updateUserName',
  'Mutation.updateUserIcon',
  'Mutation.updateSession',
  'Mutation.updatePlayerName',
  'Mutation.updatePlayerIcon',
  'Mutation.updateSessionData',
  'Mutation.deleteSession',
  'Mutation.deletePlayer',
  'Mutation.deleteSessionData',
  'Query.checkDuplicateUserId',
  'Query.directSessionAccess',
  'Query.getSessionPlayer',
  'Query.getSessionPlayers',
  'Query.directPlayerAccess',
  'Query.directDashboardAccess',
]

export const handler = async event => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  // const typesBase = `arn:aws:appsync:${process.env.AWS_REGION}:${event.accountId}:apis/${event.apiId}/types`
  const definedTypeFieldsBase = [
    // `${typesBase}/Room/fields/password`,
  ]
  const admitFields: string[] = []

  let isAuthorized = false
  let id: string | null = null

  if (event.authorizationToken === 'waddlefy') {
    // 初回接続
    isAuthorized = true
    admitFields.push('Mutation.userSignUp')
    admitFields.push('Mutation.userSignIn')
    admitFields.push('Query.checkDuplicateUserId')
  } else {
    const split = event.authorizationToken.split('/')
    if (split.length === 3) {
      const token = split[1]
      const secret = split[2]
      if (split[0] === 'u') {
        // User
        const userData = await getTokenSecretData<UserData>(process.env.USER_TABLE_NAME, token, secret)
        if (userData) {
          isAuthorized = true
          id = userData.id
          admitFields.push('Mutation.addSession')
          admitFields.push('Mutation.addDashboard')
          admitFields.push('Mutation.addPlayerByUser')
          admitFields.push('Mutation.addSessionData')
          admitFields.push('Mutation.generatePlayerResetCode')
          admitFields.push('Mutation.updateUserName')
          admitFields.push('Mutation.updateUserIcon')
          admitFields.push('Mutation.updateSession')
          admitFields.push('Mutation.updateSessionData')
          admitFields.push('Mutation.deleteSession')
          admitFields.push('Mutation.deletePlayer')
          admitFields.push('Mutation.deleteSessionData')
          admitFields.push('Query.directSessionAccess')
        }
      } else if (split[0] === 'p') {
        // Player
        const playerData = await getTokenSecretData<PlayerData>(process.env.PLAYER_TABLE_NAME, token, secret)
        if (playerData) {
          isAuthorized = true
          id = playerData.id
          admitFields.push('Query.directPlayerAccess')
          admitFields.push('Mutation.updatePlayerName')
          admitFields.push('Mutation.updatePlayerIcon')
          admitFields.push('Mutation.updateSessionData')
        }
      }
    } else if (split.length === 2) {
      if (split[0] === 's') {
        // Player
        const sessionData = await getTokenData<{ id: string }>(process.env.SESSION_TABLE_NAME, split[1], 'token')
        if (sessionData) {
          isAuthorized = true
          id = sessionData.id
          admitFields.push('Mutation.addPlayerByPlayer')
          admitFields.push('Mutation.playerFirstSignIn')
          admitFields.push('Mutation.playerSignIn')
          admitFields.push('Mutation.resetPlayerPassword')
          admitFields.push('Query.getSessionPlayer')
          admitFields.push('Query.directDashboardAccess')
        }
      }
      if (split[0] === 'si') {
        // Player
        const sessionData = await getTokenData<{ id: string }>(process.env.SESSION_TABLE_NAME, split[1], 'signUpToken')
        if (sessionData) {
          isAuthorized = true
          id = sessionData.id
          admitFields.push('Query.getSessionPlayers')
        }
      }
    }
  }

  const response = {
    isAuthorized,
    resolverContext: {
      id,
    },
    deniedFields: [
      ...definedTypeFieldsBase,
      ...ALL_OPERATIONS.filter(d => admitFields.every(a => a !== d)),
    ],
    ttlOverride: 0,
  }

  console.log(`response >`, JSON.stringify(response, null, 2))
  return response;
}
