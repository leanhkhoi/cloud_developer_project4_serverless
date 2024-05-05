import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../dto/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { getUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('--- createTodo ---');

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  const item = await createTodo(newTodo, userId)
  logger.info("Create Todo successfully !")
  return {
    statusCode: 200,
    body: JSON.stringify({item})
  }
}

export const handler = middy(lambdaHandler).use(cors({
  credentials: true
}))