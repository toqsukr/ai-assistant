import TelegramBot from 'node-telegram-bot-api'
import pino from 'pino'

const botOptions: TelegramBot.ConstructorOptions = {
  polling: true,
}

export class AIAssistentBot extends TelegramBot {
  private readonly logger = pino()

  constructor() {
    const token = process.env.BOT_TOKEN
    if (!token) throw new Error('There is no telegram bot token!')
    super(token, botOptions)
  }

  onTextRequest(callback: (message: TelegramBot.Message, metadata: TelegramBot.Metadata) => any) {
    const callbackWithLog = (message: TelegramBot.Message, metadata: TelegramBot.Metadata) => {
      this.logger.info(`Recieved message: ${message.text}`)
      return callback(message, metadata)
    }
    return super.on('text', callbackWithLog)
  }
}

export default new AIAssistentBot()
