import readline from 'readline/promises'
import { authService } from './api/auth'
import { chatService } from './api/chat'
import credentialStorage from './storage'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

try {
  const { accessToken } = await authService.getAccessToken()
  credentialStorage.updateAccessToken(accessToken)

  while (true) {
    const inputValue = await rl.question('Введите запрос: ')
    const accessToken = credentialStorage.getAccessToken()

    if (inputValue === '/exit' || accessToken === null) {
      break
    }

    const answer = await chatService.processTextRequest(inputValue, accessToken)

    console.log(
      `\n======================================================================================================================\nОтвет:\n${answer}\n======================================================================================================================\n`
    )
  }
} catch (error) {
  console.log(error)
}

rl.close()
