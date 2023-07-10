import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {DynamoDBDocumentClient, UpdateCommand} from '@aws-sdk/lib-dynamodb'
export const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const handler = async event => {
  console.log(`event >`, JSON.stringify(event, null, 2))

  const id = event.input.id
  const resetCode = Math.floor((Math.random() * 999999)).toString()

  await ddbDocClient.send(new UpdateCommand({
    TableName : process.env.PLAYER_TABLE_NAME,
    Key: { id },
    ExpressionAttributeNames: { "#resetCode": "resetCode", "#status": "status" },
    ExpressionAttributeValues: { ":resetCode": resetCode, ":status": "reset" },
    UpdateExpression: `SET #resetCode = :resetCode, #status = :status`
  }))

  const response = { resetCode }

  console.log(`response >`, JSON.stringify(response, null, 2))
  return response
}
