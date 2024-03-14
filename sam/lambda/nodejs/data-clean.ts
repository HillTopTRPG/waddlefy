import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, QueryCommandOutput, DeleteCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
import { deleteSessionData } from './delete-session-data'

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const sessionPeriod = 60 * 60 * 24 * 10 // 10日

async function judgeSessionExpired(sessionId: string): Promise<boolean> {
  const expiredSecond = Math.round(Date.now() / 1000) - sessionPeriod
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

export const handler = async event => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  let deleteSessionCount = 0

  // 古いセッションデータを削除する
  // 予期せずセッションデータが消えてしまった事故が発生したのでこの機能は一時停止
  /*
  const sessionIdList = await getSessionIdList()
  for (const sessionId of sessionIdList) {
    if (await judgeSessionExpired(sessionId)) {
      deleteSessionCount++
      await deleteSessionData(ddbDocClient, process.env.SESSION_DATA_TABLE_NAME, sessionId)
      await deleteSessionData(ddbDocClient, process.env.PLAYER_TABLE_NAME, sessionId)
      await deleteSessionData(ddbDocClient, process.env.DASHBOARD_TABLE_NAME, sessionId)
      await ddbDocClient.send(new DeleteCommand({
        TableName : process.env.SESSION_TABLE_NAME,
        Key: { 'id': sessionId }
      }))
    }
  }
  */

  const response = { deleteSessionCount }
  console.log(`response >`, JSON.stringify(response, null, 2))
  return response
}
