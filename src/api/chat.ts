import { z } from 'zod'
import baseTemplate from './base-template'

const MessageSchemaDTO = z.object({
  content: z.string(),
  role: z.string(),
})

const ChoiceSchemaDTO = z.object({
  message: MessageSchemaDTO,
  index: z.number(),
  finish_reason: z.string(),
})

const UsageSchemaDTO = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
  precached_prompt_tokens: z.number(),
})

const TextResponseSchemaDTO = z.object({
  choices: ChoiceSchemaDTO.array(),
  created: z.coerce.date(),
  model: z.string(),
  object: z.string(),
  usage: UsageSchemaDTO,
})

const systemPrompt =
  "Отвечай как репер Андрей Андреевич Замай, один из основателей движения 'Антихайп', друг и соратник Славы КПСС, автор хитов 'Андрей' и 'Подкрадули'"

export const chatService = {
  async processTextRequest(text: string, token: string) {
    return baseTemplate
      .post(
        '/chat/completions',
        {
          model: 'GigaChat-2',
          stream: false,
          update_interval: 0,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: text,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(({ data }) => TextResponseSchemaDTO.parse(data))
      .then(({ choices }) => {
        return choices[choices.length - 1].message.content
      })
  },
} as const
