const { AuthAPIClient, DataAPIClient } = require(`truelayer-client`)
const dayjs = require(`dayjs`)

const TRUELAYER_CLIENT_ID = process.env.TRUELAYER_CLIENT_ID
const TRUELAYER_CLIENT_SECRET = process.env.TRUELAYER_CLIENT_SECRET
const CALLBACK_URL = process.env.CALLBACK_URL

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
  return authURL
}

Truelayer.getToken = async (code) => {
  const tokens = await Truelayer.client.exchangeCodeForToken(CALLBACK_URL, code)
  return tokens
}

Truelayer.getInfo = async (accessToken) => {
  const info = await DataAPIClient.getInfo(accessToken)
  if (info.status !== `Succeeded`) {
    console.error(info)
    throw new Error(`Failed to fetch info from Truelayer`)
  }
  return info.results[0]
}

Truelayer.getMe = async (accessToken) => {
  const me = await DataAPIClient.getMe(accessToken)
  if (me.status !== `Succeeded`) {
    console.error(me)
    throw new Error(`Failed to fetch me from Truelayer`)
  }
  return me.results[0]
}

/**
 * @param {string} refreshToken 
 * @return {{access_token: String, refresh_token: String}} 
 *         The refreshed credentials
 */
Truelayer.refreshAccessToken = (refreshToken) => Truelayer.client.refreshAccessToken(refreshToken)

Truelayer.getAccounts = async ({
  accessToken
}) => {
  const result = await DataAPIClient.getAccounts(accessToken)
  if (result.status !== `Succeeded`) {
    throw new Error(`Could not fetch accounts: ${JSON.stringify(result)}`)
  }
  return result.results
}

/**
 * @param {string} from YYYY-MM-DD
 * @param {string} to YYYY-MM-DD
 */
Truelayer.getTransactions = async ({
  accessToken,
  accountId,
  from = dayjs().subtract(7, `day`).format(`YYYY-MM-DD`),
  to = dayjs().format(`YYYY-MM-DD`)
}) => {
  const result = await DataAPIClient.getTransactions(accessToken, accountId, from, to)
  if (result.status !== `Succeeded`) {
    throw new Error(`Could not fetch transactions: ${JSON.stringify(result)}`)
  }
  return result.results
}

module.exports = Truelayer