import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
  BatchWriteCommand,
  QueryCommandOutput,
  DeleteCommand,
  ScanCommandOutput
} from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

// const period = 60 * 60 * 24 * 7 // 7日間
const period = 60 * 60 * 24 // 1日

async function judgeSessionExpired(sessionId: string): Promise<boolean> {
  const expiredSecond = Date.now() / 1000 - period
  try {
    const data: ScanCommandOutput = await ddbDocClient.send(new ScanCommand({
      TableName : process.env.SESSION_DATA_TABLE_NAME,
      IndexName: 'sessionId-index',
      Select: 'COUNT',
      FilterExpression: '#sessionId = :sessionId and #updatedAt >= :updatedAt',
      ExpressionAttributeNames: {
        '#sessionId' : 'sessionId',
        '#updatedAt' : 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':sessionId': sessionId,
        ':updatedAt': expiredSecond
      }
    }))
    return data.Count === 0
  } catch (err) {
    // do nothing
  }
  return true
}

async function getSessionIdList(): Promise<string[]> {
  try {
    const data: QueryCommandOutput = await ddbDocClient.send(new ScanCommand({
      TableName : process.env.SESSION_TABLE_NAME,
      ProjectionExpression: 'id'
    }))
    return data.Items.map(item => item.id)
  } catch (err) {
    // do nothing
  }
  return []
}

async function deleteSessionData(tableName: string, sessionId: string) {
  const idList = []

  try {
    const data: QueryCommandOutput = await ddbDocClient.send(new QueryCommand({
      TableName : tableName,
      IndexName: `sessionId-index`,
      KeyConditionExpression: '#sessionId = :sessionId',
      ExpressionAttributeNames: {
        '#sessionId' : 'sessionId'
      },
      ExpressionAttributeValues: {
        ':sessionId': sessionId
      }
    }))
    idList.push(...data.Items.map(item => item.id))
  } catch (err) {
    // do nothing
  }

  if (!idList.length) return

  return await ddbDocClient.send(new BatchWriteCommand({
    RequestItems: {
      [tableName]: idList.map(id => ({
        DeleteRequest: {
          Key: {
            id
          }
        }
      }))
    },
  }))
}

export const handler = async event => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  // 古いセッションデータを削除する
  const sessionIdList = await getSessionIdList()
  for (const sessionId of sessionIdList) {
    if (await judgeSessionExpired(sessionId)) {
      await deleteSessionData(process.env.SESSION_DATA_TABLE_NAME, sessionId)
      await deleteSessionData(process.env.PLAYER_TABLE_NAME, sessionId)
      await deleteSessionData(process.env.DASHBOARD_TABLE_NAME, sessionId)
      await ddbDocClient.send(new DeleteCommand({
        TableName : process.env.SESSION_TABLE_NAME,
        Key: { 'id': sessionId }
      }))
    }
  }

  const response = { ok: true }
  console.log(`response >`, JSON.stringify(response, null, 2))
  return response
}
