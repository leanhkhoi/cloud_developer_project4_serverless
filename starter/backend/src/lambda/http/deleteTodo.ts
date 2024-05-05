import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('--- deleteTodo ---');

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  await deleteTodo(userId, todoId)
  logger.info("Deleted Todo " + todoId)
  return {
    statusCode: 204,
    body: ''
  }
}

export const handler = middy(lambdaHandler).use(cors({ credentials: true }))
