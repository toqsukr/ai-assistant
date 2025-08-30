import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import gigachat from './gigachat'
import { LLMAgent } from './llm'
import aiAssistentBot from './telegram/bot'
import tools from './tools'

const prompt = new SystemMessage(
  "You are a useful assistant. Reply to users only in Russian. You can generate arguments only for available functions (tools) and choose which function to perform. Evaluate the task that the user has set, break it down into subtasks so that each subtask is solved by calling the available tool. Analyze which functions need to be called and how many times to solve the user's task. Determine the order in which tasks should be performed in order to achieve the correct result, and only then proceed to calling functions. Do not respond to the user with a code, formulate a human-understandable answer based on the results that the tool functions returned to you. If, after completing all the steps, as well as the instructions that you formulated during the analysis of the query, you cannot answer the question, do not answer the user directly, just write: 'Я слишком глупенький для этого, извините :(' and explain what exactly you cannot do."
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
