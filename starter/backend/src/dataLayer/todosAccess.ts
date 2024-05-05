import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Todo } from '../models/Todo'
import { AttachmentUtils } from '../fileStorage/attachmentUtils'
import { UpdateTodoRequest } from '../dto/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
const attachment = new AttachmentUtils()

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) { }

  async findAllByUserId(userId: string): Promise<Array<Todo>> {
    logger.info('Find all todos')
    const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        IndexName: this.todosIndex,
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise();
    return result.Items as Array<Todo>;
  }

  async createTodo(todoItem: Todo): Promise<Todo> {
    const result = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()
    logger.info('Create todo successfully!', result)
    return todoItem as Todo
  }

  async updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest): Promise<Todo> {
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {todoId, userId},
        UpdateExpression: 'set #name= :name, dueDate= :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': updateTodoRequest.name,
          ':dueDate': updateTodoRequest.dueDate,
          ':done': updateTodoRequest.done
        },
        ExpressionAttributeNames: {
          '#name': 'name'
        }
      })
      .promise()
    logger.info('Update todo successfully !')
    return result.Attributes as Todo
  }

  async deleteTodo(userId: string, todoId: string): Promise<string> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      }).promise()
    logger.info('Delete todo successfully !')
    return todoId as string
  }

  async updateTodoAttachmentUrl(userId: string, todoId: string) {
    logger.info('Update todo attachment url')
    const attachmentUrl = attachment.getAttachmentUrl(todoId)
    const params = {
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }
    await this.docClient.update(params).promise()
  }
}
