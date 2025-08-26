import type { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import type {
  BaseChatModel,
  BaseChatModelCallOptions,
} from '@langchain/core/language_models/chat_models'
import type { AIMessageChunk } from '@langchain/core/messages'
import type { Runnable, RunnableConfig } from '@langchain/core/runnables'
import type { ToolInterface } from '@langchain/core/tools'
import { v4 as uuid4 } from 'uuid'
import { z } from 'zod'

export class LLMAgent<SchemaT extends z.ZodType<unknown, z.ZodTypeDef>> {
  private readonly modelWithTools: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    BaseChatModelCallOptions
  >

  constructor(
    model: BaseChatModel,
    private readonly tools: ToolInterface<SchemaT>[],
    private readonly config: RunnableConfig = { configurable: { thread_id: uuid4() } }
  ) {
    if (!model.bindTools) throw new Error('This llm model does not support binding tools!')

    this.tools = tools
    this.config = config
    this.modelWithTools = model.bindTools(this.tools)
  }

  getModelWithTools() {
    return this.modelWithTools
  }

  async invoke(content: string) {
    return this.modelWithTools.invoke(content, this.config)
  }
}
