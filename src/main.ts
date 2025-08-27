import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import readline from 'readline/promises'
import gigachat from './gigachat'
import { LLMAgent } from './llm'
import tools from './tools'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const prompt = new SystemMessage(
  "You are a helpful assistant. Reply users on Russian only. You can only generate arguments for available functions (tools) and chose what function execute. Evaluate the task that the user has set, break it down into subtasks so that each subtask is solved by calling an available tool. Determine the order in which the tasks should be performed in order to achieve the correct result, and only then proceed to calling the functions. If you cannot answer the question after receiving the result of the functions, do not answer the user directly, just write: 'I am silly for it, sorry :('"
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

try {
  while (true) {
    const inputValue = await rl.question('Введите запрос: ')
    const answer = await app.invoke({ messages: [prompt, new HumanMessage(inputValue)] })
    console.log(answer)
    console.log(answer.messages[answer.messages.length - 1].content)
  }
} catch (error) {
  if (typeof error === 'object' && error && 'code' in error && error.code === 'ABORT_ERR') {
    console.log('Выход\n==============Сеанс завершен==============')
  } else {
    console.log(error)
  }
}

rl.close()
