import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { deleteSessionData } from './delete-session-data'

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const handler = async event => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  const sessionId = event.input.id
  if (sessionId) {
    await deleteSessionData(ddbDocClient, process.env.SESSION_DATA_TABLE_NAME, sessionId)
    await deleteSessionData(ddbDocClient, process.env.PLAYER_TABLE_NAME, sessionId)
    await deleteSessionData(ddbDocClient, process.env.DASHBOARD_TABLE_NAME, sessionId)
    await ddbDocClient.send(new DeleteCommand({
      TableName : process.env.SESSION_TABLE_NAME,
      Key: { 'id': sessionId }
    }))
  }

  const response = { id: sessionId, sessionId }
  console.log(`response >`, JSON.stringify(response, null, 2))
  return response
}
