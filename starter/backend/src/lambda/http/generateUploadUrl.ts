import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('--- generateUploadUrl ---');

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const url = await createAttachmentUrl(userId, todoId)
  logger.info("Generated Attachment URL for Todo ID: " + todoId)
  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

export const handler = middy(lambdaHandler).use(cors({credentials: true}))