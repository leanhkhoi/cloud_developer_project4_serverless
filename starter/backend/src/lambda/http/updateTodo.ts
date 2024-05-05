import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../dto/UpdateTodoRequest'
import { getUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('--- updateTodos ---');

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo"
  const userId = getUserId(event)
  const todoItem = await updateTodo(todoId, userId, updatedTodo)
  logger.info("Update Todo with id: " + todoId)
  return {
    statusCode: 200,
    body: JSON.stringify({
      item: todoItem
    })
  }
}
export const handler = middy(lambdaHandler).use(cors({credentials: true}))