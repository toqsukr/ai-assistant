import { GigaChat } from 'langchain-gigachat'

export default new GigaChat({
  credentials: process.env.AUTH_KEY,
  model: 'GigaChat-2',
  temperature: 0,
})
