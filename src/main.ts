import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import gigachat from './gigachat'
import { LLMAgent } from './llm'
import aiAssistentBot from './telegram/bot'
import tools from './tools'

const prompt = new SystemMessage(
  "Вы - полезный помощник. Отвечайте пользователям только на русском языке. Вы можете генерировать аргументы только для доступных функций (инструментов) и выбирать, какую функцию выполнять. Оцените задачу, которую поставил пользователь, разбейте ее на подзадачи, чтобы каждая подзадача решалась путем вызова доступного инструмента. Определите порядок, в котором следует выполнять задачи, чтобы добиться правильного результата, и только после этого приступайте к вызову функций. Если вы не можете ответить на вопрос после получения результата работы функций, не отвечайте пользователю напрямую, просто напишите: 'Я слишком глупенький для этого, извините :('"
)

function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1]

  if (lastMessage.additional_kwargs.tool_calls) {
    return 'tools'
  }

  return '__end__'
}

const llm = new LLMAgent(gigachat, tools)

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.getModelWithTools().invoke(state.messages)
  return { messages: [response] }
}

const toolNode = new ToolNode(tools)

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addEdge('__start__', 'agent')
  .addNode('tools', toolNode)
  .addEdge('tools', 'agent')
  .addConditionalEdges('agent', shouldContinue)

const app = workflow.compile()

const botCallback = async (inputValue: string) => {
  const answer = await app.invoke({ messages: [prompt, new HumanMessage(inputValue)] })
  return answer.messages[answer.messages.length - 1].content
}

aiAssistentBot.onTextRequest(async ({ chat, text }) => {
  if (!text) return
  const chatID = chat.id
  const { message_id } = await aiAssistentBot.sendMessage(chatID, 'Обрабатываю запрос...')
  const answer = await botCallback(text)
  aiAssistentBot.deleteMessage(chatID, message_id)
  aiAssistentBot.sendMessage(chatID, answer.toString())
})
