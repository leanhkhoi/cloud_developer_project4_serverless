import { decode, JwtPayload } from 'jsonwebtoken'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { createLogger } from '../utils/logger'
import { getToken } from '../lambda/auth/auth0Authorizer'

const logger = createLogger('utils')

export function getUserId(event: APIGatewayProxyEvent): string {
  const jwtToken = getToken(event.headers.Authorization);
  const decodedToken = decode(jwtToken) as JwtPayload
  logger.info("Decoded JWT Token !")
  return decodedToken.sub
}
