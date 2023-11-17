import { BatchWriteCommand, DynamoDBDocumentClient, QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb'

function sliceByNumber<T>(array: T[], number): T[][] {
  const length = Math.ceil(array.length / number)
  return new Array(length).fill(null).map((_, i) =>
    array.slice(i * number, (i + 1) * number)
  )
}

export async function deleteSessionData(
  ddbDocClient: DynamoDBDocumentClient,
  tableName: string,
  sessionId: string
): Promise<void> {
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

  const slicedList = sliceByNumber(idList, 25)
  for (const list of slicedList) {
    await ddbDocClient.send(new BatchWriteCommand({
      RequestItems: {
        [tableName]: list.map(id => ({
          DeleteRequest: {
            Key: {
              id
            }
          }
        }))
      }
    }))
  }
}
