import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { cryptoService } from '../api/crypto'

const cryptoSchema = z.object({
  operation: z.enum(['price']).describe('The type of operation with crypto to execute.'),
  currency: z
    .string()
    .describe(
      'The cryptocurrency whose exchange rate you need to find out. (for example, BTC, ETH, BCH etc.)'
    ),
  unit: z
    .string()
    .describe('The unit of measurement of the cryptocurrency exchange rate (by default, USDT)'),
})

export const cryptoTool = tool(
  async ({ operation, currency, unit }) => {
    if (operation === 'price') {
      return cryptoService.getPrice(currency, unit)
    } else {
      throw new Error('Invalid operation.')
    }
  },
  {
    name: 'crypto',
    description: `It can provide accurate data on the cryptocurrency exchange rate.
    If a user wants to know about all cryptocurrencies, do not answer them until you call the tool in turn for each of the selected currencies.
    Favorite cryptocurrencies:
      'BTC', // Bitcoin
      'ETH', // Ethereum
      'BNB', // Binance Coin
      'XRP', // Ripple
      'SOL', // Solana
      'TRX', // Tron
    `,
    schema: cryptoSchema,
    verbose: true,
  }
)
