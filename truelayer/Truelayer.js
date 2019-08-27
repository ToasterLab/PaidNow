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

Truelayer.getToken = async (code) => {
  const tokens = await Truelayer.client.exchangeCodeForToken(CALLBACK_URL, code)
  console.log(JSON.stringify(tokens))
  return tokens
}

Truelayer.getInfo = async (accessToken) => {
  const info = await DataAPIClient.getInfo(accessToken)
  if (info.status !== `Succeeded`) {
    console.error(info)
    throw new Error(`Failed to fetch info from Truelayer`)
  }
  console.log(JSON.stringify(info))
  return info.results[0]
}

Truelayer.getMe = async (accessToken) => {
  const me = await DataAPIClient.getMe(accessToken)
  if (me.status !== `Succeeded`) {
    console.error(me)
    throw new Error(`Failed to fetch me from Truelayer`)
  }
  console.log(JSON.stringify(me))
  return me.results[0]
}

Truelayer.refreshAccessToken = (refreshToken) => AuthAPIClient.refreshAccessToken(refreshToken)

module.exports = Truelayer