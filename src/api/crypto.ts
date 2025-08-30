import axios from 'axios'
import { z } from 'zod'

const CRYPTO_URL = 'https://data-api.binance.vision/api/v3'

const AveragePriceSchema = z.object({
  mins: z.number().describe('Average price interval (in minutes)'),
  price: z.string().describe('Average price'),
  closeTime: z.coerce.date().describe('Last trade time'),
})

export const cryptoService = {
  async getPrice(cryptoCurrency: string, unit: string = 'USDT') {
    const symbol = `${cryptoCurrency}${unit}`
    return axios
      .get(`${CRYPTO_URL}/avgPrice`, { params: { symbol } })
      .then(({ data }) => AveragePriceSchema.parse(data))
  },
} as const
