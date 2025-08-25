class CredentialStorage {
  private token: string | null = null

  getAccessToken() {
    return this.token
  }

  updateAccessToken(token: string) {
    this.token = token
  }

  deleteAccessToken() {
    this.token = null
  }
}

export default new CredentialStorage()
