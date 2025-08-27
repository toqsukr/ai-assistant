import { TavilySearch } from '@langchain/tavily'

export const tavilyTool = new TavilySearch({ maxResults: 3, verbose: true })
