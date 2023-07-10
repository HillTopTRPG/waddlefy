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
    const data: QueryCommandOutput = await ddbDocClient.send<T>(new QueryCommand({
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

export const handler = async (event) => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  // const typesBase = `arn:aws:appsync:${process.env.AWS_REGION}:${event.accountId}:apis/${event.apiId}/types`
  const definedTypeFieldsBase = [
    // `${typesBase}/Room/fields/password`,
  ]
  const admitFields: string[] = []

  const ALL_OPERATIONS = [
    'Query.directPlayerAccess',
    'Query.directDashboardAccess',
    'Query.getDashboardPlayer',
    'Query.getDashboardPlayers',
    'Mutation.userSignUp',
    'Mutation.userSignIn',
    'Mutation.addDashboard',
    'Mutation.addPlayer',
    'Mutation.playerSignUp',
    'Mutation.playerSignIn',
    'Mutation.generatePlayerResetCode',
    'Mutation.resetPlayerPassword',
  ]

  let isAuthorized = false
  let id: string | null = null

  if (event.authorizationToken === 'waddlefy') {
    // 初回接続
    isAuthorized = true
    admitFields.push('Mutation.userSignUp')
    admitFields.push('Mutation.userSignIn')
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
          admitFields.push('Query.directDashboardAccess')
          admitFields.push('Mutation.addDashboard')
          admitFields.push('Mutation.addPlayer')
          admitFields.push('Mutation.generatePlayerResetCode')
        }
      } else if (split[0] === 'p') {
        // Player
        const playerData = await getTokenSecretData<PlayerData>(process.env.PLAYER_TABLE_NAME, token, secret)
        if (playerData) {
          isAuthorized = true
          id = playerData.id
          admitFields.push('Query.directPlayerAccess')
        }
      }
    } else if (split.length === 2) {
      if (split[0] === 'd') {
        // Player
        const dashboardData = await getTokenData(process.env.DASHBOARD_TABLE_NAME, split[1], 'token')
        if (dashboardData) {
          isAuthorized = true
          id = dashboardData.id
          admitFields.push('Query.getDashboardPlayer')
          admitFields.push('Mutation.playerSignUp')
          admitFields.push('Mutation.playerSignIn')
          admitFields.push('Mutation.resetPlayerPassword')
        }
      }
      if (split[0] === 'di') {
        // Player
        const dashboardData = await getTokenData(process.env.DASHBOARD_TABLE_NAME, split[1], 'signUpToken')
        if (dashboardData) {
          isAuthorized = true
          id = dashboardData.id
          admitFields.push('Query.getDashboardPlayers')
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
