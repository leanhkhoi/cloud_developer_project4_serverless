import { CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from 'jsonwebtoken'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl =
  'https://dev-x8sycvvx3lppc5lb.us.auth0.com/.well-known/jwks.json'

export const handler = async (event): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = await verifyToken(event.authorizationToken) as JwtPayload

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  // TODO: Implement token verification
  const response = await Axios.get(jwksUrl)
  const availableKeys = response.data.keys
  const key = availableKeys.find((key) => key.kid === jwt.header.kid)
  if (!key) {
    throw new Error('Could not find matched key at enpoint ' + jwksUrl)
  }

  const perm = key.x5c[0];
  const certificate = `-----BEGIN CERTIFICATE-----\n${perm}\n-----END CERTIFICATE-----`
  return jsonwebtoken.verify(token, certificate, {
    algorithms: ['RS256']
  })
}

export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
