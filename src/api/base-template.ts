import axios from 'axios'

const baseTemplate = axios.create({
  baseURL: process.env.LLM_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

export default baseTemplate
