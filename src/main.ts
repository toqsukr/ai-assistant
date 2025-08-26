import { HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { RunnableLambda } from '@langchain/core/runnables'
import readline from 'readline/promises'
import gigachat from './gigachat'
import { LLMAgent } from './llm'
import tools from './tools'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    "You are a helpful assistant. Reply users on Russian only. You can only generate arguments for available functions (tools) and chose what function execute. If you can't answer question after functions execution - don't answer user directly, just write: 'I am silly for it, sorry('",
  ],
  ['human', '{text}'],
])

const llm = new LLMAgent(gigachat, tools)

const chain = prompt.pipe(llm.getModelWithTools())

const toolChain = RunnableLambda.from(async (userInput: string, config) => {
  const humanMessage = new HumanMessage(userInput)
  const aiMsg = await chain.invoke({ messages: [humanMessage] }, config)
  const calls = aiMsg.tool_calls ?? []
  console.log(aiMsg.tool_calls)
  const toolMsg = await tools[0].batch(calls, config)
  const messages = [humanMessage, aiMsg, ...toolMsg]
  console.log(messages)
  return chain.invoke({ messages }, config)
})

try {
  while (true) {
    const inputValue = await rl.question('Введите запрос: ')
    const answer = await toolChain.invoke(inputValue)
    console.log(answer)
    console.log(answer.content)
  }
} catch (error) {
  if (typeof error === 'object' && error && 'code' in error && error.code === 'ABORT_ERR') {
    console.log('Выход\n==============Сеанс завершен==============')
  } else {
    console.log(error)
  }
}

rl.close()
