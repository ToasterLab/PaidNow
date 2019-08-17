const { AuthAPIClient, DataAPIClient } = require(`truelayer-client`)

const TRUELAYER_CLIENT_ID = process.env.TRUELAYER_CLIENT_ID
const TRUELAYER_CLIENT_SECRET = process.env.TRUELAYER_CLIENT_SECRET
const CALLBACK_URL = process.env.CALLBACK_URL

console.log(CALLBACK_URL)

// permission scopes
const scopes = [`info`, `accounts`, `balance`, `transactions`, `offline_access`, `cards`]

const Truelayer = {}

Truelayer.client = new AuthAPIClient({
  client_id: TRUELAYER_CLIENT_ID,
  client_secret: TRUELAYER_CLIENT_SECRET
})

Truelayer.getAuthURL = () => {
  const authURL = Truelayer.client.getAuthUrl({
    redirectURI: CALLBACK_URL,
    scope: scopes,
    nonce: `nonce`,
    enableMock: true
  })
  console.log(authURL)
  return authURL
}

Truelayer.getToken = (code) => Truelayer.client.exchangeCodeForToken(CALLBACK_URL, code)

Truelayer.getInfo = (accessToken) => DataAPIClient.getInfo(accessToken)

module.exports = Truelayer