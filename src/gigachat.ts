import { GigaChat } from 'langchain-gigachat'

export default new GigaChat({
  credentials: process.env.AUTH_KEY,
  scope: process.env.LLM_SCOPE,
  model: 'GigaChat-2',
  temperature: 0,
})
