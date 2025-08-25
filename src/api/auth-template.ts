import axios from 'axios'
import { v4 as uuid4 } from 'uuid'

const authTemplate = axios.create({
  withCredentials: true,
  baseURL: process.env.LLM_AUTH_URL,
  headers: {
    Accept: 'application/json',
    RqUID: uuid4(),
    Authorization: `Basic ${process.env.AUTH_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
})

authTemplate.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('Non authorized')
    }
    return Promise.reject(error)
  }
)

export default authTemplate
