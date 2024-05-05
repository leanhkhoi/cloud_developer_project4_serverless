import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils'
import { Todo } from '../models/Todo'
import { CreateTodoRequest } from '../dto/CreateTodoRequest'
import { UpdateTodoRequest } from '../dto/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('BusinessLogic')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

export async function findAllByUserId(userId: string): Promise<Array<Todo>> {
  return todosAccess.findAllByUserId(userId)
}

export async function createTodo(
  createToDoRequest: CreateTodoRequest,
  userId: string
): Promise<Todo> {
  logger.info('Create todo')
  const todoId = uuid.v4()
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  const newTodo = {
    userId,
    todoId,
    done: false,
    createdAt: new Date().toDateString(),
    attachmentUrl,
    ...createToDoRequest
  }
  return await todosAccess.createTodo(newTodo)
}

export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<UpdateTodoRequest> {
  logger.info('Update todos')
  return await todosAccess.updateTodo(todoId, userId, updateTodoRequest)
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info('Delete todo')
  return todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentUrl(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info('Create attachment', userId, todoId)
  await todosAccess.updateTodoAttachmentUrl(userId, todoId)
  return attachmentUtils.getUploadUrl(todoId)
}

