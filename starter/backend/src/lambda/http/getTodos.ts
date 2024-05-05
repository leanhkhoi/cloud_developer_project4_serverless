import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { findAllByUserId as findAllByUserId } from '../../businessLogic/todos'
import { getUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('--- getTodos ---');

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const todos = await findAllByUserId(userId)
  logger.info("Got Todos ");
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
}
export const handler = middy(lambdaHandler).use(cors({credentials: true}))


