import { z } from 'zod'
import authTemplate from './auth-template'

const AccessTokenSchemaDTO = z.object({
  access_token: z.string(),
  expires_at: z.coerce.date(),
})

export const authService = {
  async getAccessToken() {
    return authTemplate
      .post('', { scope: process.env.LLM_SCOPE })
      .then(({ data }) => AccessTokenSchemaDTO.parse(data))
      .then(({ access_token, expires_at }) => ({
        accessToken: access_token,
        expiresAt: expires_at,
      }))
  },
} as const
